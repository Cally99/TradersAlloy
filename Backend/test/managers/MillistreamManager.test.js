const chai = require('chai');
const expect = chai.expect;
const moment = require('moment');
const millistreamManager = require('../../server/managers/MillistreamManager');

describe('getNewsByCompany', () => {
    it('simple test', async () => {
        const isins = ['SE0000108656'];
        const newsItems = (await millistreamManager.getNewsByCompany(isins)).data;

        expect(newsItems).to.be.an('array');
    });
});

describe.skip('MillistreamManager (load data)', () => {
    it('getReports', async () => {
        const company_id = 4688603;
        const start_year = '2021' ;
        const end_year = '2021' ;
        const currency_trade = 'SEK';

        const reports = await millistreamManager.getReports(company_id, currency_trade,start_year,end_year  );

        expect(reports[0].period).to.equal('2021-Q1');
        expect(reports[0].eventlink).to.equal('549df208-aaff-454a-857e-2e6c580c4002');
        expect(reports[0].sales).to.equal(9299000);
    });
});

describe('getHistoricPrice', () => {
    //    [{"date":"2021-05-28","closeprice":420.8,"closequantity":76648,"closeturnover":31890864.4,"closedayhighprice":421,"closedaylowprice":409.4,"openprice":410.2}]
    it(' get  a single close price ', async () => {
        const priceArrayOf1 = await millistreamManager.getHistoricPrice(42953, '2021-05-28');
        expect(priceArrayOf1).to.equal(420.8);
    });

    const today = new Date().toISOString().substring(0,10);
    it('Ask for today´s price before 18:00, and get yesterdays price', async () => {
        const priceArrayOf1 = await millistreamManager.getHistoricPrice(1360, today);
        expect(priceArrayOf1).to.not.equal(null);
    });
});

describe('getAllHistoricPrices', () => {
    // go 2 days back (for LAST TIME the price was got) to fetch yesterday's price. Mondays? holidays ?
    const price_updated = moment(new Date().toISOString().substring(0,10)).subtract(2, 'day').format('YYYY-MM-DD');
    const stock = {
        stock_id: 42953,
        price_updated: price_updated,
    };

    it('Simple Case: todays price only ', async () => {
        const priceArrayOf1 = await millistreamManager.getAllHistoricPrices(stock);
        expect(priceArrayOf1.length).to.be.lessThan(3); // 1 or 2 are acceptable values depending: before or after 18:00
    });

});
