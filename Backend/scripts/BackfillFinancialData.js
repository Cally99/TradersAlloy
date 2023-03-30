require('dotenv').config()

const companyManager = require("../server/managers/CompanyManager.js");
const stockManager = require("../server/managers/StockManager.js");
const log4js = require('log4js');
const logger = log4js.getLogger("app_log");
const companyReportManager = require('../server/managers/CompanyReportManager');
const millistreamManager = require('../server/managers/MillistreamManager'); // How to use Sinon to Mock with MillistreamController.mock.js ??

let processCount = 300
let totalCount = 0

/**
 * Paul 2021-03-07
 * This script is for Back-fill Financial Data & PDF links.
 * We have getQuarterlyResults() in /services/MillistreamReportService.js, But there are gaps in our data.
 * This script is best resolved by creating a maintenance script
 * Copy the logic of getQuarterlyResults().
 * Insert the missing data. This will include inserting to tables company_report and company_report_pdf.
 * / */

async function getQuarterlyResults () {
    try {
        const companies = await companyManager.list();
        totalCount = companies.length
        for (const itr of companies) {
            let company = itr.dataValues;
            const startDate = '2020-01-01'
            const reports = await millistreamManager.getReports(company.company, startDate);
            if (!(reports.data[0] && reports.data[0].fundamentals.length != 0)) {
                continue;
            }
            const currencies = ['EUR', 'SEK', 'DKK', 'NOK','USD'];
            const reportsForThisPeriod = reports.data[0].fundamentals.filter    (report => {
                if ((currencies.includes( report.currency ))) {
                    return report;
                }
            });
            const stocks = await stockManager.listByCompany(company.isin.toString());

            for (const report of reportsForThisPeriod) {
                // find the stock price and currency for further calculations
                const stock = stocks.find(s => s.currency_trade === report.currency); // period and currency matched

                if(stock !== undefined && report.sales && report.eps && report.period && report.eventlinklanguages && report.eventlink && report.eventlinklanguages.length == 2) {
                    report.pe = (stock.price_today / report.eps).toFixed(2);
                    report.ps = (stock.price_today / report.sales).toFixed(2);
                    report.eps = report.eps.toFixed(4);

                    await companyReportManager.createCompanyReport(company, report);
                    await companyReportManager.createCompanyReportPDF(company.isin, report.period, company.company, report.eventlinklanguages, report.eventlink);
                }
            }
            processCount ++;
            console.log('&&&&&&&&&&&&&&&&&&&&&', processCount, totalCount);
        }

    } catch (error) {
        console.log('------------- error ------------', error)
    } finally {
        console.log('************* finally DONE ***************')
    }
}


module.exports = {
    getQuarterlyResults
}
