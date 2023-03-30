const companyService = require("../services/CompanyService");

module.exports = {
    async getCompaniesAndReports(req, res) {
        const company_id_array = req.body;
        if (company_id_array) {
            const companies = await companyService.getCompaniesAndReports(company_id_array);
            res.status(200).send(companies);
        }
    },
    async companiesAndReportONE(req, res) {
        const company_id = req.body.company_id;
        if (company_id) {
            const company = await companyService.companiesAndReportONE(company_id);
            res.status(200).send(company);
        }
    },

    async list(req, res) {
        const companies = await companyService.list();
        res.status(200).send(companies);
    },

    async minlist(req, res) {
        const companies = await companyService.minlist();
        res.status(200).send(companies);
    },

    async asyncget(req, res) {
        const company_id = req.params.company_id;
        const company = await companyService.get(company_id);
        res.status(200).send(company);
    },

    async textSearch(req, res) {
        const searchString = req.params.searchString;
        const results = await companyService.textSearch(searchString);
        res.status(200).send(results);
    },

    async updateCEOComments(req, res) {
        const company_id = req.params.company_id;
        const ceo_comment = req.body.ceo_comment;

        const result = await companyService.updateCEOComments(company_id, ceo_comment);

        res.status(200).send(result);
    },
};
