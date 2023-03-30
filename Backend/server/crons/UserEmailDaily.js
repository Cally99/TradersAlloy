const cron = require('node-cron');
const UserEmailDailyService = require ('../../services/UserEmailDailyService.js');

const log4js = require('log4js');
const healthCheck = log4js.getLogger("health");

/**
 * Email user at 19:00 weekdays...
 */
cron.schedule('10 19 * * 1-5', async () => {
    const startTime = Date.now();
    // let metaData;
    //
    // try {
    //     if (process.env.SEND_USER_EMAILS||true) {
    //         metaData = await UserEmailDailyService.dailyContent();
    //     }
    //
    // } catch (error) {
    //     healthCheck.error(error.message);
    //
    // } finally {
    //     metaData.executionTime =  ((Date.now() - startTime) / 1000 ).toFixed(0) + ' seconds';
    //     healthCheck.info(`* User's Daily Email: ${JSON.stringify(metaData)}`);
    //
    // }



}, {
    scheduled: true,
    timezone: "Europe/Stockholm"
});
