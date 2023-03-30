const userChartLinesManager = require("../managers/UserChartLinesManager.js");


module.exports = {

    async save_UserLines(user_id, stock_id, content) {
        const is_user_exist = await userChartLinesManager.check_user_exist(user_id)
        if (is_user_exist) {
            const is_line_exist = await userChartLinesManager.check_line_exist(user_id, stock_id)
            if (is_line_exist.length >= 1 ) {
                return await userChartLinesManager.update_userLines(user_id, stock_id, content)
            } else {
                return await userChartLinesManager.create_userLines(user_id, stock_id, content)
            }
        } else {
            throw new Error('Not_exist_user')
        }
    },

    async fetchUserLinesData(user_id, stock_id) {
        return await userChartLinesManager.fetchUserLinesData(user_id, stock_id);
    }

};
