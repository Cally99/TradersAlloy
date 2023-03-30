const UserSettings = require('../models').UserSettings;
const userSettingsManager = require('../managers/UserSettingsManager');

module.exports = {
    async saveUserSettings(user_id, content, feature, body) {
        const is_exit = await userSettingsManager.check_userSettings_exist(user_id, feature);
        if (is_exit) {
            const data = await userSettingsManager.updateUserSettings(user_id, content, feature);
            return data;
        } else {
            const data = await userSettingsManager.createUserSettings(body);
            return data;
        }
    },

    async fetchUserSettingsWLConf(user_id) {
        const data = await userSettingsManager.fetchUserSettingsWLConf(user_id);
        return data;
    },

    async loadChartOverlays(user_id) {
        const data = await userSettingsManager.loadChartOverlays(user_id);
        return data;
    }

}