const axios = require('axios');
const Stock = require('../server/models').Stock;
const StockExchangeSector = require('../server/models').StockExchangeSector;
const StockExchange = require('../server/models').StockExchange;
const CompanyReport = require('../server/models').CompanyReport;


var moment = require('moment');

var stockExchange_array = ["29929", "29930", "33187", "35181", "35182", "35183", "35197", "35201", "35235", "35262", "39890", "82836", "4680264"]

var count = 0
var stocks_array = []
var isin_pdf_array = []
var pdf_array = []
var calls = 0

var report_array = []


const getAll = async () => {
    for (var i=0; i<stockExchange_array.length; i++) {
        await get_allStocks(stockExchange_array[i])
        console.log("GetAll: ", i);
    }


//    await CompanyReportPDF  // init company_report_pdf table
  //      .bulkCreate(pdf_array)
        // .then(stockReportPDF => console.log('Successfully inserted data to StockReportPDF table.'))
        // .catch(error => console.log('error', error))

    await CompanyReport  // init company_report table
        .bulkCreate(report_array)
    //     // .then(stockReport => console.log('Successfully inserted data to StockReport table'))
    //     // .catch(error => console.log('////////////////////////', error))

    console.log("AAAAAAAAAAAAAAAAAA", pdf_array.length);
    console.log("BBBBBBBBBBBBBBBBBB", report_array.length);
}

// getAll();

function get_allStocks(exchange_insref) {   //make stock table
    return new Promise((resolve, reject) => {
        axios.get('https://mws.millistream.com/mws.fcgi',
        {params: {usr: 'tradersalloy',
            pwd:process.env.MILLISTREAM_PWD,
            cmd:'instruments',
            marketplace: exchange_insref,
            instrumenttype:'4',
            fields: 'insref,symbol,isin,name,company,list,submarket,sector,ticktable,instrumenttype,instrumentsubtype,issuecurrency,tradecurrency',
            filetype: 'json'}})
        .then(async res => {
            for (var i=0; i<res.data.length; i++) {
                var temp = {
                    "ticker": res.data[i].symbol,
                    "name": res.data[i].name,
                    "company": res.data[i].company,
                    "sector_id": res.data[i].sector,
                    "isin": res.data[i].isin,
                    "insref": res.data[i].insref,
                    "currency_trade": res.data[i].tradecurrency,
                    "description": null,
                    "earnings_date_next": null,
                    "stock_exchange_id": exchange_insref
                }


                $today = new Date();
                $yesterday = new Date($today);
                $yesterday.setDate($today.getDate() - 1);

                var $dd = $yesterday.getDate();
                var $mm = $yesterday.getMonth()+1; //January is 0!

                var $yyyy = $yesterday.getFullYear();
                if($dd<10) {
                    $dd='0'+$dd
                }
                if($mm<10) {
                    $mm='0'+$mm
                }
                $yesterday = $yyyy +'-' + $mm + '-' + $dd;
                // TODO:  try this ... new Date().toISOString().slice(0, 10);

                // await get_PDF(res.data[i].company, res.data[i].isin, i, pdf_array.length)
                await get_price(res.data[i].insref, $yesterday, res.data[i].company, res.data[i].symbol, res.data[i].isin)



                // stocks_array.push(temp)
                console.log('***************', temp.isin, temp.company, temp.insref, stocks_array.length)
            }

            // Stock
            //     .bulkCreate(stocks_array)
            //     .then(stock => console.log('Successfully inserted data to Stock table'))
            //     .catch(error => console.log(error))

            resolve();
        })
        .catch(error => {
            console.log(error)
            resolve();
        })
    })
}


function get_PDF(company, isin, index2, total_count) {
    return new Promise((resolve, reject) => {
        axios.get('https://mws.millistream.com/mws.fcgi',
        {params: {usr: 'tradersalloy',
            pwd:process.env.MILLISTREAM_PWD,
            cmd:'fundamentals',
            insref: company,
            fields: 'eventlink,eventlinklanguages,name',
            startdate: '2017-01-01',
            filetype: 'json'}})
        .then(res => {
            if (res.data[0] && res.data[0].fundamentals.length != 0) {

                for (var i=0; i<res.data[0].fundamentals.length; i++) {
                    const {period, eventlink, eventlinklanguages} = res.data[0].fundamentals[i];
                    var last_pdf = ''
                    if (!eventlinklanguages) continue;

                    const languages = eventlinklanguages.split(",");
                    for (var index in languages) {
                        const language = languages [index];
                        const uuid = `https://documents.millistream.com/${eventlink}?language=${languages}`

                        var temp = {
                            "isin" : isin,
                            "period" : period,
                            "language" : language,
                            "UUID" : eventlink,
                            "company" : company
                        }

                        if (pdf_array.length == 0) {
                            pdf_array.push(temp)
                        } else {
                            if (pdf_array[pdf_array.length-1].isin == temp.isin && pdf_array[pdf_array.length-1].period == temp.period && pdf_array[pdf_array.length-1].language == temp.language && pdf_array[pdf_array.length-1].UUID == temp.UUID && pdf_array[pdf_array.length-1].company == temp.company) {

                            } else {
                                pdf_array.push(temp)
                            }
                        }
                        count ++
                    }

                    // if (i == res.data[0].fundamentals.length-1) {
                    //     last_pdf = `https://documents.millistream.com/${eventlink}?language=${languages[0]}`
                    //     var temp_isin_pdf = {
                    //         "isin" : isin,
                    //         "url" : last_pdf
                    //     }
                    //     isin_pdf_array.push(temp_isin_pdf)
                    //     console.log('###############', temp_isin_pdf.isin, isin_pdf_array.length)
                    // }
                }
                calls ++
            }
            resolve();
        })
        .catch(error => {
            console.log('*', error)
            resolve ();
        })
    })
}


