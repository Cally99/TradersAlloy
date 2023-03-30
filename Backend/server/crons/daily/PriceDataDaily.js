const cron = require('node-cron');
const millistreamPriceService = require('../../loaders/MillistreamPriceService.js');
const healthManager = require('../../managers/HealthManager');
const UserEmailDailyService = require ('../../services/UserEmailDailyService.js');
const UserAccountService = require ('../../services/UserAccountService.js');

const log4js = require('log4js');
const healthCheck = log4js.getLogger("health");


/**
 * Daily prices from Millistream
 *
 * Updated node-cron to new version 3.0.0
 * */
// cron.schedule('*/10 * * * * *', async() => {
cron.schedule('30 18 * * 1-5', async() => {

    await loadStockPrices();
    await updateUserAccounts();
    await sendUserEmails();

}, {
    scheduled: true,
    timezone: 'Europe/Stockholm',
});



async function sendUserEmails(startTime, metaData) {
    startTime = Date.now();
    metaData = null;

    try {
        if (process.env.SEND_USER_EMAILS || true) {
            metaData = await UserEmailDailyService.dailyContent();
        }

    } catch (error) {
        healthCheck.error(error.message);

    } finally {
        metaData.executionTime = ((Date.now() - startTime) / 1000).toFixed(0) + ' seconds';
        healthCheck.info(`* User's Daily Email: ${JSON.stringify(metaData)}`);

    }
    return {startTime, metaData};
}


async function updateUserAccounts(startTime, metaData) {

    startTime = Date.now();
    metaData = null;

    try {
        healthCheck.info('Started UserAccountHistory inserts...');
        metaData = await UserAccountService.createUserAccountHistories();

    } catch (error) {
        healthCheck.error(error.message);

    } finally {
        metaData.executionTime = ((Date.now() - startTime) / 1000).toFixed(0) + ' seconds';
        healthCheck.info(`* User Account History : ${JSON.stringify(metaData)}`);

    }
}

async function loadStockPrices() {
    let startTime = Date.now();
    let metaData;

    try {
        metaData = await millistreamPriceService.getClosePricesFromMillistream();

    } catch (error) {
        healthCheck.error(error.message);

    } finally {
        //metaData.goodPricesCount = await healthManager.stocksWithFreshPrice();
        //metaData.problemPricesCount = (await healthManager.stocksWithStalePrice()).length;
        //metaData.executionTime = ((Date.now() - startTime) / 1000 ).toFixed(0) + ' seconds';

        healthCheck.info(`* Stock Prices:  ${ JSON.stringify(metaData) }  `);
    }


}
