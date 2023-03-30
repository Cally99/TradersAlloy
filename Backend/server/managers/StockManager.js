const Stock = require('../models').Stock;
const StockPrice = require('../models').StockPrice;
const StockExchange = require('../models').StockExchange;

const millistreamManager = require('../managers/MillistreamManager');

const CompanyReportFinancialsService = require('../services/CompanyReportFinancialsService');
const exchangeService = require('../services/StockExchangeService');
const sectorService = require('../services/SectorService');
const companiesServices = require('../services/CompanyService');

const { promisify } = require('util');
// const redis = require('redis');

// const redisPassword = process.env.REDIS_PASS || '';

// const newClient = {
//     host: "localhost",
//     post: 6379,
//     password: redisPassword
// };

// const client = redis.createClient(newClient);
// const setAsync = promisify(client.set).bind(client);
// const getAsync = promisify(client.get).bind(client);

const DB = require('../helpers/DB');
const connection = DB.getConnection();

module.exports = {
    async list(is_all) {
        if(is_all) {
            return await Stock.findAll({ include: [StockExchange], });
        }
        else {
            return await Stock.findAll({ include: [StockExchange], limit:50 });
        }
    },

    async stocksWithCompanyIDArray(company_id_array) {
        return await Stock.findAll({
            include: [StockExchange],
            where: { company_id: { in: company_id_array } }
        });
    },

    async getAllStocks() {
        return await Stock.findAll();
    },


    async fetch(stock_id) {
        return await Stock.findByPk(stock_id, { include: [StockExchange] });
    },
    async getPrices(stock_id) {
        return await StockPrice.findAll({where: {stock_id}});
    },

    async loadAllStocksForAutocompleteOnStartup() {
        return await connection.query(`
            SELECT      stock_id, company_id, ticker, name, stock_exchange_id,
                        currency_trade, price_today, b.sector_id, b.sector_name
            FROM        stock a
            LEFT JOIN   stock_exchange_sector b
            ON          a.sector_id=b.sector_id
            `, {nest: false, type: connection.QueryTypes.SELECT});
    },

    async update(set, where) {
        return await Stock.update(set, where);
    },

    async insert(stock) {
        return Stock.create(stock);
    },

    async getPartList() {
        const stockChange = await StockExchange.findAll({ attributes: ['id'] });
        const idList = stockChange.map((elem) => elem.dataValues.id);
        return await Stock.findAll({ where: { stock_exchange_id: { $notIn: idList } } });
        // return await Stock.findAll({ where: { stock_exchange_id: '4680264' }, include: [StockExchange] });
    },

    /**
     * get all the stocks for ONE company
     *
     * Example: Nokia is traded in multiple countries, each with a currency and a different price
     * */
    async listByCompany(company_id) {
        return await Stock.findAll({ where: { company_id } });
    },

    /**
     * The primary stock is defined as the Stock in the HQ country
     *
     * Only ONE per company
     * */
    async getPrimaryStock(company_id) {
        let s = await Stock.findOne({ where: { company_id: company_id, primary_listing: true } });
        if (!s) { // How does this handle []  ?
            s = null;
        }
        return s;
    },

    /** Daily update of price
     */
    async updatePrice(stock_id, priceToday, dateToday) {
        const rows = await Stock.update({
            price_today: priceToday,
            price_updated: dateToday,
        }, { where: { stock_id }, returning: true, plain: true});
        const stock = rows[1].dataValues;
        return stock;
    },

    /**
     * Status flag is used to capture status business information
     *
     * */
    async setStatusFlag(stock_id, message) {
        const rowsUpdated = await Stock.update({
            status_flag: message,
        }, {
            where: { stock_id },
        });
        return rowsUpdated;
    },

    /**
     * Maybe use stock.table to store all the prices
     * That is why I come via the StockManager for now.
     * */
    async getHistoricPrice(stock_id, startDate) {
        return await millistreamManager.getHistoricPrice(stock_id, startDate);
    },

    async _func1(s, financial) {
        // This part is for profit-margin in Screener page
        if (financial.profit[financial.profit.length - 1] == 0 || financial.sales[financial.sales.length - 1] == 0) {
            s.profit_margin = '0';
        } else {
            s.profit_margin = ~~(financial.profit[financial.profit.length - 1] / financial.sales[financial.sales.length - 1]) // float to int using ~~
        }

        // This part is for Sales Growth percentage in Screener page
        let final_salesGrowth_array = [];
        for (let i = 0; i < financial.sales.length; i++) {
            if (financial.sales[i] && financial.sales[i + 1]) {
                // ( Q2 - Q1 ) / Q1 * 100, ( Q3 - Q2 ) / Q2 * 100, ( Q4 - Q3 ) / Q3 * 100
                let sales_pct = parseFloat((((financial.sales[i + 1] - financial.sales[i]) / financial.sales[i]) * 100));
                final_salesGrowth_array.push(sales_pct);
            }
        }
        s.salesGrowth_q_array = final_salesGrowth_array;
        s.salesGrowth_q_latest = final_salesGrowth_array[final_salesGrowth_array.length - 1];

        let salesGrowth_ttm_array = [];
        for (let i = 0; i < final_salesGrowth_array.length; i++) {
            if (final_salesGrowth_array[i + 3]) {
                let ttm = parseFloat((final_salesGrowth_array[i + 3] + final_salesGrowth_array[i + 2] + final_salesGrowth_array[i + 1] + final_salesGrowth_array[i])) * 10;
                salesGrowth_ttm_array.push(ttm);
            };
        };
        s.salesGrowth_t_array = salesGrowth_ttm_array;
        s.salesGrowth_t_latest = salesGrowth_ttm_array[salesGrowth_ttm_array.length - 1];



        // Gross Profit
        let final_grossProfit_array = financial.gp;
        s.grossProfit_q_array = final_grossProfit_array;
        s.grossProfit_q_latest = (final_grossProfit_array[final_grossProfit_array.length - 1] !== null) ? (final_grossProfit_array[final_grossProfit_array.length - 1]) : null;

        let grossProfit_ttm_array = [];
        for (let i = 0; i < final_grossProfit_array.length; i++) {
            if (final_grossProfit_array[i + 3]) {
                let ttm = parseFloat((final_grossProfit_array[i + 3] + final_grossProfit_array[i + 2] + final_grossProfit_array[i + 1] + final_grossProfit_array[i])) * 10;
                grossProfit_ttm_array.push(ttm);
            };
        };
        s.grossProfit_t_array = grossProfit_ttm_array;
        s.grossProfit_t_latest = grossProfit_ttm_array[grossProfit_ttm_array.length - 1];



        // Gross Profit %
        let final_grossGrowth_array = [];
        for (let i = 0; i < financial.gp.length; i++) {
            if (financial.gp[i] && financial.gp[i + 1]) {
                let gp_pct =
                    parseFloat((((financial.gp[i + 1] - financial.gp[i]) / financial.gp[i]) * 100)); // ( Q2 - Q1 ) / Q1 * 100, ( Q3 - Q2 ) / Q2 * 100, ( Q4 - Q3 ) / Q3 * 100
                final_grossGrowth_array.push(gp_pct);
            }
        }
        s.grossProfitGrowth_q_array = final_grossGrowth_array;
        s.grossProfitGrowth_q_latest = final_grossGrowth_array[final_grossGrowth_array.length - 1];

        let grossProfitGrowth_ttm_array = [];
        for (let i = 0; i < final_grossGrowth_array.length; i++) {
            if (final_grossGrowth_array[i + 3]) {
                let ttm = parseFloat((final_grossGrowth_array[i + 3] + final_grossGrowth_array[i + 2] + final_grossGrowth_array[i + 1] + final_grossGrowth_array[i])) * 10;
                grossProfitGrowth_ttm_array.push(ttm);
            };
        };
        s.grossProfitGrowth_t_array = grossProfitGrowth_ttm_array;
        s.grossProfitGrowth_t_latest = grossProfitGrowth_ttm_array[grossProfitGrowth_ttm_array.length - 1];





        // Gross Margin
        let final_grossMargin_array = [];
        for (let a = 0; a < financial.gp.length; a++) {
            if (financial.gp[a] && financial.sales[a]) {
                let gm_pct = parseFloat(((financial.gp[a] / financial.sales[a])) * 100);
                final_grossMargin_array.push(gm_pct);
            } else {
                final_grossMargin_array.push(0);
            }
        }
        s.grossMargin_q_array = final_grossMargin_array;
        s.grossMargin_q_latest = final_grossMargin_array[final_grossMargin_array.length - 1];

        let grossMargin_ttm_array = [];
        for (let i = 0; i < final_grossMargin_array.length; i++) {
            if (final_grossMargin_array[i + 3]) {
                let ttm = parseFloat((final_grossMargin_array[i + 3] + final_grossMargin_array[i + 2] + final_grossMargin_array[i + 1] + final_grossMargin_array[i])) * 10;
                grossMargin_ttm_array.push(ttm);
            };
        };
        s.grossMargin_t_array = grossMargin_ttm_array;
        s.grossMargin_t_latest = grossMargin_ttm_array[grossMargin_ttm_array.length - 1];


        // Gross Margin Growth Percent
        let final_grossMargin_growth_array = [];
        for (let b = 0; b < financial.gp.length; b++) {
            if (financial.gp[b] && financial.sales[b]) {
                if (financial.gp[b + 1] && financial.sales[b + 1]) {
                    let gmg_pct = parseFloat(((((financial.gp[b + 1] / financial.sales[b + 1]) - (financial.gp[b] / financial.sales[b])) / (financial.gp[b] / financial.sales[b])) * 100));
                    final_grossMargin_growth_array.push(gmg_pct);
                }
            } else {
                final_grossMargin_growth_array.push(0);
            }
        }
        s.grossMarginGrowth_q_array = final_grossMargin_growth_array;
        s.grossMarginGrowth_q_latest = final_grossMargin_growth_array[final_grossMargin_growth_array.length - 1];

        let grossMarginGrowth_ttm_array = [];
        for (let i = 0; i < final_grossMargin_growth_array.length; i++) {
            if (final_grossMargin_growth_array[i + 3]) {
                let ttm = parseFloat((final_grossMargin_growth_array[i + 3] + final_grossMargin_growth_array[i + 2] + final_grossMargin_growth_array[i + 1] + final_grossMargin_growth_array[i])) * 10;
                grossMarginGrowth_ttm_array.push(ttm);
            };
        };
        s.grossMarginGrowth_t_array = grossMarginGrowth_ttm_array;
        s.grossMarginGrowth_t_latest = grossMarginGrowth_ttm_array[grossMarginGrowth_ttm_array.length - 1];



        // COGS
        let final_cogs_array = [];
        for (let c = 0; c < financial.gp.length; c++) {
            if (financial.gp[c] && financial.sales[c]) {
                let cogs = parseFloat((financial.gp[c] - financial.sales[c]));
                final_cogs_array.push(cogs);
            } else {
                final_cogs_array.push(0);
            };
        };
        s.cogs_q_array = final_cogs_array;
        s.cogs_q_latest = final_cogs_array[final_cogs_array.length - 1];

        let cogs_ttm_array = [];
        for (let i = 0; i < final_cogs_array.length; i++) {
            if (final_cogs_array[i + 3]) {
                let ttm = parseFloat((final_cogs_array[i + 3] + final_cogs_array[i + 2] + final_cogs_array[i + 1] + final_cogs_array[i])) * 10;
                cogs_ttm_array.push(ttm);
            };
        };
        s.cogs_t_array = cogs_ttm_array;
        s.cogs_t_latest = cogs_ttm_array[cogs_ttm_array.length - 1];




        // Current Assets
        let final_currentAssets_array = financial.othercurrentassets;
        s.ca_q_array = final_currentAssets_array;
        s.ca_q_latest = (final_currentAssets_array[final_currentAssets_array.length - 1] !== null) ? (final_currentAssets_array[final_currentAssets_array.length - 1]) : null;
        let ca_ttm_array = [];
        for (let i = 0; i < final_currentAssets_array.length; i++) {
            if (final_currentAssets_array[i + 3]) {
                let ttm = parseFloat((final_currentAssets_array[i + 3] + final_currentAssets_array[i + 2] + final_currentAssets_array[i + 1] + final_currentAssets_array[i])) * 10;
                ca_ttm_array.push(ttm);
            };
        };
        s.ca_t_array = ca_ttm_array;
        s.ca_t_latest = ca_ttm_array[ca_ttm_array.length - 1];



        // Total Equity & Liabilities
        let final_tel_array = financial.totalequityandliabilities;
        s.tel_q_array = final_tel_array;
        s.tel_q_latest = (final_tel_array[final_tel_array.length - 1] !== null) ? (final_tel_array[final_tel_array.length - 1]) : null;
        let tel_ttm_array = [];
        for (let i = 0; i < final_tel_array.length; i++) {
            if (final_tel_array[i + 3]) {
                let ttm = parseFloat((final_tel_array[i + 3] + final_tel_array[i + 2] + final_tel_array[i + 1] + final_tel_array[i])) * 10;
                tel_ttm_array.push(ttm);
            };
        };
        s.tel_t_array = tel_ttm_array;
        s.tel_t_latest = tel_ttm_array[tel_ttm_array.length - 1];



        // This part is for Total debt in Screener page
        let final_totalDebt_array = [];
        for (let i = 0; i < financial.ltliabilities.length; i++) {
            if (financial.ltliabilities[i]) {
                let totalDebt = (parseInt(financial.ltliabilities[i]) + parseInt(financial.curliabilities[i]));
                final_totalDebt_array.push(totalDebt);
            } else {
                final_totalDebt_array.push(0);
            };
        };
        s.totalDebt_q_array = final_totalDebt_array;
        s.totalDebt_q_latest = final_totalDebt_array[final_totalDebt_array.length - 1];

        let totalDebt_ttm_array = [];
        for (let i = 0; i < final_totalDebt_array.length; i++) {
            if (final_totalDebt_array[i + 3]) {
                let ttm = parseFloat((final_totalDebt_array[i + 3] + final_totalDebt_array[i + 2] + final_totalDebt_array[i + 1] + final_totalDebt_array[i])) * 10;
                totalDebt_ttm_array.push(ttm);
            };
        };
        s.totalDebt_t_array = totalDebt_ttm_array;
        s.totalDebt_t_latest = totalDebt_ttm_array[totalDebt_ttm_array.length - 1];




        // This part is for P/B in Screener page
        let final_pb_array = [];
        for (let j = 0; j < financial.price.length; j++) {
            if (financial.totalnumberofshares[j] && financial.shequity[j] && financial.price[j]) {
                let pb = parseFloat(((financial.price[j] / financial.shequity[j]) * financial.totalnumberofshares[j]));
                final_pb_array.push(pb);
            } else {
                (final_pb_array.push(0));
            };
        };
        s.pb_q_array = final_pb_array;
        s.pb_q_latest = final_pb_array[final_pb_array.length - 1]

        let pb_ttm_array = []
        for (let i = 0; i < final_pb_array.length; i++) {
            if (final_pb_array[i + 3]) {
                let ttm = parseFloat(final_pb_array[i + 3] + final_pb_array[i + 2] + final_pb_array[i + 1] + final_pb_array[i])
                pb_ttm_array.push(ttm);
            };
        };
        s.pb_t_array = pb_ttm_array;
        s.pb_t_latest = pb_ttm_array[pb_ttm_array.length - 1];





        // This part is for Enterprise Value in Screener page
        let final_enterprise_array = [];
        for (let j = 0; j < financial.price.length; j++) {
            let enterprise = parseFloat(((financial.totalnumberofshares[j] * financial.price[j]) + (financial.ibl[j] - financial.cce[j])));
            final_enterprise_array.push(enterprise);
        };
        s.enterprise_q_array = final_enterprise_array;
        s.enterprise_q_latest = final_enterprise_array[final_enterprise_array.length - 1];

        let enterprise_ttm_array = [];
        for (let i = 0; i < final_enterprise_array.length; i++) {
            if (final_enterprise_array[i + 3]) {
                let ttm = parseFloat(final_enterprise_array[i + 3] + final_enterprise_array[i + 2] + final_enterprise_array[i + 1] + final_enterprise_array[i]);
                enterprise_ttm_array.push(ttm);
            };
        };
        s.enterprise_t_array = enterprise_ttm_array;
        s.enterprise_t_latest = enterprise_ttm_array[enterprise_ttm_array.length - 1];






        // This part is for EV/EBIT in Screener page
        let final_ev_ebit_array = [];
        for (let j = 0; j < financial.price.length; j++) {
            if (financial.ebit[j]) {
                let ev_ebit = parseFloat((((financial.totalnumberofshares[j] * financial.price[j]) + (financial.ibl[j] - financial.cce[j])) / financial.ebit[j]));
                final_ev_ebit_array.push(ev_ebit);
            } else {
                final_ev_ebit_array.push(0);
            };
        };
        s.ev_ebit_q_array = final_ev_ebit_array;
        s.ev_ebit_q_latest = final_ev_ebit_array[final_ev_ebit_array.length - 1];

        let ev_ebit_ttm_array = [];
        for (let i = 0; i < final_ev_ebit_array.length; i++) {
            if (final_ev_ebit_array[i + 3]) {
                let ttm = parseFloat(final_ev_ebit_array[i + 3] + final_ev_ebit_array[i + 2] + final_ev_ebit_array[i + 1] + final_ev_ebit_array[i]);
                ev_ebit_ttm_array.push(ttm);
            };
        };
        s.ev_ebit_t_array = ev_ebit_ttm_array;
        s.ev_ebit_t_latest = ev_ebit_ttm_array[ev_ebit_ttm_array.length - 1];



        // This part is for EV/EBITDA in Screener page
        let final_ev_ebitda_array = [];
        for (let j = 0; j < financial.price.length; j++) {
            if (financial.ebitda[j]) {
                let ev_ebitda = parseFloat(((financial.totalnumberofshares[j] * financial.price[j]) + (financial.ibl[j] - financial.cce[j])) / financial.ebitda[j]);
                final_ev_ebitda_array.push(ev_ebitda);
            } else {
                final_ev_ebitda_array.push(0);
            }
        }
        s.ev_ebitda_q_array = final_ev_ebitda_array;
        s.ev_ebitda_q_latest = final_ev_ebitda_array[final_ev_ebitda_array.length - 1];

        let ev_ebitda_ttm_array = [];
        for (let i = 0; i < final_ev_ebitda_array.length; i++) {
            if (final_ev_ebitda_array[i + 3]) {
                let ttm = parseFloat(final_ev_ebitda_array[i + 3] + final_ev_ebitda_array[i + 2] + final_ev_ebitda_array[i + 1] + final_ev_ebitda_array[i]);
                ev_ebitda_ttm_array.push(ttm);
            };
        };
        s.ev_ebitda_t_array = ev_ebitda_ttm_array;
        s.ev_ebitda_t_latest = ev_ebitda_ttm_array[ev_ebitda_ttm_array.length - 1];




        // Sales per Share
        let final_sales_per_share_array = [];
        for (let j = 0; j < financial.sales.length; j++) {
            if (financial.totalnumberofshares[j] && financial.sales[j]) {
                let sales_per_share = parseFloat(financial.sales[j] / financial.totalnumberofshares[j]);
                final_sales_per_share_array.push(sales_per_share);
            } else {
                (final_sales_per_share_array.push(0));
            };
        };
        s.sps_q_array = final_sales_per_share_array;
        s.sps_q_latest = final_sales_per_share_array[final_sales_per_share_array.length - 1];
        let sps_ttm_array = [];
        for (let i = 0; i < final_sales_per_share_array.length; i++) {
            if (final_sales_per_share_array[i + 3]) {
                let ttm = parseFloat(final_sales_per_share_array[i + 3] + final_sales_per_share_array[i + 2] + final_sales_per_share_array[i + 1] + final_sales_per_share_array[i]);
                sps_ttm_array.push(ttm);
            };
        };
        s.sps_t_array = sps_ttm_array;
        s.sps_t_latest = sps_ttm_array[sps_ttm_array.length - 1];


        // Number of Stocks
        let final_nos_array = financial.totalnumberofshares;
        s.nos_q_array = final_nos_array;
        s.nos_q_latest = final_nos_array[final_nos_array.length - 1];
        let nos_ttm_array = [];
        for (let i = 0; i < final_nos_array.length; i++) {
            if (final_nos_array[i + 3]) {
                let ttm = parseFloat(final_nos_array[i + 3] + final_nos_array[i + 2] + final_nos_array[i + 1] + final_nos_array[i]) * 10;
                nos_ttm_array.push(ttm);
            };
        };
        s.nos_t_array = tel_ttm_array;
        s.nos_t_latest = tel_ttm_array[tel_ttm_array.length - 1];


        // Number of stocks growth Percent
        let final_totalnumberofshareGrowth_array = [];
        for (let d = 0; d < financial.totalnumberofshares.length; d++) {
            if (financial.totalnumberofshares[d] && financial.totalnumberofshares[d + 1]) {
                let totalnumberofshares_pct =
                    parseFloat(((financial.totalnumberofshares[d + 1] - financial.totalnumberofshares[d]) / financial.totalnumberofshares[d]) * 100); // ( Q2 - Q1 ) / Q1 * 100, ( Q3 - Q2 ) / Q2 * 100, ( Q4 - Q3 ) / Q3 * 100
                final_totalnumberofshareGrowth_array.push(totalnumberofshares_pct);
            };
        };
        s.nosg_q_array = final_totalnumberofshareGrowth_array;
        s.nosg_q_latest = final_totalnumberofshareGrowth_array[final_totalnumberofshareGrowth_array.length - 1];
        let nosg_ttm_array = [];
        for (let i = 0; i < final_totalnumberofshareGrowth_array.length; i++) {
            if (final_totalnumberofshareGrowth_array[i + 3]) {
                let ttm = parseFloat(final_totalnumberofshareGrowth_array[i + 3] + final_totalnumberofshareGrowth_array[i + 2] + final_totalnumberofshareGrowth_array[i + 1] + final_totalnumberofshareGrowth_array[i]) * 10;
                nosg_ttm_array.push(ttm);
            };
        };
        s.nosg_t_array = nosg_ttm_array;
        s.nosg_t_latest = nosg_ttm_array[nosg_ttm_array.length - 1];


        // ROE percent
        let final_roe_array = [];
        for (let j = 0; j < financial.sales.length; j++) {
            if (financial.ebit[j] && financial.shequity[j]) {
                let roe_pct = parseFloat((financial.ebit[j] / financial.shequity[j]) * 100);
                final_roe_array.push(roe_pct);
            } else {
                (final_roe_array.push(0));
            };
        };
        s.roe_q_array = final_roe_array;
        s.roe_q_latest = final_roe_array[final_roe_array.length - 1];
        let roe_ttm_array = [];
        for (let i = 0; i < final_roe_array.length; i++) {
            if (final_roe_array[i + 3]) {
                let ttm = parseFloat(final_roe_array[i + 3] + final_roe_array[i + 2] + final_roe_array[i + 1] + final_roe_array[i]) * 10;
                roe_ttm_array.push(ttm);
            };
        };
        s.roe_t_array = roe_ttm_array;
        s.roe_t_latest = roe_ttm_array[roe_ttm_array.length - 1];



        // ROA percent
        let final_roa_array = [];
        for (let j = 0; j < financial.sales.length; j++) {
            if (financial.ptp[j] && financial.totalassets[j]) {
                let roa_pct = parseFloat((financial.ptp[j] / financial.totalassets[j]) * 100);
                final_roa_array.push(roa_pct);
            } else {
                (final_roa_array.push(0));
            };
        };
        s.roa_q_array = final_roa_array;
        s.roa_q_latest = final_roa_array[final_roa_array.length - 1];
        let roa_ttm_array = [];
        for (let i = 0; i < final_roa_array.length; i++) {
            if (final_roa_array[i + 3]) {
                let ttm = parseFloat(final_roa_array[i + 3] + final_roa_array[i + 2] + final_roa_array[i + 1] + final_roa_array[i]) * 10;
                roa_ttm_array.push(ttm);
            };
        };
        s.roa_t_array = roa_ttm_array;
        s.roa_t_latest = roa_ttm_array[roa_ttm_array.length - 1];


        // Net debt
        let final_netDebt_array = [];
        for (let j = 0; j < financial.totalassets.length; j++) {
            if (financial.totalassets[j]) {
                let netDebt_pct = parseFloat((financial.curliabilities[j] + financial.ltliabilities[j] - financial.cce[j]) / financial.totalassets[j]) * 100; // (curliabilities + ltliabiliites - cce) / totalassets
                final_netDebt_array.push(netDebt_pct);
            } else {
                (final_netDebt_array.push(0));
            };
        };
        s.netDebt_q_array = final_netDebt_array;
        s.netDebt_q_latest = final_netDebt_array[final_netDebt_array.length - 1];
        let netDebt_ttm_array = [];
        for (let i = 0; i < final_netDebt_array.length; i++) {
            if (final_netDebt_array[i + 3]) {
                let ttm = parseFloat(final_netDebt_array[i + 3] + final_netDebt_array[i + 2] + final_netDebt_array[i + 1] + final_netDebt_array[i]) * 10;
                netDebt_ttm_array.push(ttm);
            };
        };
        s.netDebt_t_array = netDebt_ttm_array;
        s.netDebt_t_latest = netDebt_ttm_array[netDebt_ttm_array.length - 1];




        // This part is for Solidity in Screener page
        let final_solidity_array = [];
        for (let j = 0; j < financial.shequity.length; j++) {
            if (financial.totalassets[j]) {
                let solidity_pct = parseFloat((financial.shequity[j] / financial.totalassets[j])) * 100; // why 10 times? the current returned values are less than 1, so that sparklines is not showed.
                final_solidity_array.push(solidity_pct);
            } else {
                (final_solidity_array.push(0));
            };
        };
        s.solidity_q_array = final_solidity_array;
        s.solidity_q_latest = final_solidity_array[final_solidity_array.length - 1];

        let solidity_ttm_array = [];
        for (let i = 0; i < final_solidity_array.length; i++) {
            if (final_solidity_array[i + 3]) {
                let ttm = parseFloat(final_solidity_array[i + 3] + final_solidity_array[i + 2] + final_solidity_array[i + 1] + final_solidity_array[i]) * 10;
                solidity_ttm_array.push(ttm);
            };
        };
        s.solidity_t_array = solidity_ttm_array;
        s.solidity_t_latest = solidity_ttm_array[solidity_ttm_array.length - 1];





        let final_sales_array = financial.sales;
        s.sales_q_array = final_sales_array;
        s.sales_q_latest = final_sales_array[final_sales_array.length - 1];
        let final_sales_t_array = [];
        for (let i = 0; i < final_sales_array.length; i++) {
            if (final_sales_array[i + 3]) {
                let sales_t = parseFloat(final_sales_array[i + 3] + final_sales_array[i + 2] + final_sales_array[i + 1] + final_sales_array[i]);
                final_sales_t_array.push(sales_t);
            };
        };
        s.sales_t_array = final_sales_t_array;
        s.sales_t_latest = final_sales_t_array[final_sales_t_array.length - 1];



        // eps
        let final_eps_array = financial.eps;
        let final_eps_q_array = [];
        final_eps_array.map(ele => {
            final_eps_q_array.push(ele); // why 100 times? because we cannot display sparkBar with less than 1 data.
        })
        s.eps_q_array = final_eps_q_array;
        s.eps_q_latest = (final_eps_array[final_eps_array.length - 1] !== null) ? (final_eps_array[final_eps_array.length - 1]) : null;
        let final_eps_t_array = [];
        for (let i = 0; i < final_eps_array.length; i++) {
            if (final_eps_array[i + 3]) {
                let sales_t = parseFloat(final_eps_array[i + 3] + final_eps_array[i + 2] + final_eps_array[i + 1] + final_eps_array[i]);
                final_eps_t_array.push(sales_t);
            };
        };
        s.eps_t_array = final_eps_t_array;
        s.eps_t_latest = final_eps_t_array[final_eps_t_array.length - 1];




        s.totalassets = financial.totalassets;
        s.shequity = financial.shequity;
        s.ltliabilities = financial.ltliabilities;
        s.curliabilities = financial.curliabilities;


        // This part is for Cash in Screener page
        let final_cash_array = financial.cce;
        s.cash_q_array = final_cash_array;
        s.cash_q_latest = (final_cash_array[final_cash_array.length - 1] !== null) ? (final_cash_array[final_cash_array.length - 1]) : null;

        let cash_ttm_array = [];
        for (let i = 0; i < final_cash_array.length; i++) {
            if (final_cash_array[i + 3]) {
                let ttm = parseFloat(final_cash_array[i + 3] + final_cash_array[i + 2] + final_cash_array[i + 1] + final_cash_array[i]);
                cash_ttm_array.push(ttm);
            };
        };
        s.cash_t_array = cash_ttm_array;
        s.cash_t_latest = cash_ttm_array[cash_ttm_array.length - 1];



        let final_ps_array = financial.ps;
        s.ps_q_array = final_ps_array;
        s.ps_q_latest = (final_ps_array[final_ps_array.length - 1] !== null) ? (final_ps_array[final_ps_array.length - 1]) : null;
        let final_ps_t_array = [];
        for (let i = 0; i < final_ps_array.length; i++) {
            if (final_ps_array[i + 3]) {
                let ps_t = parseFloat(final_ps_array[i + 3] + final_ps_array[i + 2] + final_ps_array[i + 1] + final_ps_array[i]);
                final_ps_t_array.push(ps_t);
            };
        };
        s.ps_t_array = final_ps_t_array;
        s.ps_t_latest = final_ps_t_array[final_ps_t_array.length - 1];


        let final_pe_array = financial.pe;
        s.pe_q_array = final_pe_array;
        s.pe_q_latest = (final_pe_array[final_pe_array.length - 1]) !== null ? (final_pe_array[final_pe_array.length - 1]) : null;
        let final_pe_t_array = [];
        for (let i = 0; i < final_pe_array.length; i++) {
            if (final_pe_array[i + 3]) {
                let pe_t = parseFloat(final_pe_array[i + 3] + final_pe_array[i + 2] + final_pe_array[i + 1] + final_pe_array[i]);
                final_pe_t_array.push(pe_t);
            };
        };
        s.pe_t_array = final_pe_t_array;
        s.pe_t_latest = final_pe_t_array[final_pe_t_array.length - 1];



        // EBIT
        let final_ebit_array = financial.ebit;
        s.ebit_q_array = final_ebit_array;
        s.ebit_q_latest = (final_ebit_array[final_ebit_array.length - 1] !== null) ? (final_ebit_array[final_ebit_array.length - 1]) : null;
        let final_ebit_t_array = [];
        for (let i = 0; i < final_ebit_array.length; i++) {
            if (final_ebit_array[i + 3]) {
                let ebit_t = parseFloat(final_ebit_array[i + 3] + final_ebit_array[i + 2] + final_ebit_array[i + 1] + final_ebit_array[i]);
                final_ebit_t_array.push(ebit_t);
            };
        };
        s.ebit_t_array = final_ebit_t_array;
        s.ebit_t_latest = final_ebit_t_array[final_ebit_t_array.length - 1];


        // This part is for EBIT Growth Percent in Screener page
        let final_ebitGrowth_array = [];
        for (let d = 0; d < financial.ebit.length; d++) {
            if (financial.ebit[d] && financial.ebit[d + 1]) {
                let ebit_pct =
                    parseFloat((financial.ebit[d + 1] - financial.ebit[d]) / financial.ebit[d]) * 100; // ( Q2 - Q1 ) / Q1 * 100, ( Q3 - Q2 ) / Q2 * 100, ( Q4 - Q3 ) / Q3 * 100
                final_ebitGrowth_array.push(ebit_pct);
            };
        };
        s.ebitGrowth_q_array = final_ebitGrowth_array;
        s.ebitGrowth_q_latest = final_ebitGrowth_array[final_ebitGrowth_array.length - 1];
        let final_ebitGrowth_t_array = [];
        for (let i = 0; i < final_ebitGrowth_array.length; i++) {
            if (final_ebitGrowth_array[i + 3]) {
                let ebit_t = parseFloat(final_ebitGrowth_array[i + 3] + final_ebitGrowth_array[i + 2] + final_ebitGrowth_array[i + 1] + final_ebitGrowth_array[i]);
                final_ebitGrowth_t_array.push(ebit_t);
            };
        };
        s.ebitGrowth_t_array = final_ebitGrowth_t_array;
        s.ebitGrowth_t_latest = final_ebitGrowth_t_array[final_ebitGrowth_t_array.length - 1];


        // This part is for EBIT Margin Percent in Screener page
        let final_ebitMargin_array = [];
        for (let e = 0; e < financial.ebit.length; e++) {
            if (financial.ebit[e] && financial.sales[e]) {
                let ebit_margin_pct = parseFloat(financial.ebit[e] / financial.sales[e]) * 100;
                final_ebitMargin_array.push(ebit_margin_pct);
            };
        };
        s.ebitMargin_q_array = final_ebitMargin_array;
        s.ebitMargin_q_latest = final_ebitMargin_array[final_ebitMargin_array.length - 1];
        let final_ebitMargin_t_array = [];
        for (let i = 0; i < final_ebitMargin_array.length; i++) {
            if (final_ebitMargin_array[i + 3]) {
                let ebit_t = parseFloat(final_ebitMargin_array[i + 3] + final_ebitMargin_array[i + 2] + final_ebitMargin_array[i + 1] + final_ebitMargin_array[i]);
                final_ebitMargin_t_array.push(ebit_t);
            };
        };
        s.ebitMargin_t_array = final_ebitMargin_t_array;
        s.ebitMargin_t_latest = final_ebitMargin_t_array[final_ebitMargin_t_array.length - 1];

        // This part is for EBIT Margin Growth Percent in Screener page
        let final_ebitMargin_growth_array = [];
        for (let b = 0; b < financial.ebit.length; b++) {
            if (financial.ebit[b] && financial.sales[b]) {
                if (financial.ebit[b + 1] && financial.sales[b + 1]) {
                    let ebit_margin_growth_pct = parseFloat(((financial.ebit[b + 1] / financial.sales[b + 1]) - (financial.ebit[b] / financial.sales[b])) / (financial.ebit[b] / financial.sales[b])) * 100;
                    final_ebitMargin_growth_array.push(ebit_margin_growth_pct);
                };
            };
        };
        s.ebitMarginGrowth_q_array = final_ebitMargin_growth_array;
        s.ebitMarginGrowth_q_latest = final_ebitMargin_growth_array[final_ebitMargin_growth_array.length - 1];
        let final_ebitMarginGrowth_t_array = [];
        for (let i = 0; i < final_ebitMargin_growth_array.length; i++) {
            if (final_ebitMargin_growth_array[i + 3]) {
                let ebit_t = parseFloat(final_ebitMargin_growth_array[i + 3] + final_ebitMargin_growth_array[i + 2] + final_ebitMargin_growth_array[i + 1] + final_ebitMargin_growth_array[i]);
                final_ebitMarginGrowth_t_array.push(ebit_t);
            };
        };
        s.ebitMarginGrowth_t_array = final_ebitMarginGrowth_t_array;
        s.ebitMarginGrowth_t_latest = final_ebitMarginGrowth_t_array[final_ebitMarginGrowth_t_array.length - 1];



        // EBITDA
        let final_ebitda_array = financial.ebitda;
        s.ebitda_q_array = final_ebitda_array;
        s.ebitda_q_latest = (final_ebitda_array[final_ebitda_array.length - 1] !== null) ? (final_ebitda_array[final_ebitda_array.length - 1]) : null;
        let final_ebitda_t_array = [];
        for (let i = 0; i < final_ebitda_array.length; i++) {
            if (final_ebitda_array[i + 3]) {
                let ebitda_t = parseFloat(final_ebitda_array[i + 3] + final_ebitda_array[i + 2] + final_ebitda_array[i + 1] + final_ebitda_array[i]);
                final_ebitda_t_array.push(ebitda_t);
            };
        };
        s.ebitda_t_array = final_ebitda_t_array;
        s.ebitda_t_latest = final_ebitda_t_array[final_ebitda_t_array.length - 1];



        // EBITDA Growth Percent
        let final_ebitdaGrowth_array = [];
        for (let d = 0; d < financial.ebitda.length; d++) {
            if (financial.ebitda[d] && financial.ebitda[d + 1]) {
                let ebitda_pct =
                    parseFloat((financial.ebitda[d + 1] - financial.ebitda[d]) / financial.ebitda[d]) * 100; // ( Q2 - Q1 ) / Q1 * 100, ( Q3 - Q2 ) / Q2 * 100, ( Q4 - Q3 ) / Q3 * 100
                final_ebitdaGrowth_array.push(ebitda_pct);
            };
        };
        s.ebitdaGrowth_q_array = final_ebitdaGrowth_array;
        s.ebitdaGrowth_q_latest = final_ebitdaGrowth_array[final_ebitdaGrowth_array.length - 1];

        let ebitdaGrowth_ttm_array = [];
        for (let i = 0; i < final_ebitdaGrowth_array.length; i++) {
            if (final_ebitdaGrowth_array[i + 3]) {
                let ttm = parseFloat(final_ebitdaGrowth_array[i + 3] + final_ebitdaGrowth_array[i + 2] + final_ebitdaGrowth_array[i + 1] + final_ebitdaGrowth_array[i]);
                ebitdaGrowth_ttm_array.push(ttm);
            };
        };
        s.ebitdaGrowth_t_array = ebitdaGrowth_ttm_array;
        s.ebitdaGrowth_t_latest = ebitdaGrowth_ttm_array[ebitdaGrowth_ttm_array.length - 1];


        // EBITDA Margin Percent
        let final_ebitdaMargin_array = [];
        for (let e = 0; e < financial.gp.length; e++) {
            if (financial.ebitda[e] && financial.sales[e]) {
                let ebitda_margin_pct = parseFloat(financial.ebitda[e] / financial.sales[e]) * 100;
                final_ebitdaMargin_array.push(ebitda_margin_pct);
            };
        };
        s.ebitdaMargin_q_array = final_ebitdaMargin_array;
        s.ebitdaMargin_q_latest = final_ebitdaMargin_array[final_ebitdaMargin_array.length - 1];

        let ebitdaMargin_ttm_array = [];
        for (let i = 0; i < final_ebitdaMargin_array.length; i++) {
            if (final_ebitdaMargin_array[i + 3]) {
                let ttm = parseFloat(final_ebitdaMargin_array[i + 3] + final_ebitdaMargin_array[i + 2] + final_ebitdaMargin_array[i + 1] + final_ebitdaMargin_array[i]);
                ebitdaMargin_ttm_array.push(ttm);
            };
        };
        s.ebitdaMargin_t_array = ebitdaMargin_ttm_array;
        s.ebitdaMargin_t_latest = ebitdaMargin_ttm_array[ebitdaMargin_ttm_array.length - 1];


        // EBITDA Margin Growth Percent
        let final_ebitdaMargin_growth_array = [];
        for (let b = 0; b < financial.gp.length; b++) {
            if (financial.ebitda[b] && financial.sales[b]) {
                if (financial.ebitda[b + 1] && financial.sales[b + 1]) {
                    let ebitda_margin_growth_pct = parseFloat(((financial.ebitda[b + 1] / financial.sales[b + 1]) - (financial.ebitda[b] / financial.sales[b])) / (financial.ebitda[b] / financial.sales[b])) * 100;
                    final_ebitdaMargin_growth_array.push(ebitda_margin_growth_pct);
                };
            };
        };
        s.ebitdaMarginGrowth_q_array = final_ebitdaMargin_growth_array;
        s.ebitdaMarginGrowth_q_latest = final_ebitdaMargin_growth_array[final_ebitdaMargin_growth_array.length - 1];

        let ebitdaMarginGrowth_ttm_array = [];
        for (let i = 0; i < final_ebitdaMargin_growth_array.length; i++) {
            if (final_ebitdaMargin_growth_array[i + 3]) {
                let ttm = parseFloat(final_ebitdaMargin_growth_array[i + 3] + final_ebitdaMargin_growth_array[i + 2] + final_ebitdaMargin_growth_array[i + 1] + final_ebitdaMargin_growth_array[i]);
                ebitdaMarginGrowth_ttm_array.push(ttm);
            };
        };
        s.ebitdaMarginGrowth_t_array = ebitdaMarginGrowth_ttm_array;
        s.ebitdaMarginGrowth_t_latest = ebitdaMarginGrowth_ttm_array[ebitdaMarginGrowth_ttm_array.length - 1];




        // Pre-Tax Profit
        let final_ptp_array = financial.ptp;
        s.ptp_q_array = final_ptp_array;
        s.ptp_q_latest = (final_ptp_array[final_ptp_array.length - 1] !== null) ? (final_ptp_array[final_ptp_array.length - 1]) : null;
        let final_ptp_t_array = [];
        for (let i = 0; i < final_ptp_array.length; i++) {
            if (final_ptp_array[i + 3]) {
                let ptp_t = parseFloat(final_ptp_array[i + 3] + final_ptp_array[i + 2] + final_ptp_array[i + 1] + final_ptp_array[i]);
                final_ptp_t_array.push(ptp_t);
            };
        };
        s.ptp_t_array = final_ptp_t_array;
        s.ptp_t_latest = final_ptp_t_array[final_ptp_t_array.length - 1];



        // Profit (NP)
        let final_np_array = financial.profit;
        s.np_q_array = final_np_array;
        s.np_q_latest = (final_np_array[final_np_array.length - 1] !== null) ? (final_np_array[final_np_array.length - 1]) : null;
        let final_np_t_array = [];
        for (let i = 0; i < final_np_array.length; i++) {
            if (final_np_array[i + 3]) {
                let np_t = parseFloat(final_np_array[i + 3] + final_np_array[i + 2] + final_np_array[i + 1] + final_np_array[i]);
                final_np_t_array.push(np_t);
            };
        };
        s.np_t_array = final_np_t_array;
        s.np_t_latest = final_np_t_array[final_np_t_array.length - 1];


        // This part is for Profit Growth Percent in Screener page
        let final_profitGrowth_array = [];
        for (let d = 0; d < financial.profit.length; d++) {
            if (financial.profit[d] && financial.profit[d + 1]) {
                let profit_pct =
                    parseFloat((financial.profit[d + 1] - financial.profit[d]) / financial.profit[d]) * 100; // ( Q2 - Q1 ) / Q1 * 100, ( Q3 - Q2 ) / Q2 * 100, ( Q4 - Q3 ) / Q3 * 100
                final_profitGrowth_array.push(profit_pct);
            };
        };
        s.npGrowth_q_array = final_profitGrowth_array;
        s.npGrowth_q_latest = final_profitGrowth_array[final_profitGrowth_array.length - 1];
        let npGrowth_ttm_array = [];
        for (let i = 0; i < final_profitGrowth_array.length; i++) {
            if (final_profitGrowth_array[i + 3]) {
                let ttm = parseFloat(final_profitGrowth_array[i + 3] + final_profitGrowth_array[i + 2] + final_profitGrowth_array[i + 1] + final_profitGrowth_array[i]);
                npGrowth_ttm_array.push(ttm);
            };
        };
        s.npGrowth_t_array = npGrowth_ttm_array;
        s.npGrowth_t_latest = npGrowth_ttm_array[npGrowth_ttm_array.length - 1];

        // This part is for Profit Margin Percent in Screener page
        let final_profitMargin_array = [];
        for (let e = 0; e < financial.profit.length; e++) {
            if (financial.profit[e] && financial.sales[e]) {
                let profit_margin_pct = parseFloat(financial.profit[e] / financial.sales[e]) * 100;
                final_profitMargin_array.push(profit_margin_pct);
            };
        };
        s.npMargin_q_array = final_profitMargin_array;
        s.npMargin_q_latest = final_profitMargin_array[final_profitMargin_array.length - 1];
        let npMargin_ttm_array = [];
        for (let i = 0; i < final_profitMargin_array.length; i++) {
            if (final_profitMargin_array[i + 3]) {
                let ttm = parseFloat(final_profitMargin_array[i + 3] + final_profitMargin_array[i + 2] + final_profitMargin_array[i + 1] + final_profitMargin_array[i]);
                npMargin_ttm_array.push(ttm);
            };
        };
        s.npMargin_t_array = npMargin_ttm_array;
        s.npMargin_t_latest = npMargin_ttm_array[npMargin_ttm_array.length - 1];

        // This part is for Profit Margin Growth Percent in Screener page
        let final_profitMargin_growth_array = [];
        for (let b = 0; b < financial.profit.length; b++) {
            if (financial.profit[b] && financial.sales[b]) {
                if (financial.profit[b + 1] && financial.sales[b + 1]) {
                    let profit_margin_growth_pct = parseFloat(((financial.profit[b + 1] / financial.sales[b + 1]) - (financial.profit[b] / financial.sales[b])) / (financial.profit[b] / financial.sales[b])) * 100;
                    final_profitMargin_growth_array.push(profit_margin_growth_pct);
                };
            };
        };
        s.npMarginGrowth_q_array = final_profitMargin_growth_array;
        s.npMarginGrowth_q_latest = final_profitMargin_growth_array[final_profitMargin_growth_array.length - 1];
        let npMarginGrowth_ttm_array = [];
        for (let i = 0; i < final_profitMargin_growth_array.length; i++) {
            if (final_profitMargin_growth_array[i + 3]) {
                let ttm = parseFloat(final_profitMargin_growth_array[i + 3] + final_profitMargin_growth_array[i + 2] + final_profitMargin_growth_array[i + 1] + final_profitMargin_growth_array[i]);
                npMarginGrowth_ttm_array.push(ttm);
            };
        };
        s.npMarginGrowth_t_array = npMarginGrowth_ttm_array;
        s.npMarginGrowth_t_latest = npMarginGrowth_ttm_array[npMarginGrowth_ttm_array.length - 1];




        // Intangable Assets
        let final_ia_array = financial.intangibleasset;
        s.ia_q_array = final_ia_array;
        s.ia_q_latest = (final_ia_array[final_ia_array.length - 1] !== null) ? (final_ia_array[final_ia_array.length - 1]) : null;
        let final_ia_t_array = [];
        for (let i = 0; i < final_ia_array.length; i++) {
            if (final_ia_array[i + 3]) {
                let ia_t = parseFloat(final_ia_array[i + 3] + final_ia_array[i + 2] + final_ia_array[i + 1] + final_ia_array[i]);
                final_ia_t_array.push(ia_t);
            };
        };
        s.ia_t_array = final_ia_t_array;
        s.ia_t_latest = final_ia_t_array[final_ia_t_array.length - 1];


        // Material Assets
        let final_ma_array = financial.fixedasset;
        s.ma_q_array = final_ma_array;
        s.ma_q_latest = (final_ma_array[final_ma_array.length - 1] !== null) ? (final_ma_array[final_ma_array.length - 1]) : null;
        let final_ma_t_array = [];
        for (let i = 0; i < final_ma_array.length; i++) {
            if (final_ma_array[i + 3]) {
                let ia_t = parseFloat(final_ma_array[i + 3] + final_ma_array[i + 2] + final_ma_array[i + 1] + final_ma_array[i]);
                final_ma_t_array.push(ia_t);
            };
        };
        s.ma_t_array = final_ma_t_array;
        s.ma_t_latest = final_ma_t_array[final_ma_t_array.length - 1];


        // Financial Assets
        let final_fa_array = financial.financialasset;
        s.fa_q_array = final_fa_array;
        s.fa_q_latest = (final_fa_array[final_fa_array.length - 1] !== null) ? (final_fa_array[final_fa_array.length - 1]) : null;
        let final_fa_t_array = [];
        for (let i = 0; i < final_fa_array.length; i++) {
            if (final_fa_array[i + 3]) {
                let ia_t = parseFloat(final_fa_array[i + 3] + final_fa_array[i + 2] + final_fa_array[i + 1] + final_fa_array[i]);
                final_fa_t_array.push(ia_t);
            };
        };
        s.fa_t_array = final_fa_t_array;
        s.fa_t_latest = final_fa_t_array[final_fa_t_array.length - 1];

        // Tangible Assets
        let final_ta_array = financial.noncurrentasset;
        s.ta_q_array = final_ta_array;
        s.ta_q_latest = (final_ta_array[final_ta_array.length - 1] !== null) ? (final_ta_array[final_ta_array.length - 1]) : null;
        let final_ta_t_array = [];
        for (let i = 0; i < final_ta_array.length; i++) {
            if (final_ta_array[i + 3]) {
                let ia_t = parseFloat(final_ta_array[i + 3] + final_ta_array[i + 2] + final_ta_array[i + 1] + final_ta_array[i]);
                final_ta_t_array.push(ia_t);
            };
        };
        s.ta_t_array = final_ta_t_array;
        s.ta_t_latest = final_ta_t_array[final_ta_t_array.length - 1];


        // Total Assets
        let final_totalAssets_array = financial.totalassets;
        s.totalAssets_q_array = final_totalAssets_array;
        s.totalAssets_q_latest = (final_totalAssets_array[final_totalAssets_array.length - 1] !== null) ? (final_totalAssets_array[final_totalAssets_array.length - 1]) : null;
        let final_totalAssets_t_array = [];
        for (let i = 0; i < final_totalAssets_array.length; i++) {
            if (final_totalAssets_array[i + 3]) {
                let ia_t = parseFloat(final_totalAssets_array[i + 3] + final_totalAssets_array[i + 2] + final_totalAssets_array[i + 1] + final_totalAssets_array[i]);
                final_totalAssets_t_array.push(ia_t);
            };
        };
        s.totalAssets_t_array = final_totalAssets_t_array;
        s.totalAssets_t_latest = final_totalAssets_t_array[final_totalAssets_t_array.length - 1];


        // Total Equity
        let final_totalEquity_array = financial.shequity;
        s.totalEquity_q_array = final_totalEquity_array;
        s.totalEquity_q_latest = (final_totalEquity_array[final_totalEquity_array.length - 1] !== null) ? (final_totalEquity_array[final_totalEquity_array.length - 1]) : null;
        let final_totalEquity_t_array = [];
        for (let i = 0; i < final_totalEquity_array.length; i++) {
            if (final_totalEquity_array[i + 3]) {
                let ia_t = parseFloat(final_totalEquity_array[i + 3] + final_totalEquity_array[i + 2] + final_totalEquity_array[i + 1] + final_totalEquity_array[i]);
                final_totalEquity_t_array.push(ia_t);
            };
        };
        s.totalEquity_t_array = final_totalEquity_t_array;
        s.totalEquity_t_latest = final_totalEquity_t_array[final_totalEquity_t_array.length - 1];


        // Long Term Debt
        let final_ltd_array = financial.ltliabilities;
        s.ltd_q_array = final_ltd_array;
        s.ltd_q_latest = (final_ltd_array[final_ltd_array.length - 1] !== null) ? (final_ltd_array[final_ltd_array.length - 1]) : null;
        let final_ltd_t_array = [];
        for (let i = 0; i < final_ltd_array.length; i++) {
            if (final_ltd_array[i + 3]) {
                let ia_t = parseFloat(final_ltd_array[i + 3] + final_ltd_array[i + 2] + final_ltd_array[i + 1] + final_ltd_array[i]);
                final_ltd_t_array.push(ia_t);
            };
        };
        s.ltd_t_array = final_ltd_t_array;
        s.ltd_t_latest = final_ltd_t_array[final_ltd_t_array.length - 1];


        // Short Term Debt
        let final_std_array = financial.curliabilities;
        s.std_q_array = final_std_array;
        s.std_q_latest = (final_std_array[final_std_array.length - 1] !== null) ? (final_std_array[final_std_array.length - 1]) : null;
        let final_std_t_array = [];
        for (let i = 0; i < final_std_array.length; i++) {
            if (final_std_array[i + 3]) {
                let ia_t = parseFloat(final_std_array[i + 3] + final_std_array[i + 2] + final_std_array[i + 1] + final_std_array[i]);
                final_std_t_array.push(ia_t);
            };
        };
        s.std_t_array = final_std_t_array;
        s.std_t_latest = final_std_t_array[final_std_t_array.length - 1];
        return s;
    },
    async _func2(s, financial) {
        let final_solidity_array = [];
        for (let j = 0; j < financial.shequity.length; j++) {
            if (financial.totalassets[j]) {
                let solidity = parseFloat(financial.shequity[j] / financial.totalassets[j]) * 10; // why 10 times? the current returned values are less than 1, so that sparklines is not showed.
                final_solidity_array.push(solidity);
            } else {
                (final_solidity_array.push(0));
            };
        };
        s.solidity_y_array = final_solidity_array;
        s.solidity_y_latest = final_solidity_array[final_solidity_array.length - 1];



        let final_enterprise_array = [];
        for (let j = 0; j < financial.price.length; j++) {
            let enterprise = parseFloat((financial.totalnumberofshares[j] * financial.price[j]) + (financial.ibl[j] - financial.cce[j]));
            final_enterprise_array.push(enterprise);
        };
        s.enterprise_y_array = final_enterprise_array;
        s.enterprise_y_latest = final_enterprise_array[final_enterprise_array.length - 1];

        // Sales Growth %
        let final_salesGrowth_array = [];
        for (let i = 0; i < financial.sales.length; i++) {
            if (financial.sales[i] && financial.sales[i + 1]) {
                // ( Q2 - Q1 ) / Q1 * 100, ( Q3 - Q2 ) / Q2 * 100, ( Q4 - Q3 ) / Q3 * 100
                let sales_pct = parseFloat((financial.sales[i + 1] - financial.sales[i]) / financial.sales[i]) * 100;
                final_salesGrowth_array.push(sales_pct);
            }
        }
        s.salesGrowth_y_array = final_salesGrowth_array;
        s.salesGrowth_y_latest = final_salesGrowth_array[final_salesGrowth_array.length - 1];




        let final_ev_ebit_array = [];
        for (let j = 0; j < financial.price.length; j++) {
            if (financial.ebit[j]) {
                let ev_ebit = parseFloat(((financial.totalnumberofshares[j] * financial.price[j]) + (financial.ibl[j] - financial.cce[j])) / financial.ebit[j]);
                final_ev_ebit_array.push(ev_ebit);
            } else {
                final_ev_ebit_array.push(0);
            };
        };
        s.ev_ebit_y_array = final_ev_ebit_array;
        s.ev_ebit_y_latest = final_ev_ebit_array[final_ev_ebit_array.length - 1];




        let final_ev_ebitda_array = [];
        for (let j = 0; j < financial.price.length; j++) {
            if (financial.ebitda[j]) {
                let ev_ebitda = parseFloat(((financial.totalnumberofshares[j] * financial.price[j]) + (financial.ibl[j] - financial.cce[j])) / financial.ebitda[j]);
                final_ev_ebitda_array.push(ev_ebitda);
            } else {
                final_ev_ebitda_array.push(0);
            };
        };
        s.ev_ebitda_y_array = final_ev_ebitda_array;
        s.ev_ebitda_y_latest = final_ev_ebitda_array[final_ev_ebitda_array.length - 1];


        let final_pb_array = [];
        for (let j = 0; j < financial.price.length; j++) {
            if (financial.totalnumberofshares[j] && financial.shequity[j] && financial.price[j]) {
                let pb = parseFloat(financial.price[j] / financial.shequity[j] / financial.totalnumberofshares[j]);
                final_pb_array.push(pb);
            } else {
                (final_pb_array.push(0));
            };
        };
        s.pb_y_array = final_pb_array;
        s.pb_y_latest = final_pb_array[final_pb_array.length - 1];


        // This part is for Total debt in Screener page
        let final_totalDebt_array = [];
        for (let i = 0; i < financial.ltliabilities.length; i++) {
            if (financial.ltliabilities[i]) {
                let totalDebt =
                    parseInt(financial.ltliabilities[i]) + parseInt(financial.curliabilities[i])
                final_totalDebt_array.push(totalDebt);
            } else {
                final_totalDebt_array.push(0);
            };
        };
        s.totalDebt_y_array = final_totalDebt_array;
        s.totalDebt_y_latest = final_totalDebt_array[final_totalDebt_array.length - 1];


        s.ps_y_array = financial.ps;
        s.ps_y_latest = financial.ps[financial.ps.length - 1];

        s.pe_y_array = financial.pe;
        s.pe_y_latest = financial.pe[financial.pe.length - 1];

        s.sales_y_array = financial.sales;
        s.sales_y_latest = financial.sales[financial.sales.length - 1];

        s.gp_y_array = financial.gp;
        s.gp_y_latest = financial.gp[financial.gp.length - 1];

        s.ptp_y_array = financial.ptp;
        s.ptp_y_latest = financial.ptp[financial.ptp.length - 1];

        s.ebitda_y_array = financial.ebitda;
        s.ebitda_y_latest = financial.ebitda[financial.ebitda.length - 1];

        // Ebitda Growth %
        let final_ebitdaGrowth_array = [];
        for (let d = 0; d < financial.ebitda.length; d++) {
            if (financial.ebitda[d] && financial.ebitda[d + 1]) {
                let ebitda_pct =
                    parseFloat((financial.ebitda[d + 1] - financial.ebitda[d]) / financial.ebitda[d]) * 100; // ( Q2 - Q1 ) / Q1 * 100, ( Q3 - Q2 ) / Q2 * 100, ( Q4 - Q3 ) / Q3 * 100
                final_ebitdaGrowth_array.push(ebitda_pct);
            };
        };
        s.ebitdaGrowth_y_array = final_ebitdaGrowth_array;
        s.ebitdaGrowth_y_latest = final_ebitdaGrowth_array[final_ebitdaGrowth_array.length - 1];

        // EBITDA Margin Percent
        let final_ebitdaMargin_array = [];
        for (let e = 0; e < financial.gp.length; e++) {
            if (financial.ebitda[e] && financial.sales[e]) {
                let ebitda_margin = parseFloat(financial.ebitda[e] / financial.sales[e]);
                final_ebitdaMargin_array.push(ebitda_margin);
            };
        };
        s.ebitdaMargin_y_array = final_ebitdaMargin_array;
        s.ebitdaMargin_y_latest = final_ebitdaMargin_array[final_ebitdaMargin_array.length - 1];


        // EBITDA Margin Growth Percent
        let final_ebitdaMargin_growth_array = [];
        for (let b = 0; b < financial.gp.length; b++) {
            if (financial.ebitda[b] && financial.sales[b]) {
                if (financial.ebitda[b + 1] && financial.sales[b + 1]) {
                    let ebitda_margin_growth = parseFloat(((financial.ebitda[b + 1] / financial.sales[b + 1]) - (financial.ebitda[b] / financial.sales[b])) / (financial.ebitda[b] / financial.sales[b]));
                    final_ebitdaMargin_growth_array.push(ebitda_margin_growth);
                };
            };
        };
        s.ebitdaMarginGrowth_y_array = final_ebitdaMargin_growth_array;
        s.ebitdaMarginGrowth_y_latest = final_ebitdaMargin_growth_array[final_ebitdaMargin_growth_array.length - 1];



        s.ebit_y_array = financial.ebit;
        s.ebit_y_latest = financial.ebit[financial.ebit.length - 1];
        // Ebit Growth
        let final_ebitGrowth_array = [];
        for (let d = 0; d < financial.ebit.length; d++) {
            if (financial.ebit[d] && financial.ebit[d + 1]) {
                let ebit_pct =
                    parseFloat((financial.ebit[d + 1] - financial.ebit[d]) / financial.ebit[d]) * 100; // ( Q2 - Q1 ) / Q1 * 100, ( Q3 - Q2 ) / Q2 * 100, ( Q4 - Q3 ) / Q3 * 100
                final_ebitGrowth_array.push(ebit_pct);
            };
        };
        s.ebitGrowth_y_array = final_ebitGrowth_array;
        s.ebitGrowth_y_latest = final_ebitGrowth_array[final_ebitGrowth_array.length - 1];
        // Ebit Margin
        let final_ebitMargin_array = [];
        for (let e = 0; e < financial.ebit.length; e++) {
            if (financial.ebit[e] && financial.sales[e]) {
                let ebit_margin = parseFloat(financial.ebit[e] / financial.sales[e]);
                final_ebitMargin_array.push(ebit_margin);
            };
        };
        s.ebitMargin_y_array = final_ebitMargin_array;
        s.ebitMargin_y_latest = final_ebitMargin_array[final_ebitMargin_array.length - 1];
        // EBIT Margin Growth Percent
        let final_ebitMargin_growth_array = [];
        for (let b = 0; b < financial.ebit.length; b++) {
            if (financial.ebit[b] && financial.sales[b]) {
                if (financial.ebit[b + 1] && financial.sales[b + 1]) {
                    let ebit_margin_growth = parseFloat(((financial.ebit[b + 1] / financial.sales[b + 1]) - (financial.ebit[b] / financial.sales[b])) / (financial.ebit[b] / financial.sales[b]));
                    final_ebitMargin_growth_array.push(ebit_margin_growth);
                };
            };
        };
        s.ebitMarginGrowth_y_array = final_ebitMargin_growth_array;
        s.ebitMarginGrowth_y_latest = final_ebitMargin_growth_array[final_ebitMargin_growth_array.length - 1];


        s.np_y_array = financial.profit;
        s.np_y_latest = financial.profit[financial.profit.length - 1];
        // Profit Growth Percent
        let final_profitGrowth_array = [];
        for (let d = 0; d < financial.profit.length; d++) {
            if (financial.profit[d] && financial.profit[d + 1]) {
                let profit_pct =
                    parseFloat((financial.profit[d + 1] - financial.profit[d]) / financial.profit[d]) * 100; // ( Q2 - Q1 ) / Q1 * 100, ( Q3 - Q2 ) / Q2 * 100, ( Q4 - Q3 ) / Q3 * 100
                final_profitGrowth_array.push(profit_pct);
            };
        };
        s.npGrowth_y_array = final_profitGrowth_array;
        s.npGrowth_y_latest = final_profitGrowth_array[final_profitGrowth_array.length - 1];
        // This part is for Profit Margin Percent in Screener page
        let final_profitMargin_array = [];
        for (let e = 0; e < financial.profit.length; e++) {
            if (financial.profit[e] && financial.sales[e]) {
                let profit_margin = parseFloat(financial.profit[e] / financial.sales[e]);
                final_profitMargin_array.push(profit_margin);
            };
        };
        s.npMargin_y_array = final_profitMargin_array;
        s.npMargin_y_latest = final_profitMargin_array[final_profitMargin_array.length - 1];
        // This part is for Profit Margin Growth Percent in Screener page
        let final_profitMargin_growth_array = [];
        for (let b = 0; b < financial.profit.length; b++) {
            if (financial.profit[b] && financial.sales[b]) {
                if (financial.profit[b + 1] && financial.sales[b + 1]) {
                    let profit_margin_growth = parseFloat(((financial.profit[b + 1] / financial.sales[b + 1]) - (financial.profit[b] / financial.sales[b])) / (financial.profit[b] / financial.sales[b]));
                    final_profitMargin_growth_array.push(profit_margin_growth);
                };
            };
        };
        s.npMarginGrowth_y_array = final_profitMargin_growth_array;
        s.npMarginGrowth_y_latest = final_profitMargin_growth_array[final_profitMargin_growth_array.length - 1];


        s.cash_y_array = financial.cce;
        s.cash_y_latest = financial.cce[financial.cce.length - 1];


        // Gross Profit
        s.grossProfit_y_array = financial.gp;
        s.grossProfit_y_latest = financial.gp[financial.gp.length - 1];

        // Gross Profit %
        let final_grossGrowth_array = [];
        for (let i = 0; i < financial.gp.length; i++) {
            if (financial.gp[i] && financial.gp[i + 1]) {
                let gp_pct =
                    parseFloat((financial.gp[i + 1] - financial.gp[i]) / financial.gp[i]) * 100;
                final_grossGrowth_array.push(gp_pct);
            }
        }
        s.grossProfitGrowth_y_array = final_grossGrowth_array;
        s.grossProfitGrowth_y_latest = final_grossGrowth_array[final_grossGrowth_array.length - 1];


        // Gross Margin
        let final_grossMargin_array = [];
        for (let a = 0; a < financial.gp.length; a++) {
            if (financial.gp[a] && financial.sales[a]) {
                let gm = parseFloat(financial.gp[a] / financial.sales[a]);
                final_grossMargin_array.push(gm);
            } else {
                final_grossMargin_array.push(0);
            }
        }
        s.grossMargin_y_array = final_grossMargin_array;
        s.grossMargin_y_latest = final_grossMargin_array[final_grossMargin_array.length - 1];


        // Gross Margin Growth Percent
        let final_grossMargin_growth_array = [];
        for (let b = 0; b < financial.gp.length; b++) {
            if (financial.gp[b] && financial.sales[b]) {
                if (financial.gp[b + 1] && financial.sales[b + 1]) {
                    let gmg = parseFloat(((financial.gp[b + 1] / financial.sales[b + 1]) - (financial.gp[b] / financial.sales[b])) / (financial.gp[b] / financial.sales[b]));
                    final_grossMargin_growth_array.push(gmg);
                }
            } else {
                final_grossMargin_growth_array.push(0);
            }
        }
        s.grossMarginGrowth_y_array = final_grossMargin_growth_array;
        s.grossMarginGrowth_y_latest = final_grossMargin_growth_array[final_grossMargin_growth_array.length - 1];


        // COGS
        let final_cogs_array = [];
        for (let c = 0; c < financial.gp.length; c++) {
            if (financial.gp[c] && financial.sales[c]) {
                let cogs = parseFloat(financial.gp[c] - financial.sales[c]);
                final_cogs_array.push(cogs);
            } else {
                final_cogs_array.push(0);
            };
        };
        s.cogs_y_array = final_cogs_array;
        s.cogs_y_latest = final_cogs_array[final_cogs_array.length - 1];


        // eps for year
        let final_eps_array_temp = financial.eps;
        let final_eps_y_array = [];
        final_eps_array_temp.map(ele => {
            final_eps_y_array.push(ele);
        })
        s.eps_y_array = final_eps_y_array;
        s.eps_y_latest = financial.eps[financial.eps.length - 1];


        // Intangable Assets
        let final_ia_array = financial.intangibleasset;
        s.ia_y_array = final_ia_array;
        s.ia_y_latest = final_ia_array[final_ia_array.length - 1];

        // Material Assets
        let final_ma_array = financial.fixedasset;
        s.ma_y_array = final_ma_array;
        s.ma_y_latest = final_ma_array[final_ma_array.length - 1];

        // Financial Assets
        let final_fa_array = financial.financialasset;
        s.fa_y_array = final_fa_array;
        s.fa_y_latest = final_fa_array[final_fa_array.length - 1];

        // Tangible Assets
        let final_ta_array = financial.noncurrentasset;
        s.ta_y_array = final_ta_array;
        s.ta_y_latest = final_ta_array[final_ta_array.length - 1];

        // Current Assets
        let final_currentAssets_array = financial.othercurrentassets;
        s.ca_y_array = final_currentAssets_array;
        s.ca_y_latest = final_currentAssets_array[final_currentAssets_array.length - 1];


        // Total Equity & Liabilities
        let final_tel_array = financial.totalequityandliabilities;
        s.tel_y_array = final_tel_array;
        s.tel_y_latest = final_tel_array[final_tel_array.length - 1];


        // Total Assets
        let final_totalAssets_array = financial.totalassets;
        s.totalAssets_y_array = final_totalAssets_array;
        s.totalAssets_y_latest = final_totalAssets_array[final_totalAssets_array.length - 1];


        // Total Equity
        let final_totalEquity_array = financial.shequity;
        s.totalEquity_y_array = final_totalEquity_array;
        s.totalEquity_y_latest = final_totalEquity_array[final_totalEquity_array.length - 1];


        // Long Term Debt
        let final_ltd_array = financial.ltliabilities;
        s.ltd_y_array = final_ltd_array;
        s.ltd_y_latest = final_ltd_array[final_ltd_array.length - 1];


        // Short Term Debt
        let final_std_array = financial.curliabilities;
        s.std_y_array = final_std_array;
        s.std_y_latest = final_std_array[final_std_array.length - 1];


        // Sales per Share
        let final_sales_per_share_array = [];
        for (let j = 0; j < financial.sales.length; j++) {
            if (financial.totalnumberofshares[j] && financial.sales[j]) {
                let sales_per_share = parseFloat(financial.sales[j] / financial.totalnumberofshares[j]);
                final_sales_per_share_array.push(sales_per_share);
            } else {
                (final_sales_per_share_array.push(0));
            };
        };
        s.sps_y_array = final_sales_per_share_array;
        s.sps_y_latest = final_sales_per_share_array[final_sales_per_share_array.length - 1];


        // Number of Stocks
        let final_nos_array = financial.totalnumberofshares;
        s.nos_y_array = final_nos_array;
        s.nos_y_latest = final_nos_array[final_nos_array.length - 1];


        // Number of stocks growth Percent
        let final_totalnumberofshareGrowth_array = [];
        for (let d = 0; d < financial.totalnumberofshares.length; d++) {
            if (financial.totalnumberofshares[d] && financial.totalnumberofshares[d + 1]) {
                let totalnumberofshares_pct =
                    parseFloat((financial.totalnumberofshares[d + 1] - financial.totalnumberofshares[d]) / financial.totalnumberofshares[d]) * 100; // ( Q2 - Q1 ) / Q1 * 100, ( Q3 - Q2 ) / Q2 * 100, ( Q4 - Q3 ) / Q3 * 100
                final_totalnumberofshareGrowth_array.push(totalnumberofshares_pct);
            };
        };
        s.nosg_y_array = final_totalnumberofshareGrowth_array;
        s.nosg_y_latest = final_totalnumberofshareGrowth_array[final_totalnumberofshareGrowth_array.length - 1];

        // ROE percent
        let final_roe_array = [];
        for (let j = 0; j < financial.sales.length; j++) {
            if (financial.ebit[j] && financial.shequity[j]) {
                let roe = parseFloat(financial.ebit[j] / financial.shequity[j]);
                final_roe_array.push(roe);
            } else {
                (final_roe_array.push(0));
            };
        };
        s.roe_y_array = final_roe_array;
        s.roe_y_latest = final_roe_array[final_roe_array.length - 1];


        // ROA percent
        let final_roa_array = [];
        for (let j = 0; j < financial.sales.length; j++) {
            if (financial.ptp[j] && financial.totalassets[j]) {
                let roa = parseFloat(financial.ptp[j] / financial.totalassets[j]);
                final_roa_array.push(roa);
            } else {
                (final_roa_array.push(0));
            };
        };
        s.roa_y_array = final_roa_array;
        s.roa_y_latest = final_roa_array[final_roa_array.length - 1];


        // Net debt
        let final_netDebt_array = [];
        for (let j = 0; j < financial.totalassets.length; j++) {
            if (financial.totalassets[j]) {
                let netDebt = parseFloat((financial.curliabilities[j] + financial.ltliabilities[j] - financial.cce[j]) / financial.totalassets[j]); // (curliabilities + ltliabiliites - cce) / totalassets
                final_netDebt_array.push(netDebt);
            } else {
                (final_netDebt_array.push(0));
            };
        };
        s.netDebt_y_array = final_netDebt_array;
        s.netDebt_y_latest = final_netDebt_array[final_netDebt_array.length - 1];
        return s;
    },
    async mapStocksAndFinancials(company_id_array) {
        let mapExchanges = new Map();
        const mapExchangeData = await exchangeService.fetchStockExchanges();
        mapExchangeData.forEach((exchange) => {
            mapExchanges.set(exchange.id, exchange);
        });

        let mapCompanies = new Map();
        const mapCompaniesData = await companiesServices.getCompaniesAndReports(company_id_array);
        mapCompaniesData.forEach((company) => {
            mapCompanies.set(company.company_id, company);
        });

        let arrayStocks = [];
        let arrayFinancials = await CompanyReportFinancialsService.fetchMapFinancials();
        let arrayFinancials_year = await CompanyReportFinancialsService.fetchMapFinancialsYear();

        const responseStocks = await this.stocksWithCompanyIDArray(company_id_array);

        let sectors_array = await sectorService.fetchSectorsTree();

        responseStocks.forEach((st) => {
            let s = st.dataValues;
            s.columns = ''; // it is for AddColumns btn.
            s.sector_name = 'no sector';
            for (let i = 0; i < sectors_array.length; i++) {
                if (s.sector_id == sectors_array[i].dataValues.id) {
                    s.sector_name = sectors_array[i].dataValues.name;
                }
            };

            let exchange = mapExchanges.get(s.stock_exchange_id); // map.get() to get exchange name
            s.exchange = exchange ? exchange.name : "no Exchange"; // if the value is undefined add ---> "no Exchange"
            s.country = exchange ? exchange.country : "none";

            // add fileds for ag-grid columns
            if (mapCompanies.get(s.company_id)) {
                s.market_cap = Number(mapCompanies.get(s.company_id).market_cap); // map.get() on mapCompanies to get the market cap
                s.description = mapCompanies.get(s.company_id).description;
                s.next_report_date = mapCompanies.get(s.company_id).next_report_date;
                s.last_report_date = mapCompanies.get(s.company_id).last_report_date;
            } else {
                s.market_cap = 0;
                s.description = "There is no description.";
                s.next_report_date = null;
                s.last_report_date = null;
            }
            let financial = arrayFinancials.find(financial => financial.company_id[0] === s.company_id);
            if (financial) {
                let s1 = this._func1(s, financial);
                s = {...s, s1 };
            }
            financial = arrayFinancials_year.find(financial => financial.company_id[0] === s.company_id);
            if (financial) {
                let s2 = this._func2(s, financial);
                s = {...s, s2 };
            }
            arrayStocks.push(s);
        })

        return arrayStocks;
    },

    async fetchStocks(is_All = true) {
        let mapExchanges = new Map();
        const mapExchangeData = await exchangeService.fetchStockExchanges();
        mapExchangeData.forEach((exchange) => {
            mapExchanges.set(exchange.id, exchange);
        });

        let mapCompanies = new Map();
        const mapCompaniesData = await companiesServices.getCompaniesAll();
        mapCompaniesData.forEach((company) => {
            mapCompanies.set(company.company_id, company);
        });

        let arrayStocks = [];
        let arrayFinancials = await CompanyReportFinancialsService.fetchMapFinancials();
        let arrayFinancials_year = await CompanyReportFinancialsService.fetchMapFinancialsYear();

        const responseStocks = await this.list(is_All);

        let sectors_array = await sectorService.fetchSectorsTree();

        responseStocks.forEach((st) => {
            let s = st.dataValues;
            s.columns = ''; // it is for AddColumns btn.
            s.sector_name = 'no sector';
            for (let i = 0; i < sectors_array.length; i++) {
                if (s.sector_id == sectors_array[i].dataValues.id) {
                    s.sector_name = sectors_array[i].dataValues.name;
                }
            };

            let exchange = mapExchanges.get(s.stock_exchange_id); // map.get() to get exchange name
            s.exchange = exchange ? exchange.name : "no Exchange"; // if the value is undefined add ---> "no Exchange"
            s.country = exchange ? exchange.country : "none";

            // add fileds for ag-grid columns
            if (mapCompanies.get(s.company_id)) {
                s.market_cap = Number(mapCompanies.get(s.company_id).market_cap); // map.get() on mapCompanies to get the market cap
                s.description = mapCompanies.get(s.company_id).description;
                s.next_report_date = mapCompanies.get(s.company_id).next_report_date;
                s.last_report_date = mapCompanies.get(s.company_id).last_report_date;
            } else {
                s.market_cap = 0;
                s.description = "There is no description.";
                s.next_report_date = null;
                s.last_report_date = null;
            }
            let financial = arrayFinancials.find(financial => financial.company_id[0] === s.company_id);
            if (financial) {
                let s1 = this._func1(s, financial);
                s = {...s, s1 };
            }
            financial = arrayFinancials_year.find(financial => financial.company_id[0] === s.company_id);
            if (financial) {
                let s2 = this._func2(s, financial);
                s = {...s, s2 };
            }
            arrayStocks.push(s);
        })

        return arrayStocks;

        // let mapExchanges = new Map();
        // const mapExchangeData = await exchangeService.fetchStockExchanges();
        // mapExchangeData.forEach((exchange) => {
        //     mapExchanges.set(exchange.id, exchange);
        // });

        // let mapCompanies = new Map();
        // const mapCompaniesData = await companiesServices.getCompaniesAll();
        // mapCompaniesData.forEach((company) => {
        //     mapCompanies.set(company.company_id, company);
        // });

        // let arrayStocks = [];
        // let arrayFinancials = await CompanyReportFinancialsService.fetchMapFinancials();
        // let arrayFinancials_year = await CompanyReportFinancialsService.fetchMapFinancialsYear();

        // const responseStocks = await this.list();

        // let sectors_array = await sectorService.fetchSectorsTree();

        // await responseStocks.forEach((st) => {
        //     let s = st.dataValues;
        //     s.columns = ''; // it is for AddColumns btn.
        //     s.sector_name = 'no sector';
        //     for (let i = 0; i < sectors_array.length; i++) {
        //         if (s.sector_id == sectors_array[i].dataValues.id) {
        //             s.sector_name = sectors_array[i].dataValues.name;
        //         }
        //     };

        //     let exchange = mapExchanges.get(s.stock_exchange_id); // map.get() to get exchange name
        //     s.exchange = exchange ? exchange.name : "no Exchange"; // if the value is undefined add ---> "no Exchange"
        //     s.country = exchange ? exchange.country : "none";

        //     // add fileds for ag-grid columns
        //     if (mapCompanies.get(s.company_id)) {
        //         s.market_cap = mapCompanies.get(s.company_id).market_cap; // map.get() on mapCompanies to get the market cap
        //         s.description = mapCompanies.get(s.company_id).description;
        //         s.next_report_date = mapCompanies.get(s.company_id).next_report_date;
        //         s.last_report_date = mapCompanies.get(s.company_id).last_report_date;
        //     } else {
        //         s.market_cap = 0;
        //         s.description = "There is no description.";
        //         s.next_report_date = null;
        //         s.last_report_date = null;
        //     }

        //     arrayFinancials.forEach((financial) => {
        //         if (s.company_id == financial.company_id[0]) {
        //             // This part is for profit-margin in Screener page
        //             if (financial.profit[financial.profit.length - 1] == 0 || financial.sales[financial.sales.length - 1] == 0) {
        //                 s.profit_margin = '0';
        //             } else {
        //                 s.profit_margin = ~~(financial.profit[financial.profit.length - 1] / financial.sales[financial.sales.length - 1]) // float to int using ~~
        //             }

        //             // This part is for Sales Growth percentage in Screener page
        //             let final_salesGrowth_array = [];
        //             for (let i = 0; i < financial.sales.length; i++) {
        //                 if (financial.sales[i] && financial.sales[i + 1]) {
        //                     // ( Q2 - Q1 ) / Q1 * 100, ( Q3 - Q2 ) / Q2 * 100, ( Q4 - Q3 ) / Q3 * 100
        //                     let sales_pct = parseFloat((((financial.sales[i + 1] - financial.sales[i]) / financial.sales[i]) * 100));
        //                     final_salesGrowth_array.push(sales_pct);
        //                 }
        //             }
        //             s.salesGrowth_q_array = final_salesGrowth_array;
        //             s.salesGrowth_q_latest = final_salesGrowth_array[final_salesGrowth_array.length - 1];

        //             let salesGrowth_ttm_array = [];
        //             for (let i = 0; i < final_salesGrowth_array.length; i++) {
        //                 if (final_salesGrowth_array[i + 3]) {
        //                     let ttm = parseFloat((final_salesGrowth_array[i + 3] + final_salesGrowth_array[i + 2] + final_salesGrowth_array[i + 1] + final_salesGrowth_array[i])) * 10;
        //                     salesGrowth_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.salesGrowth_t_array = salesGrowth_ttm_array;
        //             s.salesGrowth_t_latest = salesGrowth_ttm_array[salesGrowth_ttm_array.length - 1];



        //             // Gross Profit
        //             let final_grossProfit_array = financial.gp;
        //             s.grossProfit_q_array = final_grossProfit_array;
        //             s.grossProfit_q_latest = (final_grossProfit_array[final_grossProfit_array.length - 1] !== null) ? (final_grossProfit_array[final_grossProfit_array.length - 1]) : null;

        //             let grossProfit_ttm_array = [];
        //             for (let i = 0; i < final_grossProfit_array.length; i++) {
        //                 if (final_grossProfit_array[i + 3]) {
        //                     let ttm = parseFloat((final_grossProfit_array[i + 3] + final_grossProfit_array[i + 2] + final_grossProfit_array[i + 1] + final_grossProfit_array[i])) * 10;
        //                     grossProfit_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.grossProfit_t_array = grossProfit_ttm_array;
        //             s.grossProfit_t_latest = grossProfit_ttm_array[grossProfit_ttm_array.length - 1];



        //             // Gross Profit %
        //             let final_grossGrowth_array = [];
        //             for (let i = 0; i < financial.gp.length; i++) {
        //                 if (financial.gp[i] && financial.gp[i + 1]) {
        //                     let gp_pct =
        //                         parseFloat((((financial.gp[i + 1] - financial.gp[i]) / financial.gp[i]) * 100)); // ( Q2 - Q1 ) / Q1 * 100, ( Q3 - Q2 ) / Q2 * 100, ( Q4 - Q3 ) / Q3 * 100
        //                     final_grossGrowth_array.push(gp_pct);
        //                 }
        //             }
        //             s.grossProfitGrowth_q_array = final_grossGrowth_array;
        //             s.grossProfitGrowth_q_latest = final_grossGrowth_array[final_grossGrowth_array.length - 1];

        //             let grossProfitGrowth_ttm_array = [];
        //             for (let i = 0; i < final_grossGrowth_array.length; i++) {
        //                 if (final_grossGrowth_array[i + 3]) {
        //                     let ttm = parseFloat((final_grossGrowth_array[i + 3] + final_grossGrowth_array[i + 2] + final_grossGrowth_array[i + 1] + final_grossGrowth_array[i])) * 10;
        //                     grossProfitGrowth_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.grossProfitGrowth_t_array = grossProfitGrowth_ttm_array;
        //             s.grossProfitGrowth_t_latest = grossProfitGrowth_ttm_array[grossProfitGrowth_ttm_array.length - 1];





        //             // Gross Margin
        //             let final_grossMargin_array = [];
        //             for (let a = 0; a < financial.gp.length; a++) {
        //                 if (financial.gp[a] && financial.sales[a]) {
        //                     let gm_pct = parseFloat(((financial.gp[a] / financial.sales[a])) * 100);
        //                     final_grossMargin_array.push(gm_pct);
        //                 } else {
        //                     final_grossMargin_array.push(0);
        //                 }
        //             }
        //             s.grossMargin_q_array = final_grossMargin_array;
        //             s.grossMargin_q_latest = final_grossMargin_array[final_grossMargin_array.length - 1];

        //             let grossMargin_ttm_array = [];
        //             for (let i = 0; i < final_grossMargin_array.length; i++) {
        //                 if (final_grossMargin_array[i + 3]) {
        //                     let ttm = parseFloat((final_grossMargin_array[i + 3] + final_grossMargin_array[i + 2] + final_grossMargin_array[i + 1] + final_grossMargin_array[i])) * 10;
        //                     grossMargin_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.grossMargin_t_array = grossMargin_ttm_array;
        //             s.grossMargin_t_latest = grossMargin_ttm_array[grossMargin_ttm_array.length - 1];


        //             // Gross Margin Growth Percent
        //             let final_grossMargin_growth_array = [];
        //             for (let b = 0; b < financial.gp.length; b++) {
        //                 if (financial.gp[b] && financial.sales[b]) {
        //                     if (financial.gp[b + 1] && financial.sales[b + 1]) {
        //                         let gmg_pct = parseFloat(((((financial.gp[b + 1] / financial.sales[b + 1]) - (financial.gp[b] / financial.sales[b])) / (financial.gp[b] / financial.sales[b])) * 100));
        //                         final_grossMargin_growth_array.push(gmg_pct);
        //                     }
        //                 } else {
        //                     final_grossMargin_growth_array.push(0);
        //                 }
        //             }
        //             s.grossMarginGrowth_q_array = final_grossMargin_growth_array;
        //             s.grossMarginGrowth_q_latest = final_grossMargin_growth_array[final_grossMargin_growth_array.length - 1];

        //             let grossMarginGrowth_ttm_array = [];
        //             for (let i = 0; i < final_grossMargin_growth_array.length; i++) {
        //                 if (final_grossMargin_growth_array[i + 3]) {
        //                     let ttm = parseFloat((final_grossMargin_growth_array[i + 3] + final_grossMargin_growth_array[i + 2] + final_grossMargin_growth_array[i + 1] + final_grossMargin_growth_array[i])) * 10;
        //                     grossMarginGrowth_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.grossMarginGrowth_t_array = grossMarginGrowth_ttm_array;
        //             s.grossMarginGrowth_t_latest = grossMarginGrowth_ttm_array[grossMarginGrowth_ttm_array.length - 1];



        //             // COGS
        //             let final_cogs_array = [];
        //             for (let c = 0; c < financial.gp.length; c++) {
        //                 if (financial.gp[c] && financial.sales[c]) {
        //                     let cogs = parseFloat((financial.gp[c] - financial.sales[c]));
        //                     final_cogs_array.push(cogs);
        //                 } else {
        //                     final_cogs_array.push(0);
        //                 };
        //             };
        //             s.cogs_q_array = final_cogs_array;
        //             s.cogs_q_latest = final_cogs_array[final_cogs_array.length - 1];

        //             let cogs_ttm_array = [];
        //             for (let i = 0; i < final_cogs_array.length; i++) {
        //                 if (final_cogs_array[i + 3]) {
        //                     let ttm = parseFloat((final_cogs_array[i + 3] + final_cogs_array[i + 2] + final_cogs_array[i + 1] + final_cogs_array[i])) * 10;
        //                     cogs_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.cogs_t_array = cogs_ttm_array;
        //             s.cogs_t_latest = cogs_ttm_array[cogs_ttm_array.length - 1];




        //             // Current Assets
        //             let final_currentAssets_array = financial.othercurrentassets;
        //             s.ca_q_array = final_currentAssets_array;
        //             s.ca_q_latest = (final_currentAssets_array[final_currentAssets_array.length - 1] !== null) ? (final_currentAssets_array[final_currentAssets_array.length - 1]) : null;
        //             let ca_ttm_array = [];
        //             for (let i = 0; i < final_currentAssets_array.length; i++) {
        //                 if (final_currentAssets_array[i + 3]) {
        //                     let ttm = parseFloat((final_currentAssets_array[i + 3] + final_currentAssets_array[i + 2] + final_currentAssets_array[i + 1] + final_currentAssets_array[i])) * 10;
        //                     ca_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.ca_t_array = ca_ttm_array;
        //             s.ca_t_latest = ca_ttm_array[ca_ttm_array.length - 1];



        //             // Total Equity & Liabilities
        //             let final_tel_array = financial.totalequityandliabilities;
        //             s.tel_q_array = final_tel_array;
        //             s.tel_q_latest = (final_tel_array[final_tel_array.length - 1] !== null) ? (final_tel_array[final_tel_array.length - 1]) : null;
        //             let tel_ttm_array = [];
        //             for (let i = 0; i < final_tel_array.length; i++) {
        //                 if (final_tel_array[i + 3]) {
        //                     let ttm = parseFloat((final_tel_array[i + 3] + final_tel_array[i + 2] + final_tel_array[i + 1] + final_tel_array[i])) * 10;
        //                     tel_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.tel_t_array = tel_ttm_array;
        //             s.tel_t_latest = tel_ttm_array[tel_ttm_array.length - 1];



        //             // This part is for Total debt in Screener page
        //             let final_totalDebt_array = [];
        //             for (let i = 0; i < financial.ltliabilities.length; i++) {
        //                 if (financial.ltliabilities[i]) {
        //                     let totalDebt = (parseInt(financial.ltliabilities[i]) + parseInt(financial.curliabilities[i]));
        //                     final_totalDebt_array.push(totalDebt);
        //                 } else {
        //                     final_totalDebt_array.push(0);
        //                 };
        //             };
        //             s.totalDebt_q_array = final_totalDebt_array;
        //             s.totalDebt_q_latest = final_totalDebt_array[final_totalDebt_array.length - 1];

        //             let totalDebt_ttm_array = [];
        //             for (let i = 0; i < final_totalDebt_array.length; i++) {
        //                 if (final_totalDebt_array[i + 3]) {
        //                     let ttm = parseFloat((final_totalDebt_array[i + 3] + final_totalDebt_array[i + 2] + final_totalDebt_array[i + 1] + final_totalDebt_array[i])) * 10;
        //                     totalDebt_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.totalDebt_t_array = totalDebt_ttm_array;
        //             s.totalDebt_t_latest = totalDebt_ttm_array[totalDebt_ttm_array.length - 1];




        //             // This part is for P/B in Screener page
        //             let final_pb_array = [];
        //             for (let j = 0; j < financial.price.length; j++) {
        //                 if (financial.totalnumberofshares[j] && financial.shequity[j] && financial.price[j]) {
        //                     let pb = parseFloat(((financial.price[j] / financial.shequity[j]) * financial.totalnumberofshares[j]));
        //                     final_pb_array.push(pb);
        //                 } else {
        //                     (final_pb_array.push(0));
        //                 };
        //             };
        //             s.pb_q_array = final_pb_array;
        //             s.pb_q_latest = final_pb_array[final_pb_array.length - 1]

        //             let pb_ttm_array = []
        //             for (let i = 0; i < final_pb_array.length; i++) {
        //                 if (final_pb_array[i + 3]) {
        //                     let ttm = parseFloat(final_pb_array[i + 3] + final_pb_array[i + 2] + final_pb_array[i + 1] + final_pb_array[i])
        //                     pb_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.pb_t_array = pb_ttm_array;
        //             s.pb_t_latest = pb_ttm_array[pb_ttm_array.length - 1];





        //             // This part is for Enterprise Value in Screener page
        //             let final_enterprise_array = [];
        //             for (let j = 0; j < financial.price.length; j++) {
        //                 let enterprise = parseFloat(((financial.totalnumberofshares[j] * financial.price[j]) + (financial.ibl[j] - financial.cce[j])));
        //                 final_enterprise_array.push(enterprise);
        //             };
        //             s.enterprise_q_array = final_enterprise_array;
        //             s.enterprise_q_latest = final_enterprise_array[final_enterprise_array.length - 1];

        //             let enterprise_ttm_array = [];
        //             for (let i = 0; i < final_enterprise_array.length; i++) {
        //                 if (final_enterprise_array[i + 3]) {
        //                     let ttm = parseFloat(final_enterprise_array[i + 3] + final_enterprise_array[i + 2] + final_enterprise_array[i + 1] + final_enterprise_array[i]);
        //                     enterprise_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.enterprise_t_array = enterprise_ttm_array;
        //             s.enterprise_t_latest = enterprise_ttm_array[enterprise_ttm_array.length - 1];






        //             // This part is for EV/EBIT in Screener page
        //             let final_ev_ebit_array = [];
        //             for (let j = 0; j < financial.price.length; j++) {
        //                 if (financial.ebit[j]) {
        //                     let ev_ebit = parseFloat((((financial.totalnumberofshares[j] * financial.price[j]) + (financial.ibl[j] - financial.cce[j])) / financial.ebit[j]));
        //                     final_ev_ebit_array.push(ev_ebit);
        //                 } else {
        //                     final_ev_ebit_array.push(0);
        //                 };
        //             };
        //             s.ev_ebit_q_array = final_ev_ebit_array;
        //             s.ev_ebit_q_latest = final_ev_ebit_array[final_ev_ebit_array.length - 1];

        //             let ev_ebit_ttm_array = [];
        //             for (let i = 0; i < final_ev_ebit_array.length; i++) {
        //                 if (final_ev_ebit_array[i + 3]) {
        //                     let ttm = parseFloat(final_ev_ebit_array[i + 3] + final_ev_ebit_array[i + 2] + final_ev_ebit_array[i + 1] + final_ev_ebit_array[i]);
        //                     ev_ebit_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.ev_ebit_t_array = ev_ebit_ttm_array;
        //             s.ev_ebit_t_latest = ev_ebit_ttm_array[ev_ebit_ttm_array.length - 1];



        //             // This part is for EV/EBITDA in Screener page
        //             let final_ev_ebitda_array = [];
        //             for (let j = 0; j < financial.price.length; j++) {
        //                 if (financial.ebitda[j]) {
        //                     let ev_ebitda = parseFloat(((financial.totalnumberofshares[j] * financial.price[j]) + (financial.ibl[j] - financial.cce[j])) / financial.ebitda[j]);
        //                     final_ev_ebitda_array.push(ev_ebitda);
        //                 } else {
        //                     final_ev_ebitda_array.push(0);
        //                 }
        //             }
        //             s.ev_ebitda_q_array = final_ev_ebitda_array;
        //             s.ev_ebitda_q_latest = final_ev_ebitda_array[final_ev_ebitda_array.length - 1];

        //             let ev_ebitda_ttm_array = [];
        //             for (let i = 0; i < final_ev_ebitda_array.length; i++) {
        //                 if (final_ev_ebitda_array[i + 3]) {
        //                     let ttm = parseFloat(final_ev_ebitda_array[i + 3] + final_ev_ebitda_array[i + 2] + final_ev_ebitda_array[i + 1] + final_ev_ebitda_array[i]);
        //                     ev_ebitda_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.ev_ebitda_t_array = ev_ebitda_ttm_array;
        //             s.ev_ebitda_t_latest = ev_ebitda_ttm_array[ev_ebitda_ttm_array.length - 1];




        //             // Sales per Share
        //             let final_sales_per_share_array = [];
        //             for (let j = 0; j < financial.sales.length; j++) {
        //                 if (financial.totalnumberofshares[j] && financial.sales[j]) {
        //                     let sales_per_share = parseFloat(financial.sales[j] / financial.totalnumberofshares[j]);
        //                     final_sales_per_share_array.push(sales_per_share);
        //                 } else {
        //                     (final_sales_per_share_array.push(0));
        //                 };
        //             };
        //             s.sps_q_array = final_sales_per_share_array;
        //             s.sps_q_latest = final_sales_per_share_array[final_sales_per_share_array.length - 1];
        //             let sps_ttm_array = [];
        //             for (let i = 0; i < final_sales_per_share_array.length; i++) {
        //                 if (final_sales_per_share_array[i + 3]) {
        //                     let ttm = parseFloat(final_sales_per_share_array[i + 3] + final_sales_per_share_array[i + 2] + final_sales_per_share_array[i + 1] + final_sales_per_share_array[i]);
        //                     sps_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.sps_t_array = sps_ttm_array;
        //             s.sps_t_latest = sps_ttm_array[sps_ttm_array.length - 1];


        //             // Number of Stocks
        //             let final_nos_array = financial.totalnumberofshares;
        //             s.nos_q_array = final_nos_array;
        //             s.nos_q_latest = final_nos_array[final_nos_array.length - 1];
        //             let nos_ttm_array = [];
        //             for (let i = 0; i < final_nos_array.length; i++) {
        //                 if (final_nos_array[i + 3]) {
        //                     let ttm = parseFloat(final_nos_array[i + 3] + final_nos_array[i + 2] + final_nos_array[i + 1] + final_nos_array[i]) * 10;
        //                     nos_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.nos_t_array = tel_ttm_array;
        //             s.nos_t_latest = tel_ttm_array[tel_ttm_array.length - 1];


        //             // Number of stocks growth Percent
        //             let final_totalnumberofshareGrowth_array = [];
        //             for (let d = 0; d < financial.totalnumberofshares.length; d++) {
        //                 if (financial.totalnumberofshares[d] && financial.totalnumberofshares[d + 1]) {
        //                     let totalnumberofshares_pct =
        //                         parseFloat(((financial.totalnumberofshares[d + 1] - financial.totalnumberofshares[d]) / financial.totalnumberofshares[d]) * 100); // ( Q2 - Q1 ) / Q1 * 100, ( Q3 - Q2 ) / Q2 * 100, ( Q4 - Q3 ) / Q3 * 100
        //                     final_totalnumberofshareGrowth_array.push(totalnumberofshares_pct);
        //                 };
        //             };
        //             s.nosg_q_array = final_totalnumberofshareGrowth_array;
        //             s.nosg_q_latest = final_totalnumberofshareGrowth_array[final_totalnumberofshareGrowth_array.length - 1];
        //             let nosg_ttm_array = [];
        //             for (let i = 0; i < final_totalnumberofshareGrowth_array.length; i++) {
        //                 if (final_totalnumberofshareGrowth_array[i + 3]) {
        //                     let ttm = parseFloat(final_totalnumberofshareGrowth_array[i + 3] + final_totalnumberofshareGrowth_array[i + 2] + final_totalnumberofshareGrowth_array[i + 1] + final_totalnumberofshareGrowth_array[i]) * 10;
        //                     nosg_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.nosg_t_array = nosg_ttm_array;
        //             s.nosg_t_latest = nosg_ttm_array[nosg_ttm_array.length - 1];


        //             // ROE percent
        //             let final_roe_array = [];
        //             for (let j = 0; j < financial.sales.length; j++) {
        //                 if (financial.ebit[j] && financial.shequity[j]) {
        //                     let roe_pct = parseFloat((financial.ebit[j] / financial.shequity[j]) * 100);
        //                     final_roe_array.push(roe_pct);
        //                 } else {
        //                     (final_roe_array.push(0));
        //                 };
        //             };
        //             s.roe_q_array = final_roe_array;
        //             s.roe_q_latest = final_roe_array[final_roe_array.length - 1];
        //             let roe_ttm_array = [];
        //             for (let i = 0; i < final_roe_array.length; i++) {
        //                 if (final_roe_array[i + 3]) {
        //                     let ttm = parseFloat(final_roe_array[i + 3] + final_roe_array[i + 2] + final_roe_array[i + 1] + final_roe_array[i]) * 10;
        //                     roe_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.roe_t_array = roe_ttm_array;
        //             s.roe_t_latest = roe_ttm_array[roe_ttm_array.length - 1];



        //             // ROA percent
        //             let final_roa_array = [];
        //             for (let j = 0; j < financial.sales.length; j++) {
        //                 if (financial.ptp[j] && financial.totalassets[j]) {
        //                     let roa_pct = parseFloat((financial.ptp[j] / financial.totalassets[j]) * 100);
        //                     final_roa_array.push(roa_pct);
        //                 } else {
        //                     (final_roa_array.push(0));
        //                 };
        //             };
        //             s.roa_q_array = final_roa_array;
        //             s.roa_q_latest = final_roa_array[final_roa_array.length - 1];
        //             let roa_ttm_array = [];
        //             for (let i = 0; i < final_roa_array.length; i++) {
        //                 if (final_roa_array[i + 3]) {
        //                     let ttm = parseFloat(final_roa_array[i + 3] + final_roa_array[i + 2] + final_roa_array[i + 1] + final_roa_array[i]) * 10;
        //                     roa_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.roa_t_array = roa_ttm_array;
        //             s.roa_t_latest = roa_ttm_array[roa_ttm_array.length - 1];


        //             // Net debt
        //             let final_netDebt_array = [];
        //             for (let j = 0; j < financial.totalassets.length; j++) {
        //                 if (financial.totalassets[j]) {
        //                     let netDebt_pct = parseFloat((financial.curliabilities[j] + financial.ltliabilities[j] - financial.cce[j]) / financial.totalassets[j]) * 100; // (curliabilities + ltliabiliites - cce) / totalassets
        //                     final_netDebt_array.push(netDebt_pct);
        //                 } else {
        //                     (final_netDebt_array.push(0));
        //                 };
        //             };
        //             s.netDebt_q_array = final_netDebt_array;
        //             s.netDebt_q_latest = final_netDebt_array[final_netDebt_array.length - 1];
        //             let netDebt_ttm_array = [];
        //             for (let i = 0; i < final_netDebt_array.length; i++) {
        //                 if (final_netDebt_array[i + 3]) {
        //                     let ttm = parseFloat(final_netDebt_array[i + 3] + final_netDebt_array[i + 2] + final_netDebt_array[i + 1] + final_netDebt_array[i]) * 10;
        //                     netDebt_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.netDebt_t_array = netDebt_ttm_array;
        //             s.netDebt_t_latest = netDebt_ttm_array[netDebt_ttm_array.length - 1];




        //             // This part is for Solidity in Screener page
        //             let final_solidity_array = [];
        //             for (let j = 0; j < financial.shequity.length; j++) {
        //                 if (financial.totalassets[j]) {
        //                     let solidity_pct = parseFloat((financial.shequity[j] / financial.totalassets[j])) * 100; // why 10 times? the current returned values are less than 1, so that sparklines is not showed.
        //                     final_solidity_array.push(solidity_pct);
        //                 } else {
        //                     (final_solidity_array.push(0));
        //                 };
        //             };
        //             s.solidity_q_array = final_solidity_array;
        //             s.solidity_q_latest = final_solidity_array[final_solidity_array.length - 1];

        //             let solidity_ttm_array = [];
        //             for (let i = 0; i < final_solidity_array.length; i++) {
        //                 if (final_solidity_array[i + 3]) {
        //                     let ttm = parseFloat(final_solidity_array[i + 3] + final_solidity_array[i + 2] + final_solidity_array[i + 1] + final_solidity_array[i]) * 10;
        //                     solidity_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.solidity_t_array = solidity_ttm_array;
        //             s.solidity_t_latest = solidity_ttm_array[solidity_ttm_array.length - 1];





        //             let final_sales_array = financial.sales;
        //             s.sales_q_array = final_sales_array;
        //             s.sales_q_latest = final_sales_array[final_sales_array.length - 1];
        //             let final_sales_t_array = [];
        //             for (let i = 0; i < final_sales_array.length; i++) {
        //                 if (final_sales_array[i + 3]) {
        //                     let sales_t = parseFloat(final_sales_array[i + 3] + final_sales_array[i + 2] + final_sales_array[i + 1] + final_sales_array[i]);
        //                     final_sales_t_array.push(sales_t);
        //                 };
        //             };
        //             s.sales_t_array = final_sales_t_array;
        //             s.sales_t_latest = final_sales_t_array[final_sales_t_array.length - 1];



        //             // eps
        //             let final_eps_array = financial.eps;
        //             let final_eps_q_array = [];
        //             final_eps_array.map(ele => {
        //                 final_eps_q_array.push(ele); // why 100 times? because we cannot display sparkBar with less than 1 data.
        //             })
        //             s.eps_q_array = final_eps_q_array;
        //             s.eps_q_latest = (final_eps_array[final_eps_array.length - 1] !== null) ? (final_eps_array[final_eps_array.length - 1]) : null;
        //             let final_eps_t_array = [];
        //             for (let i = 0; i < final_eps_array.length; i++) {
        //                 if (final_eps_array[i + 3]) {
        //                     let sales_t = parseFloat(final_eps_array[i + 3] + final_eps_array[i + 2] + final_eps_array[i + 1] + final_eps_array[i]);
        //                     final_eps_t_array.push(sales_t);
        //                 };
        //             };
        //             s.eps_t_array = final_eps_t_array;
        //             s.eps_t_latest = final_eps_t_array[final_eps_t_array.length - 1];




        //             s.totalassets = financial.totalassets;
        //             s.shequity = financial.shequity;
        //             s.ltliabilities = financial.ltliabilities;
        //             s.curliabilities = financial.curliabilities;


        //             // This part is for Cash in Screener page
        //             let final_cash_array = financial.cce;
        //             s.cash_q_array = final_cash_array;
        //             s.cash_q_latest = (final_cash_array[final_cash_array.length - 1] !== null) ? (final_cash_array[final_cash_array.length - 1]) : null;

        //             let cash_ttm_array = [];
        //             for (let i = 0; i < final_cash_array.length; i++) {
        //                 if (final_cash_array[i + 3]) {
        //                     let ttm = parseFloat(final_cash_array[i + 3] + final_cash_array[i + 2] + final_cash_array[i + 1] + final_cash_array[i]);
        //                     cash_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.cash_t_array = cash_ttm_array;
        //             s.cash_t_latest = cash_ttm_array[cash_ttm_array.length - 1];



        //             let final_ps_array = financial.ps;
        //             s.ps_q_array = final_ps_array;
        //             s.ps_q_latest = (final_ps_array[final_ps_array.length - 1] !== null) ? (final_ps_array[final_ps_array.length - 1]) : null;
        //             let final_ps_t_array = [];
        //             for (let i = 0; i < final_ps_array.length; i++) {
        //                 if (final_ps_array[i + 3]) {
        //                     let ps_t = parseFloat(final_ps_array[i + 3] + final_ps_array[i + 2] + final_ps_array[i + 1] + final_ps_array[i]);
        //                     final_ps_t_array.push(ps_t);
        //                 };
        //             };
        //             s.ps_t_array = final_ps_t_array;
        //             s.ps_t_latest = final_ps_t_array[final_ps_t_array.length - 1];


        //             let final_pe_array = financial.pe;
        //             s.pe_q_array = final_pe_array;
        //             s.pe_q_latest = (final_pe_array[final_pe_array.length - 1]) !== null ? (final_pe_array[final_pe_array.length - 1]) : null;
        //             let final_pe_t_array = [];
        //             for (let i = 0; i < final_pe_array.length; i++) {
        //                 if (final_pe_array[i + 3]) {
        //                     let pe_t = parseFloat(final_pe_array[i + 3] + final_pe_array[i + 2] + final_pe_array[i + 1] + final_pe_array[i]);
        //                     final_pe_t_array.push(pe_t);
        //                 };
        //             };
        //             s.pe_t_array = final_pe_t_array;
        //             s.pe_t_latest = final_pe_t_array[final_pe_t_array.length - 1];



        //             // EBIT
        //             let final_ebit_array = financial.ebit;
        //             s.ebit_q_array = final_ebit_array;
        //             s.ebit_q_latest = (final_ebit_array[final_ebit_array.length - 1] !== null) ? (final_ebit_array[final_ebit_array.length - 1]) : null;
        //             let final_ebit_t_array = [];
        //             for (let i = 0; i < final_ebit_array.length; i++) {
        //                 if (final_ebit_array[i + 3]) {
        //                     let ebit_t = parseFloat(final_ebit_array[i + 3] + final_ebit_array[i + 2] + final_ebit_array[i + 1] + final_ebit_array[i]);
        //                     final_ebit_t_array.push(ebit_t);
        //                 };
        //             };
        //             s.ebit_t_array = final_ebit_t_array;
        //             s.ebit_t_latest = final_ebit_t_array[final_ebit_t_array.length - 1];


        //             // This part is for EBIT Growth Percent in Screener page
        //             let final_ebitGrowth_array = [];
        //             for (let d = 0; d < financial.ebit.length; d++) {
        //                 if (financial.ebit[d] && financial.ebit[d + 1]) {
        //                     let ebit_pct =
        //                         parseFloat((financial.ebit[d + 1] - financial.ebit[d]) / financial.ebit[d]) * 100; // ( Q2 - Q1 ) / Q1 * 100, ( Q3 - Q2 ) / Q2 * 100, ( Q4 - Q3 ) / Q3 * 100
        //                     final_ebitGrowth_array.push(ebit_pct);
        //                 };
        //             };
        //             s.ebitGrowth_q_array = final_ebitGrowth_array;
        //             s.ebitGrowth_q_latest = final_ebitGrowth_array[final_ebitGrowth_array.length - 1];
        //             let final_ebitGrowth_t_array = [];
        //             for (let i = 0; i < final_ebitGrowth_array.length; i++) {
        //                 if (final_ebitGrowth_array[i + 3]) {
        //                     let ebit_t = parseFloat(final_ebitGrowth_array[i + 3] + final_ebitGrowth_array[i + 2] + final_ebitGrowth_array[i + 1] + final_ebitGrowth_array[i]);
        //                     final_ebitGrowth_t_array.push(ebit_t);
        //                 };
        //             };
        //             s.ebitGrowth_t_array = final_ebitGrowth_t_array;
        //             s.ebitGrowth_t_latest = final_ebitGrowth_t_array[final_ebitGrowth_t_array.length - 1];


        //             // This part is for EBIT Margin Percent in Screener page
        //             let final_ebitMargin_array = [];
        //             for (let e = 0; e < financial.ebit.length; e++) {
        //                 if (financial.ebit[e] && financial.sales[e]) {
        //                     let ebit_margin_pct = parseFloat(financial.ebit[e] / financial.sales[e]) * 100;
        //                     final_ebitMargin_array.push(ebit_margin_pct);
        //                 };
        //             };
        //             s.ebitMargin_q_array = final_ebitMargin_array;
        //             s.ebitMargin_q_latest = final_ebitMargin_array[final_ebitMargin_array.length - 1];
        //             let final_ebitMargin_t_array = [];
        //             for (let i = 0; i < final_ebitMargin_array.length; i++) {
        //                 if (final_ebitMargin_array[i + 3]) {
        //                     let ebit_t = parseFloat(final_ebitMargin_array[i + 3] + final_ebitMargin_array[i + 2] + final_ebitMargin_array[i + 1] + final_ebitMargin_array[i]);
        //                     final_ebitMargin_t_array.push(ebit_t);
        //                 };
        //             };
        //             s.ebitMargin_t_array = final_ebitMargin_t_array;
        //             s.ebitMargin_t_latest = final_ebitMargin_t_array[final_ebitMargin_t_array.length - 1];

        //             // This part is for EBIT Margin Growth Percent in Screener page
        //             let final_ebitMargin_growth_array = [];
        //             for (let b = 0; b < financial.ebit.length; b++) {
        //                 if (financial.ebit[b] && financial.sales[b]) {
        //                     if (financial.ebit[b + 1] && financial.sales[b + 1]) {
        //                         let ebit_margin_growth_pct = parseFloat(((financial.ebit[b + 1] / financial.sales[b + 1]) - (financial.ebit[b] / financial.sales[b])) / (financial.ebit[b] / financial.sales[b])) * 100;
        //                         final_ebitMargin_growth_array.push(ebit_margin_growth_pct);
        //                     };
        //                 };
        //             };
        //             s.ebitMarginGrowth_q_array = final_ebitMargin_growth_array;
        //             s.ebitMarginGrowth_q_latest = final_ebitMargin_growth_array[final_ebitMargin_growth_array.length - 1];
        //             let final_ebitMarginGrowth_t_array = [];
        //             for (let i = 0; i < final_ebitMargin_growth_array.length; i++) {
        //                 if (final_ebitMargin_growth_array[i + 3]) {
        //                     let ebit_t = parseFloat(final_ebitMargin_growth_array[i + 3] + final_ebitMargin_growth_array[i + 2] + final_ebitMargin_growth_array[i + 1] + final_ebitMargin_growth_array[i]);
        //                     final_ebitMarginGrowth_t_array.push(ebit_t);
        //                 };
        //             };
        //             s.ebitMarginGrowth_t_array = final_ebitMarginGrowth_t_array;
        //             s.ebitMarginGrowth_t_latest = final_ebitMarginGrowth_t_array[final_ebitMarginGrowth_t_array.length - 1];



        //             // EBITDA
        //             let final_ebitda_array = financial.ebitda;
        //             s.ebitda_q_array = final_ebitda_array;
        //             s.ebitda_q_latest = (final_ebitda_array[final_ebitda_array.length - 1] !== null) ? (final_ebitda_array[final_ebitda_array.length - 1]) : null;
        //             let final_ebitda_t_array = [];
        //             for (let i = 0; i < final_ebitda_array.length; i++) {
        //                 if (final_ebitda_array[i + 3]) {
        //                     let ebitda_t = parseFloat(final_ebitda_array[i + 3] + final_ebitda_array[i + 2] + final_ebitda_array[i + 1] + final_ebitda_array[i]);
        //                     final_ebitda_t_array.push(ebitda_t);
        //                 };
        //             };
        //             s.ebitda_t_array = final_ebitda_t_array;
        //             s.ebitda_t_latest = final_ebitda_t_array[final_ebitda_t_array.length - 1];



        //             // EBITDA Growth Percent
        //             let final_ebitdaGrowth_array = [];
        //             for (let d = 0; d < financial.ebitda.length; d++) {
        //                 if (financial.ebitda[d] && financial.ebitda[d + 1]) {
        //                     let ebitda_pct =
        //                         parseFloat((financial.ebitda[d + 1] - financial.ebitda[d]) / financial.ebitda[d]) * 100; // ( Q2 - Q1 ) / Q1 * 100, ( Q3 - Q2 ) / Q2 * 100, ( Q4 - Q3 ) / Q3 * 100
        //                     final_ebitdaGrowth_array.push(ebitda_pct);
        //                 };
        //             };
        //             s.ebitdaGrowth_q_array = final_ebitdaGrowth_array;
        //             s.ebitdaGrowth_q_latest = final_ebitdaGrowth_array[final_ebitdaGrowth_array.length - 1];

        //             let ebitdaGrowth_ttm_array = [];
        //             for (let i = 0; i < final_ebitdaGrowth_array.length; i++) {
        //                 if (final_ebitdaGrowth_array[i + 3]) {
        //                     let ttm = parseFloat(final_ebitdaGrowth_array[i + 3] + final_ebitdaGrowth_array[i + 2] + final_ebitdaGrowth_array[i + 1] + final_ebitdaGrowth_array[i]);
        //                     ebitdaGrowth_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.ebitdaGrowth_t_array = ebitdaGrowth_ttm_array;
        //             s.ebitdaGrowth_t_latest = ebitdaGrowth_ttm_array[ebitdaGrowth_ttm_array.length - 1];


        //             // EBITDA Margin Percent
        //             let final_ebitdaMargin_array = [];
        //             for (let e = 0; e < financial.gp.length; e++) {
        //                 if (financial.ebitda[e] && financial.sales[e]) {
        //                     let ebitda_margin_pct = parseFloat(financial.ebitda[e] / financial.sales[e]) * 100;
        //                     final_ebitdaMargin_array.push(ebitda_margin_pct);
        //                 };
        //             };
        //             s.ebitdaMargin_q_array = final_ebitdaMargin_array;
        //             s.ebitdaMargin_q_latest = final_ebitdaMargin_array[final_ebitdaMargin_array.length - 1];

        //             let ebitdaMargin_ttm_array = [];
        //             for (let i = 0; i < final_ebitdaMargin_array.length; i++) {
        //                 if (final_ebitdaMargin_array[i + 3]) {
        //                     let ttm = parseFloat(final_ebitdaMargin_array[i + 3] + final_ebitdaMargin_array[i + 2] + final_ebitdaMargin_array[i + 1] + final_ebitdaMargin_array[i]);
        //                     ebitdaMargin_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.ebitdaMargin_t_array = ebitdaMargin_ttm_array;
        //             s.ebitdaMargin_t_latest = ebitdaMargin_ttm_array[ebitdaMargin_ttm_array.length - 1];


        //             // EBITDA Margin Growth Percent
        //             let final_ebitdaMargin_growth_array = [];
        //             for (let b = 0; b < financial.gp.length; b++) {
        //                 if (financial.ebitda[b] && financial.sales[b]) {
        //                     if (financial.ebitda[b + 1] && financial.sales[b + 1]) {
        //                         let ebitda_margin_growth_pct = parseFloat(((financial.ebitda[b + 1] / financial.sales[b + 1]) - (financial.ebitda[b] / financial.sales[b])) / (financial.ebitda[b] / financial.sales[b])) * 100;
        //                         final_ebitdaMargin_growth_array.push(ebitda_margin_growth_pct);
        //                     };
        //                 };
        //             };
        //             s.ebitdaMarginGrowth_q_array = final_ebitdaMargin_growth_array;
        //             s.ebitdaMarginGrowth_q_latest = final_ebitdaMargin_growth_array[final_ebitdaMargin_growth_array.length - 1];

        //             let ebitdaMarginGrowth_ttm_array = [];
        //             for (let i = 0; i < final_ebitdaMargin_growth_array.length; i++) {
        //                 if (final_ebitdaMargin_growth_array[i + 3]) {
        //                     let ttm = parseFloat(final_ebitdaMargin_growth_array[i + 3] + final_ebitdaMargin_growth_array[i + 2] + final_ebitdaMargin_growth_array[i + 1] + final_ebitdaMargin_growth_array[i]);
        //                     ebitdaMarginGrowth_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.ebitdaMarginGrowth_t_array = ebitdaMarginGrowth_ttm_array;
        //             s.ebitdaMarginGrowth_t_latest = ebitdaMarginGrowth_ttm_array[ebitdaMarginGrowth_ttm_array.length - 1];




        //             // Pre-Tax Profit
        //             let final_ptp_array = financial.ptp;
        //             s.ptp_q_array = final_ptp_array;
        //             s.ptp_q_latest = (final_ptp_array[final_ptp_array.length - 1] !== null) ? (final_ptp_array[final_ptp_array.length - 1]) : null;
        //             let final_ptp_t_array = [];
        //             for (let i = 0; i < final_ptp_array.length; i++) {
        //                 if (final_ptp_array[i + 3]) {
        //                     let ptp_t = parseFloat(final_ptp_array[i + 3] + final_ptp_array[i + 2] + final_ptp_array[i + 1] + final_ptp_array[i]);
        //                     final_ptp_t_array.push(ptp_t);
        //                 };
        //             };
        //             s.ptp_t_array = final_ptp_t_array;
        //             s.ptp_t_latest = final_ptp_t_array[final_ptp_t_array.length - 1];



        //             // Profit (NP)
        //             let final_np_array = financial.profit;
        //             s.np_q_array = final_np_array;
        //             s.np_q_latest = (final_np_array[final_np_array.length - 1] !== null) ? (final_np_array[final_np_array.length - 1]) : null;
        //             let final_np_t_array = [];
        //             for (let i = 0; i < final_np_array.length; i++) {
        //                 if (final_np_array[i + 3]) {
        //                     let np_t = parseFloat(final_np_array[i + 3] + final_np_array[i + 2] + final_np_array[i + 1] + final_np_array[i]);
        //                     final_np_t_array.push(np_t);
        //                 };
        //             };
        //             s.np_t_array = final_np_t_array;
        //             s.np_t_latest = final_np_t_array[final_np_t_array.length - 1];


        //             // This part is for Profit Growth Percent in Screener page
        //             let final_profitGrowth_array = [];
        //             for (let d = 0; d < financial.profit.length; d++) {
        //                 if (financial.profit[d] && financial.profit[d + 1]) {
        //                     let profit_pct =
        //                         parseFloat((financial.profit[d + 1] - financial.profit[d]) / financial.profit[d]) * 100; // ( Q2 - Q1 ) / Q1 * 100, ( Q3 - Q2 ) / Q2 * 100, ( Q4 - Q3 ) / Q3 * 100
        //                     final_profitGrowth_array.push(profit_pct);
        //                 };
        //             };
        //             s.npGrowth_q_array = final_profitGrowth_array;
        //             s.npGrowth_q_latest = final_profitGrowth_array[final_profitGrowth_array.length - 1];
        //             let npGrowth_ttm_array = [];
        //             for (let i = 0; i < final_profitGrowth_array.length; i++) {
        //                 if (final_profitGrowth_array[i + 3]) {
        //                     let ttm = parseFloat(final_profitGrowth_array[i + 3] + final_profitGrowth_array[i + 2] + final_profitGrowth_array[i + 1] + final_profitGrowth_array[i]);
        //                     npGrowth_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.npGrowth_t_array = npGrowth_ttm_array;
        //             s.npGrowth_t_latest = npGrowth_ttm_array[npGrowth_ttm_array.length - 1];

        //             // This part is for Profit Margin Percent in Screener page
        //             let final_profitMargin_array = [];
        //             for (let e = 0; e < financial.profit.length; e++) {
        //                 if (financial.profit[e] && financial.sales[e]) {
        //                     let profit_margin_pct = parseFloat(financial.profit[e] / financial.sales[e]) * 100;
        //                     final_profitMargin_array.push(profit_margin_pct);
        //                 };
        //             };
        //             s.npMargin_q_array = final_profitMargin_array;
        //             s.npMargin_q_latest = final_profitMargin_array[final_profitMargin_array.length - 1];
        //             let npMargin_ttm_array = [];
        //             for (let i = 0; i < final_profitMargin_array.length; i++) {
        //                 if (final_profitMargin_array[i + 3]) {
        //                     let ttm = parseFloat(final_profitMargin_array[i + 3] + final_profitMargin_array[i + 2] + final_profitMargin_array[i + 1] + final_profitMargin_array[i]);
        //                     npMargin_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.npMargin_t_array = npMargin_ttm_array;
        //             s.npMargin_t_latest = npMargin_ttm_array[npMargin_ttm_array.length - 1];

        //             // This part is for Profit Margin Growth Percent in Screener page
        //             let final_profitMargin_growth_array = [];
        //             for (let b = 0; b < financial.profit.length; b++) {
        //                 if (financial.profit[b] && financial.sales[b]) {
        //                     if (financial.profit[b + 1] && financial.sales[b + 1]) {
        //                         let profit_margin_growth_pct = parseFloat(((financial.profit[b + 1] / financial.sales[b + 1]) - (financial.profit[b] / financial.sales[b])) / (financial.profit[b] / financial.sales[b])) * 100;
        //                         final_profitMargin_growth_array.push(profit_margin_growth_pct);
        //                     };
        //                 };
        //             };
        //             s.npMarginGrowth_q_array = final_profitMargin_growth_array;
        //             s.npMarginGrowth_q_latest = final_profitMargin_growth_array[final_profitMargin_growth_array.length - 1];
        //             let npMarginGrowth_ttm_array = [];
        //             for (let i = 0; i < final_profitMargin_growth_array.length; i++) {
        //                 if (final_profitMargin_growth_array[i + 3]) {
        //                     let ttm = parseFloat(final_profitMargin_growth_array[i + 3] + final_profitMargin_growth_array[i + 2] + final_profitMargin_growth_array[i + 1] + final_profitMargin_growth_array[i]);
        //                     npMarginGrowth_ttm_array.push(ttm);
        //                 };
        //             };
        //             s.npMarginGrowth_t_array = npMarginGrowth_ttm_array;
        //             s.npMarginGrowth_t_latest = npMarginGrowth_ttm_array[npMarginGrowth_ttm_array.length - 1];




        //             // Intangable Assets
        //             let final_ia_array = financial.intangibleasset;
        //             s.ia_q_array = final_ia_array;
        //             s.ia_q_latest = (final_ia_array[final_ia_array.length - 1] !== null) ? (final_ia_array[final_ia_array.length - 1]) : null;
        //             let final_ia_t_array = [];
        //             for (let i = 0; i < final_ia_array.length; i++) {
        //                 if (final_ia_array[i + 3]) {
        //                     let ia_t = parseFloat(final_ia_array[i + 3] + final_ia_array[i + 2] + final_ia_array[i + 1] + final_ia_array[i]);
        //                     final_ia_t_array.push(ia_t);
        //                 };
        //             };
        //             s.ia_t_array = final_ia_t_array;
        //             s.ia_t_latest = final_ia_t_array[final_ia_t_array.length - 1];


        //             // Material Assets
        //             let final_ma_array = financial.fixedasset;
        //             s.ma_q_array = final_ma_array;
        //             s.ma_q_latest = (final_ma_array[final_ma_array.length - 1] !== null) ? (final_ma_array[final_ma_array.length - 1]) : null;
        //             let final_ma_t_array = [];
        //             for (let i = 0; i < final_ma_array.length; i++) {
        //                 if (final_ma_array[i + 3]) {
        //                     let ia_t = parseFloat(final_ma_array[i + 3] + final_ma_array[i + 2] + final_ma_array[i + 1] + final_ma_array[i]);
        //                     final_ma_t_array.push(ia_t);
        //                 };
        //             };
        //             s.ma_t_array = final_ma_t_array;
        //             s.ma_t_latest = final_ma_t_array[final_ma_t_array.length - 1];


        //             // Financial Assets
        //             let final_fa_array = financial.financialasset;
        //             s.fa_q_array = final_fa_array;
        //             s.fa_q_latest = (final_fa_array[final_fa_array.length - 1] !== null) ? (final_fa_array[final_fa_array.length - 1]) : null;
        //             let final_fa_t_array = [];
        //             for (let i = 0; i < final_fa_array.length; i++) {
        //                 if (final_fa_array[i + 3]) {
        //                     let ia_t = parseFloat(final_fa_array[i + 3] + final_fa_array[i + 2] + final_fa_array[i + 1] + final_fa_array[i]);
        //                     final_fa_t_array.push(ia_t);
        //                 };
        //             };
        //             s.fa_t_array = final_fa_t_array;
        //             s.fa_t_latest = final_fa_t_array[final_fa_t_array.length - 1];

        //             // Tangible Assets
        //             let final_ta_array = financial.noncurrentasset;
        //             s.ta_q_array = final_ta_array;
        //             s.ta_q_latest = (final_ta_array[final_ta_array.length - 1] !== null) ? (final_ta_array[final_ta_array.length - 1]) : null;
        //             let final_ta_t_array = [];
        //             for (let i = 0; i < final_ta_array.length; i++) {
        //                 if (final_ta_array[i + 3]) {
        //                     let ia_t = parseFloat(final_ta_array[i + 3] + final_ta_array[i + 2] + final_ta_array[i + 1] + final_ta_array[i]);
        //                     final_ta_t_array.push(ia_t);
        //                 };
        //             };
        //             s.ta_t_array = final_ta_t_array;
        //             s.ta_t_latest = final_ta_t_array[final_ta_t_array.length - 1];


        //             // Total Assets
        //             let final_totalAssets_array = financial.totalassets;
        //             s.totalAssets_q_array = final_totalAssets_array;
        //             s.totalAssets_q_latest = (final_totalAssets_array[final_totalAssets_array.length - 1] !== null) ? (final_totalAssets_array[final_totalAssets_array.length - 1]) : null;
        //             let final_totalAssets_t_array = [];
        //             for (let i = 0; i < final_totalAssets_array.length; i++) {
        //                 if (final_totalAssets_array[i + 3]) {
        //                     let ia_t = parseFloat(final_totalAssets_array[i + 3] + final_totalAssets_array[i + 2] + final_totalAssets_array[i + 1] + final_totalAssets_array[i]);
        //                     final_totalAssets_t_array.push(ia_t);
        //                 };
        //             };
        //             s.totalAssets_t_array = final_totalAssets_t_array;
        //             s.totalAssets_t_latest = final_totalAssets_t_array[final_totalAssets_t_array.length - 1];


        //             // Total Equity
        //             let final_totalEquity_array = financial.shequity;
        //             s.totalEquity_q_array = final_totalEquity_array;
        //             s.totalEquity_q_latest = (final_totalEquity_array[final_totalEquity_array.length - 1] !== null) ? (final_totalEquity_array[final_totalEquity_array.length - 1]) : null;
        //             let final_totalEquity_t_array = [];
        //             for (let i = 0; i < final_totalEquity_array.length; i++) {
        //                 if (final_totalEquity_array[i + 3]) {
        //                     let ia_t = parseFloat(final_totalEquity_array[i + 3] + final_totalEquity_array[i + 2] + final_totalEquity_array[i + 1] + final_totalEquity_array[i]);
        //                     final_totalEquity_t_array.push(ia_t);
        //                 };
        //             };
        //             s.totalEquity_t_array = final_totalEquity_t_array;
        //             s.totalEquity_t_latest = final_totalEquity_t_array[final_totalEquity_t_array.length - 1];


        //             // Long Term Debt
        //             let final_ltd_array = financial.ltliabilities;
        //             s.ltd_q_array = final_ltd_array;
        //             s.ltd_q_latest = (final_ltd_array[final_ltd_array.length - 1] !== null) ? (final_ltd_array[final_ltd_array.length - 1]) : null;
        //             let final_ltd_t_array = [];
        //             for (let i = 0; i < final_ltd_array.length; i++) {
        //                 if (final_ltd_array[i + 3]) {
        //                     let ia_t = parseFloat(final_ltd_array[i + 3] + final_ltd_array[i + 2] + final_ltd_array[i + 1] + final_ltd_array[i]);
        //                     final_ltd_t_array.push(ia_t);
        //                 };
        //             };
        //             s.ltd_t_array = final_ltd_t_array;
        //             s.ltd_t_latest = final_ltd_t_array[final_ltd_t_array.length - 1];


        //             // Short Term Debt
        //             let final_std_array = financial.curliabilities;
        //             s.std_q_array = final_std_array;
        //             s.std_q_latest = (final_std_array[final_std_array.length - 1] !== null) ? (final_std_array[final_std_array.length - 1]) : null;
        //             let final_std_t_array = [];
        //             for (let i = 0; i < final_std_array.length; i++) {
        //                 if (final_std_array[i + 3]) {
        //                     let ia_t = parseFloat(final_std_array[i + 3] + final_std_array[i + 2] + final_std_array[i + 1] + final_std_array[i]);
        //                     final_std_t_array.push(ia_t);
        //                 };
        //             };
        //             s.std_t_array = final_std_t_array;
        //             s.std_t_latest = final_std_t_array[final_std_t_array.length - 1];



        //         }
        //     });

        //     arrayFinancials_year.forEach(financial => {
        //         if (s.company_id == financial.company_id[0]) {
        //             let final_solidity_array = [];
        //             for (let j = 0; j < financial.shequity.length; j++) {
        //                 if (financial.totalassets[j]) {
        //                     let solidity = parseFloat(financial.shequity[j] / financial.totalassets[j]) * 10; // why 10 times? the current returned values are less than 1, so that sparklines is not showed.
        //                     final_solidity_array.push(solidity);
        //                 } else {
        //                     (final_solidity_array.push(0));
        //                 };
        //             };
        //             s.solidity_y_array = final_solidity_array;
        //             s.solidity_y_latest = final_solidity_array[final_solidity_array.length - 1];



        //             let final_enterprise_array = [];
        //             for (let j = 0; j < financial.price.length; j++) {
        //                 let enterprise = parseFloat((financial.totalnumberofshares[j] * financial.price[j]) + (financial.ibl[j] - financial.cce[j]));
        //                 final_enterprise_array.push(enterprise);
        //             };
        //             s.enterprise_y_array = final_enterprise_array;
        //             s.enterprise_y_latest = final_enterprise_array[final_enterprise_array.length - 1];

        //             // Sales Growth %
        //             let final_salesGrowth_array = [];
        //             for (let i = 0; i < financial.sales.length; i++) {
        //                 if (financial.sales[i] && financial.sales[i + 1]) {
        //                     // ( Q2 - Q1 ) / Q1 * 100, ( Q3 - Q2 ) / Q2 * 100, ( Q4 - Q3 ) / Q3 * 100
        //                     let sales_pct = parseFloat((financial.sales[i + 1] - financial.sales[i]) / financial.sales[i]) * 100;
        //                     final_salesGrowth_array.push(sales_pct);
        //                 }
        //             }
        //             s.salesGrowth_y_array = final_salesGrowth_array;
        //             s.salesGrowth_y_latest = final_salesGrowth_array[final_salesGrowth_array.length - 1];




        //             let final_ev_ebit_array = [];
        //             for (let j = 0; j < financial.price.length; j++) {
        //                 if (financial.ebit[j]) {
        //                     let ev_ebit = parseFloat(((financial.totalnumberofshares[j] * financial.price[j]) + (financial.ibl[j] - financial.cce[j])) / financial.ebit[j]);
        //                     final_ev_ebit_array.push(ev_ebit);
        //                 } else {
        //                     final_ev_ebit_array.push(0);
        //                 };
        //             };
        //             s.ev_ebit_y_array = final_ev_ebit_array;
        //             s.ev_ebit_y_latest = final_ev_ebit_array[final_ev_ebit_array.length - 1];




        //             let final_ev_ebitda_array = [];
        //             for (let j = 0; j < financial.price.length; j++) {
        //                 if (financial.ebitda[j]) {
        //                     let ev_ebitda = parseFloat(((financial.totalnumberofshares[j] * financial.price[j]) + (financial.ibl[j] - financial.cce[j])) / financial.ebitda[j]);
        //                     final_ev_ebitda_array.push(ev_ebitda);
        //                 } else {
        //                     final_ev_ebitda_array.push(0);
        //                 };
        //             };
        //             s.ev_ebitda_y_array = final_ev_ebitda_array;
        //             s.ev_ebitda_y_latest = final_ev_ebitda_array[final_ev_ebitda_array.length - 1];


        //             let final_pb_array = [];
        //             for (let j = 0; j < financial.price.length; j++) {
        //                 if (financial.totalnumberofshares[j] && financial.shequity[j] && financial.price[j]) {
        //                     let pb = parseFloat(financial.price[j] / financial.shequity[j] / financial.totalnumberofshares[j]);
        //                     final_pb_array.push(pb);
        //                 } else {
        //                     (final_pb_array.push(0));
        //                 };
        //             };
        //             s.pb_y_array = final_pb_array;
        //             s.pb_y_latest = final_pb_array[final_pb_array.length - 1];


        //             // This part is for Total debt in Screener page
        //             let final_totalDebt_array = [];
        //             for (let i = 0; i < financial.ltliabilities.length; i++) {
        //                 if (financial.ltliabilities[i]) {
        //                     let totalDebt =
        //                         parseInt(financial.ltliabilities[i]) + parseInt(financial.curliabilities[i])
        //                     final_totalDebt_array.push(totalDebt);
        //                 } else {
        //                     final_totalDebt_array.push(0);
        //                 };
        //             };
        //             s.totalDebt_y_array = final_totalDebt_array;
        //             s.totalDebt_y_latest = final_totalDebt_array[final_totalDebt_array.length - 1];


        //             s.ps_y_array = financial.ps;
        //             s.ps_y_latest = financial.ps[financial.ps.length - 1];

        //             s.pe_y_array = financial.pe;
        //             s.pe_y_latest = financial.pe[financial.pe.length - 1];

        //             s.sales_y_array = financial.sales;
        //             s.sales_y_latest = financial.sales[financial.sales.length - 1];

        //             s.gp_y_array = financial.gp;
        //             s.gp_y_latest = financial.gp[financial.gp.length - 1];

        //             s.ptp_y_array = financial.ptp;
        //             s.ptp_y_latest = financial.ptp[financial.ptp.length - 1];

        //             s.ebitda_y_array = financial.ebitda;
        //             s.ebitda_y_latest = financial.ebitda[financial.ebitda.length - 1];

        //             // Ebitda Growth %
        //             let final_ebitdaGrowth_array = [];
        //             for (let d = 0; d < financial.ebitda.length; d++) {
        //                 if (financial.ebitda[d] && financial.ebitda[d + 1]) {
        //                     let ebitda_pct =
        //                         parseFloat((financial.ebitda[d + 1] - financial.ebitda[d]) / financial.ebitda[d]) * 100; // ( Q2 - Q1 ) / Q1 * 100, ( Q3 - Q2 ) / Q2 * 100, ( Q4 - Q3 ) / Q3 * 100
        //                     final_ebitdaGrowth_array.push(ebitda_pct);
        //                 };
        //             };
        //             s.ebitdaGrowth_y_array = final_ebitdaGrowth_array;
        //             s.ebitdaGrowth_y_latest = final_ebitdaGrowth_array[final_ebitdaGrowth_array.length - 1];

        //             // EBITDA Margin Percent
        //             let final_ebitdaMargin_array = [];
        //             for (let e = 0; e < financial.gp.length; e++) {
        //                 if (financial.ebitda[e] && financial.sales[e]) {
        //                     let ebitda_margin = parseFloat(financial.ebitda[e] / financial.sales[e]);
        //                     final_ebitdaMargin_array.push(ebitda_margin);
        //                 };
        //             };
        //             s.ebitdaMargin_y_array = final_ebitdaMargin_array;
        //             s.ebitdaMargin_y_latest = final_ebitdaMargin_array[final_ebitdaMargin_array.length - 1];


        //             // EBITDA Margin Growth Percent
        //             let final_ebitdaMargin_growth_array = [];
        //             for (let b = 0; b < financial.gp.length; b++) {
        //                 if (financial.ebitda[b] && financial.sales[b]) {
        //                     if (financial.ebitda[b + 1] && financial.sales[b + 1]) {
        //                         let ebitda_margin_growth = parseFloat(((financial.ebitda[b + 1] / financial.sales[b + 1]) - (financial.ebitda[b] / financial.sales[b])) / (financial.ebitda[b] / financial.sales[b]));
        //                         final_ebitdaMargin_growth_array.push(ebitda_margin_growth);
        //                     };
        //                 };
        //             };
        //             s.ebitdaMarginGrowth_y_array = final_ebitdaMargin_growth_array;
        //             s.ebitdaMarginGrowth_y_latest = final_ebitdaMargin_growth_array[final_ebitdaMargin_growth_array.length - 1];



        //             s.ebit_y_array = financial.ebit;
        //             s.ebit_y_latest = financial.ebit[financial.ebit.length - 1];
        //             // Ebit Growth
        //             let final_ebitGrowth_array = [];
        //             for (let d = 0; d < financial.ebit.length; d++) {
        //                 if (financial.ebit[d] && financial.ebit[d + 1]) {
        //                     let ebit_pct =
        //                         parseFloat((financial.ebit[d + 1] - financial.ebit[d]) / financial.ebit[d]) * 100; // ( Q2 - Q1 ) / Q1 * 100, ( Q3 - Q2 ) / Q2 * 100, ( Q4 - Q3 ) / Q3 * 100
        //                     final_ebitGrowth_array.push(ebit_pct);
        //                 };
        //             };
        //             s.ebitGrowth_y_array = final_ebitGrowth_array;
        //             s.ebitGrowth_y_latest = final_ebitGrowth_array[final_ebitGrowth_array.length - 1];
        //             // Ebit Margin
        //             let final_ebitMargin_array = [];
        //             for (let e = 0; e < financial.ebit.length; e++) {
        //                 if (financial.ebit[e] && financial.sales[e]) {
        //                     let ebit_margin = parseFloat(financial.ebit[e] / financial.sales[e]);
        //                     final_ebitMargin_array.push(ebit_margin);
        //                 };
        //             };
        //             s.ebitMargin_y_array = final_ebitMargin_array;
        //             s.ebitMargin_y_latest = final_ebitMargin_array[final_ebitMargin_array.length - 1];
        //             // EBIT Margin Growth Percent
        //             let final_ebitMargin_growth_array = [];
        //             for (let b = 0; b < financial.ebit.length; b++) {
        //                 if (financial.ebit[b] && financial.sales[b]) {
        //                     if (financial.ebit[b + 1] && financial.sales[b + 1]) {
        //                         let ebit_margin_growth = parseFloat(((financial.ebit[b + 1] / financial.sales[b + 1]) - (financial.ebit[b] / financial.sales[b])) / (financial.ebit[b] / financial.sales[b]));
        //                         final_ebitMargin_growth_array.push(ebit_margin_growth);
        //                     };
        //                 };
        //             };
        //             s.ebitMarginGrowth_y_array = final_ebitMargin_growth_array;
        //             s.ebitMarginGrowth_y_latest = final_ebitMargin_growth_array[final_ebitMargin_growth_array.length - 1];


        //             s.np_y_array = financial.profit;
        //             s.np_y_latest = financial.profit[financial.profit.length - 1];
        //             // Profit Growth Percent
        //             let final_profitGrowth_array = [];
        //             for (let d = 0; d < financial.profit.length; d++) {
        //                 if (financial.profit[d] && financial.profit[d + 1]) {
        //                     let profit_pct =
        //                         parseFloat((financial.profit[d + 1] - financial.profit[d]) / financial.profit[d]) * 100; // ( Q2 - Q1 ) / Q1 * 100, ( Q3 - Q2 ) / Q2 * 100, ( Q4 - Q3 ) / Q3 * 100
        //                     final_profitGrowth_array.push(profit_pct);
        //                 };
        //             };
        //             s.npGrowth_y_array = final_profitGrowth_array;
        //             s.npGrowth_y_latest = final_profitGrowth_array[final_profitGrowth_array.length - 1];
        //             // This part is for Profit Margin Percent in Screener page
        //             let final_profitMargin_array = [];
        //             for (let e = 0; e < financial.profit.length; e++) {
        //                 if (financial.profit[e] && financial.sales[e]) {
        //                     let profit_margin = parseFloat(financial.profit[e] / financial.sales[e]);
        //                     final_profitMargin_array.push(profit_margin);
        //                 };
        //             };
        //             s.npMargin_y_array = final_profitMargin_array;
        //             s.npMargin_y_latest = final_profitMargin_array[final_profitMargin_array.length - 1];
        //             // This part is for Profit Margin Growth Percent in Screener page
        //             let final_profitMargin_growth_array = [];
        //             for (let b = 0; b < financial.profit.length; b++) {
        //                 if (financial.profit[b] && financial.sales[b]) {
        //                     if (financial.profit[b + 1] && financial.sales[b + 1]) {
        //                         let profit_margin_growth = parseFloat(((financial.profit[b + 1] / financial.sales[b + 1]) - (financial.profit[b] / financial.sales[b])) / (financial.profit[b] / financial.sales[b]));
        //                         final_profitMargin_growth_array.push(profit_margin_growth);
        //                     };
        //                 };
        //             };
        //             s.npMarginGrowth_y_array = final_profitMargin_growth_array;
        //             s.npMarginGrowth_y_latest = final_profitMargin_growth_array[final_profitMargin_growth_array.length - 1];


        //             s.cash_y_array = financial.cce;
        //             s.cash_y_latest = financial.cce[financial.cce.length - 1];


        //             // Gross Profit
        //             s.grossProfit_y_array = financial.gp;
        //             s.grossProfit_y_latest = financial.gp[financial.gp.length - 1];

        //             // Gross Profit %
        //             let final_grossGrowth_array = [];
        //             for (let i = 0; i < financial.gp.length; i++) {
        //                 if (financial.gp[i] && financial.gp[i + 1]) {
        //                     let gp_pct =
        //                         parseFloat((financial.gp[i + 1] - financial.gp[i]) / financial.gp[i]) * 100;
        //                     final_grossGrowth_array.push(gp_pct);
        //                 }
        //             }
        //             s.grossProfitGrowth_y_array = final_grossGrowth_array;
        //             s.grossProfitGrowth_y_latest = final_grossGrowth_array[final_grossGrowth_array.length - 1];


        //             // Gross Margin
        //             let final_grossMargin_array = [];
        //             for (let a = 0; a < financial.gp.length; a++) {
        //                 if (financial.gp[a] && financial.sales[a]) {
        //                     let gm = parseFloat(financial.gp[a] / financial.sales[a]);
        //                     final_grossMargin_array.push(gm);
        //                 } else {
        //                     final_grossMargin_array.push(0);
        //                 }
        //             }
        //             s.grossMargin_y_array = final_grossMargin_array;
        //             s.grossMargin_y_latest = final_grossMargin_array[final_grossMargin_array.length - 1];


        //             // Gross Margin Growth Percent
        //             let final_grossMargin_growth_array = [];
        //             for (let b = 0; b < financial.gp.length; b++) {
        //                 if (financial.gp[b] && financial.sales[b]) {
        //                     if (financial.gp[b + 1] && financial.sales[b + 1]) {
        //                         let gmg = parseFloat(((financial.gp[b + 1] / financial.sales[b + 1]) - (financial.gp[b] / financial.sales[b])) / (financial.gp[b] / financial.sales[b]));
        //                         final_grossMargin_growth_array.push(gmg);
        //                     }
        //                 } else {
        //                     final_grossMargin_growth_array.push(0);
        //                 }
        //             }
        //             s.grossMarginGrowth_y_array = final_grossMargin_growth_array;
        //             s.grossMarginGrowth_y_latest = final_grossMargin_growth_array[final_grossMargin_growth_array.length - 1];


        //             // COGS
        //             let final_cogs_array = [];
        //             for (let c = 0; c < financial.gp.length; c++) {
        //                 if (financial.gp[c] && financial.sales[c]) {
        //                     let cogs = parseFloat(financial.gp[c] - financial.sales[c]);
        //                     final_cogs_array.push(cogs);
        //                 } else {
        //                     final_cogs_array.push(0);
        //                 };
        //             };
        //             s.cogs_y_array = final_cogs_array;
        //             s.cogs_y_latest = final_cogs_array[final_cogs_array.length - 1];


        //             // eps for year
        //             let final_eps_array_temp = financial.eps;
        //             let final_eps_y_array = [];
        //             final_eps_array_temp.map(ele => {
        //                 final_eps_y_array.push(ele);
        //             })
        //             s.eps_y_array = final_eps_y_array;
        //             s.eps_y_latest = financial.eps[financial.eps.length - 1];


        //             // Intangable Assets
        //             let final_ia_array = financial.intangibleasset;
        //             s.ia_y_array = final_ia_array;
        //             s.ia_y_latest = final_ia_array[final_ia_array.length - 1];

        //             // Material Assets
        //             let final_ma_array = financial.fixedasset;
        //             s.ma_y_array = final_ma_array;
        //             s.ma_y_latest = final_ma_array[final_ma_array.length - 1];

        //             // Financial Assets
        //             let final_fa_array = financial.financialasset;
        //             s.fa_y_array = final_fa_array;
        //             s.fa_y_latest = final_fa_array[final_fa_array.length - 1];

        //             // Tangible Assets
        //             let final_ta_array = financial.noncurrentasset;
        //             s.ta_y_array = final_ta_array;
        //             s.ta_y_latest = final_ta_array[final_ta_array.length - 1];

        //             // Current Assets
        //             let final_currentAssets_array = financial.othercurrentassets;
        //             s.ca_y_array = final_currentAssets_array;
        //             s.ca_y_latest = final_currentAssets_array[final_currentAssets_array.length - 1];


        //             // Total Equity & Liabilities
        //             let final_tel_array = financial.totalequityandliabilities;
        //             s.tel_y_array = final_tel_array;
        //             s.tel_y_latest = final_tel_array[final_tel_array.length - 1];


        //             // Total Assets
        //             let final_totalAssets_array = financial.totalassets;
        //             s.totalAssets_y_array = final_totalAssets_array;
        //             s.totalAssets_y_latest = final_totalAssets_array[final_totalAssets_array.length - 1];


        //             // Total Equity
        //             let final_totalEquity_array = financial.shequity;
        //             s.totalEquity_y_array = final_totalEquity_array;
        //             s.totalEquity_y_latest = final_totalEquity_array[final_totalEquity_array.length - 1];


        //             // Long Term Debt
        //             let final_ltd_array = financial.ltliabilities;
        //             s.ltd_y_array = final_ltd_array;
        //             s.ltd_y_latest = final_ltd_array[final_ltd_array.length - 1];


        //             // Short Term Debt
        //             let final_std_array = financial.curliabilities;
        //             s.std_y_array = final_std_array;
        //             s.std_y_latest = final_std_array[final_std_array.length - 1];


        //             // Sales per Share
        //             let final_sales_per_share_array = [];
        //             for (let j = 0; j < financial.sales.length; j++) {
        //                 if (financial.totalnumberofshares[j] && financial.sales[j]) {
        //                     let sales_per_share = parseFloat(financial.sales[j] / financial.totalnumberofshares[j]);
        //                     final_sales_per_share_array.push(sales_per_share);
        //                 } else {
        //                     (final_sales_per_share_array.push(0));
        //                 };
        //             };
        //             s.sps_y_array = final_sales_per_share_array;
        //             s.sps_y_latest = final_sales_per_share_array[final_sales_per_share_array.length - 1];


        //             // Number of Stocks
        //             let final_nos_array = financial.totalnumberofshares;
        //             s.nos_y_array = final_nos_array;
        //             s.nos_y_latest = final_nos_array[final_nos_array.length - 1];


        //             // Number of stocks growth Percent
        //             let final_totalnumberofshareGrowth_array = [];
        //             for (let d = 0; d < financial.totalnumberofshares.length; d++) {
        //                 if (financial.totalnumberofshares[d] && financial.totalnumberofshares[d + 1]) {
        //                     let totalnumberofshares_pct =
        //                         parseFloat((financial.totalnumberofshares[d + 1] - financial.totalnumberofshares[d]) / financial.totalnumberofshares[d]) * 100; // ( Q2 - Q1 ) / Q1 * 100, ( Q3 - Q2 ) / Q2 * 100, ( Q4 - Q3 ) / Q3 * 100
        //                     final_totalnumberofshareGrowth_array.push(totalnumberofshares_pct);
        //                 };
        //             };
        //             s.nosg_y_array = final_totalnumberofshareGrowth_array;
        //             s.nosg_y_latest = final_totalnumberofshareGrowth_array[final_totalnumberofshareGrowth_array.length - 1];

        //             // ROE percent
        //             let final_roe_array = [];
        //             for (let j = 0; j < financial.sales.length; j++) {
        //                 if (financial.ebit[j] && financial.shequity[j]) {
        //                     let roe = parseFloat(financial.ebit[j] / financial.shequity[j]);
        //                     final_roe_array.push(roe);
        //                 } else {
        //                     (final_roe_array.push(0));
        //                 };
        //             };
        //             s.roe_y_array = final_roe_array;
        //             s.roe_y_latest = final_roe_array[final_roe_array.length - 1];


        //             // ROA percent
        //             let final_roa_array = [];
        //             for (let j = 0; j < financial.sales.length; j++) {
        //                 if (financial.ptp[j] && financial.totalassets[j]) {
        //                     let roa = parseFloat(financial.ptp[j] / financial.totalassets[j]);
        //                     final_roa_array.push(roa);
        //                 } else {
        //                     (final_roa_array.push(0));
        //                 };
        //             };
        //             s.roa_y_array = final_roa_array;
        //             s.roa_y_latest = final_roa_array[final_roa_array.length - 1];


        //             // Net debt
        //             let final_netDebt_array = [];
        //             for (let j = 0; j < financial.totalassets.length; j++) {
        //                 if (financial.totalassets[j]) {
        //                     let netDebt = parseFloat((financial.curliabilities[j] + financial.ltliabilities[j] - financial.cce[j]) / financial.totalassets[j]); // (curliabilities + ltliabiliites - cce) / totalassets
        //                     final_netDebt_array.push(netDebt);
        //                 } else {
        //                     (final_netDebt_array.push(0));
        //                 };
        //             };
        //             s.netDebt_y_array = final_netDebt_array;
        //             s.netDebt_y_latest = final_netDebt_array[final_netDebt_array.length - 1];

        //         }
        //     })

        //     arrayStocks.push(s);
        // })
        // return arrayStocks;
    }
}
