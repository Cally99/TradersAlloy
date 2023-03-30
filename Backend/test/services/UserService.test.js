const User = require('./../../server/models').User;
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const userService = require('./../../server/services/UserService');
const userManager = require('./../../server/managers/UserManager');
const emailer = require('./../../server/helpers/emailer');

describe('UserService', () => {
    let testUser;

    before(async () => {
        const email = 'test123@test123.com';
        const password = 'test';
        const settings = '{\"language\":\"sv\",\"settings\":[]}';

        testUser = await userManager.create(email, password, settings);
    });

    after(async () => {
        // Use this sequelize command because there is no
        // endpoint for removal of users in the backend
        await User.destroy({ where: { user_id:  testUser.user_id} });
    });

    it('select', async () => {
        const userTest = JSON.parse(JSON.stringify(await userService.select('test123@test123.com')));

        expect(userTest).to.be.an('object');
        expect(userTest.data).to.be.an('object');
        expect(userTest.data).to.have.keys([
            'user_id',
            'email',
            'email_newsletter',
            'email_weekly',
            'password',
            'type',
            'settings',
            'account',
            'access',
            'card_id',
            'customer_id',
            'screen',
            'created_date',
            'last_login_date',
            'membership_year',
            'membership_date',
            'subscription_id',
            'tabs'
        ]);
    });

    it('findUser', async () => {
        const userTest = JSON.parse(JSON.stringify(await userService.findUser(testUser.user_id)));

        expect(userTest).to.be.an('object');
        expect(userTest).to.have.keys([
            'user_id',
            'email',
            'email_newsletter',
            'email_weekly',
            'password',
            'type',
            'settings',
            'account',
            'access',
            'card_id',
            'customer_id',
            'screen',
            'created_date',
            'last_login_date',
            'membership_year',
            'membership_date',
            'subscription_id',
            'tabs'
        ]);
    });

    it('list', async () => {
        const usersTest = JSON.parse(JSON.stringify(await userService.list()));

        expect(usersTest).to.be.an('object');
        expect(usersTest.data).to.be.an('array');
        for(const user of usersTest.data) {
            expect(user).to.be.an('object');
            expect(user).to.have.keys([
                'user_id',
                'email',
                'email_newsletter',
                'email_weekly',
                'password',
                'type',
                'settings',
                'account',
                'access',
                'card_id',
                'customer_id',
                'screen',
                'created_date',
                'last_login_date',
                'membership_year',
                'membership_date',
                'subscription_id',
                'tabs'
            ]);
        }
    });

    it('forgotPassword', async () => {
        const spyForgottenPasswordEmail = sinon.spy(emailer, 'forgottenPasswordEmail');
        const stubCheckUserExistWithEmail = sinon.stub(userManager, 'check_user_exist_withEmail');
        const stubSelect = sinon.stub(userManager, 'select');

        stubCheckUserExistWithEmail.returns(true);
        stubSelect.returns(true);

        await userService.forgotPassword('ulmezz@gmail.com');

        for(const item of spyForgottenPasswordEmail.returnValues) {
            const itemTemp = await item;
            expect(itemTemp.message).to.be.equal('Queued. Thank you.');
        }

        spyForgottenPasswordEmail.restore();
        stubCheckUserExistWithEmail.restore();
        stubSelect.restore();
    });
});
