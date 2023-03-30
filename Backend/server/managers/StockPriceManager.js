const Stock = require('../models').Stock;
const StockPrice = require('../models').StockPrice;
const StockExchange = require('../models').StockExchange;

const millistreamManager = require('../managers/MillistreamManager');

const moment = require('moment');
const DB = require('../helpers/DB');
const connection = DB.getConnection();

module.exports = {

    async getLatestPriceLine(stock_id) {
        const priceLines =  await connection.query(`
                        SELECT stock_id, 
                                datetime_ms, 
                                open, 
                                high, 
                                low, 
                                close, 
                                volume 
                        FROM  stock_price   
                        WHERE stock_id = :stock_id
                        and   datetime_ms = (select max(datetime_ms) as latest 
                                             from stock_price 
                                             where stock_id = :stock_id
                                             limit 1)
            `, {replacements: {stock_id}, nest: false, type: connection.QueryTypes.SELECT});

        if (priceLines === undefined) {
            return null;
        }
        return priceLines[0];
    },

    /**
     *  Feeds the chart
     * */
    async getPrices(stock_id) {
        return await StockPrice.findAll({where: {stock_id}});
    },

    async getHistoricPrice(stock_id, startDate) {
        const priceLines =  await connection.query(`
                        select close
                        from   stock_price
                        where  stock_id = :stock_id
                        and    to_char( to_timestamp( datetime_ms / 1000), 'YYYY-MM-DD') = :startDate
            `, {replacements: {stock_id, startDate}, nest: false, type: connection.QueryTypes.SELECT});

        if (priceLines.length === 1) {
            if (priceLines[0].close !== null) {
                return priceLines[0];
            }
        }

        const endDate = moment(startDate).subtract(180, 'days').format('YYYY-MM-DD');
        const priceLinesOlder =  await connection.query(`
                    select close
                    from   stock_price
                    where  stock_id = :stock_id
                    and    to_char( to_timestamp( datetime_ms / 1000), 'YYYY-MM-DD') between :endDate and :startDate
                    and    close is not null
        `, {replacements: {stock_id, startDate, endDate}, nest: false, type: connection.QueryTypes.SELECT});



        if (priceLinesOlder.length >= 1) {
            return priceLinesOlder[priceLinesOlder.length-1];
        }

        throw new Error(`no_price_for_180_days`);

    },


}
