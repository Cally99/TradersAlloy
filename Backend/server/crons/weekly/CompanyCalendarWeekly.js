const cron = require('node-cron');
const millistreamCalendarService = require('../../loaders/MillistreamCalendarService.js');
const companyManager = require('../../managers/CompanyManager');
const companyCalendarManager = require('../../managers/CompanyCalendarManager');
const millistreamManager = require('../../managers/MillistreamManager'); // How to use Sinon to Mock with MillistreamController.mock.js ??

const log4js = require('log4js');
const healthCheck = log4js.getLogger("health");

/**
 *  Weekly check on the company scheduled reporting dates
 *
 * */
cron.schedule('0 3 * * Sunday', async() => {
    const startTime = Date.now();
    try {
        await millistreamCalendarService.maintainCompanyCalendars();

    } catch (error) {
        healthCheck.error(error.message);

    } finally {
        const metaData = await companyCalendarManager.check();
        metaData.executionTime =  ((Date.now() - startTime) / 1000 ).toFixed(0) + ' seconds';
        healthCheck.info(`* Company Calendars: ${JSON.stringify(metaData)}`);
    }
}, {
    scheduled: true,
    timezone: "Europe/Stockholm"
});


