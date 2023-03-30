const UserChartLines = require('../models').UserChartLines;

module.exports = {

    // TODO... check this is in the right place
    async check_user_exist(user_id) {
        return await UserChartLines.findAll({where: { user_id }});
    },

    async check_line_exist(user_id, stock_id) {
        return await UserChartLines.findAll({where: { user_id, stock_id }});
    },

    async update_userLines(user_id, stock_id, content) {
        return await UserChartLines.update(
                                    { content: content},
                                    { where: { user_id, stock_id }});
    },

    async create_userLines(user_id, stock_id, content) {
        return await UserChartLines.create({
                                        user_id,
                                        stock_id,
                                        content});
    },

    async fetchUserLinesData(user_id, stock_id) {
        return await UserChartLines.findOne({
                                    where: { user_id, stock_id }});
    }

};
