import ApiService from "@/Services/ApiService";

exports.userMock = {
    email: 'test123@test123.com',
    password: 'test1234',
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

exports.deleteUserProcedure = async (userObject) => {
    const user = (await ApiService.selectUser(userObject.email)).data;

    if (user !== 'Användaren hittades inte') {
        const researchBody = {
            user_id: user.user_id,
            stock_id: 42953
        };

        const screens = (await ApiService.getUserScreenerFilters(user.user_id)).data;
        const tradePlans = await ApiService.getTradePlans(user.user_id);
        const userWatchlists = (await ApiService.fetchWatchlists(user.user_id)).data;

        await ApiService.deleteContent(researchBody);

        for (const screen of screens) {
            const screen_id = screen.screen_id;
            await ApiService.deleteScreen(screen_id);
        }

        for (const tradePlan of tradePlans) {
            const trade_plan_id = tradePlan.trade_plan_id;
            const tradePlanIdObject = {
                trade_plan_id
            };
            await ApiService.deleteUserTradePlan(tradePlanIdObject);
        }

        for (const watchlist of userWatchlists) {
            const watchlist_id = watchlist.watchlist_id;
            await ApiService.deleteWatchlist(watchlist_id);
        }

        await ApiService.deleteUserTradesOnUserId(user.user_id);
        await ApiService.deleteAllWatchlistJoinsOnUserId(user.user_id);
        await ApiService.deleteWatchlistItemsOnUserId(user.user_id);
        await ApiService.deleteUserAccountsOnUserId(user.user_id);
        await ApiService.deleteUser(user.user_id);
    }
};

exports.localStorageAdminUser = (testUser) => {
    return {
        user_id: testUser.user_id,
        email: 'test1234@test1234.com',
        password: 'secret',
        type: 'admin',
        settings: '{"tabs":[{"i":0,"name":"Watchlist","path":"/watchlist"},{"i":1,"name":"FNOX","path":"/stocks","stock_id":42953},{"i":2,"name":"ERIC B","path":"/stocks","stock_id":772},{"i":3,"name":"SWMA","path":"/stocks","stock_id":5664}]}',
        account: '{}',
        screen: '{}',
        created_date: '2021-11-08',
        last_login_date: '2021-11-08',
        membership_year: null,
        membership_date: null,
        subscription_id: null,
        tabs: [ 3561, 5664, 42953 ],
        email_weekly: true,
        email_newsletter: true,
        customer_id: null,
        card_id: null
    };
};

exports.userTradeMockObjects = (testUser) => {
    return [
        {
            user_id: testUser.user_id,
            stock_id: 469,
            ticker: 'NOKIA',
            instrument_type: 'stock',
            entry_price: 4.9,
            entry_date: '2021-03-15',
            entry_qty: 300,
            exit_price: null,
            exit_date: null,
            exit_qty: null,
            commission: 19,
            pnl: 0,
            notes: '',
            user_account_id: '1234512345'
        },
        {
            user_id: testUser.user_id,
            stock_id: 469,
            ticker: 'NOKIA',
            instrument_type: 'stock',
            entry_price: 4.5,
            entry_date: '2021-04-20',
            entry_qty: 200,
            exit_price: null,
            exit_date: null,
            exit_qty: null,
            commission: 17,
            pnl: 0,
            notes: '',
            user_account_id: '1234512345'
        },
        {
            user_id: testUser.user_id,
            stock_id: 469,
            ticker: 'NOKIA',
            instrument_type: 'stock',
            entry_price: 4.7,
            entry_date: '2021-08-27',
            entry_qty: 500,
            exit_price: null,
            exit_date: null,
            exit_qty: null,
            commission: 21,
            pnl: 0,
            notes: '',
            user_account_id: '1234512345'
        }
    ];
};

exports.userAccountMockObjects = (testUser) => {
    return [
        {
            user_id: testUser.user_id,
            user_account_id: '184-1',
            account_name: 'Exampe Paper-trading',
            account_type: 'paper',
            balance: 1000,
            scale: 1,
            currency: 'SEK',
            hide: true,
            broker: 'Whatever',
            order_preference: 1234,
            nominal_position_size: 500,
            secret_key: '232GHK4334MNM78',
            last_import_date: '2020-09-12'
        },
        {
            user_id: testUser.user_id,
            user_account_id: '353-7',
            account_name: 'YOLO high risk',
            account_type: 'risk',
            balance: 4500,
            scale: 2,
            currency: 'SEK',
            hide: true,
            broker: 'Someone else',
            order_preference: 8784,
            nominal_position_size: 1200,
            secret_key: '65JKH564NMB8J3L3',
            last_import_date: '2021-05-21'
        },
        {
            user_id: testUser.user_id,
            user_account_id: '511222',
            account_name: 'Avanza Investeringsp',
            account_type: 'save',
            balance: 20000,
            scale: 3,
            currency: 'SEK',
            hide: true,
            broker: 'Another broker',
            order_preference: 5678,
            nominal_position_size: 2000,
            secret_key: '454KLJJ564NB23M9',
            last_import_date: '2021-07-18'
        }
    ];
};

exports.userAccountMockSeleniumObjects = (testUser) => {
    return [
        {
            user_id: testUser.user_id,
            user_account_id: '1234512345',
            account_name: 'Exampe Paper-trading',
            account_type: 'paper',
            balance: 1000,
            scale: 1,
            currency: 'SEK',
            hide: true,
            broker: 'Whatever',
            order_preference: 1234,
            nominal_position_size: 500,
            secret_key: '123J123J123J',
            last_import_date: '2021-09-12'
        }
    ];
};
