const CompanyAnalystsManager = require('../managers/CompanyAnalystsManager');

module.exports = {

    async list() {
        return await CompanyAnalystsManager.list();
    },

    async getOneCompanyAnalysis(company_id) {
        return await CompanyAnalystsManager.getOneCompanyAnalysis(company_id);
    },

}