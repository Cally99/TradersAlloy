module.exports = {
    getMockedUserAccounts(testUser) {
        return [
            {
                user_id: testUser.user_id,
                user_account_id: '184-1',
                account_name: 'Exampe Paper-trading',
                account_type: 'paper',
                cash: 1000,
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
                user_account_id: '511222',
                account_name: 'Avanza Investeringsp',
                account_type: 'save',
                cash: 20000,
                scale: 3,
                currency: 'SEK',
                hide: true,
                broker: 'Another broker',
                order_preference: 5678,
                nominal_position_size: 2000,
                secret_key: '454KLJJ564NB23M9',
                last_import_date: '2021-07-18'
            },
            {
                user_id: testUser.user_id,
                user_account_id: '353-7',
                account_name: 'YOLO high risk',
                account_type: 'risk',
                cash: 4500,
                scale: 2,
                currency: 'SEK',
                hide: true,
                broker: 'Someone else',
                order_preference: 8784,
                nominal_position_size: 1200,
                secret_key: '65JKH564NMB8J3L3',
                last_import_date: '2021-05-21'
            }
        ];
    }
};
