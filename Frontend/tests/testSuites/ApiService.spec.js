/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
/* eslint-disable no-console */
import apiService from "@/Services/ApiService";
import sinon from 'sinon';
import chai from 'chai';
const expect = chai.expect;

import testing from './../helpers/testing';

describe('ApiService', () => {
    let testUser;

    beforeAll(async() => {
        await testing.deleteUserProcedure(testing.userMock);

        testUser = (await apiService.addUser(testing.userMock)).data;

        for(const accountMockObject of testing.userAccountMockObjects(testUser)) {
            await apiService.createUserAccount(accountMockObject);
        }
    });

    afterAll(async() => {
        await testing.deleteUserProcedure(testing.userMock);
    });

    // * DiaryItem **************************
    it('selectDiaryItems', async() => {
        const userDIaryItemObject = {
            user_id: testUser.user_id,
            stock_id: 1294,
            date_created: '2021-03-12',
            note: 'Some text here...'
        };

        await apiService.insertDiaryItem(userDIaryItemObject);

        const userDiaryItems = JSON.parse(JSON.stringify(await apiService.selectDiaryItems(testUser.user_id)))[0];

        await apiService.deleteDiaryItem(userDiaryItems.diary_item_id);

        expect(userDiaryItems).to.be.an('object');
        expect(userDiaryItems).to.have.keys([
            'diary_item_id',
            'user_id',
            'stock_id',
            'date_created',
            'note',
            'background',
            'color',
            'y'
        ]);
    });

    it('deleteDiaryItem', async() => {
        const userDIaryItemObject = {
            user_id: testUser.user_id,
            stock_id: 1294,
            date_created: '2021-03-12',
            note: 'Some text here...'
        };

        await apiService.insertDiaryItem(userDIaryItemObject);

        const userDiaryItemsBeforeDelete = JSON.parse(JSON.stringify(await apiService.selectDiaryItems(testUser.user_id)))[0];

        await apiService.deleteDiaryItem(userDiaryItemsBeforeDelete.diary_item_id);

        const userDiaryItemsAfterDelete = JSON.parse(JSON.stringify(await apiService.selectDiaryItems(testUser.user_id)));

        // Before delete
        expect(userDiaryItemsBeforeDelete.user_id).to.be.equal(userDIaryItemObject.user_id);
        expect(userDiaryItemsBeforeDelete.stock_id).to.be.equal(userDIaryItemObject.stock_id);
        expect(userDiaryItemsBeforeDelete.date_created).to.be.equal(userDIaryItemObject.date_created);
        expect(userDiaryItemsBeforeDelete.note).to.be.equal(userDIaryItemObject.note);

        // After delete
        expect(userDiaryItemsAfterDelete).to.deep.equal([]);
    });
    // **************************************

    // * User *******************************
    it('userList', async() => {
        // Get all the users
        const users = await apiService.userList();

        // Test the main object
        const firstUser = users.data[0];
        expect(firstUser).to.have.keys([
            'user_id',
            'email',
            'password',
            'type',
            'settings',
            'account',
            'screen',
            'created_date',
            'last_login_date',
            'membership_year',
            'membership_date',
            'subscription_id',
            'tabs',
            'email_weekly',
            'email_newsletter',
            'customer_id',
            'card_id',
            'access'
        ]);
    });

    it('findUser', async() => {
        // Get a specific user on user id
        const user = await apiService.findUser(testUser.user_id);

        // Test on the specific user
        expect(user.email).to.be.equal('test123@test123.com');
        expect(user.type).to.be.equal('new');
        expect(user.settings).to.be.equal('{"tabs":[{"i":0,"name":"Watchlist","path":"/watchlist"},{"i":1,"name":"FNOX","path":"/stocks","stock_id":42953},{"i":2,"name":"ERIC B","path":"/stocks","stock_id":772},{"i":3,"name":"SWMA","path":"/stocks","stock_id":5664}]}');
        expect(user.account).to.be.equal('{}');
        expect(user.screen).to.be.equal('{}');
        expect(user.membership_year).to.be.equal(null);
        expect(user.membership_date).to.be.equal(null);
        expect(user.subscription_id).to.be.equal(null);
        expect(user.tabs).to.have.deep.members([3561, 5664, 42953]);
        expect(user.email_weekly).to.be.equal(true);
        expect(user.email_newsletter).to.be.equal(true);
    });

    it('selectUser', async() => {
        // Get a specific user on email
        const user = (await apiService.selectUser(testUser.email)).data;

        // Test on the specific user
        expect(user.email).to.be.equal('test123@test123.com');
        expect(user.type).to.be.equal('new');
        expect(user.settings).to.be.equal('{"tabs":[{"i":0,"name":"Watchlist","path":"/watchlist"},{"i":1,"name":"FNOX","path":"/stocks","stock_id":42953},{"i":2,"name":"ERIC B","path":"/stocks","stock_id":772},{"i":3,"name":"SWMA","path":"/stocks","stock_id":5664}]}');
        expect(user.account).to.be.equal('{}');
        expect(user.screen).to.be.equal('{}');
        expect(user.membership_year).to.be.equal(null);
        expect(user.membership_date).to.be.equal(null);
        expect(user.subscription_id).to.be.equal(null);
        expect(user.tabs).to.have.deep.members([3561, 5664, 42953]);
        expect(user.email_weekly).to.be.equal(true);
        expect(user.email_newsletter).to.be.equal(true);
    });

    it('addUserSettings', async() => {
        const userTestBeforeUpdate = await apiService.findUser(testUser.user_id);

        const addUserSettingsObject = {
            id: testUser.user_id,
            settings: JSON.parse('{"language":"sv"}')
        };

        await apiService.addUserSettings(addUserSettingsObject);

        const userTestAfterUpdate = await apiService.findUser(testUser.user_id);

        // Before update
        expect(userTestBeforeUpdate.settings).to.be.equal('{"tabs":[{"i":0,"name":"Watchlist","path":"/watchlist"},{"i":1,"name":"FNOX","path":"/stocks","stock_id":42953},{"i":2,"name":"ERIC B","path":"/stocks","stock_id":772},{"i":3,"name":"SWMA","path":"/stocks","stock_id":5664}]}');

        // After update
        expect(userTestAfterUpdate.settings).to.be.equal('{"language":"sv"}');
    });

    it('addNavigationTabs', async() => {
        const userTestBeforeUpdate = await apiService.findUser(testUser.user_id);

        const addNavigationTabsObject = {
            id: testUser.user_id,
            tabs: '{3561, 5664}'
        };

        await apiService.addNavigationTabs(addNavigationTabsObject);

        const userTestAfterUpdate = JSON.parse(JSON.stringify(await apiService.findUser(testUser.user_id)));

        // Before update
        expect(userTestBeforeUpdate.tabs).to.deep.equal([3561, 5664, 42953]);

        // After update
        expect(userTestAfterUpdate.tabs).to.deep.equal([3561, 5664]);
    });

    it('userLogin', async() => {
        const loginObject = {
            email: 'test123@test123.com',
            password: 'test1234'
        };

        const response = JSON.parse(JSON.stringify(await apiService.userLogin(loginObject)));

        expect(response).to.be.an('object');
        expect(response.status).to.be.equal(200);
        expect(response.statusText).to.be.equal('OK');
    });

    it.skip('addUser', async() => {
        const userSpecObject = {
            email: 'test25141326456@test456.com',
            password: 'test5678',
            type: 'new',
            settings: '',
            account: '{}',
            screen: '{}',
            created_date: '2021-08-12',
            last_login_date: '2021-08-12',
            membership_year: null,
            membership_date: null,
            subscription_id: null,
            tabs: '{3561,5664,42953}',
            card_id: null,
            customer_id: null
        };

        await apiService.addUser(userSpecObject);

        const userTestCheck = (await apiService.selectUser(userSpecObject.email)).data;

        await testing.deleteUserProcedure(userSpecObject);

        expect(userTestCheck).to.be.an('object');
        expect(userTestCheck).to.have.keys([
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
            'screen',
            'created_date',
            'last_login_date',
            'membership_year',
            'membership_date',
            'subscription_id',
            'tabs'
        ]);
    });

    it.skip('deleteUser', async() => {
        //seems like the User is added but can't find the user for the constant userTestBeforeDelete.
        const email2 = 'testawww456@test456.com';
        const password2 = 'test5678';
        const settings2 = '';

        const testUserAddUser = JSON.parse(JSON.stringify(await apiService.addUser({
            email: email2,
            password: password2,
            settings: settings2
        }))).data;

        console.log(testUserAddUser.user_id);

        const userTestBeforeDelete = JSON.parse(JSON.stringify(await apiService.findUser(testUserAddUser.user_id))).data;

        const requestBody = {
            userID: testUserAddUser.user_id
        };

        const userWatchlists = JSON.parse(JSON.stringify(await apiService.fetchWatchlists(testUserAddUser.user_id))).data;

        for (const watchlist of userWatchlists) {
            await apiService.deleteWatchlist(watchlist.watchlist_id);
        }

        await apiService.deleteContent(requestBody);

        await apiService.deleteUser(testUserAddUser.user_id);

        let userTestAfterDelete;

        try {
            userTestAfterDelete = JSON.parse(JSON.stringify(await apiService.findUser(testUserAddUser.user_id))).data;
        } catch (error) {
            userTestAfterDelete = error.message;
        }

        expect(userTestBeforeDelete).to.be.an('object');
        expect(userTestBeforeDelete).to.have.keys([
            'user_id',
            'email',
            'password',
            'type',
            'settings',
            'account',
            'screen',
            'created_date',
            'last_login_date',
            'membership_year',
            'membership_date',
            'subscription_id',
            'tabs'
        ]);

        expect(userTestAfterDelete).to.be.equal('Request failed with status code 400');

    });

    it.skip('updateUser', async() => {
        const updateUserObjectPreset = {
            email: testUser.email,
            type: 'new',
            settings: '{"tabs":[{"i":0,"name":"Watchlist","path":"/watchlist","icon":"mdi-eye","isFocus":true},{"i":1,"name":"FNOX","path":"/stocks","icon":"mdi-cube","isFocus":false,"insref":42953,"isin":"SE0001966656"},{"i":2,"name":"ERIC B","path":"/stocks","icon":"mdi-cube","isFocus":false,"insref":772,"isin":"SE0000108656"},{"i":3,"name":"SWMA","path":"/stocks","icon":"mdi-cube","isFocus":false,"insref":5664,"isin":"SE0000310336"}]}',
            account: '{}',
            screen: '{}'
        };

        await apiService.updateUser(updateUserObjectPreset);

        const userTestBeforeUpdate = JSON.parse(JSON.stringify(await apiService.findUser(testUser.user_id)));

        const updateUserObjectNew = {
            email: testUser.email,
            type: 'old',
            settings: '{"language":"sv"}',
            account: '{"test":"testing"}',
            screen: '["Name","Sector","Earnings Date"]'
        };

        await apiService.updateUser(updateUserObjectNew);

        const userTestAfterUpdate = JSON.parse(JSON.stringify(await apiService.findUser(testUser.user_id)));

        const updateUserObjectOld = {
            email: testUser.email,
            type: 'new',
            settings: '{"tabs":[{"i":0,"name":"Watchlist","path":"/watchlist","icon":"mdi-eye","isFocus":true},{"i":1,"name":"FNOX","path":"/stocks","icon":"mdi-cube","isFocus":false,"insref":42953,"isin":"SE0001966656"},{"i":2,"name":"ERIC B","path":"/stocks","icon":"mdi-cube","isFocus":false,"insref":772,"isin":"SE0000108656"},{"i":3,"name":"SWMA","path":"/stocks","icon":"mdi-cube","isFocus":false,"insref":5664,"isin":"SE0000310336"}]}',
            account: '{}',
            screen: '{}'
        };

        await apiService.updateUser(updateUserObjectOld);

        // Before update
        expect(userTestBeforeUpdate).to.be.an('object');
        expect(userTestBeforeUpdate).to.have.keys([
            "account",
            "created_date",
            "email",
            "last_login_date",
            "membership_date",
            "membership_year",
            "password",
            "screen",
            "settings",
            "subscription_id",
            "tabs",
            "type",
            "user_id"
        ]);
        expect(userTestBeforeUpdate.data).to.be.an('object');
        expect(userTestBeforeUpdate.data.type).to.be.equal('new');
        expect(userTestBeforeUpdate.data.settings).to.be.equal('{"tabs":[{"i":0,"name":"Watchlist","path":"/watchlist","icon":"mdi-eye","isFocus":true},{"i":1,"name":"FNOX","path":"/stocks","icon":"mdi-cube","isFocus":false,"insref":42953,"isin":"SE0001966656"},{"i":2,"name":"ERIC B","path":"/stocks","icon":"mdi-cube","isFocus":false,"insref":772,"isin":"SE0000108656"},{"i":3,"name":"SWMA","path":"/stocks","icon":"mdi-cube","isFocus":false,"insref":5664,"isin":"SE0000310336"}]}');
        expect(userTestBeforeUpdate.data.account).to.be.equal('{}');
        expect(userTestBeforeUpdate.data.screen).to.be.equal('{}');

        // After update
        expect(userTestAfterUpdate).to.be.an('object');
        expect(userTestAfterUpdate).to.have.keys([
            'data',
            'status',
            'statusText',
            'headers',
            'config',
            'request'
        ]);
        expect(userTestAfterUpdate.data).to.be.an('object');
        expect(userTestAfterUpdate.data.type).to.be.equal('old');
        expect(userTestAfterUpdate.data.settings).to.be.equal('{"language":"sv"}');
        expect(userTestAfterUpdate.data.account).to.be.equal('{"test":"testing"}');
        expect(userTestAfterUpdate.data.screen).to.be.equal('["Name","Sector","Earnings Date"]');
    });

    it('forgotPassword', async() => {
        const emailObject = {
            email: testUser.email
        };

        const userForgotPassword = JSON.parse(JSON.stringify(await apiService.forgotPassword(emailObject)));

        expect(userForgotPassword.length).to.be.equal(5);
    });

    it('newPassword', async() => {
        const userNewPasswordObject = {
            email: 'test123@test123.com',
            password: 'test5678'
        };

        await apiService.newPassword(userNewPasswordObject);

        const response = await apiService.userLogin(userNewPasswordObject);

        expect(response).to.be.an('object');
    });

    it('resetPassword', async() => {
        const userObject = {
            id: testUser.user_id,
            password: 'somethingelse1234'
        };

        await apiService.resetPassword(userObject);

        const userLoginObject = {
            email: 'test123@test123.com',
            password: 'somethingelse1234'
        };

        const response = await apiService.userLogin(userLoginObject);

        expect(response).to.be.an('object');
    });

    // *************************
    // Do not test on the 'stripe' functions at the moment,
    // because I need to know more about how stripe works,
    // and how it is setup, before I can do any tests on it.
    // *************************
    // **************************************

    // * Stock ******************************
    it('getPrices', async() => {
        // AZA
        const pricesAza = await apiService.getPrices(1294);

        expect(pricesAza.data).to.have.keys([
            'ohlcv'
        ]);
        expect(pricesAza.data.ohlcv).to.be.an('array');
    });

    it('writeContent', async() => {
        const writeBody = {
            user_id: testUser.user_id,
            stock_id: 42953,
            ticker: 'FNOX',
            content: 'Some test data'
        };

        const writeContent = await apiService.writeContent(writeBody);

        expect(writeContent.data).to.be.an('array');
        expect(writeContent.data[1][0].content).to.be.equal(writeBody.content);
    });

    it('fetchContent', async() => {
        const requestBody = {
            user_id: testUser.user_id,
            stock_id: 42953
        };

        const fetchContent = await apiService.fetchContent(requestBody);

        expect(fetchContent).to.be.an('object');
        expect(fetchContent.data).to.have.keys([
            'user_id',
            'stock_id',
            'ticker',
            'content',
            'last_update_date',
            'is_shared',
            'date_created'
        ]);
        expect(fetchContent.data.stock_id).to.be.equal(requestBody.stock_id);
        expect(fetchContent.data.user_id).to.be.equal(requestBody.user_id);
    });

    it.skip('getNews', async () => {
        const news = (await apiService.getNews()).data;

        expect(news).to.be.an('array')
        for(const one of news) {
            expect(one).to.be.an('object');
            expect(one).to.contain.keys([
                'company_id',
                'news_id',
                'date',
                'tags',
                'title',
                'links',
                'agency',
                'version',
                'newstext',
                'countries',
                'signature',
                'language'
            ]);
        }
    });

    it.skip('getNewsOnCompanyId', async () => {
        const news = JSON.parse(JSON.stringify(await apiService.getNewsOnCompanyId(33013))).data;

        expect(news).to.be.an('array')
        for(const one of news) {
            expect(one).to.be.an('object');
            expect(one).to.contain.keys([
                'company_id',
                'news_id',
                'date',
                'tags',
                'title',
                'links',
                'agency',
                'version',
                'newstext',
                'countries',
                'signature',
                'language'
            ]);
        }
    });

    it.skip('getNewsOnNewsId', async () => {
        const news = JSON.parse(JSON.stringify(await apiService.getNewsOnNewsId('FTV0046A7E'))).data;

        expect(news).to.be.an('array')
        for(const one of news) {
            expect(one).to.be.an('object');
            expect(one).to.contain.keys([
                'company_id',
                'news_id',
                'date',
                'tags',
                'title',
                'links',
                'agency',
                'version',
                'newstext',
                'countries',
                'signature',
                'language'
            ]);
        }
    });

    it('fetchMapFinancials', async() => {
        const fetchMapFinancials = await apiService.fetchMapFinancials();

        const financialsItem = fetchMapFinancials.data[0];
        expect(financialsItem).to.have.keys([
            'company_id',
            'period',
            'price',
            'date_report',
            'eps',
            'eps_ttm',
            'sales',
            'profit',
            'pe',
            'ps',
            'gp',
            'ibl',
            'ebitda',
            'ebit',
            'ptp',
            'intangibleasset',
            'fixedasset',
            'financialasset',
            'noncurrentasset',
            'othercurrentassets',
            'cce',
            'currentassets',
            'totalassets',
            'totalequityandliabilities',
            'totalliabilities',
            'shequity',
            'ltliabilities',
            'curliabilities',
            'totalnumberofshares',
            'pdf_link',
            'pdf_language'
        ]);
    });

    it.skip('fetchFinancialData', async() => {
        const fetchFinancialData = await apiService.fetchFinancialData(4289153);
        //We are not even use this data in the backend.

        expect(fetchFinancialData).to.have.keys([
            'data',
            'status',
            'statusText',
            'headers',
            'request',
            'config'
        ])
        expect(fetchFinancialData.status).to.be.equal(200);
        // console.log(fetchFinancialData.data.company_id[0]);

        // expect(fetchFinancialData.data).to.have.keys([
        //     'company_id',
        //     'period',
        //     'price',
        //     'date_report',
        //     'eps',
        //     'eps_ttm',
        //     'sales',
        //     'profit',
        //     'ps',
        //     'gp',
        //     'ibl',
        //     'ebitda',
        //     'ebit',
        //     'ptp',
        //     'intangibleasset',
        //     'fixedasset',
        //     'financialasset',
        //     'noncurrentasset',
        //     'cce',
        //     'currentassets',
        //     'totalassets',
        //     'shequity',
        //     'ltliabilities',
        //     'curliabilities',
        //     'totalnumberofshares',
        //     'pdf_link',
        //     'pe',
        //     'pdf_language'
        // ]);
        // expect(fetchFinancialData.data.company_id).to.be.an('array');
        // expect(fetchFinancialData.data.period).to.be.an('array');
        // expect(fetchFinancialData.data.date_report).to.be.an('array');
        // expect(fetchFinancialData.data.eps).to.be.an('array');
        // expect(fetchFinancialData.data.sales).to.be.an('array');
        // expect(fetchFinancialData.data.profit).to.be.an('array');
        // expect(fetchFinancialData.data.gp).to.be.an('array');
        // expect(fetchFinancialData.data.ebitda).to.be.an('array');
        // expect(fetchFinancialData.data.ebit).to.be.an('array');
        // expect(fetchFinancialData.data.ptp).to.be.an('array');
        // expect(fetchFinancialData.data.intangibleasset).to.be.an('array');
        // expect(fetchFinancialData.data.fixedasset).to.be.an('array');
        // expect(fetchFinancialData.data.financialasset).to.be.an('array');
        // expect(fetchFinancialData.data.noncurrentasset).to.be.an('array');
        // expect(fetchFinancialData.data.cce).to.be.an('array');
        // expect(fetchFinancialData.data.currentassets).to.be.an('array');
        // expect(fetchFinancialData.data.totalassets).to.be.an('array');
        // expect(fetchFinancialData.data.shequity).to.be.an('array');
        // expect(fetchFinancialData.data.ltliabilities).to.be.an('array');
        // expect(fetchFinancialData.data.curliabilities).to.be.an('array');
        // expect(fetchFinancialData.data.totalnumberofshares).to.be.an('array');
    });

    it('fetchFinancialsQuarterly', async() => {
        const fetchFinancialsQuarterly = await apiService.fetchFinancialsQuarterly(33233);

        const financialQuaterly = fetchFinancialsQuarterly.data[0];
        expect(financialQuaterly).to.be.an('object');
        expect(financialQuaterly).to.have.keys([
            'period',
            'sales',
            'costofgoodssold',
            'gp',
            'ibl',
            'ebitda',
            'ebit',
            'ptp',
            'profit',
            'intangibleasset',
            'fixedasset',
            'financialasset',
            'noncurrentasset',
            'cce',
            'othercurrentassets',
            'pdf_language',
            'pdf_link',
            'totalcurrentassets',
            'totalassets',
            'shequity',
            'ltliabilities',
            'curliabilities',
            'totalliabilities',
            'totalequityandliabilities'
        ]);
    });

    it('fetchFinancialsAnnual', async() => {
        //Check if it works properly in practice **************************
        //c_reports in CompanyReportController.js is an empty array.
        const fetchFinancialsAnnual = await apiService.fetchFinancialsAnnual(33233);

        expect(fetchFinancialsAnnual.data).to.be.an('array');
        expect(fetchFinancialsAnnual).to.have.keys([
            'data',
            'status',
            'statusText',
            'headers',
            'request',
            'config'
        ])
        expect(fetchFinancialsAnnual.status).to.be.equal(200);
    });

    it.skip('fetchInsiderData', async() => {
        const fetchInsiderData = await apiService.fetchInsiderData(33233);

        const insiderData = fetchInsiderData.data[0];
        expect(insiderData).to.be.an('object');
        expect(insiderData).to.have.keys([
            'company_id',
            'insider_trade_id',
            'isin',
            'person',
            'person_title',
            'volume',
            'qty_or_amount',
            'stock_id',
            'price',
            'transaction_date',
            'transaction_currency',
            'transaction_nature',
            'instrument_name'
        ]);
    });

    it.skip('fetchCompanies', async() => {
        const fetchCompanies = await apiService.fetchCompanies();

        const company = fetchCompanies.data[0];
        expect(company).to.have.keys([
            'company_id',
            'name',
            'next_report_date',
            'status_flag',
            'description',
            'market_cap',
            'last_report_date',
            'last_eps_ttm',
            'last_np',
            'last_sales',
            'last_pe',
            'ceo_comments',
            'insider_trade_isins'
        ]);
    });

    it('getUserAccounts', async() => {
        const userAccounts = (await apiService.getUserAccounts(testUser.user_id)).data;

        expect(userAccounts).to.be.an('array');

        for(const userAccount of userAccounts) {
            expect(userAccount).to.be.an('object');

            expect(userAccount).to.contain.keys([
                'user_id',
                'user_account_id',
                'account_name',
                'account_type',
                'cash',
                'scale',
                'currency',
                'is_ignored',
                'is_selected',
                'broker',
                'competition_id',
                'order_preference',
                'nominal_position_size',
                'secret_key',
                'last_import_date'
            ]);
        }
    });

    it('getUserAccount', async () => {
        const userAccount = (await apiService.getUserAccount('184-1')).data;

        expect(userAccount).to.be.an('object');
    });

    it('deleteUserAccount', async () => {
        const deleteUserAccountResponse = (await apiService.deleteUserAccount('184-1')).data;

        expect(deleteUserAccountResponse).to.be.equal('Successfully deleted specific account for user');
    });

    it('fetchResearchData', async() => {
        const fetchResearchData = await apiService.fetchResearchData(testUser.user_id);

        const firstFetchResearchData = fetchResearchData.data[0];
        expect(firstFetchResearchData).to.have.keys([
            'user_id',
            'stock_id',
            'ticker',
            'content',
            'last_update_date',
            'is_shared',
            'date_created'
        ]);
    });

    // *************************
    // ++++++++++++++++++
    // ++++++++++++++++++
    // ++++++++++++++++++
    // ++++++++++++++++++
    // Will do unit test on 'updateConviction' later.
    // it('updateConviction', async () => {

    // });
    // *************************

    it('fetchConviction_withINSREF', async() => {
        const newWatchlistObject = {
            user_id: testUser.user_id,
            name: 'Exempellista123'
        };

        const watchlist = await apiService.insertWatchlist(newWatchlistObject);

        const userWatchlistItemObject = {
            user_id: testUser.user_id,
            stock_id: 1294,
            company_id: 32875,
            ticker: 'AZA',
            name: 'Avanza Bank Holding',
            isin: 'SE0012454072',
            conviction: 0,
            watched_since: '2021-03-15',
            // watched_since_price double precision,
            // tags text COLLATE pg_catalog."default"
        };

        await apiService.WLIsave(userWatchlistItemObject);

        const convictionObject = {
            user_id: testUser.user_id,
            stock_id: 1294
        };

        const fetchConviction_withINSREF = await apiService.fetchConviction_withINSREF(convictionObject);

        await apiService.deleteWatchlist(watchlist.data.watchlist_id);

        expect(fetchConviction_withINSREF.data).to.have.keys([
            'watchlist_item_id',
            'user_id',
            'stock_id',
            'company_id',
            'ticker',
            'isin',
            'name',
            'conviction',
            'watched_since',
            'watched_since_price',
            'tags'
        ]);
        expect(fetchConviction_withINSREF.data.user_id).to.be.equal(userWatchlistItemObject.user_id);
        expect(fetchConviction_withINSREF.data.stock_id).to.be.equal(userWatchlistItemObject.stock_id);
        expect(fetchConviction_withINSREF.data.ticker).to.be.equal(userWatchlistItemObject.ticker);
        expect(fetchConviction_withINSREF.data.name).to.be.equal(userWatchlistItemObject.name);
        expect(fetchConviction_withINSREF.data.isin).to.be.equal(userWatchlistItemObject.isin);
        expect(fetchConviction_withINSREF.data.conviction).to.be.equal(userWatchlistItemObject.conviction);
        expect(fetchConviction_withINSREF.data.watched_since).to.be.equal(userWatchlistItemObject.watched_since);
    });

    // *************************
    // don't do test on function 'fetchSector_name' because
    // it needs the primary key sector_id as the parameter
    // and I don't know what the sector_id is in the real database
    // and we should't create fake data in table stock_exchange_sector
    // so it will be skipped for the moment
    // it('fetchSector_name', async () => {

    // });
    // *************************

    it('addTags', async() => {
        const getTagsObject = {
            user_id: testUser.user_id,
            stock_id: 42953
        };

        const getTagsBeforeAddTags = await apiService.fetchTags(getTagsObject);

        const addTagsObject = {
            user_id: testUser.user_id,
            stock_id: 42953,
            tags: '[{"text":"Event Trade","color":"orange"}]'
        };

        await apiService.addTags(addTagsObject);

        const getTagsAfterAddTags = await apiService.fetchTags(getTagsObject);

        // Before addTags
        expect(getTagsBeforeAddTags.data.tags).to.be.equal(null);

        // After addTags
        expect(getTagsAfterAddTags.data.tags).to.be.equal('[{"text":"Event Trade","color":"orange"}]');
    });

    it('fetchTags', async() => {
        const getTagsObject = {
            user_id: testUser.user_id,
            stock_id: 42953
        };

        const addTagsObject = {
            user_id: testUser.user_id,
            stock_id: 42953,
            tags: '[{"text":"Event Trade","color":"orange"}]'
        };

        await apiService.addTags(addTagsObject);

        const getTags = await apiService.fetchTags(getTagsObject);

        expect(getTags.data.tags).to.be.equal('[{"text":"Event Trade","color":"orange"}]');
    });

    it.skip('fetchChartInsiderData', async() => {
        const fetchChartInsiderData = await apiService.fetchChartInsiderData(1294);

        const insiderData = fetchChartInsiderData.data;

        expect(insiderData[0]).to.have.keys([
            'insider_trade_id',
            'transaction_timestamp',
            'stock_id',
            'volume',
            'price',
            'transaction_nature',
            'qty_or_amount'
        ]);
    });

    it('save_UserLines', async() => {
        const userLinesObject = {
            user_id: testUser.user_id,
            stock_id: 42953,
            content: '[{"data":[],"grid":{"id":0},"id":"onchart.TextTool0","name":"TextTool 0","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_102","p1":[1578873600000,10],"background":"#f4c20d   ","text":"sdsdfsdfsdfsdf","color":"#000000   ","single":false}},{"data":[],"grid":{"id":1},"id":"onchart.TextTool1","name":"TextTool 1","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_106","p1":[1568592000000,10],"background":"#f4c20d   ","text":"text 4","color":"#000000   ","single":false}},{"data":[],"grid":{"id":2},"id":"onchart.TextTool2","name":"TextTool 2","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_107","p1":[1538956800000,10],"background":"#f4c20d   ","text":"text","color":"#000000   ","single":false}},{"data":[],"grid":{"id":3},"id":"onchart.TextTool3","name":"TextTool 3","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_104","p1":[1515801600000,10],"background":"#C2E0FC   ","text":"very nice","color":"#000000   ","single":false}},{"data":[],"grid":{"id":4},"id":"onchart.TextTool4","name":"TextTool 4","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_103","p1":[1515974400000,10],"background":"#f4c20d   ","text":"something else","color":"#000000   ","single":false}},{"data":[],"grid":{"id":5},"id":"onchart.TextTool5","name":"TextTool 5","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_105","p1":[1545609600000,10],"background":"#f4c20d   ","text":"xxxxxx","color":"#000000   ","single":false}},{"data":[],"grid":{"id":0},"id":"onchart.TradeHistory0","name":"TradeHistory 0","type":"TradeHistory","settings":{"update":false,"$selected":false,"$state":"finished","legend":true,"$uuid":"tradeHistory_1131","pp1":[1559692800000,10.000229166666667],"pp2":[1549152000000,8.664072916666667],"single":false}}]'
        };

        const saveUserLines = await apiService.save_UserLines(userLinesObject);

        await apiService.deleteUserChartLinesOnUserId(testUser.user_id);

        expect(saveUserLines.data).to.be.an('object');
        expect(saveUserLines.data).to.have.keys([
            'user_id',
            'stock_id',
            'content',
            'id'
        ]);
    });

    it('deleteUserChartLinesOnUserId', async() => {
        const userLinesObject = {
            user_id: testUser.user_id,
            stock_id: 42953,
            content: '[{"data":[],"grid":{"id":0},"id":"onchart.TextTool0","name":"TextTool 0","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_102","p1":[1578873600000,10],"background":"#f4c20d   ","text":"sdsdfsdfsdfsdf","color":"#000000   ","single":false}},{"data":[],"grid":{"id":1},"id":"onchart.TextTool1","name":"TextTool 1","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_106","p1":[1568592000000,10],"background":"#f4c20d   ","text":"text 4","color":"#000000   ","single":false}},{"data":[],"grid":{"id":2},"id":"onchart.TextTool2","name":"TextTool 2","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_107","p1":[1538956800000,10],"background":"#f4c20d   ","text":"text","color":"#000000   ","single":false}},{"data":[],"grid":{"id":3},"id":"onchart.TextTool3","name":"TextTool 3","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_104","p1":[1515801600000,10],"background":"#C2E0FC   ","text":"very nice","color":"#000000   ","single":false}},{"data":[],"grid":{"id":4},"id":"onchart.TextTool4","name":"TextTool 4","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_103","p1":[1515974400000,10],"background":"#f4c20d   ","text":"something else","color":"#000000   ","single":false}},{"data":[],"grid":{"id":5},"id":"onchart.TextTool5","name":"TextTool 5","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_105","p1":[1545609600000,10],"background":"#f4c20d   ","text":"xxxxxx","color":"#000000   ","single":false}},{"data":[],"grid":{"id":0},"id":"onchart.TradeHistory0","name":"TradeHistory 0","type":"TradeHistory","settings":{"update":false,"$selected":false,"$state":"finished","legend":true,"$uuid":"tradeHistory_1131","pp1":[1559692800000,10.000229166666667],"pp2":[1549152000000,8.664072916666667],"single":false}}]'
        };

        await apiService.save_UserLines(userLinesObject);

        const requestBodyObject = {
            user_id: testUser.user_id,
            stock_id: 42953
        };

        const userLinesBeforeDelete = await apiService.fetchUserLinesData(requestBodyObject);

        await apiService.deleteUserChartLinesOnUserId(testUser.user_id);

        const userLinesAfterDelete = await apiService.fetchUserLinesData(requestBodyObject);

        // Before delete
        expect(userLinesBeforeDelete.data).to.be.an('object');
        expect(userLinesBeforeDelete.data).to.have.keys([
            'user_id',
            'stock_id',
            'content'
        ]);
        expect(userLinesBeforeDelete.data.content).to.be.equal('[{"data":[],"grid":{"id":0},"id":"onchart.TextTool0","name":"TextTool 0","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_102","p1":[1578873600000,10],"background":"#f4c20d   ","text":"sdsdfsdfsdfsdf","color":"#000000   ","single":false}},{"data":[],"grid":{"id":1},"id":"onchart.TextTool1","name":"TextTool 1","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_106","p1":[1568592000000,10],"background":"#f4c20d   ","text":"text 4","color":"#000000   ","single":false}},{"data":[],"grid":{"id":2},"id":"onchart.TextTool2","name":"TextTool 2","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_107","p1":[1538956800000,10],"background":"#f4c20d   ","text":"text","color":"#000000   ","single":false}},{"data":[],"grid":{"id":3},"id":"onchart.TextTool3","name":"TextTool 3","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_104","p1":[1515801600000,10],"background":"#C2E0FC   ","text":"very nice","color":"#000000   ","single":false}},{"data":[],"grid":{"id":4},"id":"onchart.TextTool4","name":"TextTool 4","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_103","p1":[1515974400000,10],"background":"#f4c20d   ","text":"something else","color":"#000000   ","single":false}},{"data":[],"grid":{"id":5},"id":"onchart.TextTool5","name":"TextTool 5","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_105","p1":[1545609600000,10],"background":"#f4c20d   ","text":"xxxxxx","color":"#000000   ","single":false}},{"data":[],"grid":{"id":0},"id":"onchart.TradeHistory0","name":"TradeHistory 0","type":"TradeHistory","settings":{"update":false,"$selected":false,"$state":"finished","legend":true,"$uuid":"tradeHistory_1131","pp1":[1559692800000,10.000229166666667],"pp2":[1549152000000,8.664072916666667],"single":false}}]');

        // After delete
        expect(userLinesAfterDelete.data).to.be.equal('');
    });

    it('fetchUserLinesData', async() => {
        const userLinesObject = {
            user_id: testUser.user_id,
            stock_id: 42953,
            content: '[{"data":[],"grid":{"id":0},"id":"onchart.TextTool0","name":"TextTool 0","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_102","p1":[1578873600000,10],"background":"#f4c20d   ","text":"sdsdfsdfsdfsdf","color":"#000000   ","single":false}},{"data":[],"grid":{"id":1},"id":"onchart.TextTool1","name":"TextTool 1","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_106","p1":[1568592000000,10],"background":"#f4c20d   ","text":"text 4","color":"#000000   ","single":false}},{"data":[],"grid":{"id":2},"id":"onchart.TextTool2","name":"TextTool 2","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_107","p1":[1538956800000,10],"background":"#f4c20d   ","text":"text","color":"#000000   ","single":false}},{"data":[],"grid":{"id":3},"id":"onchart.TextTool3","name":"TextTool 3","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_104","p1":[1515801600000,10],"background":"#C2E0FC   ","text":"very nice","color":"#000000   ","single":false}},{"data":[],"grid":{"id":4},"id":"onchart.TextTool4","name":"TextTool 4","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_103","p1":[1515974400000,10],"background":"#f4c20d   ","text":"something else","color":"#000000   ","single":false}},{"data":[],"grid":{"id":5},"id":"onchart.TextTool5","name":"TextTool 5","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_105","p1":[1545609600000,10],"background":"#f4c20d   ","text":"xxxxxx","color":"#000000   ","single":false}},{"data":[],"grid":{"id":0},"id":"onchart.TradeHistory0","name":"TradeHistory 0","type":"TradeHistory","settings":{"update":false,"$selected":false,"$state":"finished","legend":true,"$uuid":"tradeHistory_1131","pp1":[1559692800000,10.000229166666667],"pp2":[1549152000000,8.664072916666667],"single":false}}]'
        };

        await apiService.save_UserLines(userLinesObject);

        const requestBodyObject = {
            user_id: testUser.user_id,
            stock_id: 42953
        };

        const userLines = await apiService.fetchUserLinesData(requestBodyObject);

        await apiService.deleteUserChartLinesOnUserId(testUser.user_id);

        expect(userLines.data.content).to.be.equal('[{"data":[],"grid":{"id":0},"id":"onchart.TextTool0","name":"TextTool 0","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_102","p1":[1578873600000,10],"background":"#f4c20d   ","text":"sdsdfsdfsdfsdf","color":"#000000   ","single":false}},{"data":[],"grid":{"id":1},"id":"onchart.TextTool1","name":"TextTool 1","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_106","p1":[1568592000000,10],"background":"#f4c20d   ","text":"text 4","color":"#000000   ","single":false}},{"data":[],"grid":{"id":2},"id":"onchart.TextTool2","name":"TextTool 2","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_107","p1":[1538956800000,10],"background":"#f4c20d   ","text":"text","color":"#000000   ","single":false}},{"data":[],"grid":{"id":3},"id":"onchart.TextTool3","name":"TextTool 3","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_104","p1":[1515801600000,10],"background":"#C2E0FC   ","text":"very nice","color":"#000000   ","single":false}},{"data":[],"grid":{"id":4},"id":"onchart.TextTool4","name":"TextTool 4","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_103","p1":[1515974400000,10],"background":"#f4c20d   ","text":"something else","color":"#000000   ","single":false}},{"data":[],"grid":{"id":5},"id":"onchart.TextTool5","name":"TextTool 5","type":"TextTool","settings":{"update":false,"$selected":false,"$state":"finished","legend":false,"$uuid":"text_105","p1":[1545609600000,10],"background":"#f4c20d   ","text":"xxxxxx","color":"#000000   ","single":false}},{"data":[],"grid":{"id":0},"id":"onchart.TradeHistory0","name":"TradeHistory 0","type":"TradeHistory","settings":{"update":false,"$selected":false,"$state":"finished","legend":true,"$uuid":"tradeHistory_1131","pp1":[1559692800000,10.000229166666667],"pp2":[1549152000000,8.664072916666667],"single":false}}]');
    });

    it('fetchEarningDates', async() => {
        const fetchEarningDates = await apiService.fetchEarningDates(1294);
        expect(fetchEarningDates.data).to.be.an('array');

        const earningsDate = fetchEarningDates.data[0];
        expect(earningsDate).to.have.keys([
            'period',
            'date_report_ms'
        ]);
    });

    it('fetchSectorsTree', async() => {
        const fetchSectorsTree = await apiService.fetchSectorsTree();
        expect(fetchSectorsTree.data).to.be.an('array');

        const sectorsTree = fetchSectorsTree.data[0];
        expect(sectorsTree).to.be.an('object');
        expect(sectorsTree).to.have.keys([
            "children",
            "id",
            "name",
            "parentid"
        ]);
    });

    it('fetchWatchlists', async() => {
        const fetchWatchlists = await apiService.fetchWatchlists(testUser.user_id);
        expect(fetchWatchlists.data).to.be.an('array');

        const firstFetchWatchlists = fetchWatchlists.data[0];
        expect(firstFetchWatchlists).to.be.an('object');
        expect(firstFetchWatchlists).to.have.keys([
            'watchlist_id',
            'user_id',
            'name',
            'type'
        ]);
    });

    it('deleteWatchlist', async() => {
        const newWatchlistObject = {
            user_id: testUser.user_id,
            name: 'Exempellista123'
        };

        const watchlist = await apiService.insertWatchlist(newWatchlistObject);

        const deleteWatchlist = await apiService.deleteWatchlist(watchlist.data.watchlist_id);

        // Delete watchlist part
        expect(deleteWatchlist.data).to.be.equal('Deleted WL and WLI');
    });

    it('insertWatchlist', async() => {
        const newWatchlistObject = {
            user_id: testUser.user_id,
            name: 'Exempellista123'
        };

        const watchlist = await apiService.insertWatchlist(newWatchlistObject);

        await apiService.deleteWatchlist(watchlist.data.watchlist_id);

        expect(watchlist.data).to.be.an('object');
        expect(watchlist.data).to.have.keys([
            'watchlist_id',
            'user_id',
            'name',
            'type'
        ]);
    });

    // it('fetchEarningsDateNext', async () => {
    //     const fetchEarningsDateNext = await apiService.fetchEarningsDateNext();
    //     // empty array????
    //     console.log(fetchEarningsDateNext.data);

    //     expect(fetchEarningsDateNext.data).to.be.an('array');
    //     // *********************** And the keys expected????
    // });

    it('fetchSectors', async() => {
        const fetchSectors = await apiService.fetchSectors();
        expect(fetchSectors.data).to.be.an('array');

        const sector = fetchSectors.data[0];
        expect(sector).to.be.an('object');
        expect(sector).to.have.keys([
            "children",
            "id",
            "name",
            "parentid"
        ]);
    });

    it('fetchExchanges', async() => {
        const fetchExchanges = await apiService.fetchExchanges();
        expect(fetchExchanges.data).to.be.an('array');

        const firstFetchExchanges = fetchExchanges.data[0];
        expect(firstFetchExchanges).to.be.an('object');
        expect(firstFetchExchanges).to.have.keys([
            'id',
            'handle',
            'name',
            'country',
            'city'
        ]);
    });

    it('selectUserTrades', async() => {
        const userTradeObjects = [{
            user_id: testUser.user_id,
            stock_id: 42953,
            ticker: 'FNOX',
            instrument_type: 'stock',
            entry_price: 29.1,
            entry_date: '2021-03-15',
            entry_qty: 500,
            exit_price: 35.2,
            exit_date: '2021-03-16',
            exit_qty: 500,
            commission: 19,
            pnl: 0,
            notes: '',
            user_account_id: '353-7'
        }];

        await apiService.insertArrayOfUserTrades(userTradeObjects);

        const selectUserTrades = JSON.parse(JSON.stringify(await apiService.selectUserTrades(testUser.user_id)))[0];

        await apiService.deleteUserTrade(selectUserTrades.trade_id);

        expect(selectUserTrades).to.be.an('object');
        expect(selectUserTrades).to.have.keys([
            "entry_commission",
            "exit_commission",
            "entry_date",
            "entry_price",
            "entry_qty",
            "exit_date",
            "exit_price",
            "exit_qty",
            "instrument_type",
            "notes",
            "pnl",
            "stock_id",
            "ticker",
            "trade_id",
            "user_id",
            "user_account_id"
        ]);
    });

    it('insertUserTrade', async() => {
        const userTradeObject = {
            user_id: testUser.user_id,
            stock_id: 42953,
            ticker: 'FNOX',
            instrument_type: 'stock',
            entry_price: 29.1,
            entry_date: '2021-03-15',
            entry_qty: 500,
            exit_price: 35.2,
            exit_date: '2021-03-16',
            exit_qty: 500,
            entry_commission: 19,
            exit_commission: 25,
            pnl: 0,
            notes: '',
            user_account_id: '353-7'
        };

        const selectUserTradesBeforeInsert = await apiService.selectUserTrades(testUser.user_id);
        await apiService.insertUserTrade(userTradeObject);

        const selectUserTradesAfterInsert = await apiService.selectUserTrades(testUser.user_id);
        await apiService.deleteUserTrade(selectUserTradesAfterInsert[0].trade_id);

        // Before insert
        expect(selectUserTradesBeforeInsert).to.be.an('array');
        expect(selectUserTradesBeforeInsert).to.deep.equal([]);

        // After insert
        expect(selectUserTradesAfterInsert[0]).to.be.an('object');

        const userTrade = selectUserTradesAfterInsert[0];
        expect(userTrade).to.be.an('object');
        expect(userTrade).to.have.keys([
            'trade_id',
            'user_id',
            'stock_id',
            'ticker',
            'instrument_type',
            'entry_price',
            'entry_date',
            'entry_qty',
            'exit_price',
            'exit_date',
            'exit_qty',
            "entry_commission",
            "exit_commission",
            'pnl',
            'notes',
            'user_account_id'
        ]);
        expect(userTrade.user_id).to.be.equal(userTradeObject.user_id);
        expect(userTrade.stock_id).to.be.equal(userTradeObject.stock_id);
        expect(userTrade.ticker).to.be.equal(userTradeObject.ticker);
        expect(userTrade.instrument_type).to.be.equal(userTradeObject.instrument_type);
        expect(userTrade.entry_price).to.be.equal(userTradeObject.entry_price);
        expect(userTrade.entry_date).to.be.equal(userTradeObject.entry_date);
        expect(userTrade.entry_qty).to.be.equal(userTradeObject.entry_qty);
        expect(userTrade.exit_price).to.be.equal(userTradeObject.exit_price);
        expect(userTrade.exit_date).to.be.equal(userTradeObject.exit_date);
        expect(userTrade.exit_qty).to.be.equal(userTradeObject.exit_qty);
        expect(userTrade.entry_commission).to.be.equal(userTradeObject.entry_commission);
        expect(userTrade.exit_commission).to.be.equal(userTradeObject.exit_commission);
        expect(userTrade.pnl).to.be.equal(userTradeObject.pnl);
        expect(userTrade.notes).to.be.equal(userTradeObject.notes);
        expect(userTrade.user_account_id).to.be.equal(userTradeObject.user_account_id);
    });

    it('insertArrayOfUserTrades', async() => {
        const userTradeObjects = [{
            user_id: testUser.user_id,
            stock_id: 42953,
            ticker: 'FNOX',
            instrument_type: 'stock',
            entry_price: 29.1,
            entry_date: '2021-03-15',
            entry_qty: 500,
            exit_price: 35.2,
            exit_date: '2021-03-16',
            exit_qty: 500,
            entry_commission: 19,
            exit_commission: 25,
            pnl: 0,
            notes: ''
        }];

        const selectUserTradesBeforeInsert = await apiService.selectUserTrades(testUser.user_id);
        await apiService.insertArrayOfUserTrades(userTradeObjects);

        const selectUserTradesAfterInsert = await apiService.selectUserTrades(testUser.user_id);
        await apiService.deleteUserTrade(selectUserTradesAfterInsert[0].trade_id);

        // Before insert
        expect(selectUserTradesBeforeInsert).to.deep.equal([]);

        // After insert
        const userTrade = selectUserTradesAfterInsert[0];

        expect(userTrade.user_id).to.be.equal(userTradeObjects[0].user_id);
        expect(userTrade.stock_id).to.be.equal(userTradeObjects[0].stock_id);
        expect(userTrade.ticker).to.be.equal(userTradeObjects[0].ticker);
        expect(userTrade.instrument_type).to.be.equal(userTradeObjects[0].instrument_type);
        expect(userTrade.entry_price).to.be.equal(userTradeObjects[0].entry_price);
        expect(userTrade.entry_date).to.be.equal(userTradeObjects[0].entry_date);
        expect(userTrade.entry_qty).to.be.equal(userTradeObjects[0].entry_qty);
        expect(userTrade.exit_price).to.be.equal(userTradeObjects[0].exit_price);
        expect(userTrade.exit_date).to.be.equal(userTradeObjects[0].exit_date);
        expect(userTrade.exit_qty).to.be.equal(userTradeObjects[0].exit_qty);
        expect(userTrade.entry_commission).to.be.equal(userTradeObjects[0].entry_commission);
        expect(userTrade.exit_commission).to.be.equal(userTradeObjects[0].exit_commission);
        expect(userTrade.pnl).to.be.equal(userTradeObjects[0].pnl);
        expect(userTrade.notes).to.be.equal(userTradeObjects[0].notes);
    });

    it('updateUserTrade', async() => {
        const userTradeObject = {
            user_id: testUser.user_id,
            stock_id: 42953,
            ticker: 'FNOX',
            instrument_type: 'stock',
            entry_price: 29.1,
            entry_date: '2021-03-15',
            entry_qty: 500,
            exit_price: 35.2,
            exit_date: '2021-03-16',
            exit_qty: 500,
            entry_commission: 19,
            exit_commission: 25,
            pnl: 0,
            notes: ''
        };

        await apiService.insertUserTrade(userTradeObject);
        const selectUserTradesBeforeUpdate = await apiService.selectUserTrades(testUser.user_id);

        const userTradeUpdateObject = {
            trade_id: selectUserTradesBeforeUpdate[0].trade_id,
            user_id: testUser.user_id,
            // stock_id: 42953,
            // ticker: 'FNOX',
            // instrument_type: 'stock',
            entry_price: 35.7,
            entry_date: '2021-02-11',
            entry_qty: 720,
            exit_price: 48.5,
            exit_date: '2021-02-14',
            exit_qty: 720,
            entry_commission: 23,
            exit_commission: 32,
            // pnl: 0,
            // notes: ''
        };

        await apiService.updateUserTrade(userTradeUpdateObject);
        const selectUserTradesAfterUpdate = await apiService.selectUserTrades(testUser.user_id);

        const userTradeDelete = selectUserTradesBeforeUpdate[0];
        await apiService.deleteUserTrade(userTradeDelete.trade_id);

        // Before update
        const userTrade1 = selectUserTradesBeforeUpdate[0];

        expect(userTrade1.user_id).to.be.equal(userTradeObject.user_id);
        expect(userTrade1.entry_price).to.be.equal(userTradeObject.entry_price);
        expect(userTrade1.entry_date).to.be.equal(userTradeObject.entry_date);
        expect(userTrade1.entry_qty).to.be.equal(userTradeObject.entry_qty);
        expect(userTrade1.exit_price).to.be.equal(userTradeObject.exit_price);
        expect(userTrade1.exit_date).to.be.equal(userTradeObject.exit_date);
        expect(userTrade1.exit_qty).to.be.equal(userTradeObject.exit_qty);
        expect(userTrade1.entry_commission).to.be.equal(userTradeObject.entry_commission);
        expect(userTrade1.exit_commission).to.be.equal(userTradeObject.exit_commission);

        // After update
        const userTrade2 = selectUserTradesAfterUpdate[0];

        expect(userTrade2.user_id).to.be.equal(userTradeUpdateObject.user_id);
        expect(userTrade2.entry_price).to.be.equal(userTradeUpdateObject.entry_price);
        expect(userTrade2.entry_date).to.be.equal(userTradeUpdateObject.entry_date);
        expect(userTrade2.entry_qty).to.be.equal(userTradeUpdateObject.entry_qty);
        expect(userTrade2.exit_price).to.be.equal(userTradeUpdateObject.exit_price);
        expect(userTrade2.exit_date).to.be.equal(userTradeUpdateObject.exit_date);
        expect(userTrade2.exit_qty).to.be.equal(userTradeUpdateObject.exit_qty);
        expect(userTrade2.entry_commission).to.be.equal(userTradeUpdateObject.entry_commission);
        expect(userTrade2.exit_commission).to.be.equal(userTradeUpdateObject.exit_commission);
    });

    it.skip('updateArrayOfUserTrades', async() => {
        const userTradeObject = {
            user_id: testUser.user_id,
            stock_id: 42953,
            ticker: 'FNOX',
            instrument_type: 'stock',
            entry_price: 29.1,
            entry_date: '2021-03-15',
            entry_qty: 500,
            exit_price: 35.2,
            exit_date: '2021-03-16',
            exit_qty: 500,
            commission: 19,
            pnl: 0,
            notes: ''
        };

        await apiService.insertUserTrade(userTradeObject);

        const selectUserTradesBeforeUpdate = await apiService.selectUserTrades(testUser.user_id);

        console.log(selectUserTradesBeforeUpdate);

        const userTradeObjects = [{
            trade_id: selectUserTradesBeforeUpdate[0].trade_id,
            user_id: testUser.user_id,
            // stock_id: 42953,
            // ticker: 'FNOX',
            // instrument_type: 'stock',
            entry_price: 45.3,
            entry_date: '2020-02-10',
            entry_qty: 650,
            exit_price: 55.5,
            exit_date: '2020-02-12',
            exit_qty: 650,
            commission: 23,
            // pnl: 0,
            // notes: ''
        }];

        //It does not update the object.
        await apiService.updateArrayOfUserTrades(userTradeObjects);

        const selectUserTradesAfterUpdate = await apiService.selectUserTrades(testUser.user_id);

        await apiService.deleteUserTrade(selectUserTradesBeforeUpdate[0].trade_id);


        // Before update
        expect(selectUserTradesBeforeUpdate).to.be.an('array');

        const userTradeBefore = selectUserTradesBeforeUpdate[0];

        expect(userTradeBefore).to.be.an('object');
        expect(userTradeBefore).to.have.keys([
            'trade_id',
            'user_id',
            'stock_id',
            'ticker',
            'instrument_type',
            'entry_price',
            'entry_date',
            'entry_qty',
            'exit_price',
            'exit_date',
            'exit_qty',
            'commission',
            'pnl',
            'notes'
        ]);
        expect(userTradeBefore.user_id).to.be.equal(userTradeObject.user_id);
        expect(userTradeBefore.stock_id).to.be.equal(userTradeObject.stock_id);
        expect(userTradeBefore.ticker).to.be.equal(userTradeObject.ticker);
        expect(userTradeBefore.instrument_type).to.be.equal(userTradeObject.instrument_type);
        expect(userTradeBefore.entry_price).to.be.equal(userTradeObject.entry_price);
        expect(userTradeBefore.entry_date).to.be.equal(userTradeObject.entry_date);
        expect(userTradeBefore.entry_qty).to.be.equal(userTradeObject.entry_qty);
        expect(userTradeBefore.exit_price).to.be.equal(userTradeObject.exit_price);
        expect(userTradeBefore.exit_date).to.be.equal(userTradeObject.exit_date);
        expect(userTradeBefore.exit_qty).to.be.equal(userTradeObject.exit_qty);
        expect(userTradeBefore.commission).to.be.equal(userTradeObject.commission);
        expect(userTradeBefore.pnl).to.be.equal(userTradeObject.pnl);
        expect(userTradeBefore.notes).to.be.equal(userTradeObject.notes);

        // After update
        expect(selectUserTradesAfterUpdate).to.be.an('array');

        const userTradeAfter = selectUserTradesAfterUpdate[0];

        console.log(userTradeAfter);

        expect(userTradeAfter).to.have.keys([
            'trade_id',
            'user_id',
            'stock_id',
            'ticker',
            'instrument_type',
            'entry_price',
            'entry_date',
            'entry_qty',
            'exit_price',
            'exit_date',
            'exit_qty',
            'commission',
            'pnl',
            'notes'
        ]);
        expect(userTradeAfter.trade_id).to.be.equal(userTradeObjects[0].trade_id);
        expect(userTradeAfter.user_id).to.be.equal(userTradeObjects[0].user_id);
        expect(userTradeAfter.entry_price).to.be.equal(userTradeObjects[0].entry_price);
        expect(userTradeAfter.entry_date).to.be.equal(userTradeObjects[0].entry_date);
        expect(userTradeAfter.entry_qty).to.be.equal(userTradeObjects[0].entry_qty);
        expect(userTradeAfter.exit_price).to.be.equal(userTradeObjects[0].exit_price);
        expect(userTradeAfter.exit_date).to.be.equal(userTradeObjects[0].exit_date);
        expect(userTradeAfter.exit_qty).to.be.equal(userTradeObjects[0].exit_qty);
        expect(userTradeAfter.commission).to.be.equal(userTradeObjects[0].commission);
    });

    it('deleteUserTrade', async() => {
        const userTradeObject = {
            user_id: testUser.user_id,
            stock_id: 42953,
            ticker: 'FNOX',
            instrument_type: 'stock',
            entry_price: 29.1,
            entry_date: '2021-03-15',
            entry_qty: 500,
            exit_price: 35.2,
            exit_date: '2021-03-16',
            exit_qty: 500,
            entry_commission: 19,
            exit_commission: 25,
            pnl: 0,
            notes: ''
        };

        await apiService.insertUserTrade(userTradeObject);

        const selectUserTradesBeforeDelete = JSON.parse(JSON.stringify(await apiService.selectUserTrades(testUser.user_id)));

        await apiService.deleteUserTrade(selectUserTradesBeforeDelete[0].trade_id);

        const selectUserTradesAfterDelete = JSON.parse(JSON.stringify(await apiService.selectUserTrades(testUser.user_id)));

        // Before delete
        expect(selectUserTradesBeforeDelete).to.be.an('array');

        const userTradeBeforeDelete = selectUserTradesBeforeDelete[0];

        expect(userTradeBeforeDelete).to.be.an('object');
        expect(userTradeBeforeDelete.user_id).to.be.equal(userTradeObject.user_id);
        expect(userTradeBeforeDelete.stock_id).to.be.equal(userTradeObject.stock_id);
        expect(userTradeBeforeDelete.ticker).to.be.equal(userTradeObject.ticker);
        expect(userTradeBeforeDelete.instrument_type).to.be.equal(userTradeObject.instrument_type);
        expect(userTradeBeforeDelete.entry_price).to.be.equal(userTradeObject.entry_price);
        expect(userTradeBeforeDelete.entry_date).to.be.equal(userTradeObject.entry_date);
        expect(userTradeBeforeDelete.entry_qty).to.be.equal(userTradeObject.entry_qty);
        expect(userTradeBeforeDelete.exit_price).to.be.equal(userTradeObject.exit_price);
        expect(userTradeBeforeDelete.exit_date).to.be.equal(userTradeObject.exit_date);
        expect(userTradeBeforeDelete.exit_qty).to.be.equal(userTradeObject.exit_qty);
        expect(userTradeBeforeDelete.entry_commission).to.be.equal(userTradeObject.entry_commission);
        expect(userTradeBeforeDelete.exit_commission).to.be.equal(userTradeObject.exit_commission);
        expect(userTradeBeforeDelete.pnl).to.be.equal(userTradeObject.pnl);
        expect(userTradeBeforeDelete.notes).to.be.equal(userTradeObject.notes);

        // After delete
        expect(selectUserTradesAfterDelete).to.deep.equal([]);
    });

    it('deleteUserTradeOnUserIdAndStockId', async() => {
        const userTradeObject = {
            user_id: testUser.user_id,
            stock_id: 42953,
            ticker: 'FNOX',
            instrument_type: 'stock',
            entry_price: 29.1,
            entry_date: '2021-03-15',
            entry_qty: 500,
            exit_price: 35.2,
            exit_date: '2021-03-16',
            exit_qty: 500,
            entry_commission: 19,
            exit_commission: 26,
            pnl: 0,
            notes: ''
        };

        await apiService.insertUserTrade(userTradeObject);

        const selectUserTradesBeforeDelete = await apiService.selectUserTrades(testUser.user_id);

        await apiService.deleteUserTradeOnUserIdAndStockId(selectUserTradesBeforeDelete[0]);

        const selectUserTradesAfterDelete = await apiService.selectUserTrades(testUser.user_id);

        // Before delete
        expect(selectUserTradesBeforeDelete).to.be.an('array');

        const userTradeBeforeDelete = selectUserTradesBeforeDelete[0];

        expect(userTradeBeforeDelete).to.be.an('object');
        expect(userTradeBeforeDelete.user_id).to.be.equal(userTradeObject.user_id);
        expect(userTradeBeforeDelete.stock_id).to.be.equal(userTradeObject.stock_id);
        expect(userTradeBeforeDelete.ticker).to.be.equal(userTradeObject.ticker);
        expect(userTradeBeforeDelete.instrument_type).to.be.equal(userTradeObject.instrument_type);
        expect(userTradeBeforeDelete.entry_price).to.be.equal(userTradeObject.entry_price);
        expect(userTradeBeforeDelete.entry_date).to.be.equal(userTradeObject.entry_date);
        expect(userTradeBeforeDelete.entry_qty).to.be.equal(userTradeObject.entry_qty);
        expect(userTradeBeforeDelete.exit_price).to.be.equal(userTradeObject.exit_price);
        expect(userTradeBeforeDelete.exit_date).to.be.equal(userTradeObject.exit_date);
        expect(userTradeBeforeDelete.exit_qty).to.be.equal(userTradeObject.exit_qty);
        expect(userTradeBeforeDelete.entry_commission).to.be.equal(userTradeObject.entry_commission);
        expect(userTradeBeforeDelete.exit_commission).to.be.equal(userTradeObject.exit_commission);
        expect(userTradeBeforeDelete.pnl).to.be.equal(userTradeObject.pnl);
        expect(userTradeBeforeDelete.notes).to.be.equal(userTradeObject.notes);

        // After delete
        expect(selectUserTradesAfterDelete).to.deep.equal([]);
    });

    it('getTradePlan', async() => {
        const insertNewUserTradePlanObject = {
            user_id: testUser.user_id,
            stock_id: 42953,
            entry_price: 33,
            stoploss_price: 22,
            target_price: 11,
            entry_date: '1597968000000',
            exit_date: '1588809600000',
            long: true,
            entry_alert_status: 'on',
            stoploss_alert_status: 'on',
            target_alert_status: 'on'
        };

        await apiService.insertUserTradePlan(insertNewUserTradePlanObject);

        const getTradePlan = await apiService.getTradePlan(insertNewUserTradePlanObject);

        //It doesnt work the delete.
        for (const tradeItem of getTradePlan.data) {
            await apiService.deleteUserTradePlan(tradeItem);
        }

        const tradePlan = (getTradePlan.data).find((tp) => tp.entry_price === 33);

        expect(tradePlan).to.be.an('object');
        expect(tradePlan).to.have.keys([
            'trade_plan_id',
            'user_id',
            'stock_id',
            'entry_price',
            'stoploss_price',
            'target_price',
            'entry_date',
            'exit_date',
            'long',
            'entry_alert_status',
            'stoploss_alert_status',
            'target_alert_status'
        ]);
        expect(tradePlan.user_id).to.be.equal(insertNewUserTradePlanObject.user_id);
        expect(tradePlan.stock_id).to.be.equal(insertNewUserTradePlanObject.stock_id);
        expect(tradePlan.entry_price).to.be.equal(insertNewUserTradePlanObject.entry_price);
        expect(tradePlan.stoploss_price).to.be.equal(insertNewUserTradePlanObject.stoploss_price);
        expect(tradePlan.target_price).to.be.equal(insertNewUserTradePlanObject.target_price);
        expect(tradePlan.entry_date).to.be.equal(insertNewUserTradePlanObject.entry_date);
        expect(tradePlan.exit_date).to.be.equal(insertNewUserTradePlanObject.exit_date);
        expect(tradePlan.long).to.be.equal(insertNewUserTradePlanObject.long);
        expect(tradePlan.entry_alert_status).to.be.equal(insertNewUserTradePlanObject.entry_alert_status);
        expect(tradePlan.stoploss_alert_status).to.be.equal(insertNewUserTradePlanObject.stoploss_alert_status);
        expect(tradePlan.target_alert_status).to.be.equal(insertNewUserTradePlanObject.target_alert_status);
    });

    // *************************
    // +++++++++++++
    // +++++++++++++
    // +++++++++++++
    // +++++++++++++
    // Will wait with testing function 'getTradePlans'
    // until function 'deleteUserTradePlan' has been fixed
    // *************************

    // *************************
    // +++++++++++++
    // +++++++++++++
    // +++++++++++++
    // +++++++++++++
    // Will wait with testing function 'updateTradePlan'
    // until function 'deleteUserTradePlan' has been fixed
    // *************************

    // *************************
    // +++++++++++++
    // +++++++++++++
    // +++++++++++++
    // +++++++++++++
    // Will wait with testing function 'insertUserTradePlan'
    // until function 'deleteUserTradePlan' has been fixed
    // *************************

    // *************************
    // Need to change in UserTradeController:s function 'deleteUserTradePlan'
    // from req.body.trade_plan_id to req.params.trade_plan_id before
    // function 'deleteUserTradePlan' in ApiService will work properly
    // *************************

    it('getUserTrades', async() => {
        const userTradeInsertObject = {
            user_id: testUser.user_id,
            stock_id: 42953,
            ticker: 'FNOX',
            instrument_type: 'stock',
            entry_price: 29.1,
            entry_date: '2021-03-15',
            entry_qty: 500,
            exit_price: 35.6,
            exit_date: '2021-03-18',
            exit_qty: 500,
            entry_commission: 19,
            exit_commission: 25,
            pnl: 0,
            notes: ''
        };

        await apiService.insertTradeHistory(userTradeInsertObject);

        const getUserTrades = await apiService.getUserTrades(testUser.user_id);

        await apiService.deleteUserTrade(getUserTrades[0].trade_id);

        expect(getUserTrades).to.be.an('array');

        const userTrade = getUserTrades[0];

        expect(userTrade).to.be.an('object');
        expect(userTrade.user_id).to.be.equal(userTradeInsertObject.user_id);
        expect(userTrade.stock_id).to.be.equal(userTradeInsertObject.stock_id);
        expect(userTrade.ticker).to.be.equal(userTradeInsertObject.ticker);
        expect(userTrade.instrument_type).to.be.equal(userTradeInsertObject.instrument_type);
        expect(userTrade.entry_price).to.be.equal(userTradeInsertObject.entry_price);
        expect(userTrade.entry_date).to.be.equal(userTradeInsertObject.entry_date);
        expect(userTrade.entry_qty).to.be.equal(userTradeInsertObject.entry_qty);
        expect(userTrade.exit_price).to.be.equal(userTradeInsertObject.exit_price);
        expect(userTrade.exit_date).to.be.equal(userTradeInsertObject.exit_date);
        expect(userTrade.exit_qty).to.be.equal(userTradeInsertObject.exit_qty);
        expect(userTrade.entry_commission).to.be.equal(userTradeInsertObject.entry_commission);
        expect(userTrade.exit_commission).to.be.equal(userTradeInsertObject.exit_commission);
        expect(userTrade.pnl).to.be.equal(userTradeInsertObject.pnl);
        expect(userTrade.notes).to.be.equal(userTradeInsertObject.notes);
    });

    // *************************
    // Will wait with testing function 'updateTradeHistory'
    // until the declare problem with function 'getTradeHistory' has been fixed
    // *************************

    // *************************
    // Will wait with testing function 'insertTradeHistory'
    // until the declare problem with function 'getTradeHistory' has been fixed
    // *************************

    it('fetchWatchlistHeaders', async() => {
        const userUpdateObject = {
            user_id: testUser.user_id,
            headers: '["","Name","Sector","Earnings Date","Watched Since"]'
        };

        await apiService.saveWatchlistHeaders(userUpdateObject);

        const userHeaders = await apiService.fetchWatchlistHeaders(testUser.user_id);
        expect(userHeaders.data).to.be.an('array');
        expect(userHeaders.data[0]).to.be.equal('');
        expect(userHeaders.data[1]).to.be.equal('Name');
        expect(userHeaders.data[2]).to.be.equal('Sector');
        expect(userHeaders.data[3]).to.be.equal('Earnings Date');
        expect(userHeaders.data[4]).to.be.equal('Watched Since');
    });

    it('saveWatchlistHeaders', async() => {
        const userUpdateObject = {
            user_id: testUser.user_id,
            headers: '["","Name","Sector","Earnings Date","Watched Since","Ticker","∆%","Conviction","Research","Diary Notes","Tags"]'
        };

        await apiService.saveWatchlistHeaders(userUpdateObject);

        const userHeaders = await apiService.fetchWatchlistHeaders(testUser.user_id);
        expect(userHeaders.data).to.be.an('array');
        expect(userHeaders.data[0]).to.be.equal('');
        expect(userHeaders.data[1]).to.be.equal('Name');
        expect(userHeaders.data[2]).to.be.equal('Sector');
        expect(userHeaders.data[3]).to.be.equal('Earnings Date');
        expect(userHeaders.data[4]).to.be.equal('Watched Since');
        expect(userHeaders.data[5]).to.be.equal('Ticker');
        expect(userHeaders.data[6]).to.be.equal('∆%');
        expect(userHeaders.data[7]).to.be.equal('Conviction');
        expect(userHeaders.data[8]).to.be.equal('Research');
        expect(userHeaders.data[9]).to.be.equal('Diary Notes');
        expect(userHeaders.data[10]).to.be.equal('Tags');
    });

    it.skip('getUserScreenerFilters', async() => {
        const userScreenerObject = {
            user_id: testUser.user_id,
            name: 'My "Large Cap" >€1B',
            filter: '{"market_cap":{"filterType":"number","operator":"AND","condition1":{"filterType":"number","type":"greaterThan","filter":1000,"filterTo":null},"condition2":{"filterType":"number","type":"lessThan","filter":1000000,"filterTo":null}}}',
            date_updated: '2021-03-15',
            known_items: ['test1', 'test2', 'test3']
        };

        await apiService.saveUserScreenerFilters(userScreenerObject);

        const getUserScreenerFilters = JSON.parse(JSON.stringify(await apiService.getUserScreenerFilters(testUser.user_id)));

        for (const screen of getUserScreenerFilters.data) {
            await apiService.deleteScreen(screen.screen_id);
        }

        expect(getUserScreenerFilters.data).to.be.an('array');
        for (const screen of getUserScreenerFilters.data) {
            expect(screen).to.be.an('object');
            expect(screen).to.have.keys([
                'screen_id',
                'user_id',
                'name',
                'filter',
                'date_updated',
                'known_items'
            ]);
            expect(screen.user_id).to.be.equal(userScreenerObject.user_id);
            expect(screen.name).to.be.equal(userScreenerObject.name);
            expect(screen.filter).to.be.equal(userScreenerObject.filter);
            expect(screen.date_updated).to.be.equal(userScreenerObject.date_updated);
            expect(screen.known_items).to.be.an('array');
            expect(screen.known_items).to.deep.equal(userScreenerObject.known_items);
        }
    });

    it.skip('saveUserScreenerFilters', async() => {
        const getUserScreenerFiltersBeforeSave = JSON.parse(JSON.stringify(await apiService.getUserScreenerFilters(testUser.user_id)));

        const userScreenerObject = {
            user_id: testUser.user_id,
            name: 'My "Large Cap" >€1B',
            filter: '{"market_cap":{"filterType":"number","operator":"AND","condition1":{"filterType":"number","type":"greaterThan","filter":-1e+31,"filterTo":null},"condition2":{"filterType":"number","type":"lessThan","filter":1000000,"filterTo":null}},"sales_array_delta":{"filterType":"number","operator":"AND","condition1":{"filterType":"number","type":"greaterThanWithNulls","filter":-5,"filterTo":null},"condition2":{"filterType":"number","type":"lessThanWithNulls","filter":1e+27,"filterTo":null}},"profit_margin":{"filterType":"number","operator":"AND","condition1":{"filterType":"number","type":"greaterThan","filter":-5,"filterTo":null},"condition2":{"filterType":"number","type":"lessThan","filter":8,"filterTo":null}}}',
            date_updated: '2021-03-15',
            known_items: ['test1', 'test2', 'test3']
        };

        await apiService.saveUserScreenerFilters(userScreenerObject);

        const getUserScreenerFiltersAfterSave = JSON.parse(JSON.stringify(await apiService.getUserScreenerFilters(testUser.user_id)));

        await apiService.deleteScreen(getUserScreenerFiltersAfterSave.data[0].screen_id);

        // Before save
        expect(getUserScreenerFiltersBeforeSave.data).to.deep.equal([]);

        // After save
        const screen = getUserScreenerFiltersAfterSave.data[0];
        expect(screen).to.be.an('object');
        expect(screen).to.have.keys([
            'screen_id',
            'user_id',
            'name',
            'filter',
            'date_updated',
            'known_items'
        ]);
        expect(screen.user_id).to.be.equal(userScreenerObject.user_id);
        expect(screen.name).to.be.equal(userScreenerObject.name);
        expect(screen.filter).to.be.equal(userScreenerObject.filter);
        expect(screen.date_updated).to.be.equal(userScreenerObject.date_updated);
        expect(screen.known_items).to.be.an('array');
        expect(screen.known_items).to.deep.equal(userScreenerObject.known_items);
    });

    it.skip('deleteScreen', async() => {
        const userScreenerObject = {
            user_id: testUser.user_id,
            name: 'My "Large Cap" >€1B',
            filter: '{"market_cap":{"filterType":"number","operator":"AND","condition1":{"filterType":"number","type":"greaterThan","filter":-1e+31,"filterTo":null},"condition2":{"filterType":"number","type":"lessThan","filter":1000000,"filterTo":null}},"sales_array_delta":{"filterType":"number","operator":"AND","condition1":{"filterType":"number","type":"greaterThanWithNulls","filter":-5,"filterTo":null},"condition2":{"filterType":"number","type":"lessThanWithNulls","filter":1e+27,"filterTo":null}},"profit_margin":{"filterType":"number","operator":"AND","condition1":{"filterType":"number","type":"greaterThan","filter":-5,"filterTo":null},"condition2":{"filterType":"number","type":"lessThan","filter":8,"filterTo":null}}}',
            date_updated: '2021-03-15',
            known_items: ['test1', 'test2', 'test3']
        };

        await apiService.saveUserScreenerFilters(userScreenerObject);

        const getUserScreenerFiltersBeforeDelete = JSON.parse(JSON.stringify(await apiService.getUserScreenerFilters(testUser.user_id)));

        await apiService.deleteScreen(getUserScreenerFiltersBeforeDelete.data[0].screen_id);

        const getUserScreenerFiltersAfterDelete = JSON.parse(JSON.stringify(await apiService.getUserScreenerFilters(testUser.user_id)));

        // Before delete
        const screen = getUserScreenerFiltersBeforeDelete.data[0];
        expect(screen).to.have.keys([
            'screen_id',
            'user_id',
            'name',
            'filter',
            'date_updated',
            'known_items'
        ]);
        expect(screen.user_id).to.be.equal(userScreenerObject.user_id);
        expect(screen.name).to.be.equal(userScreenerObject.name);
        expect(screen.filter).to.be.equal(userScreenerObject.filter);
        expect(screen.date_updated).to.be.equal(userScreenerObject.date_updated);
        expect(screen.known_items).to.be.an('array');
        expect(screen.known_items).to.deep.equal(userScreenerObject.known_items);

        // After delete
        expect(getUserScreenerFiltersAfterDelete.data).to.deep.equal([]);
    });

    it.skip('updateScreenFilters', async() => {
        const userScreenerObjectBeforeUpdate = {
            user_id: testUser.user_id,
            name: 'test123',
            filter: '{"market_cap":{"filterType":"number","operator":"AND","condition1":{"filterType":"number","type":"greaterThan","filter":-1e+31,"filterTo":null},"condition2":{"filterType":"number","type":"lessThan","filter":1000000,"filterTo":null}},"sales_array_delta":{"filterType":"number","operator":"AND","condition1":{"filterType":"number","type":"greaterThanWithNulls","filter":-5,"filterTo":null},"condition2":{"filterType":"number","type":"lessThanWithNulls","filter":1e+27,"filterTo":null}},"profit_margin":{"filterType":"number","operator":"AND","condition1":{"filterType":"number","type":"greaterThan","filter":-5,"filterTo":null},"condition2":{"filterType":"number","type":"lessThan","filter":8,"filterTo":null}}}',
            date_updated: '2021-03-15',
            known_items: ['test1', 'test2', 'test3']
        };

        await apiService.saveUserScreenerFilters(userScreenerObjectBeforeUpdate);

        const getUserScreenerFiltersBeforeUpdate = JSON.parse(JSON.stringify(await apiService.getUserScreenerFilters(testUser.user_id)));

        let userScreenerObjectAfterUpdate;

        for (const screen of getUserScreenerFiltersBeforeUpdate.data) {
            userScreenerObjectAfterUpdate = {
                screen_id: screen.screen_id,
                name: 'test456'
            };

            await apiService.updateScreenFilters(userScreenerObjectAfterUpdate);
        }

        const getUserScreenerFiltersAfterUpdate = await apiService.getUserScreenerFilters(testUser.user_id);

        for (const screen of getUserScreenerFiltersBeforeUpdate.data) {
            await apiService.deleteScreen(screen.screen_id);
        }

        // Before update
        const screen = getUserScreenerFiltersBeforeUpdate.data[0];
        expect(screen).to.be.an('object');
        expect(screen).to.have.keys([
            'screen_id',
            'user_id',
            'name',
            'filter',
            'date_updated',
            'known_items'
        ]);
        expect(screen.user_id).to.be.equal(userScreenerObjectBeforeUpdate.user_id);
        expect(screen.name).to.be.equal(userScreenerObjectBeforeUpdate.name);
        expect(screen.filter).to.be.equal(userScreenerObjectBeforeUpdate.filter);
        expect(screen.date_updated).to.be.equal(userScreenerObjectBeforeUpdate.date_updated);
        expect(screen.known_items).to.be.an('array');
        expect(screen.known_items).to.deep.equal(userScreenerObjectBeforeUpdate.known_items);

        // After update
        expect(getUserScreenerFiltersAfterUpdate.data).to.be.an('array');

        const firstGetUserScreenerFiltersAfterUpdate = getUserScreenerFiltersAfterUpdate.data[0];

        expect(firstGetUserScreenerFiltersAfterUpdate).to.be.an('object');
        expect(firstGetUserScreenerFiltersAfterUpdate).to.have.keys([
            'screen_id',
            'user_id',
            'name',
            'filter',
            'date_updated',
            'known_items'
        ]);
        expect(firstGetUserScreenerFiltersAfterUpdate.screen_id).to.be.equal(userScreenerObjectAfterUpdate.screen_id);
        expect(firstGetUserScreenerFiltersAfterUpdate.name).to.be.equal(userScreenerObjectAfterUpdate.name);
    });

    it.skip('updateUserScreenerFilters', async() => {
        const userScreenerObjectBeforeUpdate = {
            user_id: testUser.user_id,
            name: 'test123',
            filter: '{"market_cap":{"filterType":"number","operator":"AND","condition1":{"filterType":"number","type":"greaterThan","filter":-1e+31,"filterTo":null},"condition2":{"filterType":"number","type":"lessThan","filter":1000000,"filterTo":null}},"sales_array_delta":{"filterType":"number","operator":"AND","condition1":{"filterType":"number","type":"greaterThanWithNulls","filter":-5,"filterTo":null},"condition2":{"filterType":"number","type":"lessThanWithNulls","filter":1e+27,"filterTo":null}},"profit_margin":{"filterType":"number","operator":"AND","condition1":{"filterType":"number","type":"greaterThan","filter":-5,"filterTo":null},"condition2":{"filterType":"number","type":"lessThan","filter":8,"filterTo":null}}}',
            date_updated: '2021-03-15',
            known_items: ['test1', 'test2', 'test3']
        };

        await apiService.saveUserScreenerFilters(userScreenerObjectBeforeUpdate);

        const getUserScreenerFiltersBeforeUpdate = JSON.parse(JSON.stringify(await apiService.getUserScreenerFilters(testUser.user_id)));

        let userScreenerObjectAfterUpdate;

        for (const screen of getUserScreenerFiltersBeforeUpdate.data) {
            userScreenerObjectAfterUpdate = {
                screen_id: screen.screen_id,
                name: 'test456',
                filter: '{"market_cap":{"filterType":"number"}}'
            };

            await apiService.updateUserScreenerFilters(userScreenerObjectAfterUpdate);
        }

        const getUserScreenerFiltersAfterUpdate = JSON.parse(JSON.stringify(await apiService.getUserScreenerFilters(testUser.user_id)));

        for (const screen of getUserScreenerFiltersBeforeUpdate.data) {
            await apiService.deleteScreen(screen.screen_id);
        }

        // Before update
        const firstGetUserScreenerFiltersBeforeUpdate = getUserScreenerFiltersBeforeUpdate.data[0];

        expect(firstGetUserScreenerFiltersBeforeUpdate).to.be.an('object');
        expect(firstGetUserScreenerFiltersBeforeUpdate).to.have.keys([
            'screen_id',
            'user_id',
            'name',
            'filter',
            'date_updated',
            'known_items'
        ]);
        expect(firstGetUserScreenerFiltersBeforeUpdate.user_id).to.be.equal(userScreenerObjectBeforeUpdate.user_id);
        expect(firstGetUserScreenerFiltersBeforeUpdate.name).to.be.equal(userScreenerObjectBeforeUpdate.name);
        expect(firstGetUserScreenerFiltersBeforeUpdate.filter).to.be.equal(userScreenerObjectBeforeUpdate.filter);
        expect(firstGetUserScreenerFiltersBeforeUpdate.date_updated).to.be.equal(userScreenerObjectBeforeUpdate.date_updated);
        expect(firstGetUserScreenerFiltersBeforeUpdate.known_items).to.be.an('array');
        expect(firstGetUserScreenerFiltersBeforeUpdate.known_items).to.deep.equal(userScreenerObjectBeforeUpdate.known_items);

        // After update
        const firstGetUserScreenerFiltersAfterUpdate = getUserScreenerFiltersAfterUpdate.data[0];

        expect(firstGetUserScreenerFiltersAfterUpdate).to.be.an('object');
        expect(firstGetUserScreenerFiltersAfterUpdate).to.have.keys([
            'screen_id',
            'user_id',
            'name',
            'filter',
            'date_updated',
            'known_items'
        ]);
        expect(firstGetUserScreenerFiltersAfterUpdate.screen_id).to.be.equal(userScreenerObjectAfterUpdate.screen_id);
        expect(firstGetUserScreenerFiltersAfterUpdate.name).to.be.equal(userScreenerObjectAfterUpdate.name);
        expect(firstGetUserScreenerFiltersAfterUpdate.filter).to.be.equal(userScreenerObjectAfterUpdate.filter);
    });

    it('uploadAvanza', async() => {
        const stubUploadAvanza = sinon.stub(apiService, 'uploadAvanza');
        const formData = null;

        const avanzaObject = {
            user_id: testUser.user_id,
            stock_id: 469,
            isin: "FI0009000681",
            account: "7516434",
            amount: -3500,
            commission: "19.00",
            currency: "EUR",
            description: "Nokia Corporation",
            exchange_rate: 3.5,
            price: 3.5,
            qty: 1000,
            ticker: "NOKIA",
            tx_date: "2020-01-01",
            tx_type: "BUY",
        };

        stubUploadAvanza.returns(avanzaObject);

        await apiService.uploadAvanza(formData);

        expect(stubUploadAvanza.returnValues).to.be.an('array');

        const firstStubUploadAvanza = stubUploadAvanza.returnValues[0];
        expect(firstStubUploadAvanza).to.be.an('object');
        expect(firstStubUploadAvanza).to.have.keys([
            'user_id',
            'stock_id',
            'isin',
            'account',
            'amount',
            'commission',
            'currency',
            'description',
            'exchange_rate',
            'price',
            'qty',
            'ticker',
            'tx_date',
            'tx_type',
        ]);
        expect(firstStubUploadAvanza.account).to.be.equal(avanzaObject.account);
        expect(firstStubUploadAvanza.amount).to.be.equal(avanzaObject.amount);
        expect(firstStubUploadAvanza.commission).to.be.equal(avanzaObject.commission);
        expect(firstStubUploadAvanza.currency).to.be.equal(avanzaObject.currency);
        expect(firstStubUploadAvanza.description).to.be.equal(avanzaObject.description);
        expect(firstStubUploadAvanza.exchange_rate).to.be.equal(avanzaObject.exchange_rate);
        expect(firstStubUploadAvanza.isin).to.be.equal(avanzaObject.isin);
        expect(firstStubUploadAvanza.price).to.be.equal(avanzaObject.price);
        expect(firstStubUploadAvanza.qty).to.be.equal(avanzaObject.qty);
        expect(firstStubUploadAvanza.ticker).to.be.equal(avanzaObject.ticker);
        expect(firstStubUploadAvanza.tx_date).to.be.equal(avanzaObject.tx_date);
        expect(firstStubUploadAvanza.tx_type).to.be.equal(avanzaObject.tx_type);
        expect(firstStubUploadAvanza.user_id).to.be.equal(avanzaObject.user_id);
    });

    // it('saveAvanza', async () => {
    //     const userTxsMock = [
    //         {
    //             user_id: 98,
    //             account: '',
    //             tx_date: '2021-04-09',
    //             tx_type: 'BUY',
    //             isin: 'SE0001966656',
    //             description: '',
    //             qty: 20,
    //             price: 231,
    //             amount: -3450,
    //             commission: 12,
    //             currency: 'SEK',
    //             exchange_rate: 231,
    //             stock_id: 42953
    //         },
    //         {
    //             user_id: 98,
    //             account: '',
    //             tx_date: '2021-05-11',
    //             tx_type: 'SELL',
    //             isin: 'SE0001966656',
    //             description: '',
    //             qty: -10,
    //             price: 265,
    //             amount: 5200,
    //             commission: 14,
    //             currency: 'SEK',
    //             exchange_rate: 265,
    //             stock_id: 42953
    //         }
    //     ];

    //     const userTradesMock = [
    //         {
    //             user_id: 98,
    //             stock_id: 42953,
    //             ticker: 'FNOX',
    //             instrument_type: 'test',
    //             entry_price: 231,
    //             entry_date: '2021-04-09',
    //             entry_qty: 10,
    //             exit_price: 265,
    //             exit_date: '2021-05-11',
    //             exit_qty: 10,
    //             commission: 14,
    //             pnl: 0,
    //             notes: ''
    //         },
    //         {
    //             user_id: 98,
    //             stock_id: 42953,
    //             ticker: 'FNOX',
    //             instrument_type: 'test',
    //             entry_price: 231,
    //             entry_date: '2021-04-09',
    //             entry_qty: 10,
    //             exit_price: null,
    //             exit_date: null,
    //             exit_qty: null,
    //             commission: 12,
    //             pnl: 0,
    //             notes: ''
    //         }
    //     ];

    //     const userTxAndTradeObject = {
    //         txs: userTxsMock,
    //         uts: userTradesMock
    //     };

    //     const results = await apiService.saveAvanza(userTxAndTradeObject);

    //     // Why console.log???
    //     console.log(results);
    // });

    it('insertOneTx', async() => {
        const avanzaObject = {
            account: "7516434",
            amount: -3500,
            commission: 19,
            currency: "EUR",
            description: "Nokia Corporation",
            exchange_rate: 3.5,
            isin: "FI0009000681",
            price: 3.5,
            qty: 1000,
            ticker: "NOKIA",
            tx_date: "2020-01-01",
            tx_type: "BUY",
            user_account_id: "353-7",
            user_id: testUser.user_id
        };

        await apiService.insertOneTx(avanzaObject);

        const fetchTx = JSON.parse(JSON.stringify(await apiService.fetchTx(testUser.user_id)));

        await apiService.deleteTxOnId(fetchTx[0]);

        const tx = fetchTx.find((t) => t.user_account_id === avanzaObject.user_account_id && t.user_id === avanzaObject.user_id);
        expect(tx).to.have.keys([
            'tx_id',
            'user_id',
            'stock_id',
            'user_account_id',
            'account',
            'tx_date',
            'tx_type',
            'isin',
            'description',
            'qty',
            'price',
            'amount',
            'commission',
            'currency',
            'exchange_rate'
        ]);
        expect(tx.user_id).to.be.equal(avanzaObject.user_id);
        expect(tx.user_account_id).to.be.equal(avanzaObject.user_account_id);
        expect(tx.account).to.be.equal(avanzaObject.account);
        expect(tx.tx_date).to.be.equal(avanzaObject.tx_date);
        expect(tx.tx_type).to.be.equal(avanzaObject.tx_type);
        expect(tx.isin).to.be.equal(avanzaObject.isin);
        expect(tx.description).to.be.equal(avanzaObject.description);
        expect(tx.qty).to.be.equal(avanzaObject.qty);
        expect(tx.price).to.be.equal(avanzaObject.price);
        expect(tx.amount).to.be.equal(avanzaObject.amount);
        expect(tx.commission).to.be.equal(avanzaObject.commission);
        expect(tx.currency).to.be.equal(avanzaObject.currency);
        expect(tx.exchange_rate).to.be.equal(avanzaObject.exchange_rate);
    });

    it('fetchTx', async() => {
        const avanzaObject = {
            account: "7516434",
            amount: -3500,
            commission: 19,
            currency: "EUR",
            description: "Nokia Corporation",
            exchange_rate: 3.5,
            isin: "FI0009000681",
            price: 3.5,
            qty: 1000,
            ticker: "NOKIA",
            tx_date: "2020-01-01",
            tx_type: "BUY",
            user_account_id: "353-7",
            user_id: testUser.user_id
        };

        await apiService.insertOneTx(avanzaObject);

        const fetchTx = JSON.parse(JSON.stringify(await apiService.fetchTx(testUser.user_id)));

        await apiService.deleteTxOnId(fetchTx[0]);

        const tx = fetchTx.find((t) => t.user_account_id === avanzaObject.user_account_id && t.user_id === avanzaObject.user_id);

        expect(tx).to.be.an('object');
        expect(tx.user_id).to.be.equal(avanzaObject.user_id);
        expect(tx.user_account_id).to.be.equal(avanzaObject.user_account_id);
        expect(tx.tx_date).to.be.equal(avanzaObject.tx_date);
        expect(tx.tx_type).to.be.equal(avanzaObject.tx_type);
        expect(tx.isin).to.be.equal(avanzaObject.isin);
        expect(tx.description).to.be.equal(avanzaObject.description);
        expect(tx.qty).to.be.equal(avanzaObject.qty);
        expect(tx.price).to.be.equal(avanzaObject.price);
        expect(tx.amount).to.be.equal(avanzaObject.amount);
        expect(tx.commission).to.be.equal(avanzaObject.commission);
        expect(tx.currency).to.be.equal(avanzaObject.currency);
        expect(tx.exchange_rate).to.be.equal(avanzaObject.exchange_rate);
    });

    it.skip('updateTxOnId', async() => {
        const avanzaObject = {
            user_id: testUser.user_id,
            stock_id: 1294,
            account: "7516434",
            amount: -3500,
            commission: 19,
            currency: "EUR",
            description: "Nokia Corporation",
            exchange_rate: 3.5,
            isin: "FI0009000681",
            price: 3.5,
            qty: 1000,
            ticker: "NOKIA",
            tx_date: "2020-01-01",
            tx_type: "BUY"
        };

        await apiService.insertOneTx(avanzaObject);

        const fetchTxBeforeUpdate = await apiService.fetchTx(testUser.user_id);

        console.log(fetchTxBeforeUpdate);

        const editAvanzaObject = {
            tx_id: fetchTxBeforeUpdate[0].tx_id,
            user_id: testUser.user_id,
            stock_id: 1294,
            account: "1234567",
            tx_date: "2021-03-16",
            tx_type: "SELL",
            isin: "FI0009000999",
            description: "Nokia Corporation Two",
            qty: 2500,
            price: 5.2,
            amount: -7800,
            commission: 23,
            currency: "SEK",
            exchange_rate: 5.2
        };

        //does not work the update
        await apiService.updateTxOnId(editAvanzaObject);

        const fetchTxAfterUpdate = await apiService.fetchTx(testUser.user_id);

        await apiService.deleteTxOnId(fetchTxBeforeUpdate[0]);

        // Before update
        expect(fetchTxBeforeUpdate).to.be.an('array');

        const txBeforeUpdate = fetchTxBeforeUpdate[0];
        expect(txBeforeUpdate).to.be.an('object');
        expect(txBeforeUpdate).to.have.keys([
            'tx_id',
            'user_id',
            'stock_id',
            'account',
            'tx_date',
            'tx_type',
            'isin',
            'description',
            'qty',
            'price',
            'amount',
            'commission',
            'currency',
            'exchange_rate'
        ]);
        expect(txBeforeUpdate.user_id).to.be.equal(avanzaObject.user_id);
        expect(txBeforeUpdate.account).to.be.equal(avanzaObject.account);
        expect(txBeforeUpdate.tx_date).to.be.equal(avanzaObject.tx_date);
        expect(txBeforeUpdate.tx_type).to.be.equal(avanzaObject.tx_type);
        expect(txBeforeUpdate.isin).to.be.equal(avanzaObject.isin);
        expect(txBeforeUpdate.description).to.be.equal(avanzaObject.description);
        expect(txBeforeUpdate.qty).to.be.equal(avanzaObject.qty);
        expect(txBeforeUpdate.price).to.be.equal(avanzaObject.price);
        expect(txBeforeUpdate.amount).to.be.equal(avanzaObject.amount);
        expect(txBeforeUpdate.commission).to.be.equal(avanzaObject.commission);
        expect(txBeforeUpdate.currency).to.be.equal(avanzaObject.currency);
        expect(txBeforeUpdate.exchange_rate).to.be.equal(avanzaObject.exchange_rate);

        // After update
        const txAfterUpdate = fetchTxAfterUpdate[0];
        expect(txAfterUpdate).to.be.an('object');
        expect(txAfterUpdate).to.have.keys([
            'tx_id',
            'user_id',
            'stock_id',
            'account',
            'tx_date',
            'tx_type',
            'isin',
            'description',
            'qty',
            'price',
            'amount',
            'commission',
            'currency',
            'exchange_rate'
        ]);
        expect(txAfterUpdate.user_id).to.be.equal(editAvanzaObject.user_id);
        expect(txAfterUpdate.account).to.be.equal(editAvanzaObject.account);
        expect(txAfterUpdate.tx_date).to.be.equal(editAvanzaObject.tx_date);
        expect(txAfterUpdate.tx_type).to.be.equal(editAvanzaObject.tx_type);
        expect(txAfterUpdate.isin).to.be.equal(editAvanzaObject.isin);
        expect(txAfterUpdate.description).to.be.equal(editAvanzaObject.description);
        expect(txAfterUpdate.qty).to.be.equal(editAvanzaObject.qty);
        expect(txAfterUpdate.price).to.be.equal(editAvanzaObject.price);
        expect(txAfterUpdate.amount).to.be.equal(editAvanzaObject.amount);
        expect(txAfterUpdate.commission).to.be.equal(editAvanzaObject.commission);
        expect(txAfterUpdate.currency).to.be.equal(editAvanzaObject.currency);
        expect(txAfterUpdate.exchange_rate).to.be.equal(editAvanzaObject.exchange_rate);
    });

    it('deleteTxOnId', async() => {
        const avanzaObject = {
            account: "7516434",
            amount: -3500,
            commission: 19,
            currency: "EUR",
            description: "Nokia Corporation",
            exchange_rate: 3.5,
            isin: "FI0009000681",
            price: 3.5,
            qty: 1000,
            ticker: "NOKIA",
            tx_date: "2020-01-01",
            tx_type: "BUY",
            user_account_id: "353-7",
            user_id: testUser.user_id
        };

        await apiService.insertOneTx(avanzaObject);

        const fetchTxBeforeDelete = JSON.parse(JSON.stringify(await apiService.fetchTx(testUser.user_id)));

        await apiService.deleteTxOnId(fetchTxBeforeDelete.find((t) => t.user_account_id === avanzaObject.user_account_id && t.user_id === avanzaObject.user_id));

        const fetchTxAfterDelete = JSON.parse(JSON.stringify(await apiService.fetchTx(testUser.user_id)));

        // Before delete
        const txBeforeDelete = fetchTxBeforeDelete.find((t) => t.user_account_id === avanzaObject.user_account_id && t.user_id === avanzaObject.user_id);

        expect(txBeforeDelete.user_id).to.be.equal(avanzaObject.user_id);
        expect(txBeforeDelete.user_account_id).to.be.equal(avanzaObject.user_account_id);
        expect(txBeforeDelete.tx_date).to.be.equal(avanzaObject.tx_date);
        expect(txBeforeDelete.tx_type).to.be.equal(avanzaObject.tx_type);
        expect(txBeforeDelete.isin).to.be.equal(avanzaObject.isin);
        expect(txBeforeDelete.description).to.be.equal(avanzaObject.description);
        expect(txBeforeDelete.qty).to.be.equal(avanzaObject.qty);
        expect(txBeforeDelete.price).to.be.equal(avanzaObject.price);
        expect(txBeforeDelete.amount).to.be.equal(avanzaObject.amount);
        expect(txBeforeDelete.commission).to.be.equal(avanzaObject.commission);
        expect(txBeforeDelete.currency).to.be.equal(avanzaObject.currency);
        expect(txBeforeDelete.exchange_rate).to.be.equal(avanzaObject.exchange_rate);

        // After delete
        expect(fetchTxBeforeDelete.length).to.be.greaterThan(fetchTxAfterDelete.length);
    });

    // *************************
    // Can't do test on function 'fetchUserSettingsWLConf' because
    // there need to be a delete function for table user_settings
    // to be able to clean up after test is done.
    // it('fetchUserSettingsWLConf', async () => {
    //     const fetchUserSettingsWLConf = JSON.parse(JSON.stringify(await apiService.fetchUserSettingsWLConf(testUser.user_id)));

    //     console.log(fetchUserSettingsWLConf);
    // });
    // *************************

    // *************************
    // Can't do test on function 'saveSettings' because
    // there need to be a delete function for table user_settings
    // to be able to clean up after test is done.
    // *************************

    // **************************************
});
