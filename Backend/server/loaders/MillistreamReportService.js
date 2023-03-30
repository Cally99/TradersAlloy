const stockPriceManager = require('../managers/StockPriceManager');
const stockManager = require('../managers/StockManager');
const companyManager = require('../managers/CompanyManager');
const companyService = require('../services/CompanyService');
const CompanyReport = require('../models').CompanyReport;
const companyReportManager = require('../managers/CompanyReportManager');
const companyReportService = require('../services/CompanyReportService');
const companyCalendarManager = require('../managers/CompanyCalendarManager');
const millistreamManager = require('../managers/MillistreamManager'); // How to use Sinon to Mock with MillistreamController.mock.js ??

const moment = require('moment');
const _ = require('lodash');
const log4js = require('log4js');
const healthCheck = log4js.getLogger("health");
const Common = require('../helpers/common');

/**
 *    from the CRON job
 * */
async function maintainCompanyReports(smallTestMode=false) {
    const companiesNotReported = await companyReportManager.getCompanyIdsNotReported();
    let companiesNotReportedFiltered = [];
    let reportsAddedArray = [];

    if (smallTestMode) {
        companiesNotReportedFiltered = companiesNotReported; //.slice(0, 5);
    } else {
        companiesNotReportedFiltered = companiesNotReported;
    }
    /*  Report Data Struct
        ┌─────────┬────────────┬────────┬──────────────┬──────────────────────┬────────────────┬─────────────┐
        │ (index) │ company_id │ period │ date_report  │         name         │ currency_trade │ price       │
        ├─────────┼────────────┼────────┼──────────────┼──────────────────────┼────────────────┼─────────────┤
        │    0    │  4562607   │ '2021' │ '2022-02-15' │ 'Transcendent Group' │     'SEK'      │    23.00    │
        │    1    │    33019   │ '2021' │ '2022-02-15' │  'Nederman Holding'  │     'SEK'      │   191.50    │
        │    2    │    39832   │ '2021' │ '2022-02-16' │     'Alma Media'     │     'EUR'      │    10.26    │
        │    3    │    39866   │ '2021' │ '2022-02-16' │   'Honkarakenne B'   │     'EUR'      │     6.74    │
        │    4    │  3141306   │ '2021' │ '2022-02-15' │  'Momentum Group B'  │     'SEK'      │   204.00    │
        └─────────┴────────────┴────────┴──────────────┴──────────────────────┴────────────────┴─────────────┘
    */
    for (const reportDataStruct of companiesNotReportedFiltered) {
        const reportsAdded = await fetchAndLoadReports(reportDataStruct);
        if (reportsAdded) {
            reportsAddedArray =  reportsAddedArray.concat(reportsAdded);
        }
    }

    return reportsAddedArray;
}

async function maintainCompanyReports2018(smallTestMode=false) {
    const companiesNotReported = await companyReportManager.getCompanyIdsNotReported2018();
    let companiesNotReportedFiltered = [];
    let reportsAddedArray = [];

    if (smallTestMode) {
        companiesNotReportedFiltered = companiesNotReported.slice(0, 5);
    } else {
        companiesNotReportedFiltered = companiesNotReported;
    }
    let i = 0;
    for (const reportDataStruct of companiesNotReportedFiltered) {
        const reportsAdded = await fetchAndLoadReports2018(reportDataStruct);
        if (reportsAdded) {
            reportsAddedArray =  reportsAddedArray.concat(reportsAdded);
        }
        i++;
        if (i%100 === 0) console.log(i);
    }

    return reportsAddedArray;
}


/**
 * Load all the reports from Millistream , sometimes this means the date_report is empty... no price
 *
 * */
async function fetchAndLoadReports2018(lookingFor) {
    try {
        let startYear = lookingFor.period.substring(0,4);
        let endYear = lookingFor.period.substring(0,4);
        const response = await stockPriceManager.getHistoricPrice(lookingFor.stock_id, lookingFor.date_report );
        lookingFor.price = response.close;
//        console.log('Looking For... ', lookingFor.name, lookingFor.period, lookingFor.price, lookingFor.currency_trade);

        if (lookingFor.price === null) {
            healthCheck.error(`{error: "null_price", company_id: ${lookingFor.company_id}, period: '${lookingFor.period}', name: '${lookingFor.name}', price: ${lookingFor.price}, currency_trade: '${lookingFor.currency_trade}'}`);
        }
        const millistreamReports = await JSON.parse(JSON.stringify(await millistreamManager.getReports(lookingFor.company_id, lookingFor.currency_trade, startYear, endYear)));

        const possiblePeriods = calculatePossiblePeriods(lookingFor.period);
        const report = millistreamReports.find( r => { return possiblePeriods.includes(r.period)   });
        if (!report) {
            const daysLate = moment().diff(lookingFor.date_report, "days");
            if (daysLate > 1) {
                healthCheck.error(`{error: "late_report", company_id: ${lookingFor.company_id} , period: '${lookingFor.period}', name: '${lookingFor.name}', days_late:  ${daysLate} }`);
            } else {
                const time = new Date().toISOString().substring(11,16);
                healthCheck.info(`Checked Millistream for ${lookingFor.name} at ${time}`);
            }
            return null;
        }
        await insertNewCompanyReport(lookingFor, report);




        //healthCheck.info(`  - New report ${report.company_id} ${report.period}  price ${report.price} @ ${report.date_report} `);
        return {company_id: lookingFor.company_id, period: lookingFor.period};

    } catch (error) {
        healthCheck.error(`{error: '${error.message}', company_id: ${lookingFor.company_id}, period: '${lookingFor.period}', name: '${lookingFor.name}', price: ${lookingFor.price}, currency: '${lookingFor.currency_trade}'}`);
        //healthCheck.error(`${error.message}: ${lookingFor.name} ${lookingFor.period} ${lookingFor.price} ${lookingFor.currency_trade}`);
        return null;
    }
}

