const axios = require('axios');
const cheerio = require('cheerio');
const log4js = require('log4js');
const logger = log4js.getLogger("app_log");
const url = 'https://marknadssok.fi.se/publiceringsklient?Page=1';
const stockInsiderManager = require('../managers/StockInsiderManager.js');
const companyManager = require("../managers/CompanyManager.js");
const _ = require('lodash');
const healthCheck = log4js.getLogger("health");


let companies = [];
let final_array = [];
let insiderTrades = [];
let scrap_flag = false;

/**
 * This module only handles scraping and serving the API calls (handing to the Manager.
 * It does not deal with the user emails, that is in another Service (see the crons for that.
 *
 *
 * */

module.exports = {
    async get_initial() {
        axios(url)
            .then(async response => {
                companies = [];
                companies = await companyManager.list();
                insiderTrades = [];
                insiderTrades = await stockInsiderManager.fetchTransactionDateCompanyID();
                const html = response.data;
                const $ = cheerio.load(html);
                const statsTable = $('.pagination.pagination-normal.pagination-centered > ul > li');
                statsTable.each(async function(i) {
                    if (i == statsTable.length - 2) {
                        const pageNumber = $(this).find('a').text();
                        let pageNumber_string = pageNumber.substr(1, 5);
                        let pageNumber_int = parseInt(pageNumber_string);

                        healthCheck.info(`StockInsiderService: start scrapping... total page number ${pageNumber_int}`);
                        await get_url(pageNumber_int);
                    }
                })
            })
            .catch(console.error);
    },

    async fetchInsiderTrades(company_id) {
        return await stockInsiderManager.fetchInsiderTrades(company_id);
    }
};

async function get_url(pageNumber) {
    try {
        final_array = [];
        for (let i = 1; i <= pageNumber; i++) {
            let url = 'https://marknadssok.fi.se/publiceringsklient?Page=' + i.toString();
            if (!scrap_flag) {
                await get_array(url);
            }
        }

        healthCheck.info(`StockInsiderService: finished scraping... length of new insiderTrades array : ${final_array.length}`);
        // await stockInsiderManager.destroy();
        await stockInsiderManager.bulkCreate(final_array);
        /**
         *  for updating insider_trade_isins field in Company table, we need to get the isins array.
         */
        let results = _(final_array)
            .groupBy('company_id')
            .map((item, key) => ({
                company_id: _.map(item, 'company_id'),
                isin: _.map(item, 'isin')
            }))
            .value()

        results.forEach(async item => {
            await companyManager.updateISINs(item.company_id[0], item.isin.toString());
        })
        healthCheck.info(`StockInsiderService: finished scrapping/updating tables =====`);

    } catch (error) {
        healthCheck.error(`StockInsiderService: ${error.message}`);
    }
}

function get_array(url) {
    return new Promise((resolve, reject) => {
        axios(url)
            .then(response => {
                const html = response.data;
                const $ = cheerio.load(html);
                const statsTable = $('.table.table-bordered.table-hover.table-striped.zero-margin-top > tbody > tr');

                statsTable.each(function() {
                    const array = $(this).find('td');
                    let isin = '';
                    let instrument_name = '';
                    let person = '';
                    let person_title = '';
                    let volume = '';
                    let qty_or_amount = '';
                    let price = '';
                    let transaction_date = '';
                    let transaction_currency = '';
                    let transaction_nature = '';
                    let instrument_type = '';
                    let issuer = '';
                    let company_id = '';
                    array.each(function(i) {
                        const item = $(this).text()
                        if (i == 1) issuer = item;
                        if (i == 2) person = item;
                        if (i == 3) person_title = item;
                        if (i == 5) transaction_nature = item;
                        if (i == 6) instrument_name = item;
                        if (i == 7) instrument_type = item;
                        if (i == 8) isin = item;
                        if (i == 9) transaction_date = item;
                        if (i == 10) volume = parseInt(item.replace(/\s/g, '')); // removed space in number
                        if (i == 11) qty_or_amount = item;
                        if (i == 12) price = parseFloat(item.replace(',', '.'));
                        if (i == 13) transaction_currency = item;
                    })
                    let issuer_splited_array = issuer.split(' ');

                    /**
                     * We should compare the company_name of DB with issuer of site.
                     * But the name and issuer is not matched correctly.
                     * So, we should check if name includes the some letters of issuer.
                     */
                    const tempArray = issuer_splited_array.map((item) => {
                        return companies.filter((d) => d.name.includes(item)).length;
                    })

                    const company = tempArray.indexOf(1) > -1 ? companies.find(item => item.name.includes(issuer_splited_array[tempArray.indexOf(1)])) : null;
                    if (company) {
                        company_id = company.dataValues.company_id;
                    }

                    /**
                     * We have insider trades in stock_insider_trade table already.
                     * While scrapping marknadssok.fi.se, we don't need to scrap all pages because almost data is already existed.
                     * marknadssok.fi.se is updating only several data every day.
                     * So that we need to scrap only those new data every day.
                     */
                    for (var k = 0; k < insiderTrades.length; k++) {
                        if (insiderTrades[k].transaction_date == transaction_date && insiderTrades[k].company_id == company_id && insiderTrades[k].company_id) {
                            scrap_flag = true;
                            return;
                        }
                    }

                    // if (instrument_type == "Aktie" || instrument_type == "Option") {
                    if (company_id) {
                        final_array.push({
                            isin,
                            person,
                            person_title,
                            volume,
                            qty_or_amount,
                            price,
                            transaction_date,
                            transaction_currency,
                            transaction_nature,
                            // stock_id,
                            company_id,
                            instrument_name,
                        });
                    }
                    // }
                });
                resolve()
            })
            .catch(() => resolve());
    })
}