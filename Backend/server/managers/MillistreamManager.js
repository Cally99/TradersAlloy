const axios = require('axios');
const log4js = require('log4js');
const logger = log4js.getLogger("app_log");

const moment = require('moment');
const healthCheck = log4js.getLogger("health");

const pdf2base64 = require('pdf-to-base64');


/** ToDo: working
 *
 *  https://mws.millistream.com/mws.fcgi?cmd=newsbyinstrument&isin=SE0000108656&startdate=2021-12-01&enddate=2021-12-03&fields=date,time,headline,language,newsid,newstype,subject,text,newstags&filetype=json&usr=tradersalloy&pwd=zBaly0kTcfneORknIjvnK1kMIj1eO0iJTmdxKEkR
 *  https://mws.millistream.com/mws.fcgi?cmd=newsbyinstrument&isin=SE0000108656&startdate=2021-12-01&enddate=2021-12-03&fields=date,time,headline,language,newsid,newstype,subject,text,newstags&filetype=json&usr=tradersalloy&pwd=zBaly0kTcfneORknIjvnK1kMIj1eO0iJTmdxKEkR
 */
exports.getNewsByCompany = async function(isins) {
    console.log('4');

    const newsItems = await axios.get('https://mws.millistream.com/mws.fcgi',
        {params:
                {usr: 'tradersalloy',
                pwd: process.env.MILLISTREAM_PWD,
                cmd: 'newsbyinstrument',
                isin:  'SE0004899474', //isins.join(),    // 'SE0000108649,SE0000108656'
                startdate: '2021-11-10',
                enddate: '2021-12-06',
                fields: 'date,time,headline,language,newsid,newstype,subject,text,newstags',
                filetype: 'json'}}); // maybe xml is the only valid value
    //console.log(( newsItems.data ));
    return newsItems;
};

/**

 https://mws.millistream.com/mws.fcgi?cmd=newsbysource&insref=8212,8213&startdate=2021-12-07&enddate=2021-12-07&fields=date,time,headline,language,newsid,newstype,subject,text&filetype=json&usr=tradersalloy&pwd=zBaly0kTcfneORknIjvnK1kMIj1eO0iJTmdxKEkR

 */
exports.getNewsBySource = async function(startDate, endDate, limit=0) {
    const newsItems = await axios.get('https://mws.millistream.com/mws.fcgi',
        {params: {usr: 'tradersalloy',
                pwd:process.env.MILLISTREAM_PWD,
                cmd:'newsbysource',
                startdate: startDate,
                enddate: endDate,
                insref: '8212,8213,8195,8196,8197,8199,8201,8224,8225,8226',
                fields: 'date,time,newsref,newstype,headline,language,newsid,subject,text,newstags,isin',
                filetype: 'json'}});

    return newsItems;
};

/** ToDo: 2021-12
 */
exports.getCorporateActions = async function() {

    const stock_exchange_ids = [];

    const actions = await axios.get('https://mws.millistream.com/mws.fcgi',
        {params: {usr: 'tradersalloy',
                pwd:process.env.MILLISTREAM_PWD,
                cmd:'corporateactions',
                marketplace: stock_exchange_ids,
                instrumenttype:'4',
                fields: 'insref,symbol,isin,name,company,list,marketplace,submarket,sector,ticktable,instrumenttype,instrumentsubtype,tradecurrency',
                filetype: 'json'}});

    return actions;
};

/**
 https://mws.millistream.com/mws.fcgi?cmd=instruments&instrumenttype=4&marketplace=35182&fields=insref,symbol,isin,name,company,list,submarket,tradecurrency&filetype=json&usr=tradersalloy&pwd=zBaly0kTcfneORknIjvnK1kMIj1eO0iJTmdxKEkR
 */
exports.getAllCompanies = async function(stock_exchange_id) {

    const allCompanies = await axios.get('https://mws.millistream.com/mws.fcgi',
        {params: {usr: 'tradersalloy',
                pwd:process.env.MILLISTREAM_PWD,
                cmd:'instruments',
                instrumenttype:'4',
                fields: 'insref,symbol,isin,name,company,list,marketplace,submarket,sector,ticktable,instrumenttype,instrumentsubtype,tradecurrency',
                filetype: 'json'}});
    return allCompanies;
};



