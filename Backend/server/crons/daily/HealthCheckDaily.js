const cron = require('node-cron');
const logFileService = require ('../../services/LogFileService.js');

const log4js = require('log4js');
const healthCheck = log4js.getLogger("health");

/**
 * Daily Executive Summary of system events to show system status
 *
 * */
cron.schedule('0 23 * * *', async () => {

    try {
        await logFileService.emailTodaysEntries();
    } catch (error) {
        healthCheck.error(`${error.message} type: ${error.name}  `);
    }


}, {
    scheduled: true,
    timezone: "Europe/Stockholm"
});

