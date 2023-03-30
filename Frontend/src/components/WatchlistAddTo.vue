<template lang="pug">
    div()
        v-btn( class="blue3 white--text"
                :disabled="disabled"
                style="text-transform:none;"
                @click="addToWatchlist(currentWatchlist, stocks)")
            v-icon(style="margin-right:10px;") mdi-eye-outline
            span(class="ellipsis" v-if="selectedWatchlists.length == 1") {{latestWatchlist}}
            span(class="ellipsis" v-else-if="selectedWatchlists.length > 1") {{currentWatchlistName}}, +{{selectedWatchlists.length-1}}
            span(class="ellipsis" v-else) {{this.$t('add_to')}}
                b(class="pl-1") {{currentWatchlistName}}

        v-menu( offset-y bottom left origin="top right" open-on-hover
                    :close-on-content-click="false"
                    transition="scroll-y-transition")
            template( v-slot:activator="{ on, attrs }")
                v-btn( blue
                        v-bind="attrs"
                        v-on="on"
                        class="blue1 white--text" style="margin:-3px;"
                        :disabled="disabled")
                    v-icon mdi-chevron-down

            v-list( style="width:265px")
                v-list-item( v-for="watchlist in watchlists"
                    class="cursor-pointer v-list-item--link v-list-sub-item"
                    style="height:10px; ")
                    v-list-item-title {{watchlist.name}}
                    v-checkbox(v-model="selectedWatchlists" :value="watchlist.watchlist_id" color="#244360"  @change="addToWatchlists(watchlist, stocks)")
                    // @click="addToWatchlist(watchlist, stocks)"
                v-divider(style="margin-bottom:40px;")
            div(style="background:white;")
                br
                v-slide-y-transition( hide-on-leave=true)
                    v-btn( v-if="!createNew"
                        style="position:absolute; right:10px; bottom:20px; border-color:#244360" outlined small class="lighten-3"
                        @click="createNew=true")
                        //- v-icon(style="margin-right:8px; ") mdi-eye
                        span(style="color:#244360") {{this.$t('new_watchlist')}}
                v-slide-y-transition( hide-on-leave=true)
                    v-text-field( v-if="createNew"
                        v-model="newWatchlistName"
                        label="" placeholder="New Watchlist Name" outlined dense
                        @keyup.enter="createNewWatchlist(newWatchlistName, stocks)"
                        style="margin:0 20px;")
</template>

