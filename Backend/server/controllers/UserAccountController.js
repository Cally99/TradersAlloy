const userAccountService = require('./../services/UserAccountService');

module.exports = {
    async getUserAccounts(req, res) {
        const user_id = req.params.user_id;
        const userAccountResponse = await userAccountService.getUserAccounts(user_id);

        res.status(200).send(userAccountResponse);
    },
    async getAllUserAccounts(req, res) {
        const allAccounts = await userAccountService.getAllUserAccounts();
        res.status(200).send(allAccounts);
    },
    async getUserAccount(req, res) {
        const user_account_id = req.params.user_account_id;
        const userAcountResponse = await userAccountService.getUserAccount(user_account_id);

        res.status(200).send(userAcountResponse);
    },
    async createUserAccount(req, res) {
        const account = req.body;
        const accountResponse = await userAccountService.createUserAccount(account);

        res.status(200).send(accountResponse);
    },
    async updateUserAccount(req, res) {
        const account = req.body;
        const accountResponse = await userAccountService.updateUserAccount(account);

        res.status(200).send(accountResponse);
    },
    async deleteUserAccountsOnUserId(req, res) {
        const user_id = req.params.user_id;
        await userAccountService.deleteUserAccountsOnUserId(user_id);

        res.status(200).send('Successfully deleted account for user');
    },
    async deleteUserAccount(req, res) {
        const user_account_id = req.params.user_account_id;
        await userAccountService.deleteUserAccount(user_account_id);

        res.status(200).send('Successfully deleted specific account for user');
    }
};