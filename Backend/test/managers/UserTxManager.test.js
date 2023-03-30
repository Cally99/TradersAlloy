const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const userTxManager = require('./../../server/managers/UserTxManager');

// Need to add either test user or only use mocked data
describe.skip('UserTxManager . save_json_UserTx', () => {
    it('save_json_UserTx', async () => {
        const userTxsMock = [
            {  user_id: 98, account: '', tx_date: '2021-04-09', tx_type: 'BUY', isin: 'SE0001966656', description: '',  qty:  20, price: 231,amount: -3450, commission: 12, currency: 'SEK', exchange_rate: 231, stock_id: 42953},
            {  user_id: 98, account: '', tx_date: '2021-05-11', tx_type: 'SELL',isin: 'SE0001966656', description: '',  qty: -10, price: 265,amount:  5200, commission: 14, currency: 'SEK', exchange_rate: 265, stock_id: 42953}
        ];

        const userTradesMock = [
            {user_id: 98,stock_id: 42953,ticker: 'FNOX',instrument_type: 'test',entry_price: 231,entry_date: '2021-04-09',entry_qty: 10,exit_price: 265,exit_date: '2021-05-11',exit_qty: 10,commission: 14,pnl: 0,notes: ''},
            {user_id: 98,stock_id: 42953,ticker: 'FNOX',instrument_type: 'test',entry_price: 231,entry_date: '2021-04-09',entry_qty: 10,exit_price: null,exit_date: null,exit_qty: null,commission: 12,pnl: 0,notes: ''}
        ];

        const result = await userTxManager.save_json_UserTx(userTxsMock, userTradesMock);

        console.log(result);
    });
});

describe('UserTxManager . insertOneTx', () => {
    it('should create one (half) (BUY) User Trade', async () => {
        const userTx =  {  user_id: 532, user_account_id: '532-3', tx_date: '2022-01-01', tx_type: 'BUY', stock_id: 42953, ticker: 'ABB', isin: 'SE0001966656', qty:  10, price: 10,amount: 10, commission: 1, currency: 'SEK', exchange_rate: 1};

        const result = await userTxManager.insertOneTx(userTx);

        //console.log(result);
    });
    it('should balance previous BUY User Trades ', async () => {
        const userTx =  {  user_id: 532, user_account_id: '532-3', tx_date: '2022-01-01', tx_type: 'SELL', stock_id: 42953, ticker: 'ABB', isin: 'SE0001966656', qty:  4, price: 12,amount: 10, commission: 1, currency: 'SEK', exchange_rate: 1};

        const result = await userTxManager.insertOneTx(userTx);

        //console.log(result);
    });
});
