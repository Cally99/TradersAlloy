require('dotenv').config()
const axios = require('axios');
const Sequelize = require('sequelize');
const config = require(`${__dirname}/../config/config.json`);

const DB = require('../server/config/DB');
const connection  = DB.getConnection();

const Company = require('../server/models').Company;
const CompanyReport = require('../server/models').CompanyReport;
const CompanyCalendar = require('../server/models').CompanyCalendar;

/*
  Call these methods for maintaining the system ... without cluttering the Application code.
  run-func is an npm module that needs to be installed.
        run-func ./server/scripts/InitializeCompanyEarnings.js updateCompanyLastReports
        run-func ./server/scripts/InitializeCompanyEarnings.js overwriteWithSoonEvents
*/
module.exports = {

    async updateCompanyLastReports() {
        console.log('BEGIN');
        connection.options.logging = false;

        const companyLastReports = await connection.query(`
            SELECT tt.isin as isin, date_report, eps, sales 
            FROM company_report tt
            INNER JOIN
                (SELECT isin, MAX(date_report) AS MaxDateTime
                FROM company_report
                GROUP BY isin) byISIN
            ON tt.isin = byISIN.isin 
            AND tt.date_report = byISIN.MaxDateTime
        `,{ nest: false, type: connection.QueryTypes.SELECT },  // --and S.currency_trade in ('NOK', 'DKK', 'EUR', 'USD')
        );
        console.log(`selected ${companyLastReports.length} Company Reports `);

        let count = 0;
        let errorCount = 0;
        for (const r of companyLastReports) {
            try {
                await updateCompanyLastReports(r.isin, r.date_report, r.eps, r.sales);
            } catch (error) {
                console.log('error :'+error);
                errorCount++;
            }
        }
        console.log(`Error Count ${errorCount}`);
    },

    async overwriteWithSoonEvents () {
        console.log('BEGIN');
        connection.options.logging = false;

        const upcomingEvents = await connection.query(`
            select isin, date_report
            from company_calendar
            where date_report between current_date and current_date +30;
        `,{ nest: false, type: connection.QueryTypes.SELECT },  // --and S.currency_trade in ('NOK', 'DKK', 'EUR', 'USD')
        );
        console.log(`selected ${upcomingEvents.length} events that are soon... so overwrite history `);

        let count = 0;
        let errorCount = 0;
        for (const r of upcomingEvents) {
            try {
                await overwriteWithSoonEvents(r.isin, r.date_report);
            } catch (error) {
                console.log('error :'+error);
                errorCount++;
            }
        }
        console.log(`Error Count ${errorCount}`);
    },



}
/**
 Base case: update ALL companies with their last financial earnings report (date and eps and earnings )
 * */
async function updateCompanyLastReports(isin, date_report, eps, sales) {
    //console.log(`ticker: ${report.ticker}  period:  ${report.period}  eps:  ${report.eps}` );
    try  {
        const companyLastReports = await connection.query(`
            update company 
            set most_relevant_earnings_date = :date_report, 
                most_relevant_eps = :eps, 
                most_relevant_sales = :sales
            where isin = :isin     
        `,{  nest: false,
                    replacements: {isin: isin, date_report: date_report, eps: eps, sales: sales},
                    type: connection.QueryTypes.SELECT }
        );

//        console.log(company.ticker +' : q'+event.period);
    } catch(e) {
        console.log('error on updating the '+e.message);
    }
}


/**
... next... there is an event coming soon, so overwrite what is now last quarters history with the new date coming up
*/
async function overwriteWithSoonEvents(isin, date_report) {
    //console.log(`ticker: ${report.ticker}  period:  ${report.period}  eps:  ${report.eps}` );
    try  {
        const companyLastReports = await connection.query(`
            update company 
            set most_relevant_earnings_date = :date_report, 
                most_relevant_eps = null, 
                most_relevant_sales = null
            where isin = :isin     
        `,{  nest: false,
            replacements: {isin: isin, date_report: date_report},
            type: connection.QueryTypes.SELECT }
        );

//        console.log(company.ticker +' : q'+event.period);
    } catch(e) {
        console.log('error on updating the '+e.message);
    }
}
