const companyManager = require('../../server/managers/CompanyManager');
const companyCalendarManager = require('../../server/managers/CompanyCalendarManager');
const millistreamReportService = require('../../server/loaders/MillistreamReportService');

//const log4js = require('log4js');
//const logger = log4js.getLogger("loader_log");

/**
 *   Update COMPANY_CALENDAR table with all dates for a company
 *
 *   To run this...
 *   node ./scripts/2021-05-10_clean_data/5_refreshCompanyCalendar.js
 *
 * */
try {
    let resultObject = refreshCompanyCalendar();
    process.exitCode = 0;

} catch(error) {
    console.log(error);
}

async function refreshCompanyCalendar() {
    //let companies = [];  // test 1 or 10 companies ... should build a unit test for this !
    //if (true) {
        const companies = JSON.parse(JSON.stringify(await companyManager.list()));
      //  companies = allCompanies.slice(0,100);
    //} else {
    //    const company = JSON.parse(JSON.stringify(await companyManager.get(33032)));
      //  companies.push(company);
    //}

    console.log(  `============== Company Calendar UPDATES ==============` );
    for (c of companies) {
        await reloadCompanyCalendar(c.company_id)
    }
    console.log(  `======================= COMPLETED ====================` );

    async function reloadCompanyCalendar(company_id) {
        console.log(   ` \n ${c.name} ${c.company_id} `  );
        const allPublishedEvents = await millistreamReportService.getCalendarSince2018(company_id);
        if ( !allPublishedEvents ) {
            console.log(`nothing returned from Millistream: ${company_id}`);
            return false;
        }
//      const inDatabase = companyCalendarManager.findAll(company_id);
//      const insertEvents = removeDuplicates(allPublishedEvents, inDatabase);

        for (const event of allPublishedEvents ) {
            console.log( event );
//            console.log(event.period);
            if ( event.period.length === 4 && event.subtype === 3) {
                //event.period = event.period+"-Q4";
                //console.log( "Data fix applied" );
            }


            try {
                await companyCalendarManager.create({
                    company_id: company_id,
                    period: event.period,
                    date_report: event.date,
                    type_report: event.subtype,
                });
            } catch (error) {
                console.log(`ERROR: ${company_id} : ${event.period} ${error.message} ... `);
                continue;
            }
        }
    }

    function refreshCompanyCalendar(company_id) {
        const allPublishedEvents = millistreamManager.getCalendarALL(company_id);
        const inDatabase = companyCalendarManager.findAll(company_id);
        const insertEvents = removeDuplicates(allPublishedEvents, inDatabase);

        for (const event of insertEvents ) {
            //console.log(event);
        }

    }

    /**
     * This works but it is easier to rebuild from empty.
     *
     function removeDuplicates(millistreamArray, databaseArray) {
        let insertDates = [];
        alreadyExistsDoNotAdd:
        for (r of millistreamArray) {
            for (cc of databaseArray) {
                if (r.period === cc.period  && r.date === cc.date_report) {
                    continue alreadyExistsDoNotAdd;
                }
            }
            insertDates.push(r);
        }
        // console.log(insertDates);
        return insertDates;
    }
     */

}
