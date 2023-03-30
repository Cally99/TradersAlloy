const exchangeRateManager = require('./../managers/SysExchangeRateManager');

const moment = require('moment');

module.exports = {
    async getExchangeRates() {
        return await exchangeRateManager.getExchangeRates();
    },

};
