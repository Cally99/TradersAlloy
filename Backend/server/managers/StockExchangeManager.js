const StockExchange = require('../models').StockExchange;

module.exports = {
    async fetchStockExchanges() {
        return await StockExchange.findAll();
    },

};
