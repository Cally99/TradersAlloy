const cron = require('node-cron');
const logFileService = require ('../../services/LogFileService.js');
const MillistreamNewsService = require ('../../loaders/MillistreamNewsService.js');

const log4js = require('log4js');
const healthCheck = log4js.getLogger("health");

/**
 * Check news every hour
 *
 * */
cron.schedule('02 7-19 * * 1-5', async () => {

    let metaData;

    try {

        metaData = await MillistreamNewsService.getNewsBySource();


    } catch (error) {
        healthCheck.error(`${error.message} type: ${error.name}  `);
    } finally {

        healthCheck.info(` * News: ${JSON.stringify(metaData)}`);
    }


}, {
    scheduled: true,
    timezone: "Europe/Stockholm"
});

