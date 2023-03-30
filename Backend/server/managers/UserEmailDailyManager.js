const DB = require('../helpers/DB');
const connection = DB.getConnection();
const log4js = require('log4js');
const healthCheck = log4js.getLogger("health");

module.exports = {
    async getAllAlertsForAllUsers() {

        const results = await connection.query(`
            select S.stock_id, 
                    U.email, 
                    S.ticker, 
                    S.name, 
                    'ENTRY' as reason, 
                    S.price_today, 
                    UTP.entry_price as what_price_was_crossed, 
                    UTP.trade_plan_id
            from  user_trade_plan UTP , 
                  stock S, 
                  users U
            where S.price_today < UTP.entry_price  and S.price_today > UTP.stoploss_price
            and   S.stock_id = UTP.stock_id
            and   U.user_id = UTP.user_id
            and   UTP.entry_alert_status = 'on'
            and   ((EXTRACT(EPOCH FROM CURRENT_DATE) * 1000) BETWEEN exit_date and entry_date)
        UNION
            select S.stock_id, 
                   U.email, 
                   S.ticker, 
                   S.name, 
                   'STOPLOSS', 
                   S.price_today, 
                   UTP.stoploss_price, 
                   UTP.trade_plan_id
            from    user_trade_plan UTP, 
                    stock S, 
                    users U
            where S.price_today < UTP.stoploss_price
            and   S.stock_id = UTP.stock_id
            and   U.user_id = UTP.user_id
            and   UTP.stoploss_alert_status = 'on'
            and   ((EXTRACT(EPOCH FROM CURRENT_DATE) * 1000) BETWEEN exit_date and entry_date)
        UNION
            select S.stock_id, 
                   U.email, 
                   S.ticker, 
                   S.name, 
                   'TARGET', 
                   S.price_today, 
                   UTP.target_price, 
                   UTP.trade_plan_id
            from    user_trade_plan UTP, 
                    stock S, 
                    users U
            where S.price_today > UTP.target_price
            and   S.stock_id = UTP.stock_id
            and   U.user_id = UTP.user_id
            and   UTP.target_alert_status = 'on'
            and   ((EXTRACT(EPOCH FROM CURRENT_DATE) * 1000) BETWEEN exit_date and entry_date)
            ORDER BY 1,2,4
        `,  {nest: false, type: connection.QueryTypes.SELECT});

        return results;

    },

    async updateTarget(array) {
        if(array.length > 0) {
            const count = await connection.query(`
                update user_trade_plan 
                set target_alert_status = 'fired' 
                where trade_plan_id IN ( :ids)
                `,  {logging:true, nest: false, replacements: {ids: array}, type: connection.QueryTypes.SELECT});

            healthCheck.info('updated user_trade_plan table - TARGET ' + count);
            return count;
        }
    },

    async updateStoploss(array) {
        if(array.length > 0) {
            const count = await connection.query(`
                update user_trade_plan 
                set stoploss_alert_status = 'fired' 
                where trade_plan_id IN ( :ids)
                `,  {logging:true, nest: false, replacements: {ids: array}, type: connection.QueryTypes.SELECT});

            healthCheck.info('updated user_trade_plan table - STOPLOSS ' + count);
            return count;
        }
    },

    async updateEntry(array) {
        if(array.length > 0) {
            const count = await connection.query(`
                update user_trade_plan 
                set entry_alert_status = 'fired' 
                where trade_plan_id IN ( :ids)
                `,  {logging:true, nest: false, replacements: {ids: array}, type: connection.QueryTypes.SELECT});

            healthCheck.info('updated user_trade_plan table - ENTRY ' + count);
            return count;
        }
    }

};
