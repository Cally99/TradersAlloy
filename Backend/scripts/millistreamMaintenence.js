const axios = require('axios');
require('dotenv').config()
const CompanyReport = require('../server/models').CompanyReport;
const Stock = require('../server/models').Stock;
var moment = require('moment');


var company = "33219"
var insref = "2889269"
var startDate = "2020-01-01"
var startDate_latest = "2020-03-31"

get_insref()

function get_insref() {
    Stock.findAll()
        .then(async s => {
            for (var i=0; i<s.length; i++) {
                await get_price(s[i].insref, startDate_latest, s[i].company, s[i].isin, s[i].ticker)
                await get_PDF(s[i].company, s[i].isin)
            }
        })
        .catch(error => console.log(error));
}


function get_price(insref, startDate_latest, company, isin, ticker) {
    console.log('//////////////////////', insref)
    return new Promise((resolve, reject) => {
        axios.get('https://mws.millistream.com/mws.fcgi',
        {params: {usr: 'tradersalloy',
            pwd:process.env.MILLISTREAM_PWD,
            cmd:'history',
            insref: insref,
            fields: 'insref,date,company,symbol,name,isin,closeprice',
            startdate: startDate_latest,
            enddate: '2100-01-01',
            filetype: 'json'}})
        .then( async res => {
            if (res.data[0] && res.data[0].history.length != 0) {
                for (var i=0; i<res.data[0].history.length; i++) {
                    if (res.data[0].history[i].closeprice) {
                        await get_stockReports(company, res.data[0].history[i].closeprice, isin, ticker)
                        break
                    }
                }
            }
            resolve();
        })
        .catch(error => {
            console.log(error)
            resolve();
        })
    })
}

function get_stockReports(company, price, isin, ticker) {
    return new Promise((resolve, reject) => {
        axios.get('https://mws.millistream.com/mws.fcgi',
        {params: {usr: 'tradersalloy',
            pwd:process.env.MILLISTREAM_PWD,
            cmd:'fundamentals',
            insref: company,
            fields: 'eps,sales,np,fiscalperiod',
            startdate: startDate,
            currency: 'SEK',
            filetype: 'json'}})
        .then(async res => {
            if (res.data[0] && res.data[0].fundamentals.length != 0) {
                var temp = {
                    "isin": isin,
                    "ticker": ticker,
                    "company": company,
                    "period": res.data[0].fundamentals[0].period,
                    "date_report": null,
                    "type_report": null,
                    "eps": (res.data[0].fundamentals[0].eps).toFixed(2),
                    "sales": res.data[0].fundamentals[0].sales,
                    "profit": res.data[0].fundamentals[0].np,
                    "pe": (price / res.data[0].fundamentals[0].eps).toFixed(2),
                    "ps": (price / res.data[0].fundamentals[0].sales).toFixed(2),
                    "gp": res.data[0].fundamentals[i].gp,
                    "ebitda" : res.data[0].fundamentals[i].ebitda,
                    "ebit" : res.data[0].fundamentals[i].ebit,
                    "ptp" : res.data[0].fundamentals[i].ptp,
                    "intangibleasset" : res.data[0].fundamentals[i].intangibleasset,
                    "fixedasset" : res.data[0].fundamentals[i].fixedasset,
                    "financialasset" : res.data[0].fundamentals[i].financialasset,
                    "noncurrentasset" : res.data[0].fundamentals[i].noncurrentasset,
                    "cce" : res.data[0].fundamentals[i].cce,
                    "currentassets" : res.data[0].fundamentals[i].currentassets,
                    "totalassets" : res.data[0].fundamentals[i].totalassets,
                    "shequity" : res.data[0].fundamentals[i].shequity,
                    "ltliabilities" : res.data[0].fundamentals[i].ltliabilities,
                    "curliabilities" : res.data[0].fundamentals[i].curliabilities,
                    "totalnumberofshares" : res.data[0].fundamentals[i].totalnumberofshares,
                }

                await CompanyReport.create(temp)
                    .then(response => {
                        console.log('added CompanyReport table')
                    })
                    .catch((error) => console.log('failed to update CompanyReport table'));
            }
            resolve();
        })
        .catch(error => {
            console.log(error)
            resolve ();
        })
    })
}

/// NOT NEEDED NOW : PDF LINK IS IN THE REPORT TABLE
function get_PDF(company, isin) {
    console.log('---------------------------', company)
    return new Promise((resolve, reject) => {
        axios.get('https://mws.millistream.com/mws.fcgi',
        {params: {usr: 'tradersalloy',
            pwd:process.env.MILLISTREAM_PWD,
            cmd:'fundamentals',
            insref: company,
            fields: 'eventlink,eventlinklanguages,name',
            startdate: moment(new Date()).format('YYYY-MM-DD'),
            filetype: 'json'}})
        .then(async res => {
            if (res.data[0] && res.data[0].fundamentals.length != 0) {
                const {period, eventlink, eventlinklanguages} = res.data[0].fundamentals[0];
                var temp = {
                    "isin" : isin,
                    "period" : period,
                    "language" : eventlinklanguages,
                    "UUID" : eventlink,
                    "company" : company
                }

                await CompanyReportPDF.create(temp)
                    .then(() => {
                        console.log('added CompanyReportPDF table')
                    })
                    .catch((error) => console.log('failed to update CompanyReportPDF table'));
            }
            resolve();
        })
        .catch(error => {
            console.log('*', error)
            resolve ();
        })
    })
}
