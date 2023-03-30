const CompanyWebcastService = require("../services/CompanyWebcastService");

module.exports = {
    async list(req, res) {
        const companyWebcast = await CompanyWebcastService.list();
        res.status(200).send(companyWebcast);
    },

    async getOneCompanyWebcast(req, res) {
        const company_id = req.params.company_id;
        const news = await CompanyWebcastService.getOneCompanyWebcast(company_id);
        res.status(200).send(news);
    },
};