const UserTradePlan = require('../models').UserTradePlan;
const _ = require('lodash');
const DB = require('../config/DB.js');
let connection = DB.getConnection();

const userTradeManager = require('../managers/UserTradePlanManager');

module.exports = {

    async selectUserTradePlans(user_id) {
        return await userTradeManager.selectUserTradePlans(user_id);
    },

    async selectUserTradePlan(user_id, stock_id) {
        return await userTradeManager.selectUserTradePlan(user_id, stock_id);
    },

    async insertUserTradePlan(body) {
        return await userTradeManager.insertUserTradePlan(body);
    },

    async updateUserTradePlan(trade_plan_id, body) {
        return await userTradeManager.updateUserTradePlan(trade_plan_id, body);
    },

    async deleteUserTradePlan(trade_plan_id) {
        return await userTradeManager.deleteUserTradePlan(trade_plan_id);
    },


}

