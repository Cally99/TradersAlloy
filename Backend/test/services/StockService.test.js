const chai = require('chai');
const expect = chai.expect;
// const chaiHttp = require('chai-http');
// const expect = chai.expect;
// const axios = require('axios');
const sinon = require('sinon');

const stockService = require('./../../server/services/StockService');
const stockManager = require('./../../server/managers/StockManager');

describe('StockService', () => {
    it.skip('Just get a price that exists', async () => {
        //TODO: Don't get any value here. Neet to
        //make sure we get a value to assert here
        const price = await stockService.getHistoricPrice(108, '2021-07-08'); // Saturday ? but that is from the Calendar
        expect(price).to.equal(399.8);
    });

    it('Ask for Saturday price; get Monday`s price', async () => {
        const price = await stockService.getHistoricPrice(196594, '2019-01-16'); // Saturday ? but that is from the Calendar
        expect(price).to.equal(1.75);
    });

    it('Bankrupt company : no prices : check 6 months back', async () => {
        const price = await stockService.getHistoricPrice(33067, '2020-10-14');
        expect(price).to.equal(null);
    });
});

describe('StockService.list', () => {
    it('simple case', async () => {
        // console.log('Gick in?');  /// TODO... move to /mocks
        const mockedStocksResponse = [{
            stock_id: 733968,
            stock_exchange_id: '35181',
            isin: 'SE0005504347',
            ticker: 'DELARK',
            company_id: 42447,
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
            company_id: 68355,
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
            company_id: 68398,
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
            company_id: 33135,
            name: 'Saxlund Group',
            sector_id: 68193,
            currency_trade: 'SEK',
            price_today: 0.435
        }];

        const stub = sinon.stub(stockManager, 'list');
        stub.returns(mockedStocksResponse);

        const stocks = JSON.parse(JSON.stringify(await stockService.list()));

        expect(stub.calledOnce).to.be.true;

        expect(stocks).to.be.an('array');
        expect(stocks).to.have.length(4);

        stocks.forEach((stock) => {
            expect(stock).to.be.an('object');
            expect(stock).to.have.keys(
                [
                    'stock_id',
                    'stock_exchange_id',
                    'company_id',
                    'isin',
                    'ticker',
                    'name',
                    'sector_id',
                    'currency_trade',
                    'price_today'
                ]
            );
        });

        expect(stocks).to.deep.equal([{
            stock_id: 733968,
            stock_exchange_id: '35181',
            isin: 'SE0005504347',
            ticker: 'DELARK',
            company_id: 42447,
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
            company_id: 68355,
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
            company_id: 68398,
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
            company_id: 33135,
            name: 'Saxlund Group',
            sector_id: 68193,
            currency_trade: 'SEK',
            price_today: 0.435
        }]);
    });
});
