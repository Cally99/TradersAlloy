const companyManager = require('../../server/managers/CompanyManager');
const companyReportManager = require('../../server/managers/CompanyReportManager');
const companyCalendarManager = require('../../server/managers/CompanyCalendarManager');

const companyReport = require('../../server/models').CompanyReport;
const stockManager = require('../../server/managers/StockManager');

/**
 *   Update COMPANY table with all dates for a company
 *
 *   To run this...
 *   node ./scripts/2021-05-10_clean_data/8_ ...
 *
 * */



async function run () {

    try {

        const companies = JSON.parse(JSON.stringify(await companyManager.list()));

//const company  = companyManager.get(39503);
        for (const company of companies) {
            const company_id = company.company_id;

            const stock = await stockManager.getPrimaryStock( company_id );
            if (!stock) {
                console.log('NO stock FOUND');
                continue;
            }

//            console.log(company_id);
            const report = (await companyReportManager.getLastReport( company_id ))[0];
            let eps_ttm = await companyReportManager.getEPS_trailing_12_months(company_id);

            console.log(`company and EPS ttm: ${company_id} ${eps_ttm}` );

            if (eps_ttm === null) {
                console.log( `EPS_ttm is null ${company_id} `);
                await companyManager.setStatusFlag(company_id, 'could not calculate EPS_ttm');
            }

            if (eps_ttm === 0) {
                eps_ttm = null;
            }

            let nextReportDate = (await companyCalendarManager.getNextReport( company_id ))[0];

            if(nextReportDate === undefined) {
                console.log('Set report date to null');
                nextReportDate = null;
            }

            if (!report) {
                console.log('NO REPORT FOUND - continue with the next company');
                continue;
            }

            let last_pe = null;
            let last_ps = null;

            if(stock.price_today !== 0 && eps_ttm !== null) {
                last_pe = (stock.price_today / eps_ttm).toFixed(2);
                last_ps = (stock.price_today / report.sales).toFixed(2);


                if (last_pe == "Infinity") {
                    console.log("eps_ttm: "+eps_ttm);
                    console.log("stock.price_today: "+stock.price_today);
                    last_pe = null;
                }
            }

            const last_sales = report.sales;
            const costofgoodssold  = report.sales - report.gp;
            const totalliabilities = report.ltliabilities + report.curliabilities;
            const totalequityandliabilities = report.ltliabilities + report.curliabilities + report.shequity;

            stock.price_today = (stock.price_today !== 0 ? stock.price_today : null);


            await companyManager.updateCompanyWithLatestReport(
                company.company_id,
                report.date_report,
                eps_ttm,
                last_sales,
                last_pe,
                market_cap,
                company.ceo_comments,
                nextReportDate);

            await companyReport.update(
                        {
                            price: stock.price_today,
                            pe: last_pe,
                            ps: last_ps,
                            costofgoodssold: costofgoodssold,
                            totalliabilities: totalliabilities,
                            totalequityandliabilities: totalequityandliabilities},
                        {where: {company_id: company_id, period: report.period}});
        }

    } catch(error) {
        console.log(error);
    }

}
/**
 * convert currency
 * */
function priceToEURs(currency, price) {
    switch (currency) {
        case 'EUR': return price;
        case 'SEK': return price / 10.13;
        case 'NOK': return price / 10.05;
        case 'DKK': return price / 7.44;
    }
}


module.exports = {
    run,
};


