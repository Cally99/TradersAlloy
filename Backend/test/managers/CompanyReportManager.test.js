const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const test = require("sinon-test")(sinon, { useFakeTimers: false });

const Company  = require('./../../server/models/').Company;
const companyReportManager = require('./../../server/managers/companyReportManager');
const companyManager = require('./../../server/managers/CompanyManager');
const companyManagerMock = require('../mocks/CompanyManager.mock');
const CompanyReport = require('./../../server/models/').CompanyReport;
const CompanyCalendar  = require('./../../server/models/').CompanyCalendar;

describe('CompanyManager :: shouldHaveReported', () => {
    it('simple ', async () => {
        const shouldHaveReported = JSON.parse(JSON.stringify(await companyReportManager.shouldHaveReported()));
        expect(shouldHaveReported).to.be.an('array');
        expect(shouldHaveReported[0]).to.have.keys([
            'company_id',
            'name',
            'period',
            'date_report',
            'currency'
        ]);
    });
});

describe('CompanyManager :: selectAllNullPE', () => {
    it('simple ', async () => {
        const companiesWithNullPE = JSON.parse(JSON.stringify(await companyReportManager.selectAllNullPE()));

        expect(companiesWithNullPE).to.be.an('array');

    });
});

describe('companyReportManager :: selectAllNullPEByCompany', () => {
    it('simple', async () => {
        const x = await companyReportManager.selectAllNullPEByCompany(1);

        expect(x).to.be.an('array');
        //expect(x[0]).to.be.an('array');
    });
});

describe('companyReportManager :: updatePEandPSandEPS', () => {
    it('simple', async () => {
        await CompanyReport.update({
            eps_ttm: 0,
            pe: 0,
            ps: 0},
        {where: {company_id: 33233, period: '2020-Q1'}});

        const rowsUpdate = await companyReportManager.updatePEandPSandEPS({
            company_id: 33233,
            period: '2020-Q1',
            eps_ttm: 99.99 ,
            pe: 99.99,
            ps: 99.99
        });
        console.assert(rowsUpdate===1 , "Unexpected updated");

        const companyReport = await CompanyReport.findOne({where: {company_id: 33233, period: '2020-Q1'}});

        expect(companyReport.ps).to.equal(99.99);
        expect(companyReport.pe).to.equal(99.99);
        expect(companyReport.eps_ttm).to.equal(99.99);
    });
});

describe('companyReportManager', () => {
     afterEach(async () => {
        await CompanyCalendar.destroy({where: { company_id: 1}});
        await Company.destroy({where: { company_id: 1}});
    });

    beforeEach(async () => {
        sinon.restore();

        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();
        today = mm + '/' + dd + '/' + yyyy;

        await Company.create({ company_id: 1, name: "Traders Alloy AB", last_eps_ttm: null, next_report_date: null, last_sales: null, last_report_date: null, last_pe: null, market_cap: null} );
        await CompanyCalendar.create( {company_id: 1, period: '2021-Q1', date_report: today} )
        await CompanyCalendar.create( {company_id: 1, period: '2021-Q2', date_report: today} )
        await CompanyCalendar.create( {company_id: 1, period: '2021-Q3', date_report: today} )
    });

    it('getCompanyIdsMissingReports', test( async function () {

        const eventsWithoutReports = await companyReportManager.getCompanyIdsMissingReports();

        expect(eventsWithoutReports.length).to.greaterThan(2);
        expect(eventsWithoutReports[0]).to.have.keys('company_id');
    }));

    it('getCompaniesReportingNow', test( async function() {
        const stub = this.stub(companyManager, 'getCompaniesReportingNow');
        const responseCompaniesReportingMock = companyManagerMock.getCompaniesReportingNow();

        stub.returns(responseCompaniesReportingMock);

        const responseCompaniesReporting = await companyManager.getCompaniesReportingNow();

        expect(responseCompaniesReporting).to.be.an('array');
        expect(responseCompaniesReporting).to.have.length(3);
        for(const CompaniesReporting of responseCompaniesReporting) {
            expect(CompaniesReporting).to.be.an('object');
            expect(CompaniesReporting).to.have.keys(
                [
                    'company_id',
                    'type_report',
                    'date_report',
                    'period'
                ]
            );
        }
        expect(responseCompaniesReporting).to.deep.equal([
            {
                company_id:  39502  ,// Nokia
                period: '2020-Q3',
                date_report: '2021-01-21',
                type_report: 3
            },
            {
                company_id:  32875  ,// Avanza
                period: '2020-Q3',
                date_report: '2021-01-21',
                type_report: 3
            },
            {
                company_id:  32395   ,// Sandvik
                period: '2020-Q3'   ,
                date_report:  '2021-01-21' ,
                type_report: 3
            }
        ]);

        stub.restore();
    }));
});
