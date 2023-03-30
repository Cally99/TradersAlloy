const chai = require('chai');
const expect = chai.expect;

const userAccountService = require('./../../server/services/UserAccountService');
const testing = require('./../../server/helpers/testing');
const userMock = require('./../mocks/UserMock');
const userAccountMock = require('./../mocks/UserAccountMock');

describe('UserAccountService', () => {
    let testUser = null;

    beforeEach(async () => {
        const emailMock = userMock.getUserMockObject().email;

        await testing.deleteTestUserOnEmail(emailMock);

        testUser = await testing.createTestUser(userMock.getUserMockObject());

        for(const account of userAccountMock.getMockedUserAccounts(testUser)) {
            await testing.createTestUserAccount(account);
        }
    });

    afterEach(async () => {
        await testing.deleteTestUserAccounts(testUser.user_id);
        await testing.deleteTestUserOnEmail(testUser.email);
    });

    it('user accounts should be of type array', async () => {
        const userAccounts = JSON.parse(JSON.stringify(await userAccountService.getUserAccounts(testUser.user_id)));
        expect(userAccounts).to.be.an('array');
    });

    it('one user account should be of type object', async () => {
        const userAccounts = JSON.parse(JSON.stringify(await userAccountService.getUserAccounts(testUser.user_id)));

        for(const account of userAccounts) {
            expect(account).to.be.an('object');
        }
    });

    it('one user account object should contain following keys', async () => {
        const userAccounts = JSON.parse(JSON.stringify(await userAccountService.getUserAccounts(testUser.user_id)));

        for(const account of userAccounts) {
            expect(account).to.contain.keys([
                'user_id',
                'user_account_id',
                'account_name',
                'account_type',
                'cash',
                'scale',
                'currency',
                'competition_id',
                'is_ignored',
                'is_selected',
                'broker',
                'order_preference',
                'nominal_position_size',
                'secret_key',
                'last_import_date'
            ]);
        }
    });

    it('should be 3 accounts for the user', async () => {
        const userAccounts = JSON.parse(JSON.stringify(await userAccountService.getUserAccounts(testUser.user_id)));
        expect(userAccounts.length).to.be.equal(3);
    });

    it('should update one account for the user', async () => {
        const userAccountBeforeUpdate = JSON.parse(JSON.stringify(await userAccountService.getUserAccount('184-1')));

        const accountObject = {
            user_id: testUser.user_id,
            user_account_id: userAccountBeforeUpdate.user_account_id,
            account_name: 'Example',
            account_type: 'other',
            cash: 2300,
            scale: 5,
            currency: 'EUR',
            broker: 'Di Angelo broke',
            order_preference: 9867,
            nominal_position_size: 7000,
            secret_key: '666JJJ6666JJJ66',
            last_import_date: '2021-06-06'
        };

        await userAccountService.updateUserAccount(accountObject);

        const userAccountAfterUpdate = JSON.parse(JSON.stringify(await userAccountService.getUserAccount('184-1')));

        expect(userAccountAfterUpdate.user_id).to.be.equal(accountObject.user_id);
        expect(userAccountAfterUpdate.user_account_id).to.be.equal(accountObject.user_account_id);
        expect(userAccountAfterUpdate.account_name).to.be.equal(accountObject.account_name);
        expect(userAccountAfterUpdate.account_type).to.be.equal(accountObject.account_type);
        expect(userAccountAfterUpdate.cash).to.be.equal(accountObject.cash);
        expect(userAccountAfterUpdate.scale).to.be.equal(accountObject.scale);
        expect(userAccountAfterUpdate.currency).to.be.equal(accountObject.currency);
        expect(userAccountAfterUpdate.broker).to.be.equal(accountObject.broker);
        expect(userAccountAfterUpdate.order_preference).to.be.equal(accountObject.order_preference);
        expect(userAccountAfterUpdate.nominal_position_size).to.be.equal(accountObject.nominal_position_size);
        expect(userAccountAfterUpdate.secret_key).to.be.equal(accountObject.secret_key);
        expect(userAccountAfterUpdate.last_import_date).to.be.equal(accountObject.last_import_date);
    });

    it('should contain the inserted accounts in the database', async () => {
        const userAccounts = JSON.parse(JSON.stringify(await userAccountService.getUserAccounts(testUser.user_id)));

        for(const account of userAccounts) {
            const userIdTemp = userAccountMock.getMockedUserAccounts(testUser).find((a) => a.user_id === account.user_id).user_id;
            const userAccountIdTemp = userAccountMock.getMockedUserAccounts(testUser).find((a) => a.user_account_id === account.user_account_id).user_account_id;
            const accountNameTemp = userAccountMock.getMockedUserAccounts(testUser).find((a) => a.account_name === account.account_name).account_name;
            const accountTypeTemp = userAccountMock.getMockedUserAccounts(testUser).find((a) => a.account_type === account.account_type).account_type;
            const cashTemp = userAccountMock.getMockedUserAccounts(testUser).find((a) => a.cash === account.cash).cash;
            const scaleTemp = userAccountMock.getMockedUserAccounts(testUser).find((a) => a.scale === account.scale).scale;
            const currencyTemp = userAccountMock.getMockedUserAccounts(testUser).find((a) => a.currency === account.currency).currency;
            const brokerTemp = userAccountMock.getMockedUserAccounts(testUser).find((a) => a.broker === account.broker).broker;
            const orderPreferenceTemp = userAccountMock.getMockedUserAccounts(testUser).find((a) => a.order_preference === account.order_preference).order_preference;
            const nominalPositionSizeTemp = userAccountMock.getMockedUserAccounts(testUser).find((a) => a.nominal_position_size === account.nominal_position_size).nominal_position_size;
            const secretKeyTemp = userAccountMock.getMockedUserAccounts(testUser).find((a) => a.secret_key === account.secret_key).secret_key;
            const lastImportDateTemp = userAccountMock.getMockedUserAccounts(testUser).find((a) => a.last_import_date === account.last_import_date).last_import_date;

            expect(account.user_id).to.be.equal(userIdTemp);
            expect(account.user_account_id).to.be.equal(userAccountIdTemp);
            expect(account.account_name).to.be.equal(accountNameTemp);
            expect(account.account_type).to.be.equal(accountTypeTemp);
            expect(account.cash).to.be.equal(cashTemp);
            expect(account.scale).to.be.equal(scaleTemp);
            expect(account.currency).to.be.equal(currencyTemp);
            expect(account.broker).to.be.equal(brokerTemp);
            expect(account.order_preference).to.be.equal(orderPreferenceTemp);
            expect(account.nominal_position_size).to.be.equal(nominalPositionSizeTemp);
            expect(account.secret_key).to.be.equal(secretKeyTemp);
            expect(account.last_import_date).to.be.equal(lastImportDateTemp);
        }
    });

    it('should delete one account for the user', async () => {
        const userAccount = JSON.parse(JSON.stringify(await userAccountService.getUserAccount('184-1')));
        const userAccountsBeforeDelete = JSON.parse(JSON.stringify(await userAccountService.getUserAccounts(testUser.user_id)));

        await userAccountService.deleteUserAccount(userAccount.user_account_id);

        const userAccountsAfterDelete = JSON.parse(JSON.stringify(await userAccountService.getUserAccounts(testUser.user_id)));

        expect(userAccountsBeforeDelete.length).to.be.equal(3);
        expect(userAccountsAfterDelete.length).to.be.equal(2);
    });
});
