const stockManager = require("../managers/StockManager");
const millistreamManager = require("../managers/MillistreamManager.js");
const moment = require('moment');

const log4js = require('log4js');
const logger = log4js.getLogger("app_log");
const healthCheck = log4js.getLogger("health");



module.exports = {
    async list() {
        return await stockManager.list();
    },

    async fetch(stock_id) {
        return await stockManager.fetch(stock_id);
    },

    async getPricesFunctionalExperiments(stock_id) {
        const x = async (f) => {
            return { ohlcv: await f };
        };

        const result = await x( this(stock_id) );
        console.log(result);
        const prices = JSON.parse(JSON.stringify(await stockManager.getPrices(stock_id) ));

        const formattedPrices = prices.map( p => {
            return [parseInt(p.datetime_ms), p.open, p.high, p.low, p.close, p.volume];
        });
        return formattedPrices;
    },

    async getPrices(stock_id) {
        const prices = JSON.parse(JSON.stringify(await stockManager.getPrices(stock_id) ));
        const formattedPrices = prices.map( p => {
            return [parseInt(p.datetime_ms), p.open, p.high, p.low, p.close, p.volume];
        });
        return {ohlcv: formattedPrices};
    },

    async loadAllStocksForAutocompleteOnStartup() {
        return await stockManager.loadAllStocksForAutocompleteOnStartup();
    },

    getBaseFileName(stock) {
        return stock.StockExchange ? `${stock.ticker.split(' ').join('-')}.${stock.StockExchange.city}` : `${stock.ticker.split(' ').join('-')}`;
    },

    async getHistoricPrice(stock_id, startDate) {
        return await stockManager.getHistoricPrice(stock_id, startDate);
    },

    async mapStocksAndFinancials(company_id_array) {
        return await stockManager.mapStocksAndFinancials(company_id_array);
    },
    async fetchAllStocks() {
        return await stockManager.fetchStocks();
    },
    async fetchOnePageStocks() {
        return await stockManager.fetchStocks(false);
    }
}

//     async screenResults(exchanges, sectors) {

//         const s = await stockManager.screenResults(exchanges, sectors_stringArray);

//         let results = [];

// // Maybe use a Set instead ?
// //        let isin_array = new Set(s);
//         let temp_array = s;
//         let isin_array = [];
//         for (let i = 0; i < temp_array.length; i++) {
//             if (i == 0) {
//                 isin_array.push(temp_array[i].isin);
//             }
//             if (isin_array.includes(temp_array[i].isin)) {

//             } else {
//                 isin_array.push(temp_array[i].isin);
//             }
//         }

//         for (let i = 0; i < isin_array.length; i++) {
//             let temp_pe = [];
//             let temp_margin = [];
//             for (let j = 0; j < temp_array.length; j++) {
//                 if (isin_array[i] == temp_array[j].isin) {
//                     if (temp_array[j].p_e != null)
//                         temp_pe.push(temp_array[j].p_e)
//                     if (temp_array[j].sales != null)
//                         temp_margin.push(temp_array[j].sales)
//                     var temp_isin = temp_array[j].isin
//                     var temp_sector = temp_array[j].sector
//                     var temp_exchange = temp_array[j].exchange
//                     var temp_ticker = temp_array[j].ticker
//                     var temp_name = temp_array[j].name
//                 }
//             }

//             results.push( {
//                 isin: temp_isin,
//                 sector: temp_sector,
//                 exchange: temp_exchange,
//                 ticker: temp_ticker,
//                 name: temp_name,
//                 pe: temp_pe,
//                 margin: temp_margin
//             });
//         }

//         return results;
//     },
