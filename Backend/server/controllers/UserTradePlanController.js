const userTradeService = require('../services/UserTradePlanService');

module.exports = {

    async selectUserTradePlans(req, res) {
        const user_id = Number(req.params.user_id);

        const tradePlans = await userTradeService.selectUserTradePlans(user_id);
        res.status(200).send(tradePlans);
    },

    async selectUserTradePlan(req, res) {
        const user_id = req.params.user_id;
        const stock_id = req.params.stock_id;

        const tradePlanData = await userTradeService.selectUserTradePlan(user_id, stock_id);
        res.status(200).send(tradePlanData);
    },

    async insertUserTradePlan(req, res) {
        const body = req.body;

        const tradePlanData = await userTradeService.insertUserTradePlan(body);
        res.status(200).send(tradePlanData.dataValues);
    },

    async updateUserTradePlan(req, res) {
        const trade_plan_id = req.body.trade_plan_id;
        const body = req.body;

        const tradePlanData = await userTradeService.updateUserTradePlan(trade_plan_id, body);
        res.status(200).send(tradePlanData.data);
    },

    async deleteUserTradePlan(req, res) {
        const trade_plan_id = req.params.trade_plan_id;

        const tradePlanData = await userTradeService.deleteUserTradePlan(trade_plan_id);
        res.status(200).json(tradePlanData);
    },


}

