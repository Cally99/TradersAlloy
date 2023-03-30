const chai = require('chai');
const chaiSubset = require('chai-subset');
chai.use(chaiSubset);
const expect = chai.expect;
const sinon = require('sinon');

const millistreamManager = require('./../../server/managers/MillistreamManager');
const millistreamCompanyService = require('./../../server/loaders/MillistreamCompanyService');
const Company = require('./../../server/models').Company;
const Stock = require('./../../server/models').Stock;


describe ('MillistreamCompanyService . getMillistreamTotalSet', () => {
    before (async () => {
        const stubPrice = sinon.stub(millistreamManager, 'getAllStockIdsFromMillistream');
        stubPrice.returns(
            {data:[
                {insref: 1, list: '33620'},
                {insref: 2, list: '1'},
                {insref: 3, list: '33620 1'},
            ]});
    }),

    it ('should exclude all stock_id in list 33620', async() => {
        const millistreamStockIds = await millistreamCompanyService.getMillistreamTotalSet();
        // console.log(millistreamStockIds);
        expect( millistreamStockIds[0]).to.equal(2) ;
    });
});


describe ('MillistreamCompanyService . discoverNewStocksAndCompanies', () => {
    it ('simple case ...', async() => {

    const newStocks = await millistreamCompanyService.discoverNewStocksAndCompanies();
//        console.log(newStocks);
//        expect(newStocks[0].insref).to.equal( 4 );
    });
});

describe ('MillistreamCompanyService . insertStock', () => {
    before (async () => {
        const stubPrice = sinon.stub(millistreamManager, 'getPriceCloseOnly');
        stubPrice.returns(100);
    });

    after(async () => {
        await Company.destroy({ where: { company_id: 80000 } });
        await Stock.destroy({ where: { stock_id: 90001 } });
        await Stock.destroy({ where: { stock_id: 90002 } });

        sinon.reset();
    });

    it('simple case - new Company', async() => {
        const millistreamStock = {
            "company": 80000,
            "insref":90001,
            "symbol":"AAA",
            "isin":"SE0000000001",
            "name":"AAA Test Stock",
            "marketplace":35181,
            "submarket":4380220,
            "list":"35187 919325",
            "tradecurrency":"SEK"
        };


        await millistreamCompanyService.insertStock(millistreamStock);

        const stockInserted = JSON.parse( JSON.stringify( await Stock.findByPk(90001)) );
        expect(stockInserted.ticker).equals('AAA');
        expect(stockInserted.primary_listing).equals(true);
        expect(stockInserted.company_id).equals(80000);
        expect(stockInserted.stock_id).equals(90001);
        expect(stockInserted.currency_trade).equals('SEK');
    });

    it('simple case - new Stock, existing company', async() => {
        const millistreamStock = {
            "company": 32391,
            "insref": 90002,
            "symbol":"ERIC X",
            "isin":"SE0000000001",
            "name":"Ericsson New",
            "marketplace":35181,
            "submarket":4380220,
            "list":"35187 919325",
            "tradecurrency":"SEK"
        };

        await millistreamCompanyService.insertStock(millistreamStock);

        const stockInserted = JSON.parse( JSON.stringify( await Stock.findByPk(90002)) );
        expect(stockInserted.ticker).equals('ERIC X');
        expect(stockInserted.primary_listing).equals(false);
    });
});


describe.skip('MillistreamCompanyService . insertStock', () => {
    it('New Stock: New Company', () => {
        const newFromMillistream = {
            "marketplace":29929,
            "insref":45192,
            "symbol":"SOSI",
            "isin":"SE0001057910",
            "name":"Sotkamo Silver",
            "company":33206,
            "list":"29934",
            "ticktable":1086991,
            "instrumenttype":4,
            "instrumentsubtype":0,
            "issuecurrency":"SEK",
            "tradecurrency":"SEK"
        };

        millistreamCompanyService.insertStock(newFromMillistream);
    });

    it('New Stock: Existing Company', () => {
        const newFromMillistream = {
            "marketplace":29929,
            "insref":45192,
            "symbol":"SOSI",
            "isin":"SE0001057910",
            "name":"Sotkamo Silver",
            "company":33206,
            "list":"29934",
            "ticktable":1086991,
            "instrumenttype":4,
            "instrumentsubtype":0,
            "issuecurrency":"SEK",
            "tradecurrency":"SEK"
        };

        millistreamCompanyService.insertStock(newFromMillistream);

    });
});


describe ('MillistreamCompanyService . difMillistreamAndDatabase', () => {
    it ('simple case', async() => {
        const superSet = [
            {insref: 1, company_id: 1, name: 'AAA',},
            {insref: 2, company_id: 2, name: 'BBB',},
            {insref: 3, company_id: 3, name: 'CCC',},
            {insref: 4, company_id: 4, name: 'DDD',},
        ];

        const subSet = [2,3];

        const excludeThisSet = [1];

        // Should add 4 ; and not add 1
        const newSet = await millistreamCompanyService.difMillistreamAndDatabase(superSet, subSet, excludeThisSet)
        console.log(newSet);
//        expect(newSet[0].insref).to.equal( 4 );
    });
});



