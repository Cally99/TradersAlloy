<template lang="pug">
    div(v-if="researchs.some(x => x.ticker === watchlist.ticker)" @click="checkDeleteResearch ? gotoResearch(watchlist) : ''" class="document" style="margin-top:25px;position: relative;float: left;")
        v-img(:src="`/images/logos/senofidk/${watchlist.company_id}.png`" width="70px" style="display:inline-block; width:70px; float:right;")
        div(class="content" v-html="getResearchDoc(watchlist).content")

    div(v-else class="document" style="margin-top:25px; outline-style: dashed; outline-width: 1px;box-shadow: none;position: relative;float: left;")
        div(class="d-flex justify-end")
            div
                p(class="mb-0" style="font-weight: bold; color:#C8C8C8; font-size:15px!important;") {{ watchlist.name }}
                p(class="mb-0" style="font-weight: bold; color:#C8C8C8; font-size:15px!important;") {{ getStockByINSREF(watchlist.stock_id).name }}

        div
            span(style="display:block; margin-left:38%;  margin-top:80px; font-size:12px !important; font-weight:bold") No Research
            v-btn(style="display:block; margin-left:28%; margin-top:-10px; color:#3f51b5; text-decoration: underline !important; box-shadow: none; font-size:15px !important; font-weight:bold" class="text-lowercase btn_custom") write research
</template>

<script>
    import {mapActions, mapGetters} from "vuex";
    import _ from "lodash";
    import Ticker from "./../../components/Ticker.vue";

    export default {
        name: "SheetResearch",
        components: {
            Ticker
        },
        props: {
            watchlist: Object
        },
        computed: {
            ...mapGetters([
                'getResearchs',
                'getNavigationTabs',
                'getAllStocks',
                'getMapStocks'
            ]),
            productChunks() {
                return _.chunk(Object.values(this.items), 4);
            },
            researchs() {
                return this.$store.getters.getResearchs;
            },

            watchlists() {
                let items = this.$store.getters.getWatchlistItems;
                if (this.watchlistID != -1) {
                    return items.filter(i => i.watchlist_id == this.watchlistID);
                } else {
                    return items;
                }
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
                    let item = this.$store.getters["getMapStocks"].find(s => s.stock_id == stock_id)
                    return item
                }
            }
        },
        watch: {
            userSubscribed(val) {
                if (val == true) this.is_membership = false;
                else this.is_membership = false;
            },
        },
        methods: {
            ...mapActions(["setAddNavigationTabsAction"]),
            getResearchDoc(item) {
                let research = this.researchs.find(r => r.ticker === item.ticker);
                return research;
            },
            gotoResearch(item) {
                this.checkDeleteResearch = true;
                this.$router.push({name: 'landing-page.stock-detail', params: {stock_id: item.stock_id}, query: {tab: 1}});
            },
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

<style>
    .remove-research-item-design {
        position: absolute;
        left: 217px;
        top: 245px;
        background-color: white;
        color: gray;
    }

    .remove-research-item-design:hover {
        cursor: pointer !important;
        color: red;
    }

    .ta_research_toolbar {
        position: absolute;
        top: 250px;
        left: 20px;
        width: 238px;
        color: white;
        background-color: white;
        border: 1px solid cornflowerblue;
    }

    .ta_research_toolbar_item {
        padding: 4px;
        color: silver;
        margin-right: 130px;
    }

    .ta_research_toolbar_item:hover {
        color: #666666;
        cursor: pointer;
    }

    .btn_custom {
        background-color: transparent !important;

    }

    .btn_custom:hover {
        background-color: transparent !important;
    }

    .document {
        background-color: white;
        border: 1px #cccccc solid;
        width: 250px;
        height: 300px;
        box-shadow: 18px 18px 50px -20px rgba(0, 0, 0, 0.35);
        padding: 6px 7px;
        overflow: hidden;
    }

    .document:hover {
        box-shadow: 18px 18px 50px -20px rgba(0, 0, 0, 0.7);
    }

    .document p,
    .document span,
    .document * {
        font-size: 10px !important;
        line-height: 11px;
    }

    .document img {
        max-width: 50% !important;
    }

    .content >>> p {
        font-size: 6px !important;
    }
</style>
