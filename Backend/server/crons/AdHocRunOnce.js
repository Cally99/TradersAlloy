const cron = require('node-cron');
const millistreamCompanyService = require('../../services/MillistreamCompanyService.js');
const CompanyManagerHistoryFix = require('../../managerfixes/CompanyCalendarHistoryLoader');

const log4js = require('log4js');
const healthCheck = log4js.getLogger("health");
const common = require('../helpers/common');

/**
 *  RUN ONCE (per year) Intended for ONE-OFF jobs to run on the server
 *
 * */
cron.schedule('30 10 4 2 Friday', async ()=> {
    let metaData = {};

    try {
        if (common.getPlatform() !== 'PROD') {
            return;
        }

        const metaDataReturned = await CompanyManagerHistoryFix.loadCompanyCalendarHistory();
        metaData = Object.assign(metaData, metaDataReturned );



    } catch (error) {
        healthCheck.error(error.message);

    } finally {
        healthCheck.info(`* AdHoc Job: Load company_calendar_history: ${ JSON.stringify(metaData) }  `);
    }
}, {
    scheduled: true,
    timezone: "Europe/Stockholm"
});
