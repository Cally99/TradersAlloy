const UserResearch = require('../models').UserResearch;
const userResearchService = require('../services/UserResearchService');


module.exports = {

    async fetchContent(req, res) {
        const user_id = req.body.user_id;
        const stock_id = req.body.stock_id;

        const researchData = await userResearchService.fetchContent(user_id, stock_id);
        res.status(200).send(researchData);
    },

    async writeContent(req, res) {
        const user_id = req.body.user_id;
        const stock_id = req.body.stock_id;
        const ticker = req.body.ticker;
        const content = req.body.content;

        const researchData = await userResearchService.writeContent(user_id, stock_id, ticker, content);
        res.status(200).send(researchData);
    },

    async deleteContent(req, res) {
        const user_id = req.body.user_id;
        const stock_id = req.body.stock_id;

        await UserResearch.destroy({ where: { user_id, stock_id } });
        res.status(200).send('Successfully deleted user research');
    },

    async fetchResearchData(req, res) {
        const user_id = req.params.user_id;

        const researchData = await userResearchService.fetchResearchData(user_id);
        res.status(200).send(researchData);
    },

    // This controller function is never used in the router
    async setIsShared(req, res) {
        const user_id = req.body.user_id;
        const stock_id = req.body.stock_id;

        const researchData = await userResearchService.setIsShared(user_id, stock_id);
        res.status(researchData.flag ? 200 : 400).send(researchData.data);
    },
};
