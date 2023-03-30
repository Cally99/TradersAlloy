const chai = require('chai');
const expect = chai.expect;

const companyService = require('./../../server/services/CompanyService');

describe('CompanyService', () => {
    it('list', async () => {
        const listAllCompanies = JSON.parse(JSON.stringify(await companyService.list()));

        expect(listAllCompanies).to.be.an('array');
        for(const company of listAllCompanies) {
            expect(company).to.be.an('object');
            expect(company).to.have.keys([
                'company_id',
                'name',
                'description',
                'insider_trade_isins',
                'market_cap',
                'last_report_date',
                'last_eps_ttm',
                'last_sales',
                'last_pe',
                'ceo_comments',
                'last_np',
                'next_report_date',
                'status_flag'
            ]);
        }
    });

    it('asyncget', async () => {
        const companyOnIsin = JSON.parse(JSON.stringify(await companyService.asyncget(32404)));

        expect(companyOnIsin).to.be.an('object');
        expect(companyOnIsin).to.have.keys([
            'company_id',
            'name',
            'description',
            'insider_trade_isins',
            'market_cap',
            'last_report_date',
            'last_eps_ttm',
            'last_sales',
            'last_pe',
            'ceo_comments',
            'last_np',
            'next_report_date',
            'status_flag'
        ]);
    });
});
