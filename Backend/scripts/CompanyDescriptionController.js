const Company = require('../server/models').Company;
const Company_exchange = require('../server/models').StockExchange;
const Stock = require('../server/models').Stock;
const Sequelize = require('sequelize');
const { Op } = require("sequelize");
const _ = require('lodash');
const cron = require('node-cron');
const axios = require('axios');
const cheerio = require('cheerio');

const searchRegExp = /\s/g;
const replaceWith = '-';

let sequelize;

sequelize = new Sequelize(process.env.DB_database, process.env.DB_username, process.env.DB_password, {
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


// get_tickers()

function get_tickers() {
    sequelize.query(`
                    SELECT S.ticker, S.isin, S.stock_exchange_id
                    FROM Company as C
                        INNER JOIN Stock as S
                    ON C.isin = S.isin
                    GROUP BY 1,2,3`,
                { nest: false, replacements: { }, type: sequelize.QueryTypes.SELECT })
            .then(async results => {
                for (var i=0; i<results.length; i++) {
                    const ticker_name = results[i].ticker.replace(searchRegExp, replaceWith);
                    let exchange_key = '.ST'
                    let exchange_id = results[i].stock_exchange_id
                    if (exchange_id == '33187' || exchange_id == '39890') exchange_key = '.OL'
                    if (exchange_id == '35182' || exchange_id == '35235') exchange_key = '.HE'
                    if (exchange_id == '35183' || exchange_id == '35262') exchange_key = '.CO'
                    let url = 'https://finance.yahoo.com/quote/' + ticker_name + exchange_key + '/profile?p=' + ticker_name + exchange_key
                    await get_description(url, results[i].isin)
                }
                console.log('inserted all descriptions +++++++++++++++++++')
            })
            .catch(error => console.log('error', error));
}

function get_description(url, isin) {
    return new Promise((resolve, reject) => {
        axios(url)
            .then(response => {
                const html = response.data;
                const $ = cheerio.load(html)
                const description = $('.quote-sub-section');
                description.each(async function (i) {
                    const description_text = $(this).find('p').text()
                    await updateCompanyTable(description_text, isin)
                })
                resolve()
            })
            .catch(() => resolve());
    })
}

function updateCompanyTable(description, isin) {
    return new Promise((resolve, reject) => {
        sequelize.query(`
                    UPDATE Company
                    SET description = :description
                    WHERE isin = :isin AND description is Null`,
                { nest: false, replacements: {description: description, isin: isin }, type: sequelize.QueryTypes.SELECT })
            .then(results => {
                console.log('------- updated company description ------', isin)
                resolve()
            })
            .catch(error => {
                console.log('error', error)
                resolve()
            });
    })
}

module.exports = {
    // fetchMapFinancials(req, res) {
    //     res.status(200).send(arrayFinancials)
    // },
    // fetchFinancialData(req, res) {
    //     res.status(200).send(mapFinancials.get(req.params.isin))
    // }
};