function get_price(insref, startDate, company, ticker, isin) {
    return new Promise((resolve, reject) => {
        axios.get('https://mws.millistream.com/mws.fcgi',
        {params: {usr: 'tradersalloy',
            pwd:process.env.MILLISTREAM_PWD,
            cmd:'history',
            insref: insref,
            fields: 'insref,date,company,symbol,name,isin,closeprice,closequantity,closeturnover,closedayhighprice,closedaylowprice,openprice',
            startdate: startDate,
            enddate: '2100-01-01',
            filetype: 'json'}})
        .then( async res => {
            if (res.data[0] && res.data[0].history.length != 0) {
                await get_stockReports(company, res.data[0].history[0].closeprice, ticker, isin)
            }
            resolve();
        })
        .catch(error => {
            console.log(error)
            resolve();
        })
    })
}

function get_stockReports(company, price, ticker, isin) {  //first function for company_report table, but report_date is null
    return new Promise((resolve, reject) => {
        axios.get('https://mws.millistream.com/mws.fcgi',
        {params: {usr: 'tradersalloy',
            pwd:process.env.MILLISTREAM_PWD,
            cmd:'fundamentals',
            insref: company,
            // fields: 'eps,sales,np,fiscalperiod',
            fields: 'currency,sales,gp,ebitda,ebit,ptp,np,intangibleasset,fixedasset,financialasset,noncurrentasset,cce,currentassets,totalassets,shequity,ltliabilities,curliabilities,eps,totalnumberofshares',
            startdate: '2017-01-01',
            currency: 'SEK',
            filetype: 'json'}})
        .then(async res => {
            if (res.data[0] && res.data[0].fundamentals.length != 0) {
                for (var i=0; i<res.data[0].fundamentals.length; i++) {
                    var temp_report_type = 'Q'
                    if (res.data[0].fundamentals[i].eps != null && res.data[0].fundamentals[i].period.length > 4) temp_report_type = 'Q'
                    if (res.data[0].fundamentals[i].eps != null && res.data[0].fundamentals[i].period.length < 5) temp_report_type = 'Y'
                    if (res.data[0].fundamentals[i].eps == null) temp_report_type = 'E'

                    var temp = {
                        "isin": isin,
                        "ticker": ticker,
                        "company": company,
                        "period": res.data[0].fundamentals[i].period,
                        "date_report": null,
                        "type_report": temp_report_type,
                        "eps": (res.data[0].fundamentals[i].eps).toFixed(2),
                        "sales": res.data[0].fundamentals[i].sales,
                        "profit": res.data[0].fundamentals[i].np,
                        "pe": (price / res.data[0].fundamentals[i].eps).toFixed(2),
                        "ps": (price / res.data[0].fundamentals[i].sales).toFixed(2),
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
                    report_array.push(temp)   // make report_array for company_report table. (report_date is null)

                    if (i == res.data[0].fundamentals.length - 1) {
                        await get_reportsDates(res, company,price, ticker, isin)
                    }

                }
            } else {
                await get_reportsDates(res, company,price, ticker, isin)
            }
            resolve();
        })
        .catch(error => {
            console.log(error)
            resolve ();
        })
    })
}


function get_reportsDates(report, company,price, ticker, isin) {  // second function for company_report table, and report_date is FUTUER dates.
    return new Promise((resolve, reject) => {
        axios.get('https://mws.millistream.com/mws.fcgi',
        {params: {usr: 'tradersalloy',
            pwd:process.env.MILLISTREAM_PWD,
            cmd:'calendar',
            type: '15',
            subtype: '4',
            insref: company,
            fields: 'date,subtype',
            filetype: 'json'}})
        .then (res => {
            if (res.data.length != 0) {
                for (var i=0; i<res.data[0].calendarevent.length; i++) {
                    var quarter = moment(res.data[0].calendarevent[i].date).quarter()
                    var period_temp = res.data[0].calendarevent[i].date.substring(0,4) + '-Q' + quarter

                    var temp = {
                        "isin": isin,
                        "ticker": ticker,
                        "company": company,
                        "period": period_temp,
                        "date_report": res.data[0].calendarevent[i].date,
                        "type_report": 'E',
                        "eps": null,
                        "sales": null,
                        "profit": null,
                        "pe": null,
                        "ps": null,
                        "gp": null,
                        "ebitda" : null,
                        "ebit" : null,
                        "ptp" : null,
                        "intangibleasset" : null,
                        "fixedasset" : null,
                        "financialasset" : null,
                        "noncurrentasset" : null,
                        "cce" : null,
                        "currentassets" : null,
                        "totalassets" : null,
                        "shequity" : null,
                        "ltliabilities" : null,
                        "curliabilities" : null,
                        "totalnumberofshares" : null
                    }
                    report_array.push(temp)  // make report_array for company_report table. (report_date is FUTUER date)
                }
            }
            resolve ();
        })
        .catch(error => {
            console.log(error)
            resolve ();
        })
    })
}

module.exports = axios
