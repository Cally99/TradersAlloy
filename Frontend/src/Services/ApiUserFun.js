import Api from '@/Services/Api'

// User Fun == user functionality ... for the users benefit (not admin, login or billing)

export default {
    async addStocksToWLs(obj) {
        const response = await Api().post('/addStocksToWLs/', obj);
        return response;
    },
    async removeStocksFromWLs(obj) {
        const response = await Api().post('/removeStocksFromWLs/', obj);
        return response;
    },
    async removeStocksFromWLI(obj) {
        const response = await Api().post('/removeStocksFromWLI/', obj);
        return response;
    },
    async getWatchlistCategory(userId) {
        const response = await Api().get('/getWatchlistCategory/' + userId);
        return response;

        //                this.$store.commit("setMessage",{text: 'Failed to fetch User Watchlists.'+error, type: 'error'});
        //              return null;
    },

    async fetchUserWatchlistItems(userId) {
        return await Api().get('/watchlistitems/' + userId)
    },

    async fetchUserWatchlists(userId) {
        const response = await Api().get('/user_watchlists/' + userId);
        return response;
        //                this.$store.commit("setMessage",{text: 'Failed to fetch User Watchlists.'+error, type: 'error'});
        //              return null;
    },

    async getUserTradePlans(requestBody) {
        const response = await Api().get('/getUserTradePlans/', requestBody);
        return response;
        //                this.$store.commit("setMessage",{text: 'Failed to fetch User Trade Plan.'+error, type: 'error'});
        //              return null;
    },

    async upsertUserTradePlan(requestBody) {
        const response = await Api().post('/upsertUserTradePlan/', requestBody);
        return response;
        // .then((response) => {
        //     return response;
        // }, (error) => {
        //     this.$store.commit("setMessage",{text: 'Failed to SAVE User Trade Plan.'+error, type: 'error'});
        //     return null;
        // })
    },
    async deleteWatchlist(watchlist_id) {
        return await Api().delete('/watchlist/' + watchlist_id);
    },

    // WLIdelete(watchlist_item_id){
    //     return Api().delete('/watchlistitem/'+watchlist_item_id)
    //         .then((response) => {
    //             return response;
    //         }, (error) => {
    //             this.$store.commit("setMessage",{text: 'Failed to delete User Watchlist item.'+error, type: 'error'});
    //             return null;
    //         })
    // },
    // WLIsave(requestBody) {
    //     return Api().post('/watchlistitem/', requestBody)
    //         .then((response) => {
    //             return response
    //         }, (error) => {
    //             this.$store.commit("setMessage",{text: 'APiUserFun:'+error, type: 'error'});
    //         })
    // },

    async getFriends(user_id) {
        return await Api().get('/getFriends/' + user_id);
        // .then((response) => {
        //     return response
        // }, (error) => {
        //     this.$store.commit("setMessage",{text: 'APiUserFun:'+error, type: 'error'});
        // })
    },

    async addFriend(requestBody) {
        const response = await Api().post('/addFriend/', requestBody);
        return response;
        //                this.$store.commit("setMessage",{text: 'APiUserFun:'+error, type: 'error'});
    },

    async userResearchShare(requestBody) {
        const response = await Api().post('/user_research_share/', requestBody);
        return response;
        //                this.$store.commit("setMessage",{text: 'APiUserFun:'+error, type: 'error'});
    },

    async sendRapportkollen(requestBody) {
        const response = await Api().post('/send_rapportkollen', requestBody);
        this.$store.commit("setMessage", { text: 'Email sent', type: 'success' });
        return response;
        //                this.$store.commit("setMessage",{text: 'APiUserFun:'+error, type: 'error'});
    }
}