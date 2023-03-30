
const chartService = require("../services/ChartService");
const log4js = require('log4js');
const logger = log4js.getLogger("app_log");


module.exports = {
    async fetchChartNews(req, res) {
        const stock_id = req.params.stock_id;
        const results = await chartService.fetchChartNews(stock_id);
        res.status(200).send(results);
    },

    async fetchChartInsiders(req, res) {
        const stock_id = req.params.stock_id;
        const results = await chartService.fetchChartInsiders(stock_id);
        res.status(200).send(results);
    },

    async fetchChartUserAnnotations(req, res) {
        const stock_id = req.params.stock_id;
        const user_id = req.params.user_id;
        const results = await chartService.fetchChartUserAnnotations(stock_id, user_id);
        res.status(200).send(results);
    },

    async fetchChartEarningsDates(req, res) {
        const stock_id = req.params.stock_id;
        const results = await chartService.fetchChartEarningsDates(stock_id);
        res.status(200).send(results);
    },

    async fetchChartUserTrades(req, res) {
        const stock_id = req.params.stock_id;
        const user_id = req.params.user_id;
        const results = await chartService.fetchChartUserTrades(stock_id, user_id);
        res.status(200).send(results);
    }

};
