const stockExchangeManager = require('../managers/StockExchangeManager');

module.exports = {

    async fetchStockExchanges() {
        return await stockExchangeManager.fetchStockExchanges();
    },

};
