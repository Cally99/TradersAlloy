const userChartLinesService = require("../services/UserChartLinesService");
const log4js = require('log4js');
const logger = log4js.getLogger("app_log");

const UserChartLines = require('./../../server/models').UserChartLines;

module.exports = {
    async save_UserLines(req, res) {
        const lines = await userChartLinesService.save_UserLines(req.body.user_id, req.body.stock_id, req.body.content);
        res.status(200).send(lines);
    },

    async deleteUserChartLinesOnUserId(req, res) {
        const user_id = req.params.user_id;

        await UserChartLines.destroy({ where: { user_id:  user_id} });
        res.status(200).send('Successfully deleted all user chart lines for the user');
    },

    async fetchUserLinesData(req, res) {
        const lines = await userChartLinesService.fetchUserLinesData(req.body.user_id, req.body.stock_id);
        res.status(200).send(lines);
    }

};
