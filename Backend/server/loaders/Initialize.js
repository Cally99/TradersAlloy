const millistreamManager = require('../managers/MillistreamManager');
const MillistreamCompanyService = require('../loaders/MillistreamCompanyService');
const MillistreamCalendarService = require('../loaders/MillistreamCalendarService');
const MillistreamReportService = require('../loaders/MillistreamReportService');

const MillistreamPriceService = require('../loaders/MillistreamPriceService');
const stockManager = require('../managers/StockManager');

const log4js = require('log4js');
const logger = log4js.getLogger("app_log");


module.exports = {

    /**
     * */
    async loadStock() {
        try {
            console.log('STARTED: stock and company');
            const response = await millistreamManager.getAllCompanies();

            // DEV phase
            let stocks = response.data;
            // console.log(response.data[0]);

            stocks = stocks.filter(x => ( x.list.match(/33620/)   ? false : true  ));   // exclude First North Stockholm traded in NOK

            for (const stock of stocks) {
                await MillistreamCompanyService.insertStock(stock);

                console.log(`Inserted ${stock.name}`);
            }
            console.log('DONE: stock and company');
            process.exit(0); // default standard for success
        } catch (e) {
            console.log(e.stack);
            process.exit(1);
        }
    },

    async loadCompanyCalendar() {
        try {
            console.log('STARTED: company_calendar');

            await MillistreamCalendarService.maintainCompanyCalendars();

            console.log('DONE: company_calendar');
            process.exit(0);
        } catch (e) {
            console.log(e.stack);
            process.exit(1);
        }
    },

    async loadCompanyCalendarHistory() {
        console.log('Please reuse the b_company_calendar_history I loaded last night');
        process.exit(0);

    },

    async loadStockPrice() {
        try {
            console.log('STARTED: stock_price');
            const stocks = JSON.parse( JSON.stringify( await stockManager.getAllStocks()));

            console.log(stocks);
            for (const stock of stocks) {
                await MillistreamPriceService.loadAndSavePrices2018(stock.stock_id);
                console.log(`Inserted ${stock.name}`);
            }
            console.log('DONE: stock_price');
            process.exit(0);
        } catch (e) {
            console.log(e.stack);
            process.exit(1);
        }
    },

    async loadCompanyReport() {
        // RUN THIS FROM CRON TO GET LOGS
        // see CompanyReportsDaily2018.js
    },

};
