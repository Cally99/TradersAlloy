const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const companyManager = require('../../server/managers/CompanyManager');
const companyManagerMock = require('../mocks/CompanyManager.mock');

describe('CompanyManager.setStatusFlag', () => {
    it('simple case', async () => {
        const nRowsUpdated = await companyManager.setStatusFlag(33233, 'testing');
        const company = await companyManager.asyncget(33233);

        expect(nRowsUpdated).to.equal(1);
        expect(company.status_flag).to.equal('testing');
    });
});

describe('CompanyManager.getCompaniesAndReports', () => {
    it.skip('simple case', async () => {
        const allCompanies = JSON.parse(JSON.stringify(await companyManager.getCompaniesAndReports()));

        expect(allCompanies).to.be.an('array');
        // expect(allCompanies[0]).to.be.an /// TODO
        // expect(allCompanies[0].CompanyReports[0]).to.have.keys([
        //     'pdf_link',
        // ]);
    });
});

describe('CompanyManager', () => {
    it('list', async () => {
        const allCompanies = JSON.parse(JSON.stringify(await companyManager.list()));

        expect(allCompanies).to.be.an('array');
        expect(allCompanies[0]).to.be.an('object');
        expect(allCompanies[0]).to.have.keys([
            'company_id',
            'ceo_comments',
            'description',
            'market_cap',
            'last_report_date',
            'last_pe',
            'last_eps_ttm',
            'last_np',
            'last_sales',
            'name',
            'next_report_date',
            'status_flag',
            'insider_trade_isins'
        ]);

    });

    it('asyncget', async () => {
        const company = JSON.parse(JSON.stringify(await companyManager.asyncget(32875))); // Avanza

        expect(company).to.be.an('object');
        expect(company).to.have.keys([
            'company_id',
            'name',
            'description',
            'market_cap',
            'ceo_comments',
            'last_eps_ttm',
            'last_np',
            'last_pe',
            'last_report_date',
            'last_sales',
            'next_report_date',
            'status_flag',
            'insider_trade_isins'
        ]);
    });

    it.skip('CompanyManager.getCompaniesAndReports', async () => {
        const companyAndReports = JSON.parse(JSON.stringify(await companyManager.getCompaniesAndReports()));

        const firstCompany = companyAndReports[0];
        expect(firstCompany).to.be.an('object');
        expect(firstCompany).to.have.keys([
            'CompanyReports',
            'ceo_comments',
            'company_id',
            'description',
            'last_np',
            'market_cap',
            'last_report_date',
            'last_eps_ttm',
            'last_pe',
            'last_sales',
            'name',
            'next_report_date',
            'status_flag',
            'CompanyCalendars'
        ]);
        expect(companyAndReports.length).to.be.greaterThan(1000);

        expect(firstCompany.CompanyReports[0]).to.be.an('object');
        expect(firstCompany.CompanyReports[0]).to.have.keys([
            'company_id',
            'period',
            'pdf_link',
        ]);
    });

    it('updateCompanyWithLatestReport', async () => {
        await companyManager.updateCompanyWithLatestReport(32875, '2020-07-15', 9.99, 9999, '9.9', '9');

        const company = JSON.parse(JSON.stringify(await companyManager.asyncget(32875)));

        expect(company.company_id).to.be.equal(32875);
        expect(company.last_report_date).to.be.equal('2020-07-15');
        expect(company.last_eps_ttm).to.not.be.null;
        expect(company.last_sales).to.not.be.null;
        expect(company.market_cap).to.not.be.null;
    });

});


