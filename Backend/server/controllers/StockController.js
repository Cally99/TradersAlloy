const fs = require('fs');
const stockService = require("../services/StockService");

const log4js = require('log4js');
const logger = log4js.getLogger("app_log");

module.exports = {
    async list(req, res) {
        const stocks = await stockService.list();
        res.status(200).send(stocks);
    },

    async mapStocksAndFinancials(req, res) {
        const company_id_array = req.body;
        const arrayStocks = await stockService.mapStocksAndFinancials(company_id_array);
        res.status(200).send(arrayStocks);
    },
    async fetchAllStocks(req, res) {
        const arrayStocks = await stockService.fetchAllStocks();
        res.status(200).send(arrayStocks);
    },
    async fetchOnePageStocks(req, res) {
        const arrayStocks = await stockService.fetchOnePageStocks();
        res.status(200).send(arrayStocks);
    },

    async fetch(req, res) {
        const stock = await stockService.fetch(req.params.stock_id);
        res.status(200).send(stock);
    },
    async loadAllStocksForAutocompleteOnStartup(req, res) {
        const Stocks = await stockService.loadAllStocksForAutocompleteOnStartup();
        res.status(200).send(Stocks);
    },

    /** This would be better in the service layer (business logic)... so this Controller
     * is only about marshalling API calls
     *
     *
     * Get price data from /Data files for the chart
     *
     * */
    async getPricesFiles(req, res) {
        const stock = await stockService.fetch(req.params.stock_id);

        let fileName = 'server/Data/' + stockService.getBaseFileName(stock) + '.json';
        try {
            if (fs.existsSync(fileName)) {
                fs.readFile(fileName, (err, priceData) => {
                    if (err) {
                        return res.status(400).send(err);
                    }
                    return res.status(200).send(priceData);
                });
            } else {
                return res.status(200).send("No data");
            }
        } catch (error) {
            return res.status(400).send(error);
        }
    },


    /**
     *
     *
     *
     * NEW SINCE 2022-02-17
     *
     *
     * Get price data from /Data files for the chart
     *
     * */
    async getPrices(req, res) {
        const priceData = await stockService.getPrices(req.params.stock_id);

        return res.status(200).send(priceData);
    },
};
