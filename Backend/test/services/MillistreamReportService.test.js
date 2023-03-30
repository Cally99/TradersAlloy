const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const test = require("sinon-test")(sinon, { useFakeTimers: false });

const Company  = require('./../../server/models/').Company;
const CompanyReport  = require('./../../server/models/').CompanyReport;
const CompanyCalendar  = require('./../../server/models/').CompanyCalendar;
const Stock  = require('./../../server/models/').Stock;
const stockManager = require('./../../server/managers/StockManager');
const companyManager = require('./../../server/managers/CompanyManager');
const companyReportManager = require('./../../server/managers/CompanyReportManager');
const millistreamReportService = require('./../../server/loaders/MillistreamReportService');
const millistreamManager = require('./../../server/managers/MillistreamManager');
const millistreamManagerMock = require('./../mocks/MillistreamManager.mock');
const moment = require('moment');


const report = {
    period: "2021-Q4",
    currency: "SEK",
    totalnumberofshares: 1000,
    eps: 0.99,
    sales: 100,
    gp: 20,
    ptp: 12,
    ebitda: 17,
    ebit: 15,
    np: 10,
    intangibleasset: 60,
    fixedasset: 30,
    financialasset: 10,
    noncurrentasset: 100,
    cce: 3,
    currentassets: 15,
    totalassets: 115,
    ltliabilities: 40,
    curliabilities: 30,
    shequity: 100,
    eventlink:"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    eventlinklanguages:"sv",
    ibl: 0,

    date_report: '2021-07-29',
    type_report: 'FY',
    price: 9.99,
    company_id: 1,

    ps: null,
    pe: null,
    eps_ttm: null,
};

describe('millistreamReportService . checkNullPriceReport', () => {
    it("Simple case", async () => {
        const nullPriceReport = {
                                company_id: 33067,
                                period:'2020',
                                date_report: '2020-10-14',
                                stock_id:20236,
                                stock_name: 'RIZZO',
                                currency: 'SEK',
                            };
        const price = await millistreamReportService.checkNullPriceReport(nullPriceReport);

        // expect ... there to be no errors
        //TODO: Add assertions here
    });

    it("Not updating", async () => {
        const nullPriceReport = {
            company_id: 39649,
            period:'2019-Q1',
            date_report: '2019-05-31',
            stock_id:2727,
            stock_name: 'Atlantic Petroleum',
            currency: 'DKK',
        };
        const price = await millistreamReportService.checkNullPriceReport(nullPriceReport);

        // expect ... there to be no errors
        //TODO: Add assertions here
    });
});

describe('millistreamReportService . getTtmReports', () => {
    it("find all the reports needed to calculate the TTM", async () => {
        const allReports =  JSON.parse(JSON.stringify( await companyReportManager.fetchCompanyReports(33124) ));
        const report = {period: '2019-Q4', date_report: '2020-02-17'};

        const reports = await millistreamReportService.getTtmReports(report, allReports);

        //TODO: Add assertions here
        //expect(reports[0].period).to.equal('2021-Q2');
    });
});

describe('millistreamReportService . excludeExistingReports', () => {
    it("Simple case", async () => {
        const millistreamReports = [
            {company_id: 1, period: '2021-Q2'}, // only interested in this one
            {company_id: 1, period: '2021-Q1'},
            {company_id: 1, period: '2020'},
        ];
        const existingReports = [
            {company_id: 1, period: '2021-Q1'},
            {company_id: 1, period: '2020'},
            {company_id: 1, period: '2019'},
            {company_id: 1, period: '2018'},
        ];

        const reports = await millistreamReportService.excludeExistingReports(millistreamReports, existingReports);
        expect(reports[0].period).to.equal('2021-Q2');
    });

    it("Med Cap example - ", async () => {
        const millistreamReports = [
            {company_id: 1, period: '2019-Q4'}, // only interested in this one
            {company_id: 1, period: '2019-Q3'},
            {company_id: 1, period: '2019-Q2'},
            {company_id: 1, period: '2019-Q1'},
            {company_id: 1, period: '2019'},
        ];
        const existingReports = [
            {company_id: 1, period: '2020-Q4'},
            {company_id: 1, period: '2020-Q3'},
            {company_id: 1, period: '2020-Q2'},
            {company_id: 1, period: '2020-Q1'},
            {company_id: 1, period: '2020'},

            // missing 2019-Q4
            {company_id: 1, period: '2019-Q3'},
            {company_id: 1, period: '2019-Q2'},
            {company_id: 1, period: '2019-Q1'},
            {company_id: 1, period: '2019'},

            {company_id: 1, period: '2018-Q4'},
            {company_id: 1, period: '2018-Q3'},
            {company_id: 1, period: '2018-Q2'},
            {company_id: 1, period: '2018-Q1'},
            {company_id: 1, period: '2018'},
        ];

        const reports = await millistreamReportService.excludeExistingReports(millistreamReports, existingReports);
        expect(reports[0].period).to.equal('2019-Q4');
    });
});

