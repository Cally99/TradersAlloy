const UserPortfolioPlanManager = require('../managers/UserPortfolioPlanManager');

module.exports = {

    async getPlan(user_id) {
        return await UserPortfolioPlanManager.getPlan( user_id );
    },

    async setPlan(plan) {
        return await UserPortfolioPlanManager.setPlan(plan);
    },

    async deletePlan(user_id) {
        return await UserPortfolioPlanManager.deletePlan( user_id  );
    },


}
