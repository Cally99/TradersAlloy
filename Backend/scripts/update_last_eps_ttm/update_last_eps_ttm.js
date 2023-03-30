const Company = require('../../server/models').Company;
const Company_exchange = require('../../server/models').StockExchange;
const Stock = require('../../server/models').Stock;
const Sequelize = require('sequelize');
const { Op } = require("sequelize");
const _ = require('lodash');
const cron = require('node-cron');
const axios = require('axios');
const cheerio = require('cheerio');

const searchRegExp = /\s/g;
const replaceWith = '-';

let sequelize = new Sequelize('trader', 'postgres', '1234', {
    host: 'localhost',
    dialect: 'postgres',
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
    },
    define: {
        timestamps: false,
        underscored: false,
        freezeTableName: true
    },
});

/**
 *
 *
 *
 * */
let count = test();
console.log('Tests Run: '+ count);
process.exitCode = 0;

/**
 *
 *
 * */
async function test() {
    try {
        /// before
        const updateResult = await sequelize.query(`
                UPDATE company
                SET last_eps_ttm = 1
                WHERE company = '32391'
                `,
            { nest: false, type: sequelize.QueryTypes.SELECT })

        /// exercise
        await getTrailingTwelveMonthsOfReports('32391');

        // assert after
        console.log('checking');
        const actual = await sequelize.query(`
                select  last_eps_ttm
                from    company
                WHERE   company = '32391'
        `, {nest: false, type: sequelize.QueryTypes.SELECT});

        const eps = actual[0].last_eps_ttm;
        console.log('actual: '+ eps);
        const r = (eps > 5 ? 'passed' : 'failed');
        console.log(r);
        return 2;
    } catch (error) {
        console.log(error)
    }
}

/**
 *
 *
 * */
async function getTrailingTwelveMonthsOfReports(company_ref=null) {

        console.log('...');
        const rows = await sequelize.query(`
                --select isin, period , date_report , eps , currency
                select company as company_ref,
                       sum(eps) as total
                from    company_report
                WHERE   (company = :company_ref OR :company_ref is null) -- for limiting testing
                and     type_report = 'Q' 
                and     currency = 'SEK' 
                and     date_report > CURRENT_DATE -interval '12 months'
                GROUP BY company
                `,
                { nest: false, replacements: {company_ref: company_ref}, type: sequelize.QueryTypes.SELECT })
        console.log('... ... ');


        const company_data = rows[0];
        const eps_ttm = rows[0].total;
        for ( const row of rows ) {
            console.log('------ row = '+JSON.stringify(row));
            const updateResult = sequelize.query(`
                UPDATE company
                SET last_eps_ttm = :sum
                WHERE company = :company_ref 
                `,
            { nest: false, replacements: {sum: row.total, company_ref: row.company_ref }, type: sequelize.QueryTypes.SELECT })
        }

        return eps_ttm;

}




module.exports = {

};
