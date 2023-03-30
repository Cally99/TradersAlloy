const StockInsiderTrade = require('../models').StockInsiderTrade;

const DB = require('../helpers/DB');
const connection = DB.getConnection();

module.exports = {
    async bulkCreate(insiders_array) {
        return await StockInsiderTrade.bulkCreate(insiders_array);
    },

    /**
     * This API is for only one stock.
     * It will be used on FE
     * */
    async fetchInsiderTrades(company_id) {
        return await StockInsiderTrade.findAll({ where: { company_id } });
    },

    /**
     * This API is for updating DB.
     * It will be not used on FE, and it is used on only BE.
     * */
    async fetchAllInsiderTrades() {
        return await StockInsiderTrade.findAll();
    },

    async fetchTransactionDateCompanyID() {
        return await connection.query(`
            SELECT transaction_date, company_id FROM "stock_insider_trade"
            `, { nest: false, type: connection.QueryTypes.SELECT });
    }

};