describe('millistreamReportService . getMarketCapEurM', () => {
    it(' Simple case ', async () => {
        const priceEUR = await millistreamReportService.getMarketCapEurM( {totalnumberofshares: 1000000, price: 10, currency: 'SEK'} );
        expect(priceEUR).to.equal(1);
    });
});


describe('millistreamService . insertNewCompanyReport', () => {
    let report_in_the_future = report;
    report_in_the_future.period = "2121";

    afterEach(async () => {
        await CompanyReport.destroy({where: { company_id: report_in_the_future.company_id, period: report_in_the_future.period }})
        sinon.reset();
    });

    it("Simple Insert ", async () => {

        const lookingFor = {company_id: 33233,
            period: '2021-Q4',
            date_report: '2022-02-16',
            name: 'TEST COMPANY',
            currency_trade: 'SEK',
            price_today: 10,
        };

        const newReport = await millistreamReportService.insertNewCompanyReport(lookingFor, report);

        expect(newReport.costofgoodssold).to.be.equal(80);
        expect(newReport.eps).to.be.equal(0.99);  // Check the rounding of eps
    });
});

describe('millistreamService . updateCalculatedDataToCompanyReport', () => {
    afterEach(async () => {
        await CompanyReport.destroy({where: { company_id: 1}});
        await CompanyCalendar.destroy({where: { company_id: 1}});
        await Company.destroy({where: { company_id: 1}});
    });

    beforeEach(async () => {
        sinon.restore();
        await Company.create({ company_id: 1, name: "COMPANY ONE", last_eps_ttm: null, next_report_date: null, last_sales: 200, last_report_date: '2021-08-19', last_pe: 79, market_cap: '11004179104'} );
        await CompanyReport.create({ company_id: 1, period: '2020-Q2', type_report:  'Q', date_report: '2020-07-01', eps_ttm:4,    pe: 10,   ps: 11,   eps: 1, sales: 100, totalnumberofshares: 1000, price: 2.00, currency: 'NOK', gp: 1.0 });
        await CompanyReport.create({ company_id: 1, period: '2020-Q3', type_report:  'Q', date_report: '2020-10-01', eps_ttm:4,    pe: 10,   ps: 11,   eps: 1, sales: 100, totalnumberofshares: 1000, price: 2.00, currency: 'NOK', gp: 1.0 });
        await CompanyReport.create({ company_id: 1, period: '2020-Q4', type_report:  'Q', date_report: '2021-01-29', eps_ttm:4,    pe: 10,   ps: 11,   eps: 1, sales: 100, totalnumberofshares: 1000, price: 2.00, currency: 'NOK', gp: 1.0 });
        await CompanyReport.create({ company_id: 1, period: '2020',    type_report:  'Y', date_report: '2021-01-29', eps_ttm:4,    pe: 10,   ps: 11,   eps: 4, sales: 100, totalnumberofshares: 1000, price: 2.00, currency: 'NOK', gp: 1.0 });
        await CompanyReport.create({ company_id: 1, period: '2021-Q1', type_report:  'Q', date_report: '2021-04-01', eps_ttm:4,    pe: 10,   ps: 11,   eps: 1, sales: 100, totalnumberofshares: 1000, price: 2.00, currency: 'NOK', gp: 1.0 });
        await CompanyReport.create({ company_id: 1, period: '2021-Q2', type_report:  'Q', date_report: '2021-07-01', eps_ttm:4,    pe: 10,   ps: 11,   eps: 1, sales: 100, totalnumberofshares: 1000, price: 2.00, currency: 'NOK', gp: 1.0 });
        await CompanyReport.create({ company_id: 1, period: '2021-Q3', type_report:  'Q', date_report: '2021-10-01', eps_ttm:4,    pe: 10,   ps: 11,   eps: 1, sales: 100, totalnumberofshares: 1000, price: 2.00, currency: 'NOK', gp: 1.0 });
        await CompanyReport.create({ company_id: 1, period: '2021-Q4', type_report:  'Q', date_report: '2022-01-29', eps_ttm:null, pe: null, ps: null, eps: 1, sales: 500, totalnumberofshares: 1000, price: 2.00, currency: 'NOK', gp: 1.0 });
//        await CompanyReport.create({ company_id: 1, period: '2021',    eps_ttm:null, pe: null, ps: null, eps: 1, type_report:  'Y', currency: 'NOK',  price: 2.00, totalnumberofshares: 1000,  sales: 100, gp: 1.0, ltliabilities: 1.0,curliabilities: 1.0, shequity: 1.0, pdf_link: 'ee3d887f-60f2-465c-b235-5b1b534c3123'});
        await CompanyCalendar.create(    {company_id: 1, period: '2021',    date_report: "2021-12-01"} );
    });

    it("Simple Case - calculate 2021-Q4 data to add", test(async function() {
        const report = {
            company_id: 1,
            period: "2021-Q4",
            type_report: 'Q',
            date_report: '2022-01-29',
            eps: 1,
            sales: 100,
            price: 85,
            totalnumberofshares: 1000,
            ps: null,
            pe: null,
            eps_ttm: null,
        };

        const existingReports = JSON.parse(JSON.stringify(await companyReportManager.fetchCompanyReports(1)));
        //console.log(existingReports);
        const updatedRowsCR = await millistreamReportService.updateCalculatedDataToCompanyReport(report, existingReports);

        expect(updatedRowsCR).to.be.equal(1)
    }));
});

