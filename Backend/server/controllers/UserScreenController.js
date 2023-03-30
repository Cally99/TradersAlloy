const userScreenService = require('../services/UserScreenService');

module.exports = {

    async selectScreens(req, res) {
        const user_id = req.params.user_id;

        const screenData = await userScreenService.selectScreens(user_id);
        res.status(200).send(screenData);
    },

    async insertScreen(req, res) {
        const screen = req.body;

        const screenData = await userScreenService.insertScreen(screen);
        res.status(200).send(screenData.dataValues);
    },

    async updateScreen(req, res) {
        const screen_id = req.body.screen_id;
        const name = req.body.name;

        const screenData = await userScreenService.updateScreen( name, screen_id);
        res.status(200).send(screenData.dataValues);
    },
    async updateScreenFilter(req, res) {
        const screen_id = req.body.screen_id;
        const name = req.body.name;
        const filter = req.body.filter;

        const screenData = await userScreenService.updateScreenFilter(name, screen_id, filter);
        res.status(200).send(screenData.dataValues);
    },

    async deleteScreen(req, res) {
        const screen_id = req.params.screen_id;
        const screenData = await userScreenService.deleteScreen(screen_id);
        res.status(200).send(screenData);
    },

}

