const userAccountManager = require('./../managers/UserAccountManager');
const userAccountHistoryManager = require('./../managers/UserAccountHistoryManager');
const userTradeManager = require('./../managers/UserTradeManager');

module.exports = {
    async getUserAccounts(user_id) {
        return await userAccountManager.getUserAccounts(user_id);
    },
    async getAllUserAccounts() {
        return await userAccountManager.getAllUserAccounts();
    },
    async getUserAccount(user_account_id) {
        return await userAccountManager.getUserAccount(user_account_id);
    },
    async createUserAccount(account) {
        return await userAccountManager.createUserAccount(account);
    },
    async updateUserAccount(account) {
        return await userAccountManager.updateUserAccount(account);
    },
    async deleteUserAccountsOnUserId(user_id) {
        return await userAccountManager.deleteUserAccountsOnUserId(user_id);
    },
    async deleteUserAccount(user_account_id) {
        return await userAccountManager.deleteUserAccount(user_account_id);
    },

    /**          V E R Y   IMPORTANT METHOD
     *
     *
     * at the heart of maintaining prices and accounts
     *
     * This is run after successfully updating the daily price
     *
     * */
    async createUserAccountHistories() {
        await userTradeManager.updateAllPositionPrices();

        const today = new Date().toISOString().substring(0,10);
        const userAccounts =  await userAccountManager.getAllUserAccounts();

        for(let i = 0; i < userAccounts.length; i++) {
            try {
                const ua = userAccounts[i];
                const rowsReturned = await userTradeManager.getExposure(ua.user_account_id);
                const exposure = rowsReturned[0].exposure;

                // await userAccountManager.updateDaily(ua.user_account_id, exposure);

                await userAccountHistoryManager.createUserAccountHistory({
                    user_id: ua.user_id,
                    user_account_id: ua.user_account_id,
                    day: today,
                    balance: ua.cash + exposure,
                    exposure: exposure
                });
            } catch(error) {
                console.log(error.message);
            }
        }

        return {'userAccountsUpdatedCount': userAccounts.length};

    }
};
