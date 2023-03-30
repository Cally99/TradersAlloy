const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const test = require("sinon-test")(sinon, { useFakeTimers: false });

const CompanyReport  = require('./../../server/models/').CompanyReport;
const companyReportService = require('./../../server/services/CompanyReportService');
const companyReportManager = require('./../../server/managers/CompanyReportManager');
const millistreamManager = require('./../../server/managers/MillistreamManager');

const report_simple =   { company_id: 33233, period: '2021-Q1' , type_report: 'Q', eps: 1, sales: 200, totalnumberofshares:1000 };
const report_h =        { company_id: 33222, period: '2020-H2' , type_report: 'H', eps: 1.1, sales: 200};
const report_fy =       { company_id: 33233, period: '2020'    , type_report: 'FY', eps: 4, sales: 200};
const report_missing =  { company_id: 33233, period: '2018-Q1' , type_report: 'Q', eps: 1, sales: 200};

const reports = [
    {
        "period" : "2021-Q3","totalnumberofshares" : 88647000, "sales" : 3393600000, "company_id" : 68403, "type_report" : "Q", "price" : 113, "eps" : 0.89000000000000001,
        "date_report" : "2021-06-30",
        "pe" : null,
        "currency" : "SEK",
        "ps" : null
    },
    {
        "period" : "2019-Q4",
        "totalnumberofshares" : 86456000,
        "sales" : 3025800000,
        "company_id" : 68403,
        "type_report" : "Q",
        "price" : 72.849999999999994,
        "eps" : 0.1,
        "date_report" : "2019-10-09",
        "pe" : null,
        "currency" : "SEK",
        "ps" : null
    },
    {
        "period" : "2018-Q1",
        "totalnumberofshares" : 76173000,
        "sales" : 2591800000,
        "company_id" : 68403,
        "type_report" : "Q",
        "price" : 83,
        "eps" : 0.1,
        "date_report" : "2018-01-10",
        "pe" : null,
        "currency" : "SEK",
        "ps" : null
    },
    {
        "period" : "2020-Q4",
        "totalnumberofshares" : 88647000,
        "sales" : 2873800000,
        "company_id" : 68403,
        "type_report" : "Q",
        "price" : 63.399999999999999,
        "eps" : 0.1,
        "date_report" : "2020-10-07",
        "pe" : null,
        "currency" : "SEK",
        "ps" : null
    },
    {
        "period" : "2020-Q1",
        "totalnumberofshares" : 88647000,
        "sales" : 3508300000,
        "company_id" : 68403,
        "type_report" : "Q",
        "price" : 75.25,
        "eps" : 0.1,
        "date_report" : "2020-01-08",
        "pe" : null,
        "currency" : "SEK",
        "ps" : null
    },
    {
        "period" : "2019-Q1",
        "totalnumberofshares" : 80439000,
        "sales" : 3126700000,
        "company_id" : 68403,
        "type_report" : "Q",
        "price" : 83.900000000000006,
        "eps" : 0.1,
        "date_report" : "2019-01-09",
        "pe" : null,
        "currency" : "SEK",
        "ps" : null
    },
    {
        "period" : "2018-Q3",
        "totalnumberofshares" : 76173000,
        "sales" : 2461700000,
        "company_id" : 68403,
        "type_report" : "Q",
        "price" : 84.400000000000006,
        "eps" : 0.1,
        "date_report" : "2018-07-04",
        "pe" : null,
        "currency" : "SEK",
        "ps" : null
    },
    {
        "period" : "2019-Q3",
        "totalnumberofshares" : 85133000,
        "sales" : 3168500000,
        "company_id" : 68403,
        "type_report" : "Q",
        "price" : 82.799999999999997,
        "eps" : 0.1,
        "date_report" : "2019-07-03",
        "pe" : null,
        "currency" : "SEK",
        "ps" : null
    },
    {
        "period" : "2020-Q2",
        "totalnumberofshares" : 88647000,
        "sales" : 3542800000,
        "company_id" : 68403,
        "type_report" : "Q",
        "price" : 47.100000000000001,
        "eps" : 0.1,
        "date_report" : "2020-04-01",
        "pe" : null,
        "currency" : "SEK",
        "ps" : null
    },
    {
        "period" : "2018-Q2",
        "totalnumberofshares" : 76173000,
        "sales" : 2722800000,
        "company_id" : 68403,
        "type_report" : "Q",
        "price" : 74.599999999999994,
        "eps" : 0.1,
        "date_report" : "2018-04-11",
        "pe" : null,
        "currency" : "SEK",
        "ps" : null
    },
    {
        "period" : "2021-Q1",
        "totalnumberofshares" : 88647000,
        "sales" : 3696000000,
        "company_id" : 68403,
        "type_report" : "Q",
        "price" : 75.599999999999994,
        "eps" : 0.1,
        "date_report" : "2021-01-12",
        "pe" : null,
        "currency" : "SEK",
        "ps" : null
    },
    {
        "period" : "2020-Q3",
        "totalnumberofshares" : 88647000,
        "sales" : 3270500000,
        "company_id" : 68403,
        "type_report" : "Q",
        "price" : 53.5,
        "eps" : 0.1,
        "date_report" : "2020-07-01",
        "pe" : null,
        "currency" : "SEK",
        "ps" : null
    },
    {
        "period" : "2019-Q2",
        "totalnumberofshares" : 84333000,
        "sales" : 3214700000,
        "company_id" : 68403,
        "type_report" : "Q",
        "price" : 87.5,
        "eps" : 0.1,
        "date_report" : "2019-04-10",
        "pe" : null,
        "currency" : "SEK",
        "ps" : null
    },
    {
        "period" : "2018-Q4",
        "totalnumberofshares" : 76466000,
        "sales" : 2524200000,
        "company_id" : 68403,
        "type_report" : "Q",
        "price" : 82.900000000000006,
        "eps" : 0.1,
        "date_report" : "2018-10-10",
        "pe" : null,
        "currency" : "SEK",
        "ps" : null
    },
    {
        "period" : "2021-Q2",
        "totalnumberofshares" : 88647000,
        "sales" : 3683100000,
        "company_id" : 68403,
        "type_report" : "Q",
        "price" : 109.5,
        "eps" : 0.1,
        "date_report" : "2021-04-13",
        "pe" : null,
        "currency" : "SEK",
        "ps" : null
    },
    {
        "period" : "2018",
        "totalnumberofshares" : 76466000,
        "sales" : 10300500000,
        "company_id" : 68403,
        "type_report" : "FY",
        "price" : 82.900000000000006,
        "eps" : 0.1,
        "date_report" : "2018-10-10",
        "pe" : null,
        "currency" : "SEK",
        "ps" : null
    },
    {
        "period" : "2019",
        "totalnumberofshares" : 86456000,
        "sales" : 12535700000,
        "company_id" : 68403,
        "type_report" : "FY",
        "price" : 72.849999999999994,
        "eps" : 0.1,
        "date_report" : "2019-10-09",
        "pe" : null,
        "currency" : "SEK",
        "ps" : null
    },
    {
        "period" : "2020",
        "totalnumberofshares" : 88647000,
        "sales" : 13195400000,
        "company_id" : 68403,
        "type_report" : "FY",
        "price" : 63.399999999999999,
        "eps" : 0.1,
        "date_report" : "2020-10-07",
        "pe" : null,
        "currency" : "SEK",
        "ps" : null
    }
];