/**
 https://mws.millistream.com/mws.fcgi?cmd=instruments&instrumenttype=4&insref=147542&fields=insref,symbol,isin,name,company,list,submarket,tradecurrency&filetype=json&usr=tradersalloy&pwd=zBaly0kTcfneORknIjvnK1kMIj1eO0iJTmdxKEkR
 */
exports.loadStock = async function(stock_id) {

    const stock = await axios.get('https://mws.millistream.com/mws.fcgi',
        {params: {usr: 'tradersalloy',
                pwd:process.env.MILLISTREAM_PWD,
                cmd:'instruments',
                instrumenttype:'4',
                insref: stock_id,
                fields: 'insref,symbol,isin,name,company,marketplace,list,tradecurrency',
                filetype: 'json'}});
    return stock;
};


/**
 * https://mws.millistream.com/mws.fcgi?cmd=instruments&instrumenttype=4&marketplace=35197&fields=insref,name&filetype=json&usr=tradersalloy&pwd=zBaly0kTcfneORknIjvnK1kMIj1eO0iJTmdxKEkR
 */
exports.getAllStockIdsFromMillistream = async function() {

    const allCompanies = await axios.get('https://mws.millistream.com/mws.fcgi',
        {params: {usr: 'tradersalloy',
                pwd:process.env.MILLISTREAM_PWD,
                cmd:'instruments',
                instrumenttype:'4',
                marketplace: '29929,29930,33187,35181,35182,35183,35197,35201,35235,35262,39890,82836,4680264',
                fields: 'insref,list',
                filetype: 'json'}});

    return allCompanies;
};


/** Get all the Financial data for the YEAR (on Full Year that includes a second report for the 4th Quarter )
 *
 * https://mws.millistream.com/mws.fcgi?cmd=fundamentals&insref=82800&startdate=2021-01-01&currency=SEK&fields=eventlink,eventlinklanguages,name,currency,sales,gp,ebitda,ebit,ptp,np,intangibleasset,fixedasset,financialasset,noncurrentasset,cce,currentassets,totalassets,shequity,ltliabilities,curliabilities,eps,totalnumberofshares,ibl&filetype=json&usr=tradersalloy&pwd=zBaly0kTcfneORknIjvnK1kMIj1eO0iJTmdxKEkR
 * https://mws.millistream.com/mws.fcgi?cmd=fundamentals&insref=5180573&startdate=2020-01-01&currency=SEK&fields=eventlink,eventlinklanguages,name,currency,sales,gp,ebitda,ebit,ptp,np,intangibleasset,fixedasset,financialasset,noncurrentasset,cce,currentassets,totalassets,shequity,ltliabilities,curliabilities,eps,totalnumberofshares,ibl&filetype=json&usr=tradersalloy&pwd=zBaly0kTcfneORknIjvnK1kMIj1eO0iJTmdxKEkR
 *
 * */
exports.getReports = async function(company_id, currency, startYear, endYear) {
    const config = {params: {
        usr: 'tradersalloy',
            pwd: process.env.MILLISTREAM_PWD,
            cmd: 'fundamentals',
            insref: company_id,
            fields: 'eventlink,eventlinklanguages,currency,sales,gp,ebitda,ebit,ptp,np,intangibleasset,fixedasset,financialasset,noncurrentasset,cce,currentassets,totalassets,shequity,ltliabilities,curliabilities,eps,totalnumberofshares,ibl',
            startdate: startYear + '-01-01',
            enddate: endYear + '-01-01',
            currency: currency,
            filetype: 'json'
    }};
    //    console.log(config);
    const response = await axios.get('https://mws.millistream.com/mws.fcgi', config);

    if (response.status !== 200) {
        logger.error('Millistream returning 200 when getting Reports');
        throw new Error('Millistream returning 200 when getting Reports');
    }
    if (response.data.length === 0) {
        return [];
    }

    return response.data[0].fundamentals;
};

