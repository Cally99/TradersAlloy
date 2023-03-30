const UserTradePlan = require('../models').UserTradePlan;

module.exports = {

    async selectUserTradePlans(user_id) {
        return await UserTradePlan.findAll({ where: { user_id }});
    },

    async selectUserTradePlan(user_id, stock_id) {   // TODO: this does not make sense: could return many *planS*
        return UserTradePlan.findAll( { where: { user_id, stock_id }});
    },

    async insertUserTradePlan(body) {
        return UserTradePlan.create(body);
    },

    async updateUserTradePlan(trade_plan_id, body) {
        return await UserTradePlan.update(body,
                                    { where: { trade_plan_id },
                                        returning: true});
    },

    async deleteUserTradePlan(trade_plan_id) {
        return await UserTradePlan.destroy({ where: { trade_plan_id }});
    },

};