describe('CompanyReportService :: getPriceToSalesTTM', () => {
    beforeEach(async () => {
        sinon.restore();
    });

    it('list', test( async function() {
        const mockData = [{
            id: 1,
            company_id: '234112',
            period: '2018',
            date_report: '2021-03-14',
            type_report: 'Q',
            eps: 6.1,
            sales: 234,
            profit: 5489,
            pe: 54231,
            ps: 125,
            gp: 587987,
            ebitda: 121,
            ebit: 3654,
            ptp: 8975,
            intangibleasset: 244,
            fixedasset: 21,
            financialasset: 32,
            noncurrentasset: 222,
            cce: 321365,
            currentassets: 98465,
            totalassets: 1235,
            shequity: 15,
            ltliabilities: 32,
            curliabilities: 122,
            totalnumberofshares: 321,
            costofgoodssold: 21,
            totalliabilities: 456,
            totalequityandliabilities: 225,
            currency: 'SEK',
            price: 12.5
        },
        {
            id: 2,
            company_id: '234112',
            period: '2018',
            date_report: '2021-03-14',
            type_report: 'Q',
            eps: 6.1,
            sales: 234,
            profit: 5489,
            pe: 54231,
            ps: 125,
            gp: 587987,
            ebitda: 121,
            ebit: 3654,
            ptp: 8975,
            intangibleasset: 244,
            fixedasset: 21,
            financialasset: 32,
            noncurrentasset: 222,
            cce: 321365,
            currentassets: 98465,
            totalassets: 1235,
            shequity: 15,
            ltliabilities: 32,
            curliabilities: 122,
            totalnumberofshares: 321,
            costofgoodssold: 21,
            totalliabilities: 456,
            totalequityandliabilities: 225,
            currency: 'SEK',
            price: 12.5
        },
        {
            id: 3,
            company_id: '234112',
            period: '2018',
            date_report: '2021-03-14',
            type_report: 'Q',
            eps: 6.1,
            sales: 234,
            profit: 5489,
            pe: 54231,
            ps: 125,
            gp: 587987,
            ebitda: 121,
            ebit: 3654,
            ptp: 8975,
            intangibleasset: 244,
            fixedasset: 21,
            financialasset: 32,
            noncurrentasset: 222,
            cce: 321365,
            currentassets: 98465,
            totalassets: 1235,
            shequity: 15,
            ltliabilities: 32,
            curliabilities: 122,
            totalnumberofshares: 321,
            costofgoodssold: 21,
            totalliabilities: 456,
            totalequityandliabilities: 225,
            currency: 'SEK',
            price: 12.5
        }];

        const stub = this.stub(companyReportManager, 'list');
        stub.returns(mockData);

        const rpts = JSON.parse(JSON.stringify(await companyReportService.list()));

        expect(stub.calledOnce).to.be.true;

        expect(rpts).to.be.an('array');
        expect(rpts).to.have.length(3);

        rpts.forEach((itr) => {
            expect(itr).to.be.an('object');
            expect(itr).to.have.keys([
                'id',
                'company_id',
                'period',
                'date_report',
                'type_report',
                'eps',
                'sales',
                'profit',
                'pe',
                'ps',
                'gp',
                'ebitda',
                'ebit',
                'ptp',
                'intangibleasset',
                'fixedasset',
                'financialasset',
                'noncurrentasset',
                'cce',
                'currentassets',
                'totalassets',
                'shequity',
                'ltliabilities',
                'curliabilities',
                'totalnumberofshares',
                'costofgoodssold',
                'totalliabilities',
                'totalequityandliabilities',
                'currency',
                'price'
            ]);

            expect(itr.company_id).to.be.an('string');
            expect(itr.period).to.be.an('string');
            expect(itr.date_report).to.be.an('string');
            expect(itr.type_report).to.be.an('string');
            expect(itr.eps).to.be.an('number');
            expect(itr.sales).to.be.an('number');
            expect(itr.profit).to.be.an('number');
            expect(itr.pe).to.be.an('number');
            expect(itr.ps).to.be.an('number');
            expect(itr.gp).to.be.an('number');
            expect(itr.ebitda).to.be.an('number');
            expect(itr.ebit).to.be.an('number');
            expect(itr.ptp).to.be.an('number');
            expect(itr.intangibleasset).to.be.an('number');
            expect(itr.fixedasset).to.be.an('number');
            expect(itr.financialasset).to.be.an('number');
            expect(itr.noncurrentasset).to.be.an('number');
            expect(itr.cce).to.be.an('number');
            expect(itr.currentassets).to.be.an('number');
            expect(itr.totalassets).to.be.an('number');
            expect(itr.shequity).to.be.an('number');
            expect(itr.ltliabilities).to.be.an('number');
            expect(itr.curliabilities).to.be.an('number');
            expect(itr.totalnumberofshares).to.be.an('number');
            expect(itr.costofgoodssold).to.be.an('number');
            expect(itr.totalliabilities).to.be.an('number');
            expect(itr.totalequityandliabilities).to.be.an('number');
            expect(itr.currency).to.be.an('string');
            expect(itr.price).to.be.an('number');
        })
    }));

    it('companyReport_eps', async () => {
        const mockData = [{
            id: 1,
            company_id: '234112',
            period: '2018',
            date_report: '2021-03-14',
            type_report: 'Q',
            eps: 6.1,
            sales: 234,
            profit: 5489,
            pe: 54231,
            ps: 125,
            gp: 587987,
            ebitda: 121,
            ebit: 3654,
            ptp: 8975,
            intangibleasset: 244,
            fixedasset: 21,
            financialasset: 32,
            noncurrentasset: 222,
            cce: 321365,
            currentassets: 98465,
            totalassets: 1235,
            shequity: 15,
            ltliabilities: 32,
            curliabilities: 122,
            totalnumberofshares: 321,
            costofgoodssold: 21,
            totalliabilities: 456,
            totalequityandliabilities: 225,
            currency: 'SEK',
            price: 12.5
        }];

        const stub = sinon.stub(companyReportManager, 'companyReport_eps');
        stub.returns(mockData);

        const rpts = JSON.parse(JSON.stringify(await companyReportService.companyReport_eps()));

        expect(stub.calledOnce).to.be.true;
        expect(rpts).to.have.length(1);
        expect(rpts).to.be.an('array');

    });

    // We have not tested anything if the 'primary subject' gets mocked
    it('fetchFinancialsQuarterly', async () => {
        const mockData = [{
            period: '2021-Q1',
            costofgoodssold: 234,
            gp: 21,
            ebitda: 293,
            ebit: 823,
            ptp: 932,
            profit: 234,
            intangibleasset: 123,
            fixedasset: 67,
            financialasset: 76,
            noncurrentasset: 89,
            cce: 10,
            othercurrentassets: 221,
            totalcurrentassets: 34,
            totalassets: 292,
            shequity: 384,
            ltliabilities: 8384,
            curliabilities: 929,
            totalliabilities: 743,
            totalequityandliabilities: 100,
        },
        {
            period: '2021-Q2',
            costofgoodssold: 234,
            gp: 21,
            ebitda: 293,
            ebit: 823,
            ptp: 932,
            profit: 234,
            intangibleasset: 123,
            fixedasset: 67,
            financialasset: 76,
            noncurrentasset: 89,
            cce: 10,
            othercurrentassets: 221,
            totalcurrentassets: 34,
            totalassets: 292,
            shequity: 384,
            ltliabilities: 8384,
            curliabilities: 929,
            totalliabilities: 743,
            totalequityandliabilities: 100,
        },
        {
            period: '2021-Q3',
            costofgoodssold: 234,
            gp: 21,
            ebitda: 293,
            ebit: 823,
            ptp: 932,
            profit: 234,
            intangibleasset: 123,
            fixedasset: 67,
            financialasset: 76,
            noncurrentasset: 89,
            cce: 10,
            othercurrentassets: 221,
            totalcurrentassets: 34,
            totalassets: 292,
            shequity: 384,
            ltliabilities: 8384,
            curliabilities: 929,
            totalliabilities: 743,
            totalequityandliabilities: 100,
        },
        {
            period: '2021-Q4',
            costofgoodssold: 234,
            gp: 21,
            ebitda: 293,
            ebit: 823,
            ptp: 932,
            profit: 234,
            intangibleasset: 123,
            fixedasset: 67,
            financialasset: 76,
            noncurrentasset: 89,
            cce: 10,
            othercurrentassets: 221,
            totalcurrentassets: 34,
            totalassets: 292,
            shequity: 384,
            ltliabilities: 8384,
            curliabilities: 929,
            totalliabilities: 743,
            totalequityandliabilities: 100,
        }];

        const stub = sinon.stub(companyReportManager, 'fetchFinancialsQuarterly');
        stub.returns(mockData);

        const financials = JSON.parse(JSON.stringify(await companyReportService.fetchFinancialsQuarterly()));

        expect(stub.calledOnce).to.be.true;

        expect(financials).to.be.an('array');
        expect(financials).to.have.length(4);
        financials.forEach((itr) => {
            expect(itr).to.be.an('object');
            expect(itr).to.have.keys([
                'period',
                'costofgoodssold',
                'gp',
                'ebitda',
                'ebit',
                'ptp',
                'profit',
                'intangibleasset',
                'fixedasset',
                'financialasset',
                'noncurrentasset',
                'cce',
                'othercurrentassets',
                'totalcurrentassets',
                'totalassets',
                'shequity',
                'ltliabilities',
                'curliabilities',
                'totalliabilities',
                'totalequityandliabilities'
            ]);
            expect(itr.period).to.be.an('string');
            expect(itr.costofgoodssold).to.be.an('number');
            expect(itr.gp).to.be.an('number');
            expect(itr.ebitda).to.be.an('number');
            expect(itr.ebit).to.be.an('number');
            expect(itr.ptp).to.be.an('number');
            expect(itr.profit).to.be.an('number');
            expect(itr.intangibleasset).to.be.an('number');
            expect(itr.fixedasset).to.be.an('number');
            expect(itr.financialasset).to.be.an('number');
            expect(itr.noncurrentasset).to.be.an('number');
            expect(itr.cce).to.be.an('number');
            expect(itr.othercurrentassets).to.be.an('number');
            expect(itr.totalcurrentassets).to.be.an('number');
            expect(itr.totalassets).to.be.an('number');
            expect(itr.shequity).to.be.an('number');
            expect(itr.ltliabilities).to.be.an('number');
            expect(itr.curliabilities).to.be.an('number');
            expect(itr.totalliabilities).to.be.an('number');
            expect(itr.totalequityandliabilities).to.be.an('number');
        });
    });

    // We have not tested anything if the 'primary subject' gets mocked
    it('fetchFinancialsAnnual', async () => {
        const mockData = [{
            period: '2021-Q1',
            costofgoodssold: 234,
            gp: 21,
            ebitda: 293,
            ebit: 823,
            ptp: 932,
            profit: 234,
            intangibleasset: 123,
            fixedasset: 67,
            financialasset: 76,
            noncurrentasset: 89,
            cce: 10,
            othercurrentassets: 221,
            totalcurrentassets: 34,
            totalassets: 292,
            shequity: 384,
            ltliabilities: 8384,
            curliabilities: 929,
            totalliabilities: 743,
            totalequityandliabilities: 100,
        },
        {
            period: '2021-Q2',
            costofgoodssold: 234,
            gp: 21,
            ebitda: 293,
            ebit: 823,
            ptp: 932,
            profit: 234,
            intangibleasset: 123,
            fixedasset: 67,
            financialasset: 76,
            noncurrentasset: 89,
            cce: 10,
            othercurrentassets: 221,
            totalcurrentassets: 34,
            totalassets: 292,
            shequity: 384,
            ltliabilities: 8384,
            curliabilities: 929,
            totalliabilities: 743,
            totalequityandliabilities: 100,
        },
        {
            period: '2021-Q3',
            costofgoodssold: 234,
            gp: 21,
            ebitda: 293,
            ebit: 823,
            ptp: 932,
            profit: 234,
            intangibleasset: 123,
            fixedasset: 67,
            financialasset: 76,
            noncurrentasset: 89,
            cce: 10,
            othercurrentassets: 221,
            totalcurrentassets: 34,
            totalassets: 292,
            shequity: 384,
            ltliabilities: 8384,
            curliabilities: 929,
            totalliabilities: 743,
            totalequityandliabilities: 100,
        },
        {
            period: '2021-Q4',
            costofgoodssold: 234,
            gp: 21,
            ebitda: 293,
            ebit: 823,
            ptp: 932,
            profit: 234,
            intangibleasset: 123,
            fixedasset: 67,
            financialasset: 76,
            noncurrentasset: 89,
            cce: 10,
            othercurrentassets: 221,
            totalcurrentassets: 34,
            totalassets: 292,
            shequity: 384,
            ltliabilities: 8384,
            curliabilities: 929,
            totalliabilities: 743,
            totalequityandliabilities: 100,
        }];

        const stub = sinon.stub(companyReportManager, 'fetchFinancialsAnnual');
        stub.returns(mockData);

        const financials = JSON.parse(JSON.stringify( await companyReportService.fetchFinancialsAnnual()));

        expect(stub.calledOnce).to.be.true;

        expect(financials).to.be.an('array');
        expect(financials).to.have.length(4);
        financials.forEach((itr) => {
            expect(itr).to.be.an('object');
            expect(itr).to.have.keys([
                'period',
                'costofgoodssold',
                'gp',
                'ebitda',
                'ebit',
                'ptp',
                'profit',
                'intangibleasset',
                'fixedasset',
                'financialasset',
                'noncurrentasset',
                'cce',
                'othercurrentassets',
                'totalcurrentassets',
                'totalassets',
                'shequity',
                'ltliabilities',
                'curliabilities',
                'totalliabilities',
                'totalequityandliabilities'
            ]);
            expect(itr.period).to.be.an('string');
            expect(itr.costofgoodssold).to.be.an('number');
            expect(itr.gp).to.be.an('number');
            expect(itr.ebitda).to.be.an('number');
            expect(itr.ebit).to.be.an('number');
            expect(itr.ptp).to.be.an('number');
            expect(itr.profit).to.be.an('number');
            expect(itr.intangibleasset).to.be.an('number');
            expect(itr.fixedasset).to.be.an('number');
            expect(itr.financialasset).to.be.an('number');
            expect(itr.noncurrentasset).to.be.an('number');
            expect(itr.cce).to.be.an('number');
            expect(itr.othercurrentassets).to.be.an('number');
            expect(itr.totalcurrentassets).to.be.an('number');
            expect(itr.totalassets).to.be.an('number');
            expect(itr.shequity).to.be.an('number');
            expect(itr.ltliabilities).to.be.an('number');
            expect(itr.curliabilities).to.be.an('number');
            expect(itr.totalliabilities).to.be.an('number');
            expect(itr.totalequityandliabilities).to.be.an('number');
        });
    });
    /**
     * This is the same mechanism as like on "list"
     */
    it('fetchFinancials', async () => {
            const mockData = [{
                period: '2021-Q2',
                costofgoodssold: 234,
                gp: 21,
                ebitda: 293,
                ebit: 823,
                ptp: 932,
                profit: 234,
                intangibleasset: 123,
                fixedasset: 67,
                financialasset: 76,
                noncurrentasset: 89,
                cce: 10,
                othercurrentassets: 221,
                totalcurrentassets: 34,
                totalassets: 292,
                shequity: 384,
                ltliabilities: 8384,
                curliabilities: 929,
                totalliabilities: 743,
                totalequityandliabilities: 100,
            }]
            const stub = sinon.stub(companyReportManager, 'fetchFinancials');
            stub.returns(mockData);
        
            const financials = JSON.parse(JSON.stringify( await companyReportService.fetchFinancials()));
        
            expect(stub.calledOnce).to.be.true;
        
            expect(financials).to.be.an('array');
            expect(financials).to.have.length(1);
    });

    // We have not tested anything if the 'primary subject' gets mocked
    it('fetchEarningsDateNext', async () => {
        const mockData = [{
            company_id: 33206,
            date_report: '2021-01-12'
        },
        {
            company_id: 32929,
            date_report: '2021-02-09'
        },
        {
            company_id: 39836,
            date_report: '2021-01-14'
        },
        {
            company_id: 68392,
            date_report: '2021-01-29'
        },
        {
            company_id: 237943,
            date_report: '2021-04-01'
        }];

        const stub = sinon.stub(companyReportManager, 'fetchEarningsDateNext');
        stub.returns(mockData);

        const dates = JSON.parse(JSON.stringify(await companyReportService.fetchEarningsDateNext()));

        expect(dates).to.be.an('array');
        expect(dates).to.have.length(5);
        dates.forEach((itr) => {
            expect(itr).to.be.an('object');
            expect(itr).to.have.keys([
                'company_id',
                'date_report'
            ]);
            expect(itr.company_id).to.be.an('number');
            expect(itr.date_report).to.be.an('string');
        });
    });
});
