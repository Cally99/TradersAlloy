const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const stockManager = require('./../../server/managers/StockManager');
const stockManagerMock = require('../mocks/StockManager.mock');
// 5828 , 2019-12-07

describe('StockManager', () => {
    it('getHistoricPrice', async () => {
        const price = await stockManager.getHistoricPrice(42953, '2021-06-28');  // Fortnox stock
        expect(price).to.equal(401);
    });

    it('getPrimaryStock', async () => {
        const stock = await stockManager.getPrimaryStock(33233);  // Fortnox stock
        expect(stock.company_id).to.equal(33233);
        expect(stock.stock_id).to.equal(42953);
        expect(stock.currency_trade).to.equal('SEK'    );
    });

    it('list', async () => {
        const stub = sinon.stub(stockManager, 'list');
        stub.returns(stockManagerMock.list());

        const stocks = JSON.parse(JSON.stringify(await stockManager.list()));

        expect(stocks).to.be.an('array');
        expect(stocks).to.have.length(4);
        for(const stock of stocks) {
            expect(stock).to.be.an('object');
            expect(stock).to.have.keys([
                'stock_id',
                'stock_exchange_id',
                'isin',
                'ticker',
                'name',
                'sector_id',
                'currency_trade',
                'price_today'
            ]);
        }
        expect(stocks).to.deep.equal([
            {
                stock_id: 733968,
                stock_exchange_id: '35181',
                isin: 'SE0005504347',
                ticker: 'DELARK',
                name: 'Delarka Holding',
                sector_id: 68205,
                currency_trade: 'SEK',
                price_today: 63
            },
            {
                stock_id: 908443,
                stock_exchange_id: '35181',
                isin: 'SE0006143103',
                ticker: 'ITAL SDB',
                name: 'Italeaf SDB',
                sector_id: 68193,
                currency_trade: 'EUR',
                price_today: 0.09
            },
            {
                stock_id: 988551,
                stock_exchange_id: '35181',
                isin: 'SE0006504163',
                ticker: 'SAPIAB',
                name: 'Saltängen Property Invest',
                sector_id: 68205,
                currency_trade: 'SEK',
                price_today: null
            },
            {
                stock_id: 4529,
                stock_exchange_id: '35181',
                isin: 'SE0008966014',
                ticker: 'SAXG',
                name: 'Saxlund Group',
                sector_id: 68193,
                currency_trade: 'SEK',
                price_today: 0.435
            }
        ]);

        stub.restore();
    });

    it('fetch', async () => {
        const stock = JSON.parse(JSON.stringify(await stockManager.fetch(1294)));

        expect(stock).to.be.an('object');
        expect(stock).to.have.keys([
            'stock_id',
            'stock_exchange_id',
            'company_id',
            'ticker',
            'name',
            'sector_id',
            'currency_trade',
            'price_today',
            'isin',
            'price_updated',
            'primary_listing',
            'status_flag',
            'StockExchange'

        ]);
    });

    it('listByCompany', async () => {
        const stocks = JSON.parse(JSON.stringify(await stockManager.listByCompany()));

        expect(stocks).to.be.an('array');
        for(const stock of stocks) {
            expect(stock).to.be.an('object');
            expect(stock).to.have.keys([
                'stock_id',
                'stock_exchange_id',
                'company_id',
                'ticker',
                'name',
                'sector_id',
                'currency_trade',
                'price_today'
            ]);
        }
    });

    it('updatePrice', async () => {
        const today = new Date().toISOString().substring(0,10);
        const stockBeforeUpdate = JSON.parse(JSON.stringify(await stockManager.fetch(1294)));

        await stockManager.updatePrice(stockBeforeUpdate.stock_id, 123.34, today);

        const stockAfterUpdate = JSON.parse(JSON.stringify(await stockManager.fetch(1294)));

        await stockManager.updatePrice(stockBeforeUpdate.stock_id, stockBeforeUpdate.price_today, today);

        // Before update
        expect(stockBeforeUpdate).to.be.an('object');
        expect(stockBeforeUpdate).to.have.keys([
            'stock_id',
            'stock_exchange_id',
            'company_id',
            'ticker',
            'name',
            'sector_id',
            'currency_trade',
            'price_today',
            'StockExchange',
            'isin',
            'price_updated',
            'status_flag',
            'primary_listing'
        ]);
        expect(stockBeforeUpdate.price_today).to.be.not.equal(123.34);

        // After update
        expect(stockAfterUpdate).to.be.an('object');
        expect(stockAfterUpdate).to.have.keys([
            'stock_id',
            'stock_exchange_id',
            'company_id',
            'ticker',
            'name',
            'sector_id',
            'currency_trade',
            'price_today',
            'StockExchange',
            'isin',
            'price_updated',
            'primary_listing',
            'status_flag'
        ]);
        expect(stockAfterUpdate.price_today).to.be.equal(123.34);
    });
});
