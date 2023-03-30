const CompanyCalendar = require('../models').CompanyCalendar;
const DB = require('../helpers/DB');
const connection = DB.getConnection();

const log4js = require('log4js');
const logger = log4js.getLogger("app_log");
const healthCheck = log4js.getLogger("health");


module.exports = {

    async check() {
        const companiesWithEvents = await connection.query(`
                SELECT count( distinct company_id)
                FROM   company_calendar
                `,
            {  type: connection.QueryTypes.SELECT, nest: false });

        const companyCount = await connection.query(`
                SELECT count(*)
                FROM   company
                `,
            {  type: connection.QueryTypes.SELECT, nest: false })

        const metaData = {
            companyCount: companyCount[0].count,
            companiesWithEvents: companiesWithEvents[0].count,
        };

        return metaData;
    },

    async getEvents( company_id ) {
        return await CompanyCalendar.findAll( { where: { company_id }}, {raw: true});
    },

    /**
     * */
    async findAll( company_id ) {
        return await CompanyCalendar.findAll( { where: { company_id }});
    },

    async update( cc ) {
        return await CompanyCalendar.update(
                                        {date_report: cc.date_report},
                                        {where: {company_id: cc.company_id, period: cc.period}});
            //        returning: true,  // returns the updated object
            //            plain: true       // returns the updated object : with less noise
    },

    async create( company_calendar ) {
        return await CompanyCalendar.create( company_calendar );
    },

    async getNextReport (company_id) {
        const rows = await connection.query(`
                SELECT min(date_report) as next_report_date
                FROM   company_calendar 
                WHERE  company_id = :company_id
                AND    date_report > CURRENT_DATE
                `,
            { replacements: { company_id }, type: connection.QueryTypes.SELECT, nest: false })

        return rows[0].next_report_date ;
    },

    async noEvents6months () {
        const rows = await connection.query(`
                                select C.company_id, C.name, max(CC.date_report) as max_date_report
                                from company C, company_calendar CC
                                where C.company_id not in (
                                        select  company_id
                                        from company_calendar
                                        where date_report between CURRENT_DATE and CURRENT_DATE+180
                                )
                                and C.company_id = CC.company_id
                                group by 1,2
                                order by 1
                `,{ type: connection.QueryTypes.SELECT, nest: false })

        return rows;
    },

    /**
     *
     */
    async  insertCompanyCalendar(events) {
        try {
            await CompanyCalendar.bulkCreate(events);
        } catch (error) {
            healthCheck.error( `FATAL error when inserting to company_calendar: company_id:  ${error}`);
        }
    },

    /**
     * Remove all data to be rebuilt each week
     */
    async  truncateCompanyCalendar() {
        await CompanyCalendar.destroy({ truncate : true, cascade: false });
    },





    /**   OLD ?
     * CHANGE OF POLICY - do not delete old events
     * */
    async deletePastCalendarSchedule() {
        logger.debug("Delete reports for compaines reported at the day before yesterday.");
        /**
         * There are 2 cron jobs for company* tables - weekly(for company_calendar) and daily(for company_report)
         * If weekly job run before daily job, "today" date might be removed before inserting CR table.
         * So that I remove the past dates before yesterday.
         */
        return await connection.query(`
                DELETE  
                FROM    company_calendar as CC
                WHERE   CC.date_report  <  CURRENT_DATE - integer '1'
            `, {nest: false, type: connection.QueryTypes.SELECT},
        );
    }
};
