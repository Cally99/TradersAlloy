const cron = require('node-cron');
const stockInsiderService = require('../../services/StockInsiderService.js');

const log4js = require('log4js');
const healthCheck = log4js.getLogger("health");

const IS_SCRAPE_ON = process.env.IS_SCRAPE_ON

/**
 * Scrape every day at 20:00 from fi.se
 *
 * */
// cron.schedule('0 10 * * *', async() => {
cron.schedule('0 21 * * 1-5', async() => {
    if (IS_SCRAPE_ON) {
        const startTime = Date.now();
        try {
            await stockInsiderService.get_initial();
            healthCheck.info(`Insider Trades: scraped (${ ((Date.now() - startTime) / 1000 / 60).toFixed(2)} minutes ) `);
        } catch (error) {
            healthCheck.error(error.message);
        }
    }
}, {
    scheduled: true,
    timezone: "Europe/Stockholm"
});