//vhttps://mws.millistream.com/mws.fcgi?usr=tradersalloy&pwd=zBaly0kTcfneORknIjvnK1kMIj1eO0iJTmdxKEkR&cmd=fundamentals&insref=33233&currency=SEK&fields=eventlink,eventlinklanguages,name,currency,sales,gp,ebitda,ebit,ptp,np,intangibleasset,fixedasset,financialasset,noncurrentasset,cce,currentassets,totalassets,shequity,ltliabilities,curliabilities,eps,totalnumberofshares&startdate=2018-01-01&filetype=json

exports.getReports2 = async function(company_id, currency) {
    //const startDate = period.substring(0,4)+'-01-01';
    const startDate = '2018-01-01';

    logger.debug(`*** Calling Millistream for reports  ${company_id} ${period} ${currency} ( ${startDate} )`);

    const reports = await axios.get('https://mws.millistream.com/mws.fcgi', {
        params: {
            usr: 'tradersalloy',
            pwd: process.env.MILLISTREAM_PWD,
            cmd: 'fundamentals',
            insref: company_id,
            fields: 'eventlink,eventlinklanguages,currency,sales,gp,ebitda,ebit,ptp,np,intangibleasset,fixedasset,financialasset,noncurrentasset,cce,currentassets,totalassets,shequity,ltliabilities,curliabilities,eps,totalnumberofshares,ibl',
            startdate: startDate,
            currency: currency,
            filetype: 'json'
        }
    });

    // if (!(reports.data[0] && reports.data[0].fundamentals.length != 0)) {
    //     logger.error('Made a call to Millistream but got zero records back');
    //     throw 'Millistream error';
    // }
    return reports;
};

/**
 * Get the future Calendar dates, typically the next 3 are published
 * Also note that a company can choose to CHANGE the date of the next scheduled report
 *
 * https://mws.millistream.com/mws.fcgi?cmd=calendar&type=15&subtype=3,4&startdate=2019-06-09&insref=39664&fields=type,subtype,date,period&filetype=json&usr=tradersalloy&pwd=zBaly0kTcfneORknIjvnK1kMIj1eO0iJTmdxKEkR
 * https://mws.millistream.com/mws.fcgi?cmd=calendar&type=15&subtype=3,4&startdate=2018-01-01&insref=68425&fields=type,subtype,date,period&filetype=json&usr=tradersalloy&pwd=zBaly0kTcfneORknIjvnK1kMIj1eO0iJTmdxKEkR
 * */
exports.getCalendar = async function(company_id) {
    const today = new Date().toISOString().substring(0, 10);
    const startDate = moment(today).subtract(1, 'M').format('YYYY-MM-DD');

    return await axios.get('https://mws.millistream.com/mws.fcgi', {
        params: {
            usr: 'tradersalloy',
            pwd: process.env.MILLISTREAM_PWD,
            cmd: 'calendar',
            type: '15',
            subtype: '3,4',
            startdate: startDate,
            insref: company_id,
            fields: 'type,subtype,date,period',
            filetype: 'json'
        }
    });
};

/** USED BY A MAINTENACE SCRIPT
 * */
exports.getCalendarALL = async function(company_id) {

    return await axios.get('https://mws.millistream.com/mws.fcgi', {
        params: {
            usr: 'tradersalloy',
            pwd: process.env.MILLISTREAM_PWD,
            cmd: 'calendar',
            type: '15',
            subtype: '3,4',
            startdate: '2018-01-01',
            insref: company_id,
            fields: 'type,subtype,date,period',
            filetype: 'json'
        }
    });
};

/** get the price according to the currency for a single stock
 * for the database and the /Data files used for the charts
 * example:
 https://mws.millistream.com/mws.fcgi?cmd=history&insref=2187&fields=insref,date,closeprice,closequantity,closeturnover,closedayhighprice,closedaylowprice,openprice&startdate=2021-01-20&enddate=2100-01-01&filetype=json&usr=tradersalloy&pwd=zBaly0kTcfneORknIjvnK1kMIj1eO0iJTmdxKEkR
 https://mws.millistream.com/mws.fcgi?cmd=history&insref=2027574&fields=insref,date,closeprice,closequantity,closeturnover,closedayhighprice,closedaylowprice,openprice&startdate=2021-01-20&enddate=2100-01-01&filetype=json&usr=tradersalloy&pwd=zBaly0kTcfneORknIjvnK1kMIj1eO0iJTmdxKEkR
 * */
