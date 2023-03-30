const UserPortfolioPlan = require('../models').UserPortfolioPlan;

module.exports = {

    async getPlan(user_id) {
        return await UserPortfolioPlan.findAll({where: { user_id }});
    },

    async setPlan(diaryItem) {
        return await UserPortfolioPlan.upsert(
            {
                user_id: diaryItem.user_id,
                note: diaryItem.note,
                account_value: diaryItem.account_value,
                monthly_add: diaryItem.monthly_add,
                position_size: diaryItem.position_size
            }
        );
    },

    async deletePlan(user_id) {
        return await UserPortfolioPlan.destroy( {where: { user_id }} );
    },


}

