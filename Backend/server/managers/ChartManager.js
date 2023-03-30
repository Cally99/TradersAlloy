const axios = require('axios');

const DB = require('../helpers/DB');
const connection = DB.getConnection();

module.exports = {
    async fetchChartNews(stock_id) {
        return await connection.query(`
            SELECT      stock_id, 
                        EXTRACT(EPOCH FROM timestamp::timestamp) as "timestamp", 
                        content
            FROM        stock_news                           
            WHERE       stock_id = :stock_id                  
            ORDER BY 2
            `, {
            replacements: {stock_id},
            type: connection.QueryTypes.SELECT, nest: false,
        })
    },
    async fetchChartInsiders(stock_id) {
        // 153624	SE0010023432	Mertiva 	Håkan  Blomdahl        	Styrelseledamot/suppleant    	5011	Antal     	41.7	2020-03-30	SEK	Förvärv
        return await connection.query(`
                SELECT  insider_trade_id, 
                        EXTRACT(EPOCH FROM transaction_date::timestamp) as "transaction_timestamp",
                        stock_id,
                        volume,
                        price,
                        transaction_nature, 
                        qty_or_amount
                 FROM   stock_insider_trade   
                 WHERE  stock_id = :stock_id                  
                 ORDER BY transaction_timestamp
                 `, {
                replacements: {stock_id},
                type: connection.QueryTypes.SELECT, nest: false,

            })
    },
    async fetchChartUserAnnotations(isin, user_id) {
        return await connection.query(`
                SELECT  user_id, 
                        stock_id,
                        content
                FROM    user_chart_lines   
                WHERE stock_id = :stock_id       
                AND   user_id = :user_id
                `, {
            replacements: {isin: isin, user_id,},
            type: connection.QueryTypes.SELECT, nest: false,

        })
    },

    // TODO: MUST DO : We can simplify this if we KEEP the old calendar records, and not delete them.
    async fetchChartEarningsDates(stock_id) {
        let CR_data = await connection.query(`
                SELECT  period, 
                        EXTRACT(EPOCH FROM date_report::timestamp) as "date_report_ms"
                FROM    company_report CR, 
                        stock S
                WHERE   S.company_id = CR.company_id
                AND     S.stock_id = :stock_id
                `, {
            replacements: {stock_id},
            type: connection.QueryTypes.SELECT, nest: false,
        });
/*        --                UNION ALL
        SELECT  period,
            EXTRACT(EPOCH FROM date_report::timestamp) as "date_report_ms"
        FROM    company_calendar
        WHERE   company_id = :company_id

 */
        return CR_data;
    },
    async fetchChartUserTrades(stock_id, user_id) {
        //        9	1	SE0010023432	MERT A	2020-03-01	10	100	CLOSED	2020-04-01	13	100	0	200	0	Followed process, exited as planned. Wait for next pull-back
        return await connection.query(
            `SELECT user_id, 
                        stock_id, 
                        ticker,
                        EXTRACT(EPOCH FROM entry_date::timestamp) as "entry_timestamp",
                        entry_price,
                        entry_qty,
                        status, 
                        EXTRACT(EPOCH FROM exit_date::timestamp) as "exit_timestamp",
                        exit_price,
                        exit_qty,
                        commission,
                        pl,
                        pl_pct,
                        notes
                     FROM user_trade
                     WHERE stock_id = :stock_id
                     AND   user_id = :user_id                  
                     ORDER BY entry_timestamp
                     `, {
                replacements: {
                    stock_id,
                    user_id
                },
                type: connection.QueryTypes.SELECT, nest: false,

            })
    }

};
