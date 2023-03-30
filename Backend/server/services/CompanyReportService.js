const _ = require('lodash');

const companyManager = require("../managers/CompanyManager.js");
const companyReportManager = require("../managers/CompanyReportManager.js");
const companyCalendarManager = require("../managers/CompanyCalendarManager.js");
const millistreamManager = require('../managers/MillistreamManager.js');

const log4js = require('log4js');
const logger = log4js.getLogger("app_log");
const healthCheck = log4js.getLogger("health");
const moment = require('moment');

module.exports = {

    async list() {
        return await companyReportManager.list();
    },

    async fetchCompanyReports(company_id){
        return await companyReportManager.fetchCompanyReports(company_id);
    },

    async companyReport_eps(company_id) {
        return await companyReportManager.companyReport_eps(company_id);
    },

    async companyReportPDF(company_id) {
        return await companyReportManager.companyReportPDF(company_id);
    },

    async fetchFinancialsQuarterly(company_id) {
        return await companyReportManager.fetchFinancialsQuarterly(company_id);
    },

    async fetchFinancialsAnnual(company_id) {
        return await companyReportManager.fetchFinancialsAnnual(company_id);
    },

    async fetchFinancials(company_id) {
        const results = await companyReportManager.fetchFinancials(company_id);

        var result = _(results)
            .groupBy('period, ' +
                'eps, ' +
                'sales, ' +
                'profit, ' +
                'pe, ' +
                'ps, ' +
                'gp, ' +
                'ebitda, ' +
                'ebit, ' +
                'ptp, ' +
                'intangibleasset, ' +
                'fixedasset, ' +
                'financialasset, ' +
                'noncurrentasset, ' +
                'cce, ' +
                'currentassets, ' +
                'totalassets, ' +
                'shequity, ' +
                'ltliabilities, ' +
                'curliabilities, ' +
                'totalnumberofshares')
            .map((item, key) => ({
                period: _.map(item, 'period'),
                eps: _.map(item, 'eps'),
                sales: _.map(item, 'sales'),
                profit: _.map(item, 'profit'),
                pe: _.map(item, 'pe'),
                ps: _.map(item, 'ps'),
                gp: _.map(item, 'gp'),
                ebitda: _.map(item, 'ebitda'),
                ebit: _.map(item, 'ebit'),
                ptp: _.map(item, 'ptp'),
                intangibleasset: _.map(item, 'intangibleasset'),
                fixedasset: _.map(item, 'fixedasset'),
                financialasset: _.map(item, 'financialasset'),
                noncurrentasset: _.map(item, 'noncurrentasset'),
                cce: _.map(item, 'cce'),
                currentassets: _.map(item, 'currentassets'),
                totalassets: _.map(item, 'totalassets'),
                shequity: _.map(item, 'shequity'),
                ltliabilities: _.map(item, 'ltliabilities'),
                curliabilities: _.map(item, 'curliabilities'),
                totalnumberofshares: _.map(item, 'totalnumberofshares'),
                pdf_link: _.map(item, 'pdf_link'),
                pdf_language: _.map(item, 'pdf_language')

            }))
            .value()
        return result
    },

    async fetchEarningsDateNext() {
        return await companyReportManager.fetchEarningsDateNext();
    },

    async getActivePdf(pdf) {
        return await millistreamManager.getActivePdf(pdf);
    },

    async getActiveAnalystPdf(pdf) {
        return await millistreamManager.getActiveAnalystPdf(pdf);
    }
};
