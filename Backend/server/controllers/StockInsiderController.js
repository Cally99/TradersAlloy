const stockInsiderService = require('../services/StockInsiderService');

module.exports = {
    async fetchInsiderTrades(req, res) {
        const company_id = req.params.company_id;
        const insiderTrades = await stockInsiderService.fetchInsiderTrades(company_id);
        return res.status(200).send(insiderTrades);
    }
};
