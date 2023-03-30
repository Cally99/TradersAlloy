const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const test = require("sinon-test")(sinon, { useFakeTimers: false });

const millistreamPriceService = require('./../../server/loaders/MillistreamPriceService');
const millistreamPriceRepairService = require('./../../server/loaders/MillistreamPriceRepairService');
const stockManager = require('./../../server/managers/StockManager');
const stockService = require('./../../server/services/StockService');

const mockStock = {
    company_id:1,
    stock_id: 45602,
    isin: 'NO0005052605',
    ticker: 'NHY',
    name: 'Norsk Hydro',
    price_today: 50.50,
    currency_trade: 'NOK',
    stock_exchange_id: 39890,
    sector_id: 82988,
    primary_listing: true
};

const stock = {
    ticker: 'TEST',
    stock_id: 1146,
    price_updated: '2022-02-19',
    price_today: 100
};

const prices = [
    {
        "date":"2020-09-06",
        "closeprice":99,
        "closequantity":100,
        "closeturnover":1000000,
        "closedayhighprice":101,
        "closedaylowprice":90,
        "openprice":91
    },
    {
        "date":"2020-09-07",
        "closeprice":109,
        "closequantity":100,
        "closeturnover":1000000,
        "closedayhighprice":110,
        "closedaylowprice":90,
        "openprice":91
    },
    {
        "date":"2020-09-08",
        "closeprice":108,
        "closequantity":100,
        "closeturnover":1000000,
        "closedayhighprice":110,
        "closedaylowprice":90,
        "openprice":91
    }
];

const oldPrices = {
    "ohlcv": [
        [
            1420156800000,
            306.1,
            309.4,
            306.1,
            308.8,
            234274
        ],
        [
            1420417000000,
            308.5,
            308.7,
            306.6,
            307.5,
            167303
        ],
        [
            1420418000000,
            308.5,
            308.7,
            306.6,
            307.5,
            167303
        ]
    ]
};

describe ('millistreamPriceService . loadAndSavePrices', () => {
    it('NEW , save to DB', async () => {
        const stock_id = 1146;
        const result = await millistreamPriceService.loadAndSavePrices(stock_id);
    });
});


describe('MillistreamPriceService . getClosePrice', () => {
    beforeEach(async () => {
        sinon.restore();
    });

    it('simple case', test(async function() {
        const list = this.stub(stockManager, 'list');

        list.returns(mockStock)

         const result = await millistreamPriceService.getClosePricesFromMillistream();
         expect(result).to.be.an("object");
         expect(result).to.have.keys([
            'stocksSelectedCount',
            'stocksUpdatedCount',
         ]);

    }));
});

// TODO:AB
describe.skip('MillistreamPriceService . updateDatabaseWithPriceToday', () => {
    it('simple case', async () => {
        const stockUpdated =  await millistreamPriceService.updateDatabaseWithPriceToday(stock.stock_id, 100.000, '2022-02-21');
        expect(stockUpdated.price_updated).to.equal('2022-02-21');
    });
});

describe('MillistreamPriceService.concatenateOldAndNewPrices', () => {
    it('simple case', async () => {
        const allPrices =  await millistreamPriceService.concatenateOldAndNewPrices(oldPrices, prices);
        expect(allPrices.ohlcv.length).to.equal(6);
    });
});

describe('MillistreamPriceService.loadAndSavePrice', () => {
    beforeEach(async () => {
        sinon.restore();
    });

    it('simple case', async () => {
        console.log('TEST...');
        const state =  await millistreamPriceService.loadAndSavePrices(stock.stock_id);
        expect(state).to.equal(1);
    });

    it.skip('DO NOT SWITCH ON: this gets ALL prices ALL stocks from millistream: not a good test', async () => {
        const prices = JSON.parse(JSON.stringify(await millistreamPriceService.getClosePricesFromMillistream()));

        console.log(prices);
        expect(prices).to.be.an('array');
        expect(prices).to.have.length(1);
        prices.forEach((price) => {
            expect(price).to.be.an('object');
            expect(price).to.have.keys([
                'date',
                'closeprice',
                'closequantity',
                'closeturnover',
                'closedayhighprice',
                'closedaylowprice',
                'openprice']);
        });

        expect(prices).containSubset([{
            date: "2021-02-25",
            closeprice: 12.8,
            closequantity: 7377,
            closeturnover: 93453.4000000,
            closedayhighprice: 12.8,
            closedaylowprice: 12.55,
            openprice: 12.6
        }]);
    });
});

describe('MillistreamPriceService.patchPricesSinceJune1', () => {
    const allPrices = {
        "ohlcv": [
            [
                1420151800000,
                9,
                9,
                9,
                9,
                9
            ],
            [
                1420156800000,
                9,
                9,
                9,
                9,
                9
            ],
            [
                1622505600000,
                1,
                1,
                1,
                1,
                1
            ],
            [
                1629999999999,
                1,
                1,
                1,
                1,
                1
            ]
        ]
    };

    const newPricesJSON = [
        {
            "date":"2021-06-01",
            "closeprice": 5,
            "closequantity":5,
            "closeturnover":5,
            "closedayhighprice":5,
            "closedaylowprice":5,
            "openprice":5
        },{
            "date":"2021-06-02",
            "closeprice": 5,
            "closequantity":5,
            "closeturnover":5,
            "closedayhighprice":5,
            "closedaylowprice":5,
            "openprice":5
        },{
            "date":"2021-06-03",
            "closeprice": 5,
            "closequantity":5,
            "closeturnover":5,
            "closedayhighprice":5,
            "closedaylowprice":5,
            "openprice":5
        }
    ];

    it('join 2 dis-similar arrays', async () => {
        const result =  await millistreamPriceRepairService.patchPricesSinceJune1(allPrices, newPricesJSON);
        expect(result.length).to.equal(5);
    });
});