<script>
    import {mapActions, mapGetters} from "vuex";
    import ApiStocks from "../Services/ApiStocks";

    export default {
        name: 'WatchlistAddTo',
        props: {
            stocks: Array,
            disabled: Boolean,
        },
        data: function() {
            return {
                newWatchlistName: "",
                createNew: false,
                oldSelectedWatchlists: [],
                selectedWatchlists: [],
                latestWatchlist: ""
            }
        },
        methods: {
            ...mapActions([
                "addStocksToWLJ",
                "removeStocksFromWLJ",
                "removeStocksFromWLI",
                ""
            ]),
            createNewWatchlist(name, stocks) {
                if (name==="") {
                    this.newWatchlistName = "";
                    this.createNew = false;
                    return;
                }

                const that = this;

                ApiStocks.insertWatchlist({name: name, user_id: this.user.user_id}).then((res) => {
                    let watchlist = res.data;
                    that.$store.commit('addWatchlist' , watchlist );
                    that.selectedWatchlists.push(watchlist.watchlist_id);
                    that.addToWatchlists(watchlist, stocks);
                });
                this.newWatchlistName = "";
                this.createNew = false;
            },

            addToWatchlist(watchlist, stocks) {
                if (this.selectedWatchlists.length === 0) {
                    this.selectedWatchlists.push(watchlist.watchlist_id);
                    this.addToWatchlists(watchlist, stocks);
                    // stocks.forEach(stock => {
                    //     if(this.getWatchlistItems.findIndex((item) => item.stock_id === stock.stock_id) === -1) {
                    //         const payload = {
                    //             user_id: this.user.user_id,
                    //             stock_id: stock.stock_id,
                    //             ticker: stock.ticker,
                    //             company_id: stock.company_id,
                    //             name: stock.name,
                    //             conviction: 0,
                    //             watched_since: new Date().toISOString().substring(0, 10),
                    //             watched_since_price: stock.price_today,
                    //             isin: stock.isin,
                    //             tags: null
                    //         };
                    //         ApiStocks.insertWatchlistItem(payload).then(async (response) => {
                    //             await that.$store.commit("addWatchlistItem", response.data);
                    //         });
                    //         this.$store.commit("setMessage", {text: `Added ${stock.ticker} to ${watchlist.name}`, type: 'success'});
                    //     }
                    // });
                }
            },
            async addToWatchlists(watchlist, stocks) {
                console.log(this.selectedWatchlists.length, this.oldSelectedWatchlists.length)
                var changedItem = null;
                var is_added = false;
                if(this.selectedWatchlists.length > this.oldSelectedWatchlists.length) {
                    changedItem = this.selectedWatchlists.filter(item => ! this.oldSelectedWatchlists.find(oItem => oItem==item))[0];
                    is_added = true;
                } else {
                    changedItem = this.oldSelectedWatchlists.filter(oItem => ! this.selectedWatchlists.find(item => oItem==item))[0];
                }
                var changedItemObj = this.watchlists.filter(item => item.watchlist_id == changedItem);
                var watchlist_name = '';
                if(changedItemObj.length > 0) {
                    watchlist_name = changedItemObj[0].name
                }
                if(is_added) {
                    this.$store.commit('setMessage', { text: "Added to "+watchlist_name, type: 'success' });
                } else {
                    this.$store.commit('setMessage', { text: "Removed from "+watchlist_name, type: 'success' });
                }
                
                for(var x in stocks) {
                    let unselectedWatchlists = this.getWatchlists.filter(item => !this.selectedWatchlists.find(watchlist_id => watchlist_id == item.watchlist_id)).map(item => item.watchlist_id);
                    let WLs = this.getWatchlistJoins.filter(item => item.stock_id == stocks[x].stock_id).map(item => item.watchlist_id);
                    let addedWatchlist = [];
                    let removedWatchlist = [];
                    if (WLs.length > this.selectedWatchlists.length) {
                        // unselect watchlist
                        removedWatchlist = WLs.filter(item => !this.selectedWatchlists.includes(item))[0]
                        console.log('removed', removedWatchlist);
                        await this.removeStocksFromWLJ({
                            watchlist_id: removedWatchlist,
                            stock_id: stocks[x].stock_id,
                            user_id: this.user.user_id
                        });
                        let WL = this.getWatchlistJoins.find(item => item.stock_id == stocks[x].stock_id);
                        if (!WL) {
                            await this.removeStocksFromWLI({
                                watchlist_id: removedWatchlist,
                                stock_id: stocks[x].stock_id,
                                user_id: this.user.user_id
                            });
                        }
                    } else {
                        // select watchlist
                        addedWatchlist = this.selectedWatchlists.filter(item => !WLs.includes(item))[0];
                        console.log('added', addedWatchlist);
                        await this.addStocksToWLJ({
                            watchlist_id: addedWatchlist,
                            stock_id: stocks[x].stock_id,
                            user_id: this.user.user_id
                        });

                        let WLI = this.getWatchlistItems.find(item => item.stock_id == stocks[x].stock_id && item.user_id == this.user.user_id);
                        if (!WLI) {
                            const payload = {
                                user_id: this.user.user_id,
                                stock_id: stocks[x].stock_id,
                                ticker: stocks[x].ticker,
                                company_id: stocks[x].company_id,
                                name: stocks[x].name,
                                conviction: 0,
                                watched_since: new Date().toISOString().substring(0, 10),
                                watched_since_price: stocks[x].price_today,
                                isin: stocks[x].isin,
                                tags: null
                            };
                            await this.$store.commit("addWatchlistItemToWLI", payload);
                        }
                    }
                }

                this.oldSelectedWatchlists = this.selectedWatchlists
            },
            initSelectedWatchList() {
                let Ids = [];
                Ids = this.getWatchlistJoins.filter(item => item.stock_id == this.stocks[0].stock_id && item.user_id == this.user.user_id).map(item => item.watchlist_id);
                this.selectedWatchlists = [...Ids];
                this.oldSelectedWatchlists = this.selectedWatchlists
            }
        },
        computed: {
            ...mapGetters(["getWatchlists", "getUserCurrentWatchlistId", "getWatchlistItems", "getWatchlistJoins"]),
            watchlists() {
                return this.$store.getters["getWatchlists"];
            },
            watchlistIDs: {
                get() {
                },
                set(newVal) {
                }
            },
            currentWatchlist() {
                const watchlistId = this.getUserCurrentWatchlistId;
                return this.getWatchlists.find((item) => item.watchlist_id === watchlistId)
            },
            currentWatchlistName() {
                return this.currentWatchlist.name;
            },
            user() {
                return JSON.parse(localStorage.getItem('user'))
            }
        },
        watch: {
            stocks() {
                this.initSelectedWatchList();
            },
            selectedWatchlists() {
                if (this.selectedWatchlists.length != 0) {
                    this.latestWatchlist = this.getWatchlists.find(item => item.watchlist_id == this.selectedWatchlists[0]).name
                }
            }
        },
        created() {
        },
        mounted() {
            this.initSelectedWatchList();
        },
        beforeDestroy() {
        },
    }
</script>

<style scoped>
.ellipsis {
    width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
}
</style>
