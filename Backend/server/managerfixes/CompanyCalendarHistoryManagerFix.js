const CompanyCalendarHistory = require('../models').CompanyCalendarHistory;
const companyCalendarManager = require('../managers/CompanyCalendarManager');
const companyManager = require('../managers/CompanyManager');
const millistreamManager = require('../managers/MillistreamManager');



const DB = require('../helpers/DB');

const log4js = require('log4js');
const healthCheck = log4js.getLogger("health");



module.exports = {

    /**
     *
     * This is used by a rare data integrity check, we load all of Millistream calendar events.
     * We then compare with what we have in our Database.
     *
     * npm run loadCompanyCalendarHistory
     *
     * */
    async loadCompanyCalendarHistory() {
        try {
            console.log('FIXING Calendar...')
            let metaData = {};

            const companies = JSON.parse(JSON.stringify(await companyManager.list()));
            for (const company of companies) {
                await this.loadCompanyCalendarHistoryByCompany(company.company_id);
            }

            metaData.companyCount = companies.length;
            return metaData;

        } catch (e) {
            console.log('failed in loadCompanyCalendarHistory'+e.message);
        }
    },

    async nloadCompanyCalendarHistoryByCompany(company_id) {
        try {
            console.log('FIXING Company... '+company_id);
            const response = await millistreamManager.getCalendarALL(company_id);
            if (response.status !== 200) {
                healthCheck.error(company_id + ' Millistream rejected Calendar Response != 200');
                return -1;
            }

            if (response.data.length === 1) {
                const millistreamEvents = response.data[0].calendarevent;
                if (millistreamEvents) {
                    const events = millistreamEvents.map(me => {
                        return {
                            company_id: company_id,
                            period: me.period,
                            date_report: me.date,
                            type_report: me.subtype,
                        }
                    });

                    await this.insertCompanyCalendarHistory(events);
                    console.log('inserted '+ JSON.stringify(events));

                    return 1;
                }
            }
        } catch (e) {
            console.log('failed in loadCompanyCalendarHistory'+e.message);

        }
    },

    async  insertCompanyCalendarHistory(events) {
        try {
            await CompanyCalendarHistory.bulkCreate(events);
        } catch (error) {
            healthCheck.error( `FATAL error when inserting to company_calendar: company_id:  ${error}`);
        }
    },


};
