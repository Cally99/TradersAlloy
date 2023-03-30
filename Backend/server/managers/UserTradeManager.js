const UserTrade = require('../models').UserTrade;
const UserTx = require('../models').UserTx;
const DB = require('../helpers/DB');
const connection = DB.getConnection();

module.exports = {
    async updateArrayOfUserTrades(data) {
        const user_id = data.user_id;
        const updateTrades = data.updateTrades;
        const insertTrades = data.insertTrades;
        const insertTxs = data.insertTxs;

        const updatedTrades = [];
        const insertedTrades = [];
        const insertedTxs = [];

        const t = await connection.transaction();

        try {
            for(let ut of updateTrades) {
                const trade_id = ut.trade_id;

                delete ut.trade_id;

                const response = await UserTrade.update(ut, {where: {trade_id}}, {transaction: t});
                updatedTrades.push(response);
            }

            for(const it of insertTrades) {
                const response = await UserTrade.create(it, {transaction: t});
                insertedTrades.push(response);
            }

            for(const xt of insertTxs) {
                const response = await UserTx.create(xt, {transaction: t});
                insertedTxs.push(response);
            }

            await t.commit();

            const message = 'Saved successfully';

            const returnObject = {
                user_id,
                updatedTrades,
                insertedTrades,
                insertedTxs,
                message
            };

            return returnObject;
        } catch(error) {
            console.log(error.message);

            await t.rollback();

            return { errorMessage: error.message };
        }
    },

    async getUserTrades(user_id) {
        return await UserTrade.findAll({ where: { user_id } });
    },

    async selectUserTrades(user_id) {
        return await UserTrade.findAll({ where: { user_id }, order: [['exit_date', 'DESC']] });
    },

    async getUserStockPosition(user_id, stock_id, user_account_id) {
        const results = await connection.query(`
                            SELECT * 
                            FROM  user_trade 
                            WHERE user_id = :user_id
                            AND   stock_id = :stock_id 
                            AND   user_account_id = :user_account_id 
                            AND   exit_date IS NULL
        `, { replacements: {user_id, stock_id, user_account_id}, nest: false, type: connection.QueryTypes.SELECT });

        return results;
    },

    async getUserTradeByStock(user_id, stock_id) {
        return await UserTrade.findAll({ where: { user_id, stock_id } })
    },

    async insertTradeHistory(tradeHistory) { // This is from the Chart
        return await UserTrade.create(tradeHistory);
    },

    async insertUserTrade(userTrade) {
        return await UserTrade.create(userTrade);
    },

    async updateTradeHistory(body, trade_id) {   // This is from the Chart
        return await UserTrade.update(body, { where: { trade_id } });
    },

    async updateUserTrade(trade_id, body) {
        return await UserTrade.update(body, { where: { trade_id } });
    },

    async deleteUserTrade(trade_id) {
        return await UserTrade.destroy({ where: { trade_id } });
    },

    async findTrade(trade_id) {
        return await UserTrade.findOne( {where: { trade_id }})
    },

    async deleteUserTradeOnUserIdAndStockId(body) {
        const message = "Deleted trades for user: " + body.user_id + " on stock_id: " + body.stock_id;

        return await UserTrade.destroy({ where: { user_id: body.user_id, stock_id: body.stock_id } });
    },

    async deleteUserTradeOnUserId(user_id) {
        return await UserTrade.destroy({ where: { user_id } });
    },

    async getExposure(user_account_id){
        const exposure = await connection.query(`
                    select COALESCE (sum(entry_qty * exit_price), 0) as exposure
                    from   user_trade 
                    where  user_account_id = :user_account_id
                    and    exit_date is null
        `, { replacements: {user_account_id}, nest: false, type: connection.QueryTypes.SELECT });

        return exposure;

    },

    async updateAllPositionPrices() {
        const rowsUpdated = await connection.query(`
                            update user_trade UT
                            set    exit_price = sub.price_today
                            from (select stock_id,price_today 
                                  from stock) sub
                            where  UT.stock_id = sub.stock_id
                            and    UT.exit_date is null
        `, { nest: false, type: connection.QueryTypes.SELECT });

        return rowsUpdated;

    }





}

