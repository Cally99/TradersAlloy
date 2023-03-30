const companyManager = require("../managers/CompanyManager.js");
// const RedisCache = require("../helpers/RedisCache");

module.exports = {
    async getCompaniesAndReports(company_id_array) {
        // return await RedisCache.cacheCompanies("companiesKey");
        return await companyManager.getCompaniesAndReports(company_id_array);
    },
    async companiesAndReportONE(company_id) {
        return await companyManager.companiesAndReportONE(company_id);
    },
    async getCompaniesAll() {
        return await companyManager.getCompaniesAll();
    },

    async list() {
        return await companyManager.list();
    },

    async minlist() {
        return await companyManager.minlist();
    },

    async asyncget(company_id) {
        return await companyManager.asyncget(company_id);
    },

    async textSearch(searchString) {
        return await companyManager.textSearch(searchString);
    },

    async updateCEOComments(company_id, ceo_comment) {
        return await companyManager.updateCEOComments(company_id, ceo_comment);
    }
};