const CompanyAnalysis = require('../models').CompanyAnalysis;

module.exports = {
    async list() {
        return await CompanyAnalysis.findAll();
    },

    async getOneCompanyAnalysis(company_id) {
        const deepObject = await CompanyAnalysis.findAll({
            where: { company_id: company_id }
        });
        return deepObject;
    },
};