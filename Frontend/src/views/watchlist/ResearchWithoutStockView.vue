<template lang="pug">
    div(@click="checkDeleteResearch ? gotoResearch : ''" class="document" style="position:relative; float:left;")
        v-img(:src="`/images/logos/senofidk/${company_id}.png`" width="70px" style="display:inline-block; width:70px; float:right;")
        div(class="content" v-html="research.content")

        div(class="drag-info") Drag to the watchlist
</template>

<script>
    import {mapActions, mapGetters} from "vuex";
    import _ from "lodash";

    export default {
        name: "SheetNotSelectedResearch",
        computed: {
            ...mapGetters(["getResearchs", "getNavigationTabs", "getAllStocks", "getMapStocks"]),
            company_id() {
                const company_id = this.$store.getters.getAllStocks.find((s) => s.stock_id === this.research.stock_id).company_id;
                return company_id;
            },
            productChunks() {
                return _.chunk(Object.values(this.items), 4);
            },
            researchs() {
                return this.$store.getters.getResearchs;
            },

            researchesWithNoWatchlist() {
                const userId = JSON.parse(localStorage.getItem('user')).user_id;
                const researchWithNoWatchlist = this.$store.getters.getResearchs.filter((r) => {
                    return !this.$store.getters.getWatchlistItems.find((w) => {
                        if(w.user_id === userId && w.stock_id === r.stock_id) {
                            return r;
                        }
                    });
                });
                return researchWithNoWatchlist;
            },

            watchlists() {
                let items = this.$store.getters.getWatchlistItems;
                return items;
            },

            watchlistsxxx() {
                let final_array = [];
                for (var i = 0; i < this.$store.getters.getWatchlistItems.length; i++) {
                    let flag = true;
                    for (var j = 0; j < this.$store.getters.getResearchs.length; j++) {
                        if (this.$store.getters.getWatchlistItems[i].stock_id == this.$store.getters.getResearchs[j].stock_id) {
                            flag = false;
                        }
                    }
                    if (flag) {
                        final_array.push(this.$store.getters.getWatchlistItems[i]);
                    }
                }

                return final_array;
            },
            userSubscribed: {
                get() {
                    return this.$store.getters.getUserSubscribed;
                },
                set() {
                    this.is_membership = false;
                },
            },

            getStockByINSREF() {
                return stock_id => {
                    let item = this.$store.getters["getMapStocks"].find(s => s.stock_id == stock_id);
                    return item
                }
            }
        },
        watch: {
            userSubscribed(val) {
                if (val) {
                    this.is_membership = true;
                } else {
                    this.is_membership = false
                }
            },
        },
        methods: {
            ...mapActions(["setAddNavigationTabsAction"]),
            selectDeleteResearch(event, item) {
                this.checkDeleteResearch = false;

                setTimeout(() => {
                    this.checkDeleteResearch = true;
                }, 1000);

                this.$emit('selectDeleteResearch', event, item);
            },
            getResearchDoc(item) {
                return this.researchs.find(r => r.ticker === item.ticker);
            },
            gotoResearch() {
                this.checkDeleteResearch = true;
                this.$router.push({name: 'landing-page.stock-detail', params: {stock_id: this.research.stock_id}, query: {tab: 1}});
            },
        },
        props: {
            research: Object,
        },
        data() {
            return {
                checkDeleteResearch: true,
                r: null,
                stocks: [],
                user: JSON.parse(localStorage.user),
                rating_value: [-2, 2],
                items: [],
                is_membership: false,
                remained_researches: 9,
                showPP: true,
                default_value:
                    '<p style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px 0px 16px; font-size: 14.4px; line-height: 24px; color: rgb(65, 65, 65); font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-style: initial; text-decoration-color: initial;"><span style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; color: rgb(184, 49, 47); font-family: sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline !important;"><strong style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; font-weight: 700;">Products</strong></span></p>\n' +
                    '<p style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px 0px 16px; font-size: 14.4px; line-height: 24px; color: rgb(65, 65, 65); font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-style: initial; text-decoration-color: initial;"><span style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; color: rgb(40, 50, 78);"><span style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; font-family: sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline !important;">Hint: Create your own template and save for all future research (see the toolbar above).</span></span></p>\n' +
                    '<p style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px 0px 16px; font-size: 14.4px; line-height: 24px; color: rgb(65, 65, 65); font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-style: initial; text-decoration-color: initial;"><span style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; color: rgb(184, 49, 47);"><span style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; font-family: sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline !important;"><strong style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; font-weight: 700;">Competition</strong></span></span></p>\n' +
                    '<p style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px 0px 16px; font-size: 14.4px; line-height: 24px; color: rgb(65, 65, 65); font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-style: initial; text-decoration-color: initial;"><span style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; color: rgb(184, 49, 47);"><span style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; font-family: sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline !important;"><strong style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; font-weight: 700;">Thesis</strong></span></span></p>\n' +
                    '<p style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px 0px 16px; font-size: 14.4px; line-height: 24px; color: rgb(65, 65, 65); font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-style: initial; text-decoration-color: initial;"><span style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; color: rgb(184, 49, 47);"><span style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; font-family: sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline !important;"><strong style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; font-weight: 700;">Future Trends</strong></span></span></p>\n' +
                    '<p style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px 0px 16px; font-size: 14.4px; line-height: 24px; color: rgb(65, 65, 65); font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-style: initial; text-decoration-color: initial;"><span style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; color: rgb(184, 49, 47);"><span style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; font-family: sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline !important;"><strong style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; font-weight: 700;">History</strong></span></span></p>\n' +
                    '<p style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px 0px 16px; font-size: 14.4px; line-height: 24px; color: rgb(65, 65, 65); font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-style: initial; text-decoration-color: initial;"><span style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; color: rgb(184, 49, 47);"><span style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; font-family: sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline !important;"><strong style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; font-weight: 700;">Management</strong></span></span></p>\n' +
                    '<p style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px 0px 16px; font-size: 14.4px; line-height: 24px; color: rgb(65, 65, 65); font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-style: initial; text-decoration-color: initial;"><span style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; color: rgb(184, 49, 47);"><span style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; font-family: sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline !important;"><strong style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; font-weight: 700;">Region</strong></span></span></p>\n' +
                    '<p style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px 0px 16px; font-size: 14.4px; line-height: 24px; color: rgb(65, 65, 65); font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-style: initial; text-decoration-color: initial;"><span style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; color: rgb(184, 49, 47);"><span style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; font-family: sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline !important;"><strong style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; font-weight: 700;">Debt</strong></span></span></p>\n' +
                    '<p style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px 0px 16px; font-size: 14.4px; line-height: 24px; color: rgb(65, 65, 65); font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-style: initial; text-decoration-color: initial;"><span style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; color: rgb(184, 49, 47);"><span style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; font-family: sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline !important;"><strong style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; font-weight: 700;">Legal Risk</strong></span></span></p>\n' +
                    '<p style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px 0px 16px; font-size: 14.4px; line-height: 24px; color: rgb(65, 65, 65); font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-style: initial; text-decoration-color: initial;"><span style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; color: rgb(184, 49, 47); font-family: sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline !important;"><strong style="box-sizing: border-box; background-repeat: no-repeat; padding: 0px; margin: 0px; font-weight: 700;">Trade Plan</strong></span></p>',
            };
        },
    };
</script>

<style scoped>
.drag-info {
    font-size: 18px !important;
    font-weight: 900;
    color: grey;
    position:absolute;
    top: 130px;
    left: 35px;
    text-shadow: 5px 5px 6px lightgrey;
    display: none;
}

.document:hover {
    cursor: pointer;
}

.document:hover .drag-info {
    cursor: pointer;
    display: block;
}
</style>
