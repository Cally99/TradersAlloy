require('dotenv').config()
const axios = require('axios');
const DB = require('../server/config/DB');
const connection  = DB.getConnection();

const CompanyReport = require('../server/models').CompanyReport;
let count = 0;
let errorCount = 0;


/*
Old SQL
SELECT  CR.isin, S.insref, CR.currency , CR.period, CC.date_report
FROM    stock S, company_report CR
LEFT JOIN company_calendar CC
       ON CR.isin = CC.isin
       AND CR.period = CC.period
WHERE CR.isin = 'SE0013647385'
AND   S.isin = CR.isin
AND   S.currency_trade = CR.currency
ORDER BY 4;



*/
module.exports = {
    async main() {
        const reports = await connection.query(`
select  CR.isin, S.insref, CR.currency , CR.period, CC.date_report
from  stock S, company_report CR,company_calendar CC
where  CR.isin = CC.isin
and    CR.period = CC.period
and   S.isin = CR.isin
and   S.currency_trade = CR.currency
--and    CR.isin = 'SE0013647385'
order by 4;
        `,{ nest: false, type: connection.QueryTypes.SELECT },
        );
        /*
        SE0013647385	2573813	   USD	  2019-Q3	2019-07-11
        SE0013647385	2573813	   SEK	  2019-Q3	2019-07-11
        SE0013647385	2573813	   SEK	  2019-Q4	2019-10-24
        SE0013647385	2573813	   USD    2019-Q4	2019-10-24
        SE0013647385	2573813	   SEK    2020-Q1	2020-01-20
        */
        console.log(`BEGIN \n Selected ${reports.length} reports`);

        for (const report of reports) {
            try {
                let close_price = await getPriceAtReport(report.insref, report.date_report, report.currency );
                console.log(`Got Price... ${report.isin}: ${report.period}: ${close_price} ${report.currency}`);

                await updateCompanyReport(report.isin, report.period, report.currency, close_price, report.date_report);
            } catch (error) {
                console.log('error getting millistream PRICE:'+error);
                errorCount++;
            }
        }
        console.log(`Error Count ${errorCount}`);

        console.log(`
                -- 2. update price and date
                update company_report as A
                set    price = B.price,
                       date_report = B.date_report
                from  company_report B
                where  B.isin = A.isin
                and    B.currency = 'SEK'
                and    B.currency = A.currency
                and    SUBSTRING(B.period,0,5) = A.period
                and    SUBSTRING(B.period,6,2) = 'Q4';
        `);

        console.log(`
                -- 3.  next p/e and P/s
                update company_report
                set p_e = ROUND( CAST ( price / eps  AS NUMERIC), 0),
                    p_s = ROUND( CAST ( price / (sales / totalnumberofshares) AS NUMERIC) ,0)
                where  currency = 'SEK'
                and    eps != 0;
        `);

    }
}

async function updateCompanyReport(isin, period, currency, close_price, date_report) {
    try  {
        CompanyReport.update({
                "price": close_price,
                "date_report": date_report
        }, {where: {"isin": isin, "period": period, "currency": currency}})
        console.log(` ISIN: ${isin} Q: ${period} == ${close_price} `);

        if (count++ % 100 == 0) {
            console.log('PROGRESS: '+count)
        }


    } catch(e) {
        console.log('error on PRICE update'+e.message);
    }
}


// https://mws.millistream.com/mws.fcgi?usr=tradersalloy&pwd=zBaly0kTcfneORknIjvnK1kMIj1eO0iJTmdxKEkR&filetype=json&cmd=history&fields=insref,date,company,symbol,name,isin,closeprice&startdate=2020-09-16&enddate=2020-09-16&insref=2573813
async function getPriceAtReport(insref, reportDate, currency) {
    // SE0013647385	2573813	SEK	2017	2017-10-19

    const res = await axios.get('https://mws.millistream.com/mws.fcgi',
        {params: {
                usr: 'tradersalloy',
                pwd:process.env.MILLISTREAM_PWD,
                cmd:'history',
                insref: insref,
                fields: 'closeprice',
                startdate: reportDate,
                enddate: reportDate,
                filetype: 'json'
            }})


    if (res.data[0] && res.data[0].history.length != 0) {
        //console.log( JSON.stringify( res.data[0].history[0].closeprice ) );
        return res.data[0].history[0].closeprice;
    } else {
        throw new Error ('No Company PRICE: ' + companyRef );
    }
}