/**
 * Load all the reports from Millistream , sometimes this means the date_report is empty... no price
 *
 * */
async function fetchAndLoadReports(lookingFor) {
    try {
        let startYear = lookingFor.period.substring(0,4);
        let endYear = lookingFor.period.substring(0,4);
        const response = await stockPriceManager.getHistoricPrice(lookingFor.stock_id, lookingFor.date_report );
        lookingFor.price = response.close;
//        console.log('Looking For... ', lookingFor.name, lookingFor.period, lookingFor.price, lookingFor.currency_trade);

        if (lookingFor.price === null) {
            console.log(`NULL price: ${lookingFor.name} ${lookingFor.period} ${lookingFor.price} ${lookingFor.currency_trade}`);
        }
        const millistreamReports = await JSON.parse(JSON.stringify(await millistreamManager.getReports(lookingFor.company_id, lookingFor.currency_trade, startYear, endYear)));

        const possiblePeriods = calculatePossiblePeriods(lookingFor.period);
        const report = millistreamReports.find( r => { return possiblePeriods.includes(r.period)   });
        if (!report) {
            const daysLate = moment().diff(lookingFor.date_report, "days");
            if (daysLate > 1) {
                console.log(`Checked Millistream for (${lookingFor.name} / ${lookingFor.company_id} / ${lookingFor.period}), it is ${daysLate} days late.`);
            } else {
                const time = new Date().toISOString().substring(11,16);
                console.log(`Checked Millistream for ${lookingFor.name} at ${time}`);
            }
            return null;
        }
        await insertNewCompanyReport(lookingFor, report);
        await updateCalculatedDataToCompanyReport(report);
        await updateCalculatedDataToCompany(report);
        //healthCheck.info(`  - New report ${report.company_id} ${report.period}  price ${report.price} @ ${report.date_report} `);
        return {company_id: lookingFor.company_id, period: lookingFor.period};

    } catch (error) {
        healthCheck.error(`{error: ${error.message}, 
                        company_id: ${lookingFor.company_id} , 
                        period:  ${lookingFor.period} , 
                        name: ${lookingFor.name} ,  
                        price: ${lookingFor.price} , 
                        currency: ${lookingFor.currency_trade}}`);
        return null;
    }
}

/**
 * Millistream Calendar is by Quarter... but the reports served are H1 and H2; so we must look for both.
 * FY reports are not affected.
 * */
function calculatePossiblePeriods(period) {
    let possiblePeriods = [period];

    if (period.substring(5,7) === 'Q2') {
        possiblePeriods.push(`${period.substring(0,4)}-H1`);
    }

    if (period.substring(5,7) === 'Q4') {
        possiblePeriods.push(`${period.substring(0,4)}-H2`);
    }

    return possiblePeriods;
}


async function excludeExistingReports(millistreamReports, existingReports) {
    return millistreamReports.filter(r => {
        return existingReports.map(x => x.period)
                              .indexOf(r.period) === -1
    });
}

async function insertNewCompanyReport(lookingFor, report) {

    report.company_id = lookingFor.company_id;
    report.period = lookingFor.period;  // convert "H1" to "Q2 and "H2" to Q4
    report.type_report = (report.period.length === 4 ? 'FY' : 'Q');
    report.date_report = lookingFor.date_report;
//    report.price = await getCompanyPrice(lookingFor.company_id, report.date_report);
    report.price = lookingFor.price;
    report.costofgoodssold = report.sales - report.gp;
    report.totalliabilities = report.ltliabilities + report.curliabilities;
    report.totalequityandliabilities = report.ltliabilities + report.curliabilities + report.shequity;



    const newReport = await companyReportManager.createCompanyReport(report);
    if (!newReport) {
        healthCheck.error(` Failed to create the company_report ${report.company_id} `);
        return null;
    }
    return newReport;
}



