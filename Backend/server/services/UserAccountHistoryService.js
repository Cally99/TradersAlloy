const userAccountHistoryManager = require('./../managers/UserAccountHistoryManager');

module.exports = {
    async getUserAccountHistory(user_account_id) {
        return await userAccountHistoryManager.getUserAccountHistory(user_account_id);
    },

    async createUserAccountHistory() {
        return await userAccountHistoryManager.getAllUserAccounts();
    },

};
