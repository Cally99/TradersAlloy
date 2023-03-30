const chai = require('chai');
const chaiSubset = require('chai-subset');
chai.use(chaiSubset);
const expect = chai.expect;
const sinon = require('sinon');
const companyManager = require('./../../../server/managers/CompanyManager');
const profiler = require('./../../../scripts/2021-06_screener_profiles/1_market_cap');


describe('Test distribution curve of MARKET CAP for all companies', () => {


/*    it.skip('updates', async () => {

        const mockCompanies = [
                {company_id:  1, market_cap:  9000},
                {company_id:  2, market_cap: 11000},
                {company_id:  3, market_cap: 12000},
                {company_id:  4, market_cap: 13000},
                {company_id:  5, market_cap: 21000},
                {company_id:  6, market_cap: 21000},
                {company_id:  7, market_cap: 21000},
                {company_id:  8, market_cap: 21000},
                {company_id:  9, market_cap: 31000},
                {company_id: 10, market_cap: 41000},
                {company_id: 11, market_cap: 21000},
                {company_id: 12, market_cap: 21000},
                {company_id: 13, market_cap: 21000},
                {company_id: 14, market_cap: 21000},
                {company_id: 15, market_cap: 21000},
                {company_id: 16, market_cap: 21000},
            ];


        sinon.stub(companyManager, 'list').returns(mockCompanies);


        profiler.runx();
    });


 */
});
