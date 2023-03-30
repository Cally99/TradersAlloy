require('dotenv').config()
const axios = require('axios');
const Sequelize = require('sequelize');
const config = require(`${__dirname}/../config/config.json`);

const DB = require('../server/config/DB');
const connection  = DB.getConnection();

const Company = require('../server/models').Company;
const CompanyReport = require('../server/models').CompanyReport;
const CompanyCalendar = require('../server/models').CompanyCalendar;
const CompanyReportPDF = require('../server/models').CompanyReportPDF;

/*
error getting millistream Calendar:Error: No calendarevent Data Found on Millistream for company: 814819
error getting millistream Calendar:Error: No calendarevent Data Found on Millistream for company: 814807
error getting millistream Calendar:Error: No calendarevent Data Found on Millistream for company: 814768
error getting millistream Calendar:Error: No calendarevent Data Found on Millistream for company: 68398
error getting millistream Calendar:Error: No calendarevent Data Found on Millistream for company: 68355
error getting millistream Calendar:Error: No calendarevent Data Found on Millistream for company: 4605101
error getting millistream Calendar:Error: No calendarevent Data Found on Millistream for company: 4326339
error getting millistream Calendar:Error: No calendarevent Data Found on Millistream for company: 4030721
error getting millistream Calendar:Error: No calendarevent Data Found on Millistream for company: 40062
error getting millistream Calendar:Error: No calendarevent Data Found on Millistream for company: 39848
error getting millistream Calendar:Error: No calendarevent Data Found on Millistream for company: 39713
error getting millistream Calendar:Error: No calendarevent Data Found on Millistream for company: 3897669
error getting millistream Calendar:Error: No calendarevent Data Found on Millistream for company: 33748
error getting millistream Calendar:Error: No calendarevent Data Found on Millistream for company: 33681
error getting millistream Calendar:Error: No calendarevent Data Found on Millistream for company: 33403
error getting millistream Calendar:Error: No calendarevent Data Found on Millistream for company: 3110566
error getting millistream Calendar:Error: No calendarevent Data Found on Millistream for company: 3110539
error getting millistream Calendar:Error: No calendarevent Data Found on Millistream for company: 3017944
error getting millistream Calendar:Error: No calendarevent Data Found on Millistream for company: 237939
*/
/*
  Call these methods for maintaining the system ... without cluttering the Application code.
  run-func is an npm module that needs to be installed.
        run-func ./server/scripts/UpdateCompanyReports.js fixCompanyReports
*/
module.exports = {
    /*

        async initializeCompanyCalendar() {
    //        const companies = await Company.findAll({where: {isin: 'SE0006219176'}});
            console.log('BEGIN');
            connection.options.logging = false;

            const companies = await connection.query(`
                select C.*, S.ticker
                from company C, stock S
                where C.isin = S.isin
            `,{ nest: false, type: connection.QueryTypes.SELECT },  // --and S.currency_trade in ('NOK', 'DKK', 'EUR', 'USD')
            );
            console.log(`selected ${companies.length} companies `);

            let count = 0;
            let errorCount = 0;
            for (const company of companies) {
                if (count++ % 100 == 0) {
                    console.log('PROGRESS: '+count)
                }
                try {
                    let events = await getCompanyCalendar(company.company);

                    for (const event of events) {
                        await insertCompanyCalendar(company, event);
                    }
                } catch (error) {
                    console.log('error getting millistream Calendar:'+error);
                    errorCount++;
                }
            }
            console.log(`Error Count ${errorCount}`);
        },

        async initializeCompanyReports() {
            const companies = await Company.findAll();
            connection.options.logging = false;
            let count = 0;
            let errorCount = 0;

            for await (const company of companies) {
                try {
                    let reports = await getCompanyReports(company.company);

                    for (const report of reports) {
                        await updateCompanyReport(report, company.isin);
                    }

                    if (count++ % 100 == 0) {
                        console.log(`PROGRESS: ${count}   , ${company.name} ${reports.length} `)
                    }
                } catch (error) {
                    console.log(`Error getting Millistream REPORTS: ${company.ticker} : ${company.company} :  ${error}`);
                    errorCount++;
                }
            }
            console.log(`Error Count: ${errorCount}`);
        },

        async initializeCompanyReportsByCompany(company) {
            const companies = await Company.findAll({where: {company: company} });

            for await (const company of companies) {
                try {
                    console.log(company.name, company.company);
                    let reports = await getCompanyReports(company.company);

                    for (const report of reports) {
                        await updateCompanyReport(report, company.isin);
                    }
                } catch (error) {
                    console.log('error getting millistream REPORTS'+error);
                }
            }
        },


    }

    async function insertCompanyCalendar(company, event) {
        //console.log(`ticker: ${report.ticker}  period:  ${report.period}  eps:  ${report.eps}` );
        try  {
            CompanyCalendar.create({
                    "isin":                 company.isin,
                    "company":              company.company,
                    "period":               event.period,
                    "date_report":          event.date,
                    "type_report":          event.subtype,  // 3 == FY      4 == Quarterly

            }, {logging:false})
    //        console.log(company.ticker +' : q'+event.period);
        } catch(e) {
            console.log('error on insert'+e.message);
        }
    }
    */
/*
UPDATE "company_report_1" SET "eps"=0.16,"sales"=669587500,"profit"=74268750,"p_e"=NULL,"p_s"=NULL,
    "ebitda"=82131250,"ebit"=71400000,"ptp"=71400000,"intangibleasset"=500862500,"fixedasset"=5100000,
    "financialasset"=57863006250,"noncurrentasset"=58368968750,"cce"=253618750,"currentassets"=0,
    "totalassets"=58368968750,"shequity"=3090600000,"ltliabilities"=55278368750,"curliabilities"=0,
    "totalnumberofshares"=448500000,"costofgoodssold"=NaN,"totalliabilities"=55278368750,
    "totalequityandliabilities"=58368968750,"currency"='EUR'
WHERE "company" = '39516' AND "period" = '2017-Q3' AND "currency" = 'EUR'

UPDATE "company_report_1" SET "eps"=1.61,"sales"=8221000000,"profit"=728000000,"p_e"=NULL,"p_s"=NULL,
    "gp"=1276000000,"ebitda"=930000000,"ebit"=866000000,"ptp"=866000000,"intangibleasset"=6220000000,
    "fixedasset"=50000000,"financialasset"=563402000000,"noncurrentasset"=569672000000,"cce"=5094000000,
    "currentassets"=0,"totalassets"=569672000000,"shequity"=31140000000,"ltliabilities"=538532000000,
    "curliabilities"=0,"totalnumberofshares"=449800000,"costofgoodssold"=-6945000000,
    "totalliabilities"=538532000000,"totalequityandliabilities"=569672000000,"currency"='NOK'
WHERE "company" = '39516' AND "period" = '2018-Q1' AND "currency" = 'NOK'
*/

function updateCompanyReport(report, isin) {
    report.insref = report.insref+""; // Hack around a column TYPE

    if (! report.eps)                   report.eps = 0;
    if (! report.sales)                 report.sales = 1;
    if (! report.gp )                   report.gp = 1;
    if (! report.profit)                report.profit = 1;
    if (! report.ebitda)                report.ebitda = 1;
    if (! report.ebit)                  report.ebit = 1;
    if (! report.ptp)                   report.ptp = 1;
    if (! report.intangibleasset)       report.intangibleasset = 1;
    if (! report.fixedasset)            report.fixedasset = 1;
    if (! report.financialasset)        report.financialasset = 1;
    if (! report.noncurrentasset)       report.noncurrentasset = 1;
    if (! report.cce)                   report.cce = 1;
    if (! report.currentassets)         report.currentassets = 1;
    if (! report.totalassets)           report.totalassets = 1;
    if (! report.shequity)              report.shequity = 1;
    if (! report.ltliabilities)         report.ltliabilities = 1;
    if (! report.curliabilities)        report.curliabilities = 1;
    if (! report.totalnumberofshares)   report.totalnumberofshares = 1;

    let costofgoodssold =           report.gp - report.sales;
    let totalliabilities =          report.ltliabilities + report.curliabilities;
    let totalequityandliabilities = report.ltliabilities + report.curliabilities + report.shequity;

    try {
        CompanyReport.create(
            {
                "isin":                     isin,
                "company":                  report.insref,
                "period":                   report.period,
                "date_report":              null,  /// MUST GET THIS
                "type_report":              null,
                "currency":                 report.currency,
                "eps":                      (report.eps).toFixed(2),
                "sales":                    report.sales,
                "profit":                   report.np,
                "pe":                      null, // (price / report.np).toFixed(2), // Earnings === Net Profit
                "ps":                      null, // (price / report.sales).toFixed(2),
                "gp":                       report.gp,
                "ebitda":                   report.ebitda,
                "ebit":                     report.ebit,
                "ptp":                      report.ptp,
                "intangibleasset":          report.intangibleasset,
                "fixedasset":               report.fixedasset,
                "financialasset":           report.financialasset,
                "noncurrentasset":          report.noncurrentasset,
                "cce":                      report.cce,
                "currentassets":            report.currentassets,
                "totalassets":              report.totalassets,
                "shequity":                 report.shequity,
                "ltliabilities":            report.ltliabilities,
                "curliabilities":           report.curliabilities,
                "totalnumberofshares":      report.totalnumberofshares,
                "costofgoodssold":          costofgoodssold,
                "totalliabilities":         totalliabilities,
                "totalequityandliabilities":totalequityandliabilities,

            }
            , {logging:false}
        )
        //console.log(report.insref +' : '+  report.period+' : ' + report.currency);
    } catch(e) {
        console.log(e);
    }

}




// https://mws.millistream.com/mws.fcgi?usr=tradersalloy&pwd=zBaly0kTcfneORknIjvnK1kMIj1eO0iJTmdxKEkR&filetype=json&cmd=fundamentals&fields=eps,sales,currency,insref&startdate=2020-01-01&insref=68374
async function getCompanyReports(company_insref) {
    const res =   await   axios.get('https://mws.millistream.com/mws.fcgi',{
            params: {
                usr: 'tradersalloy',
                pwd: process.env.MILLISTREAM_PWD,
                cmd: 'fundamentals',
                insref: company_insref,
                fields: 'insref,eps,sales,np,gp,ebitda,ebit,ptp,intangibleasset,fixedasset,financialasset,noncurrentasset,cce,currentassets,totalassets,shequity,ltliabilities,curliabilities,totalnumberofshares,currency',
                startdate: '2017-01-01',  // only the year YYYY is used
                filetype: 'json'
            }
        })
    if (res.data[0] && res.data[0].fundamentals.length != 0) {
        return res.data[0].fundamentals;
    } else {
        throw new Error ('No Company REPORTS Found for company: ' + company_insref );
    }
}

// https://mws.millistream.com/mws.fcgi?usr=tradersalloy&pwd=zBaly0kTcfneORknIjvnK1kMIj1eO0iJTmdxKEkR&filetype=json&cmd=calendar&type=15&subtype=3,4&fields=insref,name,type,subtype,date,period&startdate=2020-01-01&insref=68374
async function getCompanyCalendar(company) {
    const res =   await   axios.get('https://mws.millistream.com/mws.fcgi', {
        params: {
                usr: 'tradersalloy',
                pwd:process.env.MILLISTREAM_PWD,
                cmd:'calendar',
                insref: company,
                fields: 'name,type,subtype,period,date,fiscalperiod',
                startdate: '2017-01-01',
                subtype: '3,4',
                filetype: 'json'
        }
    });
    if (res.data[0] && res.data[0].calendarevent.length != 0) {
        return res.data[0].calendarevent;
    } else {
        console.log("***"+JSON.stringify(company) );
        throw new Error ('No calendarevent Data Found on Millistream for company: ' + company );
    }

}
