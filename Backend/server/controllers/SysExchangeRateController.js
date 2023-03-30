const exchangeRateService = require('./../services/SysExchangeRateService');

module.exports = {

    async getExchangeRates(req, res) {
        try {
            const exchangeRates = await exchangeRateService.getExchangeRates();
            res.status(200).send(exchangeRates);

        } catch (e) {
            console.log(e);
        }
    },

};
