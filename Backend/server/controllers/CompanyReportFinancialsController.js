const CompanyReportFinancialsService = require('../services/CompanyReportFinancialsService')

module.exports = {
    async fetchMapFinancials(req, res) {
        const arrayFinancials = await CompanyReportFinancialsService.fetchMapFinancials();
        res.status(200).send(arrayFinancials);
    },
    async fetchMapFinancialsYear(req, res) {
        const arrayFinancials_years = await CompanyReportFinancialsService.fetchMapFinancialsYear();
        res.status(200).send(arrayFinancials_years);
    },
    
    //This feels like never used on the app...
    async fetchFinancialData(req, res) {
        const mapFinancials = await CompanyReportFinancialsService.getMapFinancialsData();
        res.status(200).send(mapFinancials.get(req.params.company_id));
    }
};