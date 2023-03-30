const stockExchangeService = require('../services/StockExchangeService');



module.exports = {

    async fetchStockExchanges(req, res) {
        const stockExchanges = await stockExchangeService.fetchStockExchanges();
        return res.status(200).send(stockExchanges);
    },

    // TODO: Do we use this anywhere ?
    async list(req, res) {
        return await this.fetchStockExchanges(req, res);
    },



};
