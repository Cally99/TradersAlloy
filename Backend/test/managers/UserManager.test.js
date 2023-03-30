 const User = require('./../../server/models').User;
 const chai = require('chai');
 const expect = chai.expect;
 const sinon = require('sinon');

 const userManager = require('./../../server/managers/UserManager');

 describe('UserManager', () => {
     let spyCreate;

     beforeEach(async () => {
         spyCreate = sinon.spy(userManager, 'create');

         const email = 'test123@test123.com';
         const password = 'test';
         const settings = '{"language":"sv","settings":[]}';

         await userManager.create(email, password, settings);
     });

     afterEach(async () => {
         for (item of spyCreate.returnValues) {
             const deleteUser = JSON.parse(JSON.stringify(await item));

             // Use this sequelize command because there is no
             // endpoint for removal of users in the backend
             await User.destroy({ where: { user_id:  deleteUser.user_id} });
         }

         spyCreate.restore();
     });

     it('check_user_exist_withEmail', async () => {
         const spyCheckUserExistWithEmail = sinon.spy(userManager, 'check_user_exist_withEmail');

         for (const user of spyCreate.returnValues) {
             const userTemp = JSON.parse(JSON.stringify(await user));

             await userManager.check_user_exist_withEmail(userTemp.email);

             for (const userCheck of spyCheckUserExistWithEmail.returnValues) {
                 const userTest = JSON.parse(JSON.stringify(await userCheck));

                 expect(userTest).to.be.an('object');
                 expect(userTest).to.have.keys([
                    'user_id',
                    'card_id',
                    'customer_id',
                    'email',
                    'email_newsletter',
                    'email_weekly',
                    'password',
                    'type',
                    'settings',
                    'account',
                    'access',
                    'screen',
                    'created_date',
                    'last_login_date',
                    'membership_year',
                    'membership_date',
                    'subscription_id',
                    'tabs'
                 ]);
             }
         }

         spyCheckUserExistWithEmail.restore();
     });

     it('create', async () => {
         const email = 'test456@test456.com';
         const password = 'test';
         const settings = '{\"language\":\"sv\",\"settings\":[]}';

         await userManager.create(email, password, settings);

         const testUser = JSON.parse(JSON.stringify(await userManager.check_user_exist_withEmail(email)));

         expect(testUser).to.be.an('object');
         expect(testUser).to.have.keys([
             'user_id',
             'card_id',
             'customer_id',
             'email',
             'email_newsletter',
             'email_weekly',
             'password',
             'type',
             'settings',
             'access',
             'account',
             'screen',
             'created_date',
             'last_login_date',
             'membership_year',
             'membership_date',
             'subscription_id',
             'tabs'
         ]);
     });

     it('check_user_exist_withID', async () => {
         const spyCheckUserExistWithID = sinon.spy(userManager, 'check_user_exist_withID');

         for (const user of spyCreate.returnValues) {
             const userTemp = JSON.parse(JSON.stringify(await user));

             await userManager.check_user_exist_withID(userTemp.user_id);

             for (const userCheck of spyCheckUserExistWithID.returnValues) {
                 const userExist = JSON.parse(JSON.stringify(await userCheck));

                 expect(userExist).to.be.equal(true);
             }
         }

         spyCheckUserExistWithID.restore();
     });

     it('fetchWatchlistHeaders', async () => {
         for (const user of spyCreate.returnValues) {
             const userTemp = JSON.parse(JSON.stringify(await user));

             await userManager.saveWatchlistHeaders(userTemp.user_id, '{"test":"whatever"}');

             const fetchWatchlistHeaders = JSON.parse(JSON.stringify(await userManager.fetchWatchlistHeaders(userTemp.user_id)));

             expect(fetchWatchlistHeaders).to.be.equal('{"test":"whatever"}');
         }
     });

     it('select', async () => {
         const spySelect = sinon.spy(userManager, 'select');
         const email = 'test123@test123.com';

         await userManager.select(email);

         for (const userCheck of spySelect.returnValues) {
             const userTemp = JSON.parse(JSON.stringify(await userCheck));

             expect(userTemp).to.be.an('object');
             expect(userTemp).to.have.keys([
                'user_id',
                'card_id',
                'customer_id',
                'email',
                'email_newsletter',
                'email_weekly',
                'password',
                'type',
                'settings',
                'account',
                'access',
                'screen',
                'created_date',
                'last_login_date',
                'membership_year',
                'membership_date',
                'subscription_id',
                'tabs'
             ]);
         }

         spySelect.restore();
     });

     it('findUser', async () => {
         const spyFindUser = sinon.spy(userManager, 'findUser');

         for (const userCheck of spyCreate.returnValues) {
             const userId = (await userCheck).user_id;

             await userManager.findUser(userId);

             for (const userFindUserCheck of spyFindUser.returnValues) {
                 const userFindUserTemp = JSON.parse(JSON.stringify(await userFindUserCheck));

                 expect(userFindUserTemp).to.be.an('object');
                 expect(userFindUserTemp).to.have.keys([
                    'user_id',
                    'card_id',
                    'customer_id',
                    'email',
                    'email_newsletter',
                    'email_weekly',
                    'password',
                    'type',
                    'settings',
                    'account',
                    'access',
                    'screen',
                    'created_date',
                    'last_login_date',
                    'membership_year',
                    'membership_date',
                    'subscription_id',
                    'tabs'
                 ]);
             }
         }

         spyFindUser.restore();
     });

     it('newPassword', async () => {
         for (const userCheck of spyCreate.returnValues) {
             const userId = (await userCheck).user_id;

             const testUserBeforeUpdate = JSON.parse(JSON.stringify(await userManager.findUser(userId)));

             await userManager.newPassword(testUserBeforeUpdate.email, 'test8888');

             const testUserAfterUpdate = JSON.parse(JSON.stringify(await userManager.findUser(userId)));

             // Before update
             expect(testUserBeforeUpdate).to.be.an('object');
             expect(testUserBeforeUpdate).to.have.keys([
                'user_id',
                'card_id',
                'customer_id',
                'email',
                'email_newsletter',
                'email_weekly',
                'password',
                'type',
                'settings',
                'account',
                'access',
                'screen',
                'created_date',
                'last_login_date',
                'membership_year',
                'membership_date',
                'subscription_id',
                'tabs'
             ]);
             expect(testUserBeforeUpdate.password).to.be.not.equal('test8888');

             // After update
             expect(testUserAfterUpdate).to.be.an('object');
             expect(testUserAfterUpdate).to.have.keys([
                'user_id',
                'card_id',
                'customer_id',
                'email',
                'email_newsletter',
                'email_weekly',
                'password',
                'type',
                'settings',
                'account',
                'access',
                'screen',
                'created_date',
                'last_login_date',
                'membership_year',
                'membership_date',
                'subscription_id',
                'tabs'
             ]);
             expect(testUserAfterUpdate.password).to.be.equal('test8888');
         }
     });

     it('resetPassword', async () => {
         for (const userCheck of spyCreate.returnValues) {
             const userId = (await userCheck).user_id;

             const testUserBeforeUpdate = JSON.parse(JSON.stringify(await userManager.findUser(userId)));

             await userManager.resetPassword(testUserBeforeUpdate.user_id, 'test9999');

             const testUserAfterUpdate = JSON.parse(JSON.stringify(await userManager.findUser(userId)));

             // Before update
             expect(testUserBeforeUpdate).to.be.an('object');
             expect(testUserBeforeUpdate).to.have.keys([
                'user_id',
                'card_id',
                'customer_id',
                'email',
                'email_newsletter',
                'email_weekly',
                'password',
                'type',
                'settings',
                'account',
                'access',
                'screen',
                'created_date',
                'last_login_date',
                'membership_year',
                'membership_date',
                'subscription_id',
                'tabs'
             ]);
             expect(testUserBeforeUpdate.password).to.be.not.equal('test9999');

             // After update
             expect(testUserAfterUpdate).to.be.an('object');
             expect(testUserAfterUpdate).to.have.keys([
                'user_id',
                'card_id',
                'customer_id',
                'email',
                'email_newsletter',
                'email_weekly',
                'password',
                'type',
                'settings',
                'account',
                'access',
                'screen',
                'created_date',
                'last_login_date',
                'membership_year',
                'membership_date',
                'subscription_id',
                'tabs'
             ]);
             expect(testUserAfterUpdate.password).to.be.equal('test9999');
         }
     });

     it('update', async () => {
         for (const userCheck of spyCreate.returnValues) {
             const userId = (await userCheck).user_id;
             const email = (await userCheck).email;

             await userManager.update(email, 'new', '{"language":"sv","settings":[]}', '{}', '{}');

             const testUserBeforeUpdate = JSON.parse(JSON.stringify(await userManager.findUser(userId)));

             await userManager.update(email, 'old', '{"language":"sv"}', '{"test":"account"}', '{"test":"screen"}');

             const testUserAfterUpdate = JSON.parse(JSON.stringify(await userManager.findUser(userId)));

             await userManager.update(email, 'new', '{"language":"sv","settings":[]}', '{}', '{}');

             // Before update
             expect(testUserBeforeUpdate).to.be.an('object');
             expect(testUserBeforeUpdate).to.have.keys([
                'user_id',
                'card_id',
                'customer_id',
                'email',
                'email_newsletter',
                'email_weekly',
                'password',
                'type',
                'settings',
                'account',
                'access',
                'screen',
                'created_date',
                'last_login_date',
                'membership_year',
                'membership_date',
                'subscription_id',
                'tabs'
             ]);
             expect(testUserBeforeUpdate.type).to.be.equal('new');
             expect(testUserBeforeUpdate.settings).to.be.equal('{"language":"sv","settings":[]}');
             expect(testUserBeforeUpdate.account).to.be.equal('{}');
             expect(testUserBeforeUpdate.screen).to.be.equal('{}');

             // After update
             expect(testUserAfterUpdate).to.be.an('object');
             expect(testUserAfterUpdate).to.have.keys([
                'user_id',
                'card_id',
                'customer_id',
                'email',
                'email_newsletter',
                'email_weekly',
                'password',
                'type',
                'settings',
                'account',
                'access',
                'screen',
                'created_date',
                'last_login_date',
                'membership_year',
                'membership_date',
                'subscription_id',
                'tabs'
             ]);
             expect(testUserAfterUpdate.type).to.be.equal('old');
             expect(testUserAfterUpdate.settings).to.be.equal('{"language":"sv"}');
             expect(testUserAfterUpdate.account).to.be.equal('{"test":"account"}');
             expect(testUserAfterUpdate.screen).to.be.equal('{"test":"screen"}');
         }
     });

     it('verifyAndLogin', async () => {
         for (const userCheck of spyCreate.returnValues) {
             const userId = (await userCheck).user_id;
             const email = (await userCheck).email;

             const testUserBeforeUpdate = JSON.parse(JSON.stringify(await userManager.findUser(userId)));

             await userManager.verifyAndLogin(userId);

             const testUserAfterUpdate = JSON.parse(JSON.stringify(await userManager.findUser(userId)));

             await userManager.update(email, 'new', '{"language":"sv","settings":[]}', '{}', '{}');

             // Before update
             expect(testUserBeforeUpdate).to.be.an('object');
             expect(testUserBeforeUpdate).to.have.keys([
                'user_id',
                'card_id',
                'customer_id',
                'email',
                'email_newsletter',
                'email_weekly',
                'password',
                'type',
                'settings',
                'account',
                'access',
                'screen',
                'created_date',
                'last_login_date',
                'membership_year',
                'membership_date',
                'subscription_id',
                'tabs'
             ]);
             expect(testUserBeforeUpdate.type).to.be.equal('new');

             // After update
             expect(testUserAfterUpdate).to.be.an('object');
             expect(testUserAfterUpdate).to.have.keys([
                'user_id',
                'card_id',
                'customer_id',
                'email',
                'email_newsletter',
                'email_weekly',
                'password',
                'type',
                'settings',
                'account',
                'access',
                'screen',
                'created_date',
                'last_login_date',
                'membership_year',
                'membership_date',
                'subscription_id',
                'tabs'
             ]);
             expect(testUserAfterUpdate.type).to.be.equal('freemium');
         }
     });

     it('list', async () => {
         const users = JSON.parse(JSON.stringify(await userManager.list()));

         expect(users).to.be.an('array');
         for (const user of users) {
             expect(user).to.be.an('object');
             expect(user).to.have.keys([
                'user_id',
                'card_id',
                'customer_id',
                'email',
                'email_newsletter',
                'email_weekly',
                'password',
                'type',
                'settings',
                'account',
                'access',
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

     it('addUserSettings', async () => {
         for (const userCheck of spyCreate.returnValues) {
             const userId = (await userCheck).user_id;

             await userManager.addUserSettings(userId, JSON.parse('{"language":"sv","settings":[]}'));

             const testUserBeforeUpdate = JSON.parse(JSON.stringify(await userManager.findUser(userId)));

             await userManager.addUserSettings(userId, JSON.parse('{"language":"sv","settings":[],"new":"stuff"}'));

             const testUserAfterUpdate = JSON.parse(JSON.stringify(await userManager.findUser(userId)));

             // Before update
             expect(testUserBeforeUpdate).to.be.an('object');
             expect(testUserBeforeUpdate).to.have.keys([
                'user_id',
                'card_id',
                'customer_id',
                'email',
                'email_newsletter',
                'email_weekly',
                'password',
                'type',
                'settings',
                'account',
                'access',
                'screen',
                'created_date',
                'last_login_date',
                'membership_year',
                'membership_date',
                'subscription_id',
                'tabs'
             ]);
             expect(testUserBeforeUpdate.settings).to.be.equal('{"language":"sv","settings":[]}');

             // After update
             expect(testUserAfterUpdate).to.be.an('object');
             expect(testUserAfterUpdate).to.have.keys([
                'user_id',
                'card_id',
                'customer_id',
                'email',
                'email_newsletter',
                'email_weekly',
                'password',
                'type',
                'settings',
                'account',
                'access',
                'screen',
                'created_date',
                'last_login_date',
                'membership_year',
                'membership_date',
                'subscription_id',
                'tabs'
             ]);
             expect(testUserAfterUpdate.settings).to.be.equal('{"language":"sv","settings":[],"new":"stuff"}');
         }
     });

     it('addNavigationTabs', async () => {
         for (const userCheck of spyCreate.returnValues) {
             const userId = (await userCheck).user_id;

             await userManager.addNavigationTabs(userId, '{5664, 42953}');

             const testUserBeforeUpdate = JSON.parse(JSON.stringify(await userManager.findUser(userId)));

             await userManager.addNavigationTabs(userId, '{5664, 42953, 772}');

             const testUserAfterUpdate = JSON.parse(JSON.stringify(await userManager.findUser(userId)));

             // Before update
             expect(testUserBeforeUpdate).to.be.an('object');
             expect(testUserBeforeUpdate).to.have.keys([
                'user_id',
                'card_id',
                'customer_id',
                'email',
                'email_newsletter',
                'email_weekly',
                'password',
                'type',
                'settings',
                'access',
                'account',
                'screen',
                'created_date',
                'last_login_date',
                'membership_year',
                'membership_date',
                'subscription_id',
                'tabs'
             ]);
             expect(testUserBeforeUpdate.tabs).to.deep.equal([5664, 42953]);

             // After update
             expect(testUserAfterUpdate).to.be.an('object');
             expect(testUserAfterUpdate).to.have.keys([
                'user_id',
                'card_id',
                'customer_id',
                'email',
                'email_newsletter',
                'email_weekly',
                'password',
                'type',
                'settings',
                'account',
                'access',
                'screen',
                'created_date',
                'last_login_date',
                'membership_year',
                'membership_date',
                'subscription_id',
                'tabs'
             ]);
             expect(testUserAfterUpdate.tabs).to.deep.equal([5664, 42953, 772]);
         }
     });

     it('gotoPdf', async () => {
         for (const userCheck of spyCreate.returnValues) {
             const userId = (await userCheck).user_id;

             const gotoPdf = JSON.parse(JSON.stringify(await userManager.gotoPdf(userId)));

             expect(gotoPdf).to.be.an('object');
             expect(gotoPdf).to.have.keys([
                'user_id',
                'card_id',
                'customer_id',
                'email',
                'email_newsletter',
                'email_weekly',
                'password',
                'type',
                'settings',
                'account',
                'access',
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

    it.skip('avanzaTest', async () => {
        const transactions = await userManager.avanzaTest();

        console.log(transactions);
    });
 });
