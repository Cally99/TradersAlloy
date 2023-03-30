const User = require('./../models').User;
const UserScreen = require('./../models').UserScreen;
const UserAccount = require('./../models').UserAccount;

module.exports = {
    async createTestUser(userMock) {
        const user = JSON.parse(JSON.stringify(await User.create(userMock)));

        return user;
    },
    async selectTestUser(user_id) {
        const user = JSON.parse(JSON.stringify(await User.findOne({ where: { user_id} })));

        return user;
    },
    async deleteTestUser(user_id) {
        await User.destroy({ where: { user_id } });
    },
    async deleteTestUserOnEmail(email) {
        await User.destroy({ where: { email } });
    },
    async createTestScreener(screen) {
        const responseScreen = JSON.parse(JSON.stringify(await UserScreen.create(screen)));

        return responseScreen;
    },
    async deleteTestScreeners(user_id) {
        await UserScreen.destroy({ where: { user_id } });
    },
    async selectTestScreeners(user_id) {
        const screens = JSON.parse(JSON.stringify(await UserScreen.findAll({ where: { user_id} })));

        return screens;
    },
    async createTestUserAccount(account) {
        const responseAccount = JSON.parse(JSON.stringify(await UserAccount.create(account)));

        return responseAccount;
    },
    async deleteTestUserAccounts(user_id) {
        await UserAccount.destroy({ where: { user_id } });
    }
};
