require('dotenv').config()
const axios = require('axios');
const DB = require('../server/config/DB');
const connection  = DB.getConnection();

const Company = require('../server/models').Company;
const CompanyReport = require('../server/models').CompanyReport;
const CompanyReportPDF = require('../server/models').CompanyReportPDF;

/*
  Call these methods for maintaining the system ... without cluttering the Application code.

  run-func is an npm module that needs to be installed.

        run-func ./server/scripts/UpdateCompanyReports.js fixCompanyReports
*/

module.exports = {

    async initializeCompanyCalendar() {
//        const companies = await Company.findAll({where: {isin: 'SE0006219176'}});
        console.log('BEGIN');
        connection.options.logging = false;
        const companies = await connection.query(`
            select C.*, S.ticker 
            from company C, stock S 
            where C.isin = S.isin 
        `,{ nest: false,  type: connection.QueryTypes.SELECT },  // --and S.currency_trade in ('NOK', 'DKK', 'EUR', 'USD')
        );
        console.log(JSON.stringify(companies.length));

        let count = 0;
        let errorCount = 0;
        console.log(`Count ${count}`);
        console.log(`Error Count ${errorCount}`);
    },


}
