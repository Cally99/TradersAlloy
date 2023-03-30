
const userPortfolioPlanService = require('./../services/UserPortfolioPlanService');

module.exports = {

    async getPlan(req, res) {
        const user_id = req.params.user_id;

        const plan = await userPortfolioPlanService.getPlan( user_id );
        res.status(200).send(plan);
    },

    async setPlan(req, res) {
        const plan = req.body;

        const isInserted = await userPortfolioPlanService.setPlan(plan);
        res.status(200).send(isInserted);
    },

    async deletePlan(req, res) {
        const user_id = req.params.user_id;

        const rowsDeleted = await userPortfolioPlanService.deletePlan( user_id  );
        res.status(200).send(rowsDeleted);
    },



}

