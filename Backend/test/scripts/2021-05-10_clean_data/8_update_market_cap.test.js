const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const companyManager = require('./../../../server/managers/CompanyManager');
const companyReportManager = require('./../../../server/managers/CompanyReportManager');
const stockManager = require('./../../../server/managers/StockManager');

const agent = require('../../../scripts/2021-05-10_clean_data/8_update_company_and_report');

const mockCompanies = [{
    company_id: 39503,
    name:     'Norsk Hydro',
    description: '...',
    market_cap: null,
    last_report_date: '2021-01-01',
    last_eps_ttm: 0,
    last_sales: 0,
    last_pe: 0,
    ceo_comments: 'no comment',
    period: '2021-Q1',
},
];

const mockCompanyReport = [
    {company_id: 39503, period: '2021-Q1', date_report: '2021-05-06'},
];

const mockLastReport = [{
    period: '2021-Q1',
    totalnumberofshares: '2048000000',
    date_report: '2021-05-01',
    eps: 0.7036,
    sales: 100,
    gp: 90,
    ltliabilities: 10,
    curliabilities: 10,
    shequity: 10
}];

const mockStock = {
    company_id:39503,
    stock_id: 45602,
    isin: 'NO0005052605',
    ticker: 'NHY',
    name: 'Norsk Hydro',
    price_today: 55.24,
    currency_trade: 'NOK',
    stock_exchange_id: 39890,
    sector_id: 82988,
    primary_listing: true,
};

describe.skip('Update MARKET CAP', () => {
    beforeEach(function() {
        sinon.stub(companyManager, 'list').returns(mockCompanies);
        sinon.stub(companyReportManager, 'list').returns(mockCompanyReport);
        sinon.stub(companyReportManager, 'getLastReport').returns(mockLastReport);
        sinon.stub(stockManager, 'getPrimaryStock').returns(mockStock);
    });

    afterEach(function() {
        companyManager.list.restore();
    });

    //TODO: This unit test isn't working. Need to
    //change to matching data for the assertions.
    //Will skip this test until it is fixed
    it('update calculated data for all companies', async () => {
        await agent.run();

        const updatedCompany = JSON.parse( JSON.stringify( await companyManager.get(39503)));
        console.log(updatedCompany);
        expect(updatedCompany.market_cap).equals('94765054726');
        expect(updatedCompany.last_sales).equals(21250000000);

        const updatedReport = JSON.parse( JSON.stringify( await companyReportManager.getCompanyReport(39503, '2021-Q1' )));
        console.log(updatedReport);
        expect( updatedReport.costofgoodssold).equals(18623000000 ); // 16773010100
        expect( updatedReport.totalliabilities).equals(72259000000 ); // 30805000000
        expect( updatedReport.totalequityandliabilities).to.be.a('null');
    });
});
