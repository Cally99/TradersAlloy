const userScreenManager = require('../managers/UserScreenManager');

module.exports = {

    async selectScreens(user_id) {
        const data = await userScreenManager.selectScreens(user_id);
        return data;
    },

    async insertScreen(screen) {
        const data = await userScreenManager.insertScreen(screen);
        return data;
    },

    async updateScreen(name, screen_id) {
        const data = await userScreenManager.updateScreen(name, screen_id);
        return data;
    },
    async updateScreenFilter(name, screen_id, filter) {
        const data = await userScreenManager.updateScreenFilter(name, screen_id, filter);
        return data;
    },

    async deleteScreen(screen_id) {
        const data = await userScreenManager.deleteScreen(screen_id);
        return data;
    },

}

