require('dotenv').config()
const userManager = require('./server/managers/UserManager.js');
const userTxManager = require('./server/managers/UserTxManager.js');
const userAccountManager = require('./server/managers/UserAccountManager.js');

let users = [];

async function get_initial() {
    users = [];
    users = await userManager.list();
    for (let i = 0; i < users.length; i++) {
        await addPaperAccount(users[i].dataValues)
    }
    console.log('$$$$$$$$ DONE $$$$$$$');
}

get_initial()

async function addPaperAccount(user) {
    console.log('------- user ID ----------', user.user_id);
    const user_account_id = user.user_id + '-0';
    let data = {
        user_id: user.user_id,
        user_account_id: user_account_id,
        account_name: 'Example Paper Account',
        account_type: 'paper',
        balance: 100000,
        scale: 0,
        currency: 'SEK',
        hide: false,
        broker: null,
        order_preference: 0,
        nominal_position_size: 10000,
        secret_key: null,
        last_import_date: new Date().toISOString().slice(0, 10)
    }
    const userAccount = await userAccountManager.createUserAccount(data);
    await addDefaultTransactions(userAccount.dataValues);
}

async function addDefaultTransactions(userAccount) {
    let userTxs = [{
            user_id: parseInt(userAccount.user_id),
            account: '',
            stock_id: 772,
            user_account_id: userAccount.user_account_id,
            tx_date: '2021-11-04',
            tx_type: 'BUY',
            isin: 'SE0000108656',
            description: '',
            qty: 2,
            price: 93,
            amount: -186,
            commission: 0,
            currency: 'SEK',
            exchange_rate: 93,
        },
        {
            user_id: parseInt(userAccount.user_id),
            account: '',
            stock_id: 2524980,
            user_account_id: userAccount.user_account_id,
            tx_date: '2021-11-04',
            tx_type: 'BUY',
            isin: 'SE0007280482',
            description: '',
            qty: 100,
            price: 0.5,
            amount: -50,
            commission: 0,
            currency: 'SEK',
            exchange_rate: 0.5,
        },
        {
            user_id: parseInt(userAccount.user_id),
            account: '',
            stock_id: 1983,
            user_account_id: userAccount.user_account_id,
            tx_date: '2021-11-09',
            tx_type: 'BUY',
            isin: 'DK0010274414',
            description: '',
            qty: 10,
            price: 11,
            amount: -110,
            commission: 0,
            currency: 'SEK',
            exchange_rate: 11,
        }
    ];
    for (let j = 0; j < userTxs.length; j++) {
        await userTxManager.insertOneTx(userTxs[j]);
    }
}