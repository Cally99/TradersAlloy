<template lang="pug">
    v-btn(color="#64b5f6"
        x-small
        data-v-step='1'
        @click="addToWatchlist")
        v-icon(class="white--text" small) mdi-eye
</template>

<script>
    import {mapGetters, mapActions} from "vuex";
    import Vue from 'vue';

export default Vue.extend({

    computed: {
        ...mapGetters(["getUserSubscribed", "getMapUserWatchlists"])
    },
    created: {
        ...mapActions(["addWatchlistItemAction", "addWatchlistAction","setMessageAction"]),
    },
    methods: {
        async addToWatchlist() {
            try {
                let wl = null;

                // TODO: after Bahare has created a User state in VUEX
                let user = JSON.parse(localStorage.user);
                //  if (this.getUser.isSubscribed) {
                if (this.getUserSubscribed) {
                    let watchlistName;
                    watchlistName = 'Watchlist: ' + new Date().toISOString().substring(0, 10);
                    let wl = {
                        user_id: user.user_id,
                        name: watchlistName,
                        type: '-',
                    };
                    wl = await this.addWatchlistAction(wl);
                } else {
                    wl = this.getMapUserWatchlists.values().next().value;  // get the first element of a Map()
                }

                let wli = {
                    user_id: this.user.user_id,
                    stock_id: params.stock_id,
                    company_id: params.company_id,  // TODO: WHERE DO I GET THIS FROM
                    watchlist_id: wl.watchlist_id,
                    ticker: params.ticker,
                    isin: params.isin,
                    name: params.name,
                    conviction: 0,
                    watched_since: new Date().toISOString().substring(0,10),
                    watched_since_price: null,
                    tags: null,
                };
                this.addWatchlistItemAction(wli);
                this.setMessageAction({text: "Added to to Watchlist.", type:"success"});

            } catch (error) {
                this.setMessageAction({text: "Failed: to add to watchlist: "+error, type: "error"});
            }


        },
    },
});

</script>
