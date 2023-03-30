const backofficeCompanyService = require("../services/BackofficeCompanyService");
const backofficeUserService = require("../services/BackofficeUserService");
const millistreamReportService = require("../loaders/MillistreamReportService");
const millistreamCalendarService = require("../loaders/MillistreamCalendarService");

const logFileService = require("../services/LogFileService");
const companyCalendarService = require("../services/CompanyCalendarService");

const log4js = require('log4js');
const logger = log4js.getLogger("app_log");


module.exports = {

    async getCompanyCalendars(req, res) {
        const calendars = await companyCalendarService.getCompanyCalendars();
        res.status(200).send(calendars);
    },

    async getMissingReports(req, res) {
        const messages = await millistreamReportService.getMissingReports();
        res.status(200).send(messages);
    },

    async getReportFromMillistream (req, res) {
        const company_id = req.params.company_id;

        const message = await millistreamReportService.fetchAndLoadReports(company_id);

        console.log(message);
        res.status(200).send(message);
    },

    async getUserDataDump(req, res) {
        console.log(' doing the business thing' );
        const dump = await backofficeUserService.getUserDataDump();
        return res.status(200).send(dump);
    },

    async getCompanyDataDump(req, res) {
        const dump = await backofficeCompanyService.getCompanyDataDump();
        res.status(200).send(dump);
    },

    async healthCheck(req, res) {
        const dump = await logFileService.getTodaysEntries();
        res.status(200).send(dump);
    },

    async checkMillistreamCalendars(req, res) {
        const calendars = await millistreamCalendarService.checkCompanyCalendars();
        res.status(200).send(calendars);
    },


    async getDataIntegrity(req, res) {
        const dump = await backofficeCompanyService.getDataIntegrity();
        res.status(200).send(dump);
    },

};
