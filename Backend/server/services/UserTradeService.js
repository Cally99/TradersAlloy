const _ = require('lodash');
const DB = require('../config/DB.js');

const userTradeManager = require('../managers/UserTradeManager');

module.exports = {
    // Two sets of code (for UserTrade and TradeHistory) were combined (they had the same functionality).
    // This has created duplicate methods collected in this file.

    // Before deleting junk code (which costs us time to own and maintain) we should create Unit Tests that
    // define the functionality needed; we can then delete code with confidence. // Andrew

    async selectUserTrades(user_id) {
        const data = await userTradeManager.selectUserTrades(user_id);
        return data;
    },

    async getUserTrades(user_id) {
        return await userTradeManager.getUserTrades(user_id);
    },

    async getUserTradeByStock(user_id, stock_id) {
        return await userTradeManager.getUserTradeByStock(user_id, stock_id);
    },

    ///////////////////////////////////////////////////
    async insertTradeHistory(body) {
        return await userTradeManager.insertTradeHistory(body);
    },
    async actionUserTrade(data) {
        var returnData = null;
        var position = await userTradeManager.getUserStockPosition(data.user_id, data.stock_id, data.user_account_id);
        if (data.entry_price != null) {
            if (position.length == 0) {
                returnData = await userTradeManager.insertUserTrade(data);
            }
            else {
                data.entry_qty = Number(data.entry_qty) + Number(position[0].entry_qty);
                data.entry_price = (Number(data.entry_price)*Number(data.entry_qty) + Number(position[0].entry_price)) / Number(data.entry_qty);
                returnData = await userTradeManager.updateTradeHistory(data, position[0].trade_id);
            }
        }
        else {
            if (position.length > 0) {
                data.exit_qty = Number(data.exit_qty) + Number(position[0].exit_qty);
                data.exit_price = (Number(data.exit_price)*Number(data.exit_qty) + Number(position[0].exit_price)) / Number(data.exit_qty);
                returnData = await userTradeManager.updateTradeHistory(data, position[0].trade_id);
            }
        }
        return returnData;
    },

    async insertUserTrade(ut) {
        const userTrade = await userTradeManager.insertUserTrade(ut);
        return userTrade;
    },

    async updateUserTrade(trade_id, body) {
        const data = await userTradeManager.updateUserTrade(trade_id, body);
        return data;
    },

    async updateTradeHistory(body, trade_id) {
        const result = await userTradeManager.updateTradeHistory(body);
        if (result) {
            return await userTradeManager.findTrade(trade_id);
        } else {
            throw new Error('failed update trade');
        }
    },

    async deleteUserTrade(trade_id) {
        const data = await userTradeManager.deleteUserTrade(trade_id);
        return data;
    },

    ///////////////////////////////////////////////////
    // other unique methods (not duplicates)
    async insertArrayOfUserTrades(uts) {
        const userTrades = [];

        for(const ut of uts) {
            const returnedValue = await userTradeManager.insertUserTrade(ut);
            userTrades.push(returnedValue);
        }

        return userTrades;
    },

    async updateArrayOfUserTrades(data) {
        // const returnResponse = [];

        return await userTradeManager.updateArrayOfUserTrades(data);


        // for(const ut of uts) {
        //     const response = await userTradeManager.updateUserTrade(ut.trade_id, ut);

        // }
        // await uts.map(async (ut) => {
        //     // await userTradeManager.updateUserTrade(ut)
        //     await userTradeManager.updateUserTrade(ut.trade_id, ut);
        // });
        // return {
        //     flag: true,
        //     data: null
        // };
    },

    async deleteUserTradeOnUserIdAndStockId(body) {
        const data = await userTradeManager.deleteUserTradeOnUserIdAndStockId(body);
        return data;
    },

    async deleteUserTradeOnUserId(user_id) {
        const data = await userTradeManager.deleteUserTradeOnUserId(user_id);
        return data;
    }


}

