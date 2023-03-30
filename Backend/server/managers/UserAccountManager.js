const UserAccount = require('../models').UserAccount;
const DB = require('../helpers/DB');
const connection = DB.getConnection();

module.exports = {
    async getUserAccounts(user_id) {
        return await UserAccount.findAll({ where: { user_id } });
    },
    async getAllUserAccounts() {
        return await connection.query(`
            SELECT user_account_id, user_id, coalesce(cash, 0) as cash
            FROM user_account;
        `, { replacements: {}, type: connection.QueryTypes.SELECT, nest: false }, )
    },
    async getUserAccount(user_account_id) {
        return await UserAccount.findOne({ where: { user_account_id } });
    },
    async createUserAccount(account) {
        return await UserAccount.create(account);
    },
    async updateUserAccount(account) {
        const user_account_id = account.user_account_id;

        return await UserAccount.update(account, { where: { user_account_id } });
    },
    async deleteUserAccountsOnUserId(user_id) {
        return await UserAccount.destroy({ where: { user_id } });
    },
    async deleteUserAccount(user_account_id) {
        return await UserAccount.destroy({ where: { user_account_id } });
    },



    /**
     * change the balance based on changes to the exposure of the day
     * */
    async updateDaily(user_account_id, exposure) {
        return await connection.query(`
            update user_account
            set    balance = cash + :exposure
            where user_account_id = :user_account_id
        `, { replacements: {user_account_id, exposure}, type: connection.QueryTypes.SELECT, nest: false }, )
    }


};
