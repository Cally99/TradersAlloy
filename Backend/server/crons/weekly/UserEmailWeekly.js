const cron = require('node-cron');
const UserEmailWeeklyService = require ('../../services/UserEmailWeeklyService.js');

const log4js = require('log4js');
const healthCheck = log4js.getLogger("health");


/**
 * Every Sunday send all users their watchlist by email
 *
 * Can also be run from the Admin interface.
 *
 * */
//cron.schedule('*/15 * * * * *', async () => {
cron.schedule('0 21 * * Friday', async () => {

    const startTime = Date.now();
    let metaData;
    try {
        if (process.env.EMAIL_NEWS_INTERIM) {
            metaData = await UserEmailWeeklyService.weeklyContent();
        }

    } catch (error) {
        healthCheck.error(error.message);

    } finally {
        metaData.executionTime =  ((Date.now() - startTime) / 1000 ).toFixed(0) + ' seconds';
        healthCheck.info(`* User's Daily Email: ${JSON.stringify(metaData)}`);

    }

}, {
    scheduled: true,
    timezone: "Europe/Stockholm"
});


/*
    const startTime = Date.now();
    try {
        const common = require('../helpers/common');
        if (common.getPlatform()==='PROD') {
*/


