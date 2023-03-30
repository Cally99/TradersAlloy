const companyManager = require('../managers/CompanyManager');
const companyCalendarManager = require('../managers/CompanyCalendarManager');

const millistreamManager = require('../managers/MillistreamManager'); // How to use Sinon to Mock with MillistreamController.mock.js ??

const log4js = require('log4js');
const healthCheck = log4js.getLogger("health");


/**
 *     from the CRON job
 *
 * */
async function maintainCompanyCalendars() {
    await companyCalendarManager.truncateCompanyCalendar();

    const companies = JSON.parse(JSON.stringify(await companyManager.list()));
    for (const company of companies) {
        await this.maintainCompanyCalendar(company.company_id);  // async await is much slower but ... check() needs to wait
    }
}


async function maintainCompanyCalendar(company_id) {
    const response = await millistreamManager.getCalendar(company_id);
    if (response.status !== 200) {
        healthCheck.error(company_id + ' Millistream rejected Calendar Response != 200');
        return -1;
    }

    if (response.data.length === 1) {
        const millistreamEvents = response.data[0].calendarevent;
        if (millistreamEvents) {
            const events =  millistreamEvents.map( me => {
                return {
                    company_id: company_id,
                    period: me.period,
                    date_report: me.date,
                    type_report: me.subtype,
                }
            });
            await companyCalendarManager.insertCompanyCalendar(events);

            // Add Q4 row for every Full Year
            const q4events =  millistreamEvents
                                    .filter( me => me.period.length === 4)
                                    .map(fullYearEvent => {
                                        return {
                                            company_id: company_id,
                                            period: fullYearEvent.period+'-Q4',
                                            date_report: fullYearEvent.date,
                                            type_report: 4,
                                        }
                                    });
            await companyCalendarManager.insertCompanyCalendar(q4events);



            return 1;
        }
    }

}

/** Adhoc script to report the discrepancies of the
 * company_calendar table vs. what Millistream has for
 * each company.
 *
 * Run this method (... see package.json for details )
 *
 *    npm run check-company-calendar
 *
 * */
async function checkCompanyCalendars() {
    const companies = JSON.parse(JSON.stringify(await companyManager.list()));
    for (const c of companies) {
        await this.checkCompanyCalendar(c.company_id)
    }
}

/** adhoc job to validate the company calendar. How to run this ?
 * */
async function checkCompanyCalendar(company_id) {
    const response = await millistreamManager.getCalendar(company_id);
    if (response.status !== 200) {
        console.log(company_id, response.status);
        return;
    }
    if (response.data.length === 1) {
        const msEvents = response.data[0].calendarevent;
        if (msEvents) {
            const events = await companyCalendarManager.getEvents(company_id);


            // Identify any differences in dates
            for (const event of events) {
                const msEvent = msEvents.find(e => e.period === event.period);
                if (msEvent.date !== event.date_report) {
                    console.log(`${company_id} ${event.period} ${event.date_report}  ${msEvent.date}`);
                }
            }

            // Identify
            const missingEvents = msEvents.filter(r => {
                return events.map(x => x.period).indexOf(r.period) === -1
            });
            if (missingEvents.length > 0) {
                console.log(JSON.stringify(missingEvents));
            }

        }
    }

    return;
}

//require('make-runnable');

module.exports = {
    maintainCompanyCalendars,
    maintainCompanyCalendar,
    checkCompanyCalendar,
    checkCompanyCalendars,
}
