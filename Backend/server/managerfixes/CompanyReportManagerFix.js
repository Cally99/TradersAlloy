const DB = require('../helpers/DB');
const connection = DB.getConnection();


module.exports = {
    /**
     * npm run  fixNullReportDates
     *
     * */
    async fixNullReportDatesFromCompanyCalendarHistory() {

        try {
            console.log(`STARTED...`);
            console.log(connection);

            const response = await connection.query(`
                                select  CR.company_id, CR.period, CCH.date_report
                                FROM   company_report CR ,
                                        company_calendar_history CCH 
                                where  CR.company_id = CCH.company_id
                                and    CR.period = CCH.period
                                and    CR.date_report is null
                                order by 1
                `, {nest: false, type: connection.QueryTypes.SELECT});

            for (const r of JSON.parse(JSON.stringify(response))) {
                try {
                    const rowsUpdated = await connection.query(`
                                update company_report
                                set    date_report = :date_report
                                where  company_id = :company_id
                                and    period = :period                        
                    `, {
                        replacements: {company_id: r.company_id, period: r.period, date_report: r.date_report},
                        nest: false,
                        type: connection.QueryTypes.SELECT
                    });

                    console.log(`${r.company_id}  ${r.period}... updated to ${r.date_report}  rowsUpdated = ${rowsUpdated} `);
                } catch (e) {
                    console.log(`FAILED ${r.company_id}  ${r.period}... updated to ${r.date_report}  `);
                }

            }
        } catch (e) {
            console.log(e.message);
        }





    },



};
