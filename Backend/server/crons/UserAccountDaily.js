const cron = require('node-cron');
const UserAccountService = require ('../../services/UserAccountService.js');

const log4js = require('log4js');
const healthCheck = log4js.getLogger("health");

/**
 * Email user at 19:00 weekdays...
 */
cron.schedule('30 20 * * 1-5', async () => {
    const startTime = Date.now();
    // let metaData;
    //
    // try {
    //     healthCheck.info('Started UserAccountHistory inserts...');
    //     metaData = await UserAccountService.createUserAccountHistories();
    //
    // } catch (error) {
    //     healthCheck.error(error.message);
    //
    // } finally {
    //     metaData.executionTime =  ((Date.now() - startTime) / 1000 ).toFixed(0) + ' seconds';
    //     healthCheck.info(`* User Account History : ${JSON.stringify(metaData)}`);
    //
    // }
    //


}, {
    scheduled: true,
    timezone: "Europe/Stockholm"
});