exports.getPrice = async function (stock_id) {
    const today = new Date().toISOString().substring(0,10);
    return await axios.get('https://mws.millistream.com/mws.fcgi',
        {params: {usr: 'tradersalloy',
                pwd:process.env.MILLISTREAM_PWD,
                cmd:'history',
                insref: stock_id,
                fields: 'insref,date,closeprice,closequantity,closeturnover,closedayhighprice,closedaylowprice,openprice',
                startdate: today,
                enddate: '2100-01-01',
                filetype: 'json'}});
};

exports.getPriceFromStartDate = async function (stock_id, startDate) {

    const config =  {params: {usr: 'tradersalloy',
            pwd:process.env.MILLISTREAM_PWD,
            cmd:'history',
            insref: stock_id,
            fields: 'insref,date,closeprice,closequantity,closeturnover,closedayhighprice,closedaylowprice,openprice',
            startdate: startDate,
            filetype: 'json'}};
    const response =  await axios.get('https://mws.millistream.com/mws.fcgi', config);


    if (response.data[0]) {
        if (response.data[0].history) {
            return response.data[0].history;
        }
    }

};


/**
 * Latest close price in last 7 days
 * */
exports.getPriceCloseOnly = async function (stock_id) {
    try {
        const today = new Date().toISOString().substring(0,10);
        const startDate = moment(today).subtract(7, 'd').format('YYYY-MM-DD');

        const response = await axios.get('https://mws.millistream.com/mws.fcgi',
            {params: {usr: 'tradersalloy',
                    pwd:process.env.MILLISTREAM_PWD,
                    cmd:'history',
                    insref: stock_id,
                    fields: 'insref,date,closeprice',
                    startdate: startDate,
                    enddate: '2100-01-01',
                    filetype: 'json'}});

        if (response.data[0].history) {
            const prices = response.data[0].history;
            return prices[prices.length-1].closeprice;
        }

        return null;

    } catch(e) {
        console.log('Failed to find the latest price in 7 days for :' + stock_id );
        console.log(e.message);
    }
};

exports.getPrice_JSON = async function(stock_id) {
    let startDate = '2010-01-01';
    return await axios.get('https://mws.millistream.com/mws.fcgi', {
        params: {
            usr: 'tradersalloy',
            pwd: process.env.MILLISTREAM_PWD,
            cmd: 'history',
            insref: stock_id,
            fields: 'insref,date,closeprice,closequantity,closeturnover,closedayhighprice,closedaylowprice,openprice',
            startdate: startDate,
            enddate: '2100-01-01',
            filetype: 'json'
        }
    });
};

/**
 *  https://mws.millistream.com/mws.fcgi?cmd=history&insref=20236&startdate=2020-10-13&enddate=2020-10-21&fields=insref,date,closeprice,closequantity,closeturnover,closedayhighprice,closedaylowprice,openprice&filetype=json&usr=tradersalloy&pwd=zBaly0kTcfneORknIjvnK1kMIj1eO0iJTmdxKEkR
 * */
