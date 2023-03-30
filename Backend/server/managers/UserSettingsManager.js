const UserSettings = require('../models').UserSettings;

module.exports = {

    async check_userSettings_exist(user_id, feature) { // TODO: check this is used.
        return await UserSettings.findOne({ where: { user_id: user_id, feature: feature } });
    },

    async updateUserSettings(user_id, content, feature) {
        return await UserSettings.update({ content: content }, {
            where: { feature, user_id },
            returning: true
        });
    },

    async createUserSettings(body) {
        return await UserSettings.create(body);
    },

    async fetchUserSettingsWLConf(user_id) {
        return await UserSettings.findOne({ where: { user_id, feature: 'WATCHLIST' } });
    },

    async loadChartOverlays(user_id) {
        return await UserSettings.findOne({ where: { user_id, feature: 'CHART' } });
    }

}