const companyReportService = require("../services/CompanyReportService");
const log4js = require('log4js');
const logger = log4js.getLogger("app_log");
const _ = require('lodash');

module.exports = {

    async list(req, res) {
        const c_reports = await companyReportService.list();
        res.status(200).send(c_reports);
    },

    async getCompaniesAndReports (req, res) {
        const company_id = req.params.company_id;
        const company_reports = await companyReportService.fetchCompanyReports(company_id);
        res.status(200).send(company_reports);
    },

    async fetchCompanyReports (req, res) {
        const company_id = req.params.company_id;
        const company_reports = await companyReportService.fetchCompanyReports(company_id);
        res.status(200).send(company_reports);
    },

    async companyReport_eps(req, res) {
        const company_id = req.params.company_id;
        const c_reports = await companyReportService.companyReport_eps(company_id);
        res.status(200).send(c_reports);
    },

    async companyReportPDF(req, res) {
        const company_id = req.params.company_id;
        const c_reports = await companyReportService.companyReportPDF(company_id);
        res.status(200).send(c_reports);
    },

    async fetchFinancialsQuarterly(req, res) {
        // Keep the comments here until we know how this
        // specific error message should work with the errorHandler
        // try {
        const company_id = req.params.company_id;
        const c_reports = await companyReportService.fetchFinancialsQuarterly(company_id);
        res.status(200).send(c_reports);
        // } catch(error) {
        //     logger.error('--1 '+error.message);
        //     logger.error(error.message);
        //     res.status(400).send(error);
        // }
    },

    async fetchFinancialsAnnual(req, res) {
        // Keep the comments here until we know how this
        // specific error message should work with the errorHandler
        // try {
        const company_id = req.params.company_id;
        const c_reports = await companyReportService.fetchFinancialsAnnual(company_id);
        res.status(200).send(c_reports);
        // } catch(error) {
        //     logger.error('--2 '+error.message);
        //     res.status(400).send(error);
        // }
    },

    async fetchFinancials(req, res) {
        // Keep the comments here until we know how this
        // specific error message should work with the errorHandler
        // try {
        logger.info('Entered fetchFinancials... check for PDFs');
        const company_id = req.params.company_id;
        const c_reports = await companyReportService.fetchFinancials(company_id);
        res.status(200).send(c_reports);
        // } catch(error) {
        //     logger.error('--3 '+error.message);
        //     res.status(400).send(error);
        // }
    },

    async fetchEarningsDateNext(req, res) {
        const c_reports = await companyReportService.fetchEarningsDateNext();
        res.status(200).send(c_reports);
    },

    async getActivePdf(req, res) {
        const pdf = req.params.pdf;
        const response = await companyReportService.getActivePdf(pdf);

        res.status(200).send(response);
    },

    async getActiveAnalystPdf(req, res) {
        const pdf = req.body.pdf;
        const response = await companyReportService.getActiveAnalystPdf(pdf);

        res.status(200).send(response);
    }


};
