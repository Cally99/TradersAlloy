const UserSettings = require('../models').UserSettings;
const userSettingsService = require('../services/UserSettingsService');

module.exports = {
    async saveWLColumns(req, res) {
        const user_id = req.body.user_id;
        const content = req.body.content;
        const feature = req.body.feature;
        const body = req.body;

        const response = await userSettingsService.saveUserSettings(user_id, content, feature, body);
        const settingsData = (response ? response : null);

        res.status(200).send(settingsData.data);
    },
    async saveChartOverlays(req, res) {
        const user_id = req.body.user_id;
        const content = req.body.content;
        const feature = req.body.feature;
        const body = req.body;

        const response = await userSettingsService.saveUserSettings(user_id, content, feature, body);
        const settingsData = (response ? response : null);

        res.status(200).send(settingsData.data);
    },

    async loadWLColumns(req, res) {
        const user_id = req.params.user_id;

        const response = await userSettingsService.fetchUserSettingsWLConf(user_id);
        const settingsData = (response ? response : null);

        res.status(200).send(settingsData);
    },

    async loadChartOverlays(req, res) {
        const user_id = req.params.user_id;

        const response = await userSettingsService.loadChartOverlays(user_id);
        const settingsData = (response ? response : null);

        res.status(200).send(settingsData);
    }

}