exports.getHistoricPrice = async function(stock_id, startDate) {

    let price;

    const response = await axios.get('https://mws.millistream.com/mws.fcgi', {
        params: {
            usr: 'tradersalloy',
            pwd: process.env.MILLISTREAM_PWD,
            cmd: 'history',
            insref: stock_id,
            fields: 'insref,date,closeprice,closequantity,closeturnover,closedayhighprice,closedaylowprice,openprice',
            startdate: startDate,
            enddate: startDate,
            filetype: 'json'
        }
    });
    if (response.status !== 200) {
        throw new Error(`Millistream problems ${response.statusText} ( ${stock_id}, ${startDate} )`);
    }

    if (response.data[0]) {
        if (response.data[0].history[0]) {
            if (response.data[0].history[0].closeprice) {
                price = response.data[0].history[0].closeprice;
                return price;
            }
        }
    }

    const wayBackWhen = moment(startDate).subtract(180, 'day').format( 'YYYY-MM-DD');

    const response2 = await axios.get('https://mws.millistream.com/mws.fcgi', {
        params: {
            usr: 'tradersalloy',
            pwd: process.env.MILLISTREAM_PWD,
            cmd: 'history',
            insref: stock_id,
            fields: 'insref,date,closeprice,closequantity,closeturnover,closedayhighprice,closedaylowprice,openprice',
            startdate: wayBackWhen,
            enddate: startDate,
            filetype: 'json'
        }
    });
    if (response2.status !== 200) {
        throw new Error(`Millistream has no price on ${response2.statusText} for :: ${stock_id}: between ${wayBackWhen} - ${startDate}`);
    }

    if (response2.data[0]) {

        if (response2.data[0].history[0]) {
            let prices = response2.data[0].history;
            for (let i = prices.length-1; i >= 0; i--) {
                if (prices[i].closeprice) {
                    //console.log(prices[i].date, moment(prices[i].date).diff(startDate, 'days'))
                    return prices[i].closeprice; // get the latest price served up.
                }
            }
            healthCheck.error(` Failed to find ANY price for ${stock_id} :: ${startDate}`);
            throw new Error('Failed to find any price');
        }
    }
    return null;

};

/** Get all prices since the last updated price according to the stock table.

 *  https://mws.millistream.com/mws.fcgi?cmd=history&insref=20236&startdate=2021-12-01&fields=insref,date,closeprice,closequantity,closeturnover,closedayhighprice,closedaylowprice,openprice&filetype=json&usr=tradersalloy&pwd=zBaly0kTcfneORknIjvnK1kMIj1eO0iJTmdxKEkR
 * */
exports.getAllHistoricPrices = async function(stock) {
    const since = moment(stock.price_updated|| '2018-01-01').add(1, 'day').format('YYYY-MM-DD');

    try {
        const response = await axios.get('https://mws.millistream.com/mws.fcgi', {
            params: {
                usr: 'tradersalloy',
                pwd: process.env.MILLISTREAM_PWD,
                cmd: 'history',
                insref: stock.stock_id,
                fields: 'insref,date,closeprice,closequantity,closeturnover,closedayhighprice,closedaylowprice,openprice',
                startdate: since,
                filetype: 'json'
            }
        });
        //console.log(response.status, response.data);
        if (!response.data[0]) {
            healthCheck.error(`No prize data ${stock.stock_id} ${stock.ticker} ${stock.name} ${stock.stock_exchange_id}  ${since} `);
            return [];
        }

        return response.data[0].history;

    } catch (error) {
        healthCheck.error(`Millistream error 400 ${error} ${stock.stock_id} ${since} `);
        throw new Error(error);
    }
};



exports.getAllHistoricPricesSinceJune1 = async function(stock) {
    const since = '2021-06-01'; //moment(stock.price_updated|| '2018-01-01').add(1, 'day').format('YYYY-MM-DD');

    try {
        const response = await axios.get('https://mws.millistream.com/mws.fcgi', {
            params: {
                usr: 'tradersalloy',
                pwd: process.env.MILLISTREAM_PWD,
                cmd: 'history',
                insref: stock.stock_id,
                fields: 'insref,date,closeprice,closequantity,closeturnover,closedayhighprice,closedaylowprice,openprice',
                startdate: since,
                filetype: 'json'
            }
        });
        if (!response.data[0]) {
            healthCheck.error(`No price data ${stock.stock_id} ${stock.ticker} ${stock.name} ${stock.stock_exchange_id}  ${since} `);
            return [];
        }

        return response.data[0].history;

    } catch (error) {
        healthCheck.error(`Millistream error 400 ${error} ${stock.stock_id} ${since} `);
        throw new Error(error);
    }
};

exports.getActivePdf = async function(pdf) {
    const response = await pdf2base64(`https://documents.millistream.com/${pdf}`);

    return response;
};

exports.getActiveAnalystPdf = async function(pdf) {
    const response = await pdf2base64(pdf);

    return response;
}