async function updateCalculatedDataToCompanyReport(report) {

    const reports = JSON.parse(JSON.stringify(await companyReportManager.fetchCompanyReports(report.company_id)));
    let eps_ttm = null;
    let sales_ps_ttm = null;

    if (report.type_report === 'Q') {
        const recentReports = await getTtmReports(report, reports);
        /*console.table( recentReports.map( r => {
            return {
                company_id: r.company_id,
                period : r.period,
                eps: r.eps,
                sales : r.sales,
                pe : r.pe,
                ps : r.ps,
                eps_ttm : r.eps_ttm,
                REPORT_price : report.price,
            }})); */

        eps_ttm = recentReports.reduce((sum, r) => sum + r.eps, 0);
        sales_ps_ttm = recentReports.reduce((sum, r) => sum + (r.sales / r.totalnumberofshares), 0);

    } else if (report.type_report === 'FY') {
        eps_ttm = report.eps;
        sales_ps_ttm = _.round((report.sales / report.totalnumberofshares), 5);
    }

    report.eps_ttm = _.round(eps_ttm, 2);
    report.pe = (eps_ttm ? _.round(report.price / eps_ttm, 2) : null);
    report.ps = (sales_ps_ttm ? _.round(report.price / sales_ps_ttm, 2) : null);

    return await companyReportManager.updatePEandPSandEPS(report);
}

async function getTtmReports(report, reports) {
    const ttmFromDate = moment(report.date_report).subtract(12, 'M').format('YYYY-MM-DD');
    report.Qx = report.period.substring(5, 7);

    return reports.filter(r =>
        r.type_report === 'Q' &&
        r.date_report > ttmFromDate &&
        r.date_report <= report.date_report &&
        (r.period.substring(5, 7) !== report.Qx || r.period === report.period)
    );
}


async function updateCalculatedDataToCompany(report) {
    const market_cap = await getMarketCapEurM(report);
    let ceo_comments = null; // TODO

    const next_report_date = await companyCalendarManager.getNextReport(report.company_id);

    await companyManager.updateCompanyWithLatestReport(
        report.company_id,
        report.date_report,
        report.eps_ttm,
        report.sales,
        report.pe,
        market_cap,
        ceo_comments,
        next_report_date,
        report.np)
}


async function getMarketCapEurM(report) {

    if (report.price && report.totalnumberofshares && report.currency) {
        const priceToEURs = await priceToEUR(report.currency, report.price);
        return _.round(report.totalnumberofshares / 1000000 * priceToEURs);
    } else {
        return null;
    }
}

async function priceToEUR(currency, price) {
    switch (currency) {
        case 'EUR':
            return price;
        case 'SEK':
            return price / 10.13;
        case 'NOK':
            return price / 10.05;
        case 'DKK':
            return price / 7.44;
    }
}

async function dataIntegrityProcess() {
    // Check the calendar for events that have not been fulfilled with a report
    const shouldHaveReported = await companyReportManager.shouldHaveReported();

    for (let c of shouldHaveReported) {
        healthCheck.info(`${c.company_id}  ${c.currency}    ${c.name}   ${c.period} ${c.date_report}`);
        const insertedPeriods = await fetchAndLoadReports(c.company_id, c.currency, c.period);
        healthCheck.info(`${insertedPeriods}`);
    }
}


/** Adhoc script to update price , pe and ps on all reports
 *
 * Run this method (... see package.json for details )
 *
 *    npm run check-company-report-price
 *
 * */
async function checkNullPriceReports() {
    // CR.company_id, CR.period, CR.date_report, S.stock_id, S.currency_trade as currency, S.stock_name
    const nullPriceReports = JSON.parse(JSON.stringify(await companyReportManager.checkCompanyReportPrice()));
    for (const nullPriceReport of nullPriceReports) {
        await checkNullPriceReport(nullPriceReport)
    }
}

async function checkNullPriceReport(npr) {
    //npr.company_id, npr.period, npr.date_report, npr.stock_id, npr.currency, npr.stock_name

    try {
        const price = await stockManager.getHistoricPrice(npr.stock_id, npr.date_report);
        if (!price > 0) {
            console.log(`Failed to get price: ${npr.company_id} (${npr.stock_id}) ${npr.period} \t price="${price}"(${npr.date_report}) \t ${npr.stock_name}`);
            return;
        }

        // first update the record...
        const rowsUpdate = await CompanyReport.update({ price: price }, { where: { company_id: npr.company_id, period: npr.period } });
        if (rowsUpdate[0] !== 1) {
            console.log('failed to update the price');
            return;
        }

        const reports = await companyReportManager.fetchCompanyReports(npr.company_id);
        const report = reports.find(r => npr.company_id === r.company_id && npr.period === r.period);
        if (!reports || !report) {
            console.log('Failed to find reports or report');
            return;
        }
        const rowCount = await updateCalculatedDataToCompanyReport(report, reports);
        if (rowCount[0] === 1) {
            console.log(`${npr.company_id} ${npr.period} updated`);
        }

    } catch (error) {
        console.log(error.message);
    }



    return;
}


module.exports = {
    maintainCompanyReports,
    maintainCompanyReports2018,
    fetchAndLoadReports,
    excludeExistingReports,
    updateCalculatedDataToCompanyReport,
    updateCalculatedDataToCompany,
    insertNewCompanyReport,
    getMarketCapEurM,
    priceToEUR,
    dataIntegrityProcess,
    getTtmReports,
    checkNullPriceReports,
    checkNullPriceReport,
}
