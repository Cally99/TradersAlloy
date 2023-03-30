// const UserTrade = require('../models').UserTrade;
const userTradeService = require('../services/UserTradeService');

const log4js = require('log4js');
const logger = log4js.getLogger("app_log");

module.exports = {

    // Two sets of code (for UserTrade and TradeHistory) were combined (they had the same functionality).
    // This has created duplicate methods collected in this file.

    // Before deleting junk code (which costs us time to own and maintain) we should create Unit Tests that
    // define the functionality needed; we can then delete code with confidence. // Andrew

    async getUserTrades(req, res) {
        const trades = await userTradeService.getUserTrades(req.params.user_id);
        res.status(200).send(trades);
    },

    async selectUserTrades(req, res) {
        const user_id = req.params.user_id;

        const tradeData = await userTradeService.selectUserTrades(user_id);
        res.status(200).send(tradeData);
    },

    /// This has a duplicate name on the API service: as discussed with Ulf
    async getUserTradeByStock(req, res) {
        const trades = await userTradeService.getUserTradeByStock(req.params.user_id, req.params.stock_id);
        res.status(200).send(trades);
    },

    async insertUserTrade(req, res) {
        const ut = req.body;

        const userTrade = await userTradeService.insertUserTrade(ut);
        res.status(200).send(userTrade.data);
    },

    async actionUserTrade(req, res) {
        const trades = await userTradeService.actionUserTrade(req.body);
        res.status(200).send(trades);
    },

    async insertTradeHistory(req, res) {
        const trades = await userTradeService.insertTradeHistory(req.body);
        res.status(200).send(trades);
    },

    async deleteUserTrade(req, res) {
        const trade_id = req.params.trade_id;

        const tradeData = await userTradeService.deleteUserTrade(trade_id);
        res.status(200).send(tradeData.data);
    },

    async updateTradeHistory(req, res) {
        const trade = await userTradeService.updateTradeHistory(req.body, req.body.trade_id);
        res.status(200).send(trade);
    },

    async updateUserTrade(req, res) {
        const trade_id = req.body.trade_id;
        const body = req.body;

        const tradeData = await userTradeService.updateUserTrade(trade_id, body);
        res.status(200).send(tradeData.data);
    },

    async updateArrayOfUserTrades(req, res) {
        const data = req.body;

        const tradeData = await userTradeService.updateArrayOfUserTrades(data);
        res.status(200).send(tradeData);
    },

    ///////////////////////////////////////////////////
    // other unique methods (not duplicates)
    async insertArrayOfUserTrades(req, res) {
        const uts = req.body;
        const tradeData = await userTradeService.insertArrayOfUserTrades(uts);

        res.status(200).send(tradeData);
    },

    async deleteUserTradeOnUserIdAndStockId(req, res) {
        const body = req.body;

        const tradeData = await userTradeService.deleteUserTradeOnUserIdAndStockId(body);
        res.status(200).send(tradeData.data);
    },

    async deleteUserTradeOnUserId(req, res) {
        const user_id = req.params.user_id;

        const tradeData = await userTradeService.deleteUserTradeOnUserId(user_id);
        res.status(200).send(tradeData.data);
    }


}

