const Company = require('../models').Company;
const CompanyReport = require('../models').CompanyReport;
const CompanyCalendar = require('../models').CompanyCalendar;
const companyCalendarManager = require('../managers/CompanyCalendarManager');
const log4js = require('log4js');
const logger = log4js.getLogger("app_log");

const DB = require('../helpers/DB');
const connection = DB.getConnection();

module.exports = {

    /**2
     * It is important that be document in detail these small pieces of code
     *
     * 2022-01-29 Andrew Boddy
     *
     * Maintenance script to find and fix NULL next_report_date
     * */
    async fixNullNextReportDate() {
        const promise =  await connection.query(`
            select company_id, name
            from company 
            where next_report_date is null;
            `, { logging: false, nest: false, type: connection.QueryTypes.SELECT });

        const companies = (JSON.parse(JSON.stringify(promise)));


        for (const c of companies) {
            const next_report_date = await companyCalendarManager.getNextReport(c.company_id);
            if (next_report_date !== null) {
                await Company.update( {next_report_date}, {where: { company_id: c.company_id }});
            } else {
                logger.info('No calendar data found for ...'+c);
            }
        }
    },


};
