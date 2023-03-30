const cron = require('node-cron');
const millistreamCompanyService = require('../../loaders/MillistreamCompanyService.js');

const log4js = require('log4js');
const healthCheck = log4js.getLogger("health");

/**
 *  DAILY
 *
 * */
cron.schedule('0 3 * * 1-5', ()=> discoverNewStocksAndCompanies(), {
    scheduled: true,
    timezone: "Europe/Stockholm"
});


async function  discoverNewStocksAndCompanies() {

    const startTime = Date.now();
    let metaData;

    try {
        metaData = await millistreamCompanyService.discoverNewStocksAndCompanies();

    } catch (error) {
        healthCheck.error(error.message);

    } finally {
        metaData.executionTime = ((Date.now() - startTime) / 1000 ).toFixed(2) + ' seconds';
        healthCheck.info(`* Company IPOs:  ${ JSON.stringify(metaData) }  `);
    }

}

module.exports = {
    discoverNewStocksAndCompanies,
}
