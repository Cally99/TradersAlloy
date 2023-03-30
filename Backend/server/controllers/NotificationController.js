const notificationService = require('./../services/NotificationService');

module.exports = {
    async getNotifications(req, res) {
        const user_id = req.params.user_id;

        const notifications =  await notificationService.getNotifications(user_id);
        res.status(200).send(notifications);
    },

};
