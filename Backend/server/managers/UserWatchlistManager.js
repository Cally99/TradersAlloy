const UserWatchlist = require('../models').UserWatchlist;
const UserWatchlistItem = require('../models').UserWatchlistItem;
const UserWatchlistJoin = require('../models').UserWatchlistJoin;
const Stock = require('../models').Stock;

const DB = require('../helpers/DB');
let connection = DB.getConnection();

module.exports = {
    async addStocksToWLs(payload) {
        var stock_in_WLI = await UserWatchlistItem.findOne({ where: { stock_id: payload.stock_id, user_id: payload.user_id } });
        var stock_in_table = true;

        if (!stock_in_WLI) {
            const selected_stock = await Stock.findOne({ where: { stock_id: payload.stock_id } });
            const priceToday = selected_stock.price_today;
            const company_id = selected_stock.company_id;
            const isin = selected_stock.isin;
            const ticker = selected_stock.ticker;
            const name = selected_stock.name;
            stock_in_WLI = await UserWatchlistItem.create({
                user_id: payload.user_id,
                stock_id: payload.stock_id,
                isin: isin,
                ticker: ticker,
                name: name,
                conviction: 0,
                watched_since: new Date().toISOString().slice(0, 10),
                watched_since_price: priceToday,
                company_id: company_id
            });
            stock_in_table = false;
        }
        var added_WLJ = await UserWatchlistJoin.create(payload)
        return {
            WLI: stock_in_WLI,
            exist_WLI: stock_in_table,
            WLJ: added_WLJ
        };
    },
    async removeStocksFromWLs(payload) {
        return await UserWatchlistJoin.destroy({ where: { watchlist_id: payload.watchlist_id, user_id: payload.user_id, stock_id: payload.stock_id } });
    },
    async removeStocksFromWLI(payload) {
        return await UserWatchlistItem.destroy({ where: { stock_id: payload.stock_id, user_id: payload.user_id } });
    },
    async selectWatchlists(user_id) {
        return await UserWatchlist.findAll({ where: { user_id } });
    },
    async selectWatchlistJoins(user_id) {
        return await UserWatchlistJoin.findAll({ where: { user_id: user_id } });
    },

    async selectWatchlistObjects(user_id) {
        return await UserWatchlist.findAll({
            where: { user_id },
            include: UserWatchlistItem
        }); // This is sequelize joining to the Watchlist Items
    },

    async selectWatchlist(watchlist_id) {
        return await UserWatchlist.findByPk(watchlist_id);
    },

    async insertWatchlist(watchlist) {
        return await UserWatchlist.create(watchlist);
    },

    async updateWatchlist(name, watchlist_id) {
        return await UserWatchlist.update({ name }, { where: { watchlist_id } });
    },

    async deleteWatchlist(watchlist_id) {
        return await UserWatchlist.destroy({ where: { watchlist_id } });
    },

    async deleteWatchlistItems(payload) {
        return await UserWatchlistItem.destroy({ where: { stock_id: payload.stock_id, user_id: payload.user_id } });
    },

    async selectItems(user_id) {
        return UserWatchlistItem.findAll({ where: { user_id } });
    },

    async selectItem(watchlist_item_id) {
        return UserWatchlistItem.findOne({ where: { watchlist_item_id } });
    },

    async insertItem(watchlist_item) {
        return await UserWatchlistItem.create(watchlist_item);
    },

    async updateItem(watchlistItem, watchlist_item_id) {
        const updatedRows = await UserWatchlistItem.update(
            watchlistItem, { where: { watchlist_item_id } });
        return updatedRows;
    },

    async deleteItem(payload) {
        return await UserWatchlistJoin.destroy({ where: { stock_id: payload.stock_id, user_id: payload.user_id } });
    },

    async deleteWatchlistItemsOnUserId(user_id) {
        return await UserWatchlistItem.destroy({ where: { user_id } });
    },

    async deleteAllWatchlistJoinsOnUserId(user_id) {
        return await UserWatchlistJoin.destroy({ where: { user_id } });
    },

    // DOCUMENT ALL non-CRUD methods
    // USED BY THE WATCHLIST LHS ?
    async selectByUserId(user_id) { // TODO: is this used ???
        return await connection.query(`
            SELECT      WL.watchlist_id as watchlist_id,          
                        WL.name as watchlist_name,          
                        WL.type,          
                        WL.user_id,        
                        S.ticker,         
                        S.name,
                        S.insref ,          
                        I.conviction,
                        I.plan_entry_price,
                        I.plan_stoploss_price,
                        I.plan_target_price,
                        I.watched_since,
                        I.tags,
                        I.watchlist_item_id,                              
                        SK.sector_name        AS sector
            FROM    user_watchlist as WL, 
                    user_watchlist_item as I, 
                    Stock as S, 
                    stock_exchange_sector as SK              
            WHERE SK.sector_id::varchar(255) = S.sector_id
            AND   S.insref = I.insref
            AND   WL.watchlist_id = I.watchlist_id
            AND   WL.user_id = :user_id
            `, { replacements: { user_id }, type: connection.QueryTypes.SELECT, nest: false }, )
    },

    // DOCUMENT WHERE IS THIS SPECIAL CASE USED ???
    async selectWatchlistItemsExtended(userID) { // TODO: is this used ???
        return await connection.query(`
            SELECT      min(CR.date_report)         AS earnings_date,
                        CR.isin,          
                        CR.sales,
                        I.insref,         
                        I.ticker,         
                        I.name,         
                        I.conviction,
                        I.plan_entry_price,
                        I.plan_stoploss_price,
                        I.plan_target_price,
                        I.watched_since,
                        I.tags,
                        I.watchlist_item_id,                              
                        I.watchlist_id,                              
                        SK.sector_name              AS sector,
                        SK.sector_id
            FROM    user_watchlist_item      as I, 
                    stock                    as S,               
                    company_report           as CR 
            WHERE I.user_id = :user_id
            AND   I.insref = S.insref
            AND   SK.sector_id = S.sector_id
            AND   CR.isin = S.isin 
            AND   CR.eps is null
            group by 2,3,4,5,6,7,8,9,10,11,12,13,14,15
            `, { replacements: { user_id: userID }, type: connection.QueryTypes.SELECT, nest: false }, )
    },

    async check_exist(stock_id, user_id) {
        return await UserWatchlistItem.findOne({ where: { stock_id, user_id } });
    },

    async updateConviction(stock_id, user_id, conviction) {
        return await UserWatchlistItem.update({ conviction: conviction }, { where: { stock_id, user_id } });
    },

    async fetchConviction_withINSREF(stock_id, user_id) {
        return await UserWatchlistItem.findOne({ where: { stock_id, user_id } });
    },

    async addTags(stock_id, user_id, tags) {
        return await UserWatchlistItem.update({ tags: tags }, { where: { stock_id, user_id } });
    },

    async getUserTradePlans(stock_id, user_id) {
        return UserWatchlistItem.findAll({ where: { user_id, stock_id } });
    },

};