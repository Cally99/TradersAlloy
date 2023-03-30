const chartManager = require("../managers/ChartManager.js");

module.exports = {
    async fetchChartNews(stock_id) {
        return await chartManager.fetchChartNews(stock_id);
    },
    async fetchChartInsiders(stock_id) {
        return await chartManager.fetchChartInsiders(stock_id);
    },
    async fetchChartUserAnnotations(stock_id, user_id) {
        return await chartManager.fetchChartUserAnnotations(stock_id, user_id);
    },
    async fetchChartEarningsDates(stock_id) {
        return await chartManager.fetchChartEarningsDates(stock_id);
    },
    async fetchChartUserTrades(stock_id, userID) {
        return await chartManager.fetchChartUserTrades(stock_id, user_id);
    }

};
