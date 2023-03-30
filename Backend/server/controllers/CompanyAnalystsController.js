const CompanyAnalystsService = require("../services/CompanyAnalystsService");

module.exports = {
    async list(req, res) {
        const companyAnalysts = await CompanyAnalystsService.list();
        res.status(200).send(companyAnalysts);
    },

    async getOneCompanyAnalysis(req, res) {
        const company_id = req.params.company_id;
        const companyAnalysts = await CompanyAnalystsService.getOneCompanyAnalysis(company_id);
        res.status(200).send(companyAnalysts);
    },
};