describe('millistreamService . fetchAndLoadReports', () => {

    beforeEach(async () => {
        await CompanyReport.destroy({where: { company_id: 33233, period: '2021-Q3',}});
    });

    it("Simple Case : default period of 'all time' /and test hooks)", async () => {

        const MillistreamReportsMock = sinon.stub(millistreamManager, 'getReports');
        MillistreamReportsMock.returns(millistreamManagerMock.getMillistreamReports());

        const reportDataStruct = {company_id: 33233,
            period: '2021-Q3',
            date_report: '2022-02-16',
            name: 'TEST COMPANY',
            currency_trade: 'SEK',
            price_today: 10,
        };

        const insertedPeriods = await millistreamReportService.fetchAndLoadReports(reportDataStruct);
        expect(insertedPeriods).to.be.an('object');
        });

});

describe('CompanyReportService :: priceToEURs', () => {
    it('Simple case', async () => {
        const priceEUR = await millistreamReportService.priceToEUR( 'EUR', 10 );
        expect(priceEUR).to.equal(10.00);
    });

    it('Simple case with decimal', async () => {
        const priceEUR = await millistreamReportService.priceToEUR( 'EUR', 10.01 );
        expect(priceEUR).to.equal(10.01);
    });

    it('SEK', async () => {
        const priceEUR = await millistreamReportService.priceToEUR( 'SEK', 10 );
        expect(priceEUR).to.equal(0.9871668311944718);
    });
});

describe.skip('millistreamService.fetchAndLoadReports', () => {
    it("reports.find is not a function", async () => {
        const insertedPeriods = await millistreamReportService.fetchAndLoadReports(39946);
        expect(insertedPeriods).to.be.an('array');

        //TODO: Remove console.log here before deploying to TEST
        console.log(insertedPeriods);
    });
});

