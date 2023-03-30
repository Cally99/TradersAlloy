const watchlistService = require("../services/UserWatchlistService");
const log4js = require('log4js');
const logger = log4js.getLogger("app_log");


/* ****************************************************************************************


 BEGIN THIS CODE WITH THE CRUD methods for watchlists and watchlist item... then follow with the special cases

  The policy is to send a full object from the client (default values added (except a new/next Id, a new record will
  be RETURNED by inserts to the client which can be added to VUEX locally.

****************************************************************************************** */
module.exports = {
    async addStocksToWLs(req, res) {
        const WL = await watchlistService.addStocksToWLs(req.body);
        res.status(200).send(WL);
    },
    async removeStocksFromWLs(req, res) {
        await watchlistService.removeStocksFromWLs(req.body);
        res.status(200).send('deleted from WL');
    },
    async removeStocksFromWLI(req, res) {
        await watchlistService.removeStocksFromWLI(req.body);
        res.status(200).send('deleted from WL');
    },
    async selectWatchlists(req, res) {
        const WL = await watchlistService.selectWatchlists(req.params.user_id);
        res.status(200).send(WL);
    },
    async selectWatchlistJoins(req, res) {
        const WLJ = await watchlistService.selectWatchlistJoins(req.params.user_id);
        res.status(200).send(WLJ);
    },

    async selectWatchlistObjects(req, res) {
        const WL = await watchlistService.selectWatchlistObjects(req.params.user_id);
        res.status(200).send(WL);
    },

    async selectWatchlist(req, res) {
        const WL = await watchlistService.selectWatchlist(req.params.watchlist_id);
        res.status(200).send(WL);
    },

    async insertWatchlist(req, res) {
        const WL = await watchlistService.insertWatchlist(req.body);
        res.status(200).send(WL);
    },

    async updateWatchlist(req, res) {
        const WL = await watchlistService.updateWatchlist(req.body.name, req.body.watchlist_id);
        res.status(200).send(WL);
    },

    async deleteWatchlist(req, res) {
        await watchlistService.deleteWatchlistAndWatchlistItems(req.params.watchlist_id);
        res.status(200).send('Deleted WL and WLI');
    },

    async selectItems(req, res) {
        const WLI = await watchlistService.selectItems(req.params.user_id);
        res.status(200).send(WLI);
    },

    async insertItem(req, res) {
        const WLI = await watchlistService.insertItem(req.body);
        res.status(200).send(WLI);
    },

    async updateItem(req, res) {
        const WLI = await watchlistService.updateItem(req.body, req.body.watchlist_item_id);
        res.status(200).send(WLI);
    },

    async deleteItem(req, res) {
        await watchlistService.deleteItem(req.body);
        res.status(200).send('Deleted WLI');
    },

    async deleteWatchlistItemsOnUserId(req, res) {
        const user_id = req.params.user_id;

        await watchlistService.deleteWatchlistItemsOnUserId(user_id);
        res.status(200).send('Delete all user_watchlist_item for the user');
    },

    async deleteAllWatchlistJoinsOnUserId(req, res) {
        const user_id = req.params.user_id;

        await watchlistService.deleteAllWatchlistJoinsOnUserId(user_id);
        res.status(200).send('Deleted all user_watchlist_join for the user');
    },

    // DOCUMENT ALL non-CRUD methods
    // USED BY THE WATCHLIST LHS ?
    async selectByUserId(req, res) {
        const WLI = await watchlistService.selectByUserId(req.params.user_id);
        res.status(200).send(WLI);
    },

    // DOCUMENT WHERE IS THIS SPECIAL CASE USED ???
    async selectWatchlistItemsExtended(req, res) {
        const WLI = await watchlistService.selectWatchlistItemsExtended(req.params.user_id);
        res.status(200).send(WLI);
    },

    async updateConviction(req, res) {
        const stock_id = req.body.stock_id;
        const user_id = req.body.user_id;
        const conviction = req.body.conviction;
        //      console.log(stock_id, user_id, conviction);

        const WLI = await watchlistService.updateConviction(stock_id, user_id, conviction);
        res.status(200).send(WLI);
    },

    // JUNK ???
    async fetchConviction_withINSREF(req, res) {
        const WLI = await watchlistService.fetchConviction_withINSREF(req.body.stock_id, req.body.user_id);
        res.status(200).send(WLI);
    },

    async addTags(req, res) {
        const WLI = await watchlistService.addTags(req.body.stock_id, req.body.user_id, req.body.tags);
        res.status(200).send(WLI);
    },

    async fetchTags(req, res) { //same result with fetchConviction_withINSREF, so that I used it.
        const WLI = await watchlistService.fetchConviction_withINSREF(req.body.stock_id, req.body.user_id);
        res.status(200).send(WLI);
    },

    async getUserTradePlans(req, res) {
        const WLI = await watchlistService.getUserTradePlans(req.body.insref, req.body.user_id);
        res.status(200).send(WLI);
    },

}