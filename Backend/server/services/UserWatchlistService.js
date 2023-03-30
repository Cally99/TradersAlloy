const watchlistManager = require("../managers/UserWatchlistManager.js");

module.exports = {
    async addStocksToWLs(payload) {
        return await watchlistManager.addStocksToWLs(payload);
    },
    async removeStocksFromWLs(payload) {
        return await watchlistManager.removeStocksFromWLs(payload);
    },
    async removeStocksFromWLI(payload) {
        return await watchlistManager.removeStocksFromWLI(payload);
    },
    async selectWatchlists(user_id) {
        return await watchlistManager.selectWatchlists(user_id);
    },
    async selectWatchlistJoins(user_id) {
        return await watchlistManager.selectWatchlistJoins(user_id);
    },

    async selectWatchlistObjects(user_id) {
        return await watchlistManager.selectWatchlistObjects(user_id);
    },

    async selectWatchlist(wl_ID) {
        return await watchlistManager.selectWatchlist(wl_ID);
    },

    async insertWatchlist(wl) {
        return await watchlistManager.insertWatchlist(wl);
    },

    async updateWatchlist(name, wl_ID) {
        return await watchlistManager.updateWatchlist(name, wl_ID);
    },

    async deleteWatchlist(wl_ID) {
        return await watchlistManager.deleteWatchlist(wl_ID);
    },

    async deleteWatchlistItems(payload) {
        return await watchlistManager.deleteWatchlistItems(payload);
    },

    async deleteWatchlistAndWatchlistItems(wl_ID) {
        return await Promise.all([
            watchlistManager.deleteWatchlistItems(wl_ID),
            watchlistManager.deleteWatchlist(wl_ID)
        ]);
    },

    async selectItems(user_id) {
        return await watchlistManager.selectItems(user_id);
    },

    async selectItem(watchlist_item_id) {
        return await watchlistManager.selectItem(watchlist_item_id);
    },

    async insertItem(wli) {
        return await watchlistManager.insertItem(wli);
    },

    async updateItem(wli, wli_ID) {
        return await watchlistManager.updateItem(wli, wli_ID);
    },

    async deleteItem(payload) {
        return await watchlistManager.deleteItem(payload);
    },

    async deleteWatchlistItemsOnUserId(user_id) {
        return await watchlistManager.deleteWatchlistItemsOnUserId(user_id);
    },

    async deleteAllWatchlistJoinsOnUserId(user_id) {
        return await watchlistManager.deleteAllWatchlistJoinsOnUserId(user_id);
    },

    async selectByUserId(user_id) {
        const results = await watchlistManager.selectByUserId(user_id);
        let watchlists = _(results)
            .groupBy(x => [x.watchlist_id, x.watchlist_name])
            .map((value, key) => ({ watchlist_id: key, items: value }))
            .value();

        return watchlists;
    },

    async selectWatchlistItemsExtended(user_id) {
        return await watchlistManager.selectWatchlistItemsExtended(user_id);
    },

    async updateConviction(stock_id, user_id, conviction) {
        const user_data = await watchlistManager.check_exist(stock_id, user_id);
        if (user_data) {
            await watchlistManager.updateConviction(stock_id, user_id, conviction);
            return user_data;
        } else {
            throw new Error("NOT_EXIST");
        }
    },

    async fetchConviction_withINSREF(stock_id, user_id) {
        return await watchlistManager.fetchConviction_withINSREF(stock_id, user_id);
    },

    async addTags(stock_id, user_id, tags) {
        return await watchlistManager.addTags(stock_id, user_id, tags);
    },

    async getUserTradePlans(stock_id, user_id) {
        return await watchlistManager.getUserTradePlans(stock_id, user_id);
    },
}