/**  TEST PLAN

    Inserting Q1 report
    previous year-end and quarters exit

    Mock Millistream

    Delete from the database
    execute test
    CompanyReport.findOne( 1 );
    Company.findOne( 1 );
*/
describe('MillistreamService ********* INTEGRATION TEST *********', () => {
    afterEach(async () => {
        await CompanyReport.destroy({where: { company_id: 1}})
        await CompanyCalendar.destroy({where: { company_id: 1}});
        await Company.destroy({where: { company_id: 1}});
        await Stock.destroy({where: { company_id: 1}});
    });

    beforeEach(async () => {
        sinon.restore();
        await Company.create({ company_id: 1, name: "COMPANY ONE", last_eps_ttm: null, next_report_date: null, last_sales: null, last_report_date: null, last_pe: null, market_cap: null} );

        await CompanyReport.create({ company_id: 1, period: '2021-Q1', eps: 0.1, type_report:  'Q', currency: 'SEK',  price: 2.00, totalnumberofshares: 1.000,  sales: 1.00, gp: 1.0, ltliabilities: 1.0,curliabilities: 1.0, shequity: 1.0, pe: 1.0, ps: 1.0, });
        await CompanyReport.create({ company_id: 1, period: '2020-Q2', eps: 0.4, type_report: 'FY', currency: 'SEK',  price: 2.00, totalnumberofshares: 1000,  sales: 100, gp: 10, ltliabilities: 10,curliabilities: 10, shequity: 10, pe: 0, ps: 0, });
        await CompanyReport.create({ company_id: 1, period: '2020-Q4', eps: 0.1, type_report:  'Q', currency: 'SEK',  price: 2.00, totalnumberofshares: 1000,  sales: 100, gp: 10, ltliabilities: 10,curliabilities: 10, shequity: 10, pe: null, ps: null, });
        await CompanyReport.create({ company_id: 1, period: '2020-Q3', eps: 0.1, type_report:  'Q', currency: 'SEK',  price: 2.00, totalnumberofshares: 1000,  sales: 100, gp: 10, ltliabilities: 10,curliabilities: 10, shequity: 10, pe: null, ps: null, });

        await CompanyCalendar.create(    {company_id: 1, period: '2021',    date_report: "2021-12-30"} );
        await CompanyCalendar.create(    {company_id: 1, period: '2021-Q3', date_report: "2021-09-30"} );
        await CompanyCalendar.create(    {company_id: 1, period: '2021-Q4', date_report: "2022-02-16"} ); // <--- This is the new report
        await CompanyCalendar.create(    {company_id: 1, period: '2021-Q1', date_report: "2021-03-30"} ); // got this report
        await CompanyCalendar.create(    {company_id: 1, period: '2020',    date_report: "2021-12-30"} ); // got this report
        await CompanyCalendar.create(    {company_id: 1, period: '2020-Q3', date_report: "2020-09-30"} ); // got this report
        await CompanyCalendar.create(    {company_id: 1, period: '2020-Q2', date_report: "2020-06-30"} ); // got this report
        await CompanyCalendar.create(    {company_id: 1, period: '2020-Q1', date_report: "2020-03-30"} ); // got this report

        await Stock.create({stock_id: 1, company_id: 1, ticker: "TAAB" , isin: 'SE0000000001', name: "Cristina", primary_listing: true, price_today: 8.88, currency_trade: 'SEK', price_updated: '2021-01-01', status_flag: null    } );
    });

    it("Base Case, simple 1 report",  test( async function () {

        const stub = sinon.stub(millistreamManager, 'getReports');
        stub.returns(millistreamManagerMock.getReports());

        const reportDataStruct = {company_id: 1,
            period: '2021-Q4',
            date_report: '2022-02-16',
            name: 'TEST COMAPNY',
            currency_trade: 'SEK',
            price_today: 10,
        };

        let newReports = await millistreamReportService.fetchAndLoadReports(reportDataStruct);
        //console.log('***', newReports);
        expect(newReports).to.be.an('object');

        expect(newReports).to.have.keys([
            'company_id',
            'period'
        ]);


    }));
});

describe.skip('MillistreamService Load Data end-to-end for daily reports', async () => {
    afterEach(async () => {
        await CompanyReport.destroy({where: { company_id: 1}})
        await CompanyCalendar.destroy({where: { company_id: 1}});
        await Company.destroy({where: { company_id: 1}});
    });

    beforeEach(async () => {
        sinon.restore();
        await Company.create({ company_id: 1, name: "COMPANY ONE", last_eps_ttm: null, next_report_date: null, last_sales: 200, last_report_date: '2021-05-06', last_pe: 79, market_cap: '11004179104'} );
        await CompanyReport.create({ company_id: 1, period: '2021-Q1', eps: 0.50, type_report:  'Q', currency: 'NOK',  price: 2.00, totalnumberofshares: 1000,  sales: 100, gp: 1.0, ltliabilities: 1.0,curliabilities: 1.0, shequity: 1.0, pe: 1.0, ps: 1.0, pdf_link: 'ee3d887f-60f2-465c-b235-5b1b534c3123', });
        await CompanyCalendar.create(    {company_id: 1, period: '2021',    date_report: "2021-12-06"} );
    });

    //TODO: Need to fix this unit test before deploying to TEST.
    //Getting alot of error messages: 'ReferenceError: someError is not defined'
    it('add a new Company Report', test(async function() {
        const result = JSON.parse(JSON.stringify(await millistreamReportService.maintainCompanyReports()));

        const newReport = JSON.parse( JSON.stringify( await companyReportManager.getCompanyReport(1, '2021-Q1') ));
        expect(newReport.pdf_link).to.equal('ee3d887f-60f2-465c-b235-5b1b534c3123');
        expect(newReport.eps).to.equal(0.50);
        expect(newReport.sales).to.equal(100);

        const updatedCompany = JSON.parse( JSON.stringify( await companyManager.get(1) ));
        expect(updatedCompany.last_report_date).to.equal('2021-05-06');
        expect(updatedCompany.market_cap).to.equal( '11004179104' );
        expect(updatedCompany.last_sales).to.equal( 200);
        expect(updatedCompany.last_pe).to.equal(79);

        expect(result).to.equal(1);
    }));
});


// skipped, this calls all the millistream reports and times-out
describe.skip('MillistreamService . maintainCompanyReports()', () => {
    let today = new Date().toISOString().substring(0,10);

    afterEach(async () => {
        await CompanyCalendar.destroy({where: { company_id: 1}});
        await Company.destroy({where: { company_id: 1}});
        await Stock.destroy({where: { company_id: 1}});
        await CompanyReport.destroy({where: { company_id: 1}})
    });

    beforeEach(async () => {
        sinon.restore();
        await Company.create({ company_id: 1, name: "COMPANY ONE", last_eps_ttm: null, next_report_date: null, last_sales: 200, last_report_date: today, last_pe: 79, market_cap: '11004179104'} );
        await CompanyReport.create({ company_id: 1, period: '2021-Q1', eps: 0.50, type_report:  'Q', currency: 'NOK',  price: 2.00, totalnumberofshares: 1000,  sales: 100, gp: 1.0, ltliabilities: 1.0,curliabilities: 1.0, shequity: 1.0, pe: 1.0, ps: 1.0, });
        await CompanyCalendar.create(    {company_id: 1, period: '2021',    date_report: today} );
        await Stock.create({stock_id: 1, company_id: 1, ticker: "COMP1" , isin: 'SE0000000001', name: "COMPANY ONE", primary_listing: true, price_today: 8.88, currency_trade: 'SEK', price_updated: today, status_flag: null    } );
    });

    it('Launch Daily "cron" job', test ( async function () {
        const MillistreamReportsMock = sinon.stub(millistreamManager, 'getReports');
        MillistreamReportsMock.returns(millistreamManagerMock.getReports());

        const reportsAdded = JSON.parse(JSON.stringify(await millistreamReportService.maintainCompanyReports()));
        console.log(reportsAdded);
        expect(reportsAdded.length).to.equal(3 );
    }));
});



describe.skip('MillistreamService, Load Company Reports, integrate with Millistream live', () => {
    let today = new Date().toISOString().substring(0,10);

    it('should ask for (in DEV environment) 5 reports, no mock objects, no stubs ', test ( async function () {

        const reportsAdded = JSON.parse(JSON.stringify(await millistreamReportService.maintainCompanyReports(true)));

        expect(reportsAdded).to.be.an('array');
    }));
});


describe.skip('testing functioal programming', () => {
    let today = new Date().toISOString().substring(0,10);

    it('higher ordr and closures ', test ( async function () {

        const events = [1,2,3,4];

        let processReport = ( event) => {
            console.log('event  - '+event);
        }

        let postProcess = ( event) => {
            console.log('post  - '+event);
        }

        events.map(e => {
            console.log('event '+e);
        });

        events.map( (e) => processReport(e));

        events.map( function(e) {
            //  Do stuff here
            console.log(e);
        });


    }));
});
