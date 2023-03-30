<template lang="pug">
    div(class="watchlist-section p-2")
        div(class="d-flex justify-space-between align-center pb-3")
            div(class="d-flex align-center")
                button(value="list" @click="viewMode = 'list'" class="button-group-left-design link-hover" :class="viewMode === 'list' ? 'button-active' : ''")
                    v-icon(right class="blue2--text" :class="viewMode === 'list' ? 'button-active' : ''") mdi-format-list-bulleted
                    span(class="hidden-sm-and-down pl-1") {{this.$t('List')}} 

                button(value="grid" @click="viewMode = 'grid'" class="button-group-middle-design link-hover" :class="viewMode === 'grid' ? 'button-active' : ''")
                    v-icon(right class="blue2--text" :class="viewMode === 'grid' ? 'button-active' : ''") mdi-view-grid
                    span(class="hidden-sm-and-down pl-1") {{this.$t('Charts')}}

                button(value="docs" @click="viewMode = 'docs', updateResearchs()" class="button-group-right-design link-hover" :class="viewMode === 'docs' ? 'button-active' : ''")
                    v-icon(right class="blue2--text" :class="viewMode === 'docs' ? 'button-active' : ''") mdi-file-document
                    span(class="hidden-sm-and-down pl-1") {{this.$t('research')}}

                //- v-btn-toggle(borderless v-model="viewMode")
                    v-btn(value="list" @click="viewMode = 'list'")
                        span(class="hidden-sm-and-down") List
                        v-icon(right) mdi-format-list-bulleted

                    v-btn(value="grid" @click="viewMode = 'grid'")
                        span(class="hidden-sm-and-down") Charts
                        v-icon(right) mdi-view-grid

                    v-btn(value="docs" @click="viewMode = 'docs', updateResearchs()")
                        span(class="hidden-sm-and-down") Research
                        v-icon(right) mdi-file-document

                span(v-if="!is_nameEditor" class="ml-12" style="min-width:280px; font-size:28px;" id="firstPageElement" @click="is_nameEditor=true") {{watchlistText}}
                v-text-field(v-else class="ml-12" style="font-size:28px; width: 450px;"
                                v-model="init_name"
                                @keyup.enter="renameWatchlist(final_name)"
                                @change="renameWatchlist(final_name)"
                                @blur="renameWatchlist(final_name)"
                                :autofocus="is_nameEditor" )
            div
                v-autocomplete(v-if="(watchlistID > -1 && getWatchlistJoins.length < 10 && user.type === 'new') || (watchlistID > -1 && getWatchlistJoins.length < 10 && user.type === 'freemium') || (user.type === 'admin' && watchlistID > -1) || (userSubscribed && watchlistID > -1)"
                    v-model="newWatchlistItem"
                    :label="$t('Add_to_watchlist')"
                    :placeholder="$t('Add_to_watchlist')"
                    class="stock-list"
                    data-v-step='0'
                    :filter="customFilter"
                    :items="getAllStocks"
                    item-text="name"
                    item-value="ticker"
                    return-object
                    dense solo
                    style="height: 40px;"
                )
                    template(v-slot:selection)
                        span

                    template( v-slot:item="data" style="vertical-align:middle")
                        p( style="display:inline-block; width:60px; margin-bottom:0px!important;" class="ticker") {{data.item.ticker}}
                        p( style="display:inline-block; width:200px; ; margin:0 0 0 40px; ") {{data.item.name}}
                        p( style="display:inline-block; width:200px; " class="ml-2") {{$t(data.item.sector_name)}}


            div( class="wl-container")
                button( class="blue3 ml-1" style="width:180px;color:#ffffff;padding:5px;border-radius:3px;" @click="click_newWatchlist()")
                    v-icon(style="margin-right:8px;color:#ffffff;") mdi-eye-outline
                    span {{$t('new_watchlist')}}

                br
                div( class="wl-util" style="float:right;")
                    WatchlistDropDown(:watchlistname="watchlistText" @navigateWatchlist="navigateWatchlist")

        ViewModeList( v-if="viewMode === 'list'" :watchlists="watchlists")

        ViewModeGrid( v-else-if="viewMode === 'grid'" :watchlists="watchlists")

        ViewModeDocs( v-else-if="viewMode === 'docs'" :researches="researchs")
</template>

<script>
import {mapActions, mapGetters} from "vuex";
import WatchlistDropDown from "./WatchlistDropDown";
import ChartPrice from "./ChartPrice";
import Ticker from "./Ticker";
import ViewModeList from '../views/watchlist/ViewModeList';
import ViewModeGrid from '../views/watchlist/ViewModeGrid';
import ViewModeDocs from '../views/watchlist/ViewModeDocs';
import ApiStocks from "../Services/ApiStocks.js";
import ApiService from "../Services/ApiService.js";
import moment from 'moment';
import _ from 'lodash';
export default {
    components: {
        WatchlistDropDown,
        ViewModeList,
        ViewModeGrid,
        ViewModeDocs,
        ChartPrice,
        Ticker
    },
    mounted: function() {
        this.watchlistItems = this.$store.getters.getWatchlistItems;
        this.init();
    },
    data() {
        return {
            user: JSON.parse(localStorage.getItem('user')),
            watchlistItems: this.$store.getters.getWatchlistItems,
            researchs: this.$store.getters.getResearchs,
            newWatchlistItem: null,
            newWatchlistName: "",
            dialog: false,
            confDlg: false,
            viewMode: 'list',
            config_temp_data: {},
            is_nameEditor: false,
            final_name: "",
            name: "",
        }
    },
    watch: {
        name() {
            this.final_name = this.name;
        },
        dialog(val) {
            if(val) {
                this.newWatchlistName = ''
            }
        },
        newWatchlistItem(val) {
            if(val!=null) {
                let isExist = this.watchlists.find(item=>item.company_id == val.company_id)
                if(!isExist) {
                    this.addWatchlistItem(val)
                }
                this.newWatchlistItem = null
            }
        }
    },
    computed: {
        ...mapGetters(["getResearchs", "getNavigationTabs", "getAllStocks", "getWatchlistItems"]),
        getWatchlistJoins() {
            return this.$store.getters.getWatchlistJoins;
        },
        paywallCriteria() {
            return ((this.user.type === "new" || this.user.type === "freemium") && this.numberOfWatchlistItems >= 10) && this.user.subscription_id === null;
        },
        numberOfWatchlistItems() {
            return this.$store.getters.getWatchlistItems.length;
        },
        researchesWithNoWatchlist() {
            const researchWithNoWatchlist = this.$store.getters.getResearchs.filter((r) => {
                return !this.$store.getters.getWatchlistItems.find((w) => {
                    if(w.stock_id === r.stock_id) {
                        return r;
                    }
                });
            });
            return researchWithNoWatchlist;
        },
        init_name: {
            get() {
                return this.watchlistText
            },
            set(val) {
                this.name = val
            }
        },
        watchlistID() {
            return this.$route.params.id ? this.$route.params.id : -1;
        },
        sortDirections() {
            const table = document.getElementById("sortable");
            const headers = table.querySelectorAll("th");
            return Array.from(headers).map(function(header) {
                // Track sort directions
                return "";
            });
        },
        watchlistText() {
            if (this.watchlistID === -1) {
                return this.$t("all_watchlists");
            } else {
                if (this.$store.getters['getWatchlists'].length > 0) {
                    const wl = this.$store.getters['getWatchlists'].find((item) => Number(item.watchlist_id) === Number(this.watchlistID));
                    if (wl) {
                        return wl.name;
                    } else {
                        return '';
                    }

                } else {
                    return 'Watchlist not specified';
                }
            }
        },
        getAllStocks() {
            return this.$store.getters['getAllStocks']
        },
        watchlists() {
            const stocks = this.$store.getters.getAllStocks;
            const companies = this.$store.getters.getMapCompanies;

            let watchlists = [];
            let watchlistItems = this.$store.getters.getWatchlistItems;
            let watchlistJoins = this.$store.getters.getWatchlistJoins;

            if(this.watchlistID > -1)  {
                watchlistJoins = watchlistJoins.filter((item) => item.watchlist_id === this.watchlistID);
                this.$store.commit('setUserCurrentWatchlistId', this.watchlistID);
            }

            watchlistJoins.map((item) => {
                const wli_info = watchlistItems.find((wli) => wli.stock_id === item.stock_id);
                if (wli_info) {
                    const companyId = stocks.find((s) => s.stock_id === item.stock_id).company_id;
                    if (companies.get(companyId)) {
                        const lastSales = companies.get(companyId).last_sales;
                        const next_earnings_date = companies.get(companyId).next_report_date;
                        const priceToday = stocks.find((s) => s.stock_id === item.stock_id).price_today;
                        const userResearch = this.$store.getters.getResearchs;
        
                        if(userResearch.find((r) => r.stock_id === item.stock_id) !== undefined) {
                            const given = moment(userResearch.find((r) => r.stock_id === item.stock_id).last_update_date, "YYYY-MM-DD");
                            const current = moment().startOf('day');
        
                            item.numberOfMonths = -moment.duration(given.diff(current)).asMonths();
                        }
        
                        watchlists.push({
                            'ticker': wli_info.ticker,
                            'Name': wli_info.name,
                            'Sector': wli_info.sector_name,
                            'EarningsDate': wli_info['Earnings Date'],
                            'next_earnings_date': next_earnings_date,
                            'price_today': parseFloat(priceToday).toFixed(2),
                            'Eps': (wli_info.eps !== null) ? wli_info.eps : '',
                            'Sales': (lastSales !== null) ? Math.round(lastSales / 1000000) : '',
                            'Watched Since': this.humanReadablePeriod(wli_info.watched_since),
                            '∆%': this.calcDeltaPercent(wli_info),
                            'Conviction': wli_info.conviction,
                            'company_id': wli_info.company_id,
                            'stock_id': wli_info.stock_id,
                            'Research': wli_info,
                            'tags': wli_info.tags,
                            'research_state': wli_info.research_state,
                            'wli_id': wli_info.watchlist_item_id
                        });
                    }
                    
                }
            });

            const filteredArr = watchlists.reduce((acc, current) => {  // remove the duplicated items in array
                const x = acc.find(item => item.stock_id === current.stock_id);
                if (!x) {
                    return acc.concat([current]);
                } else {
                    return acc;
                }
            }, []);
            
            return filteredArr;
        },
        userSubscribed() {
            return this.$store.getters.getUserSubscribed;
        }
    },
    methods: {
        ...mapActions(['loadUserWatchListItems', "addStocksToWLJ"]),
        updateResearchs() {
            this.researchs = JSON.parse(JSON.stringify(this.researchesWithNoWatchlist));
        },
        async init() {
            this.$intercom.hide();
            let vm = this;

            setTimeout(function() {
                vm.$intercom.update({utm_content: 'aaa', utm_campaign: 'watchlist'});
            }, 2000);

            try {
                const res = await ApiService.loadWLColumns(JSON.parse(localStorage.getItem('user')).user_id);

                // if (res.data.content) {

                //     let conf_array = JSON.parse(res.data.content);

                //     conf_array = conf_array.concat([{text:'',value:'delete', sortable:false, order:16}]);

                //     if(conf_array.length >= 1) {
                //         this.watch_headers = [...conf_array];
                //     }
                // }
            } catch(error) {
                console.log(error);
                this.$store.commit("setMessage", {text: "Something went wrong", type: 'error'});
            }
        },
        humanReadablePeriod(date) {
            let d = new Date();
            let days = Math.round((d - Date.parse(date)) / (1000 * 60 * 60 * 24), 0);
            if (days < 2) return "~ today";
            else if (days < 7) return "1 week";
            else if (days < 20) return "~1 month";
            else if (days < 40) return "1 month";
            else if (days < 70) return "2 months";
            else if (days < 100) return "3 months";
            else if (days < 365) return Math.round(days / 30, 0) + " months";
            return "> 1 year";
        },
        chnPage(object) {
            this.$emit('chnPage' , object)
        },
        newWatclist() {
            const that = this;

            ApiStocks.insertWatchlist({name: this.newWatchlistName, user_id: JSON.parse(localStorage.getItem('user')).user_id})
                .then((res) => {
                    that.$store.commit('addWatchlist' , res.data);
                    that.confDlg = false;
                    that.dialog = false;
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        customFilter(item, searchText) {
            // before update, the return value was only the ticker value of object, after update, return value  is whole object
            const s = searchText.toLowerCase();

            if (item.ticker.toLowerCase().indexOf(s) > -1 || item.name.toLowerCase().indexOf(s) > -1) {
                return item;
            }
        },
        async addWatchlistItem(val) {
            if(this.paywallCriteria) {
                this.$store.commit("setMessage", {
                    text: 'You can not add anymore items, you need to be premium user',
                    type: 'error'
                });
            } else {
                await this.addStocksToWLJ({
                    watchlist_id: this.watchlistID,
                    stock_id: val.stock_id,
                    user_id: JSON.parse(localStorage.getItem('user')).user_id
                });
                let WLI = this.getWatchlistItems.find(item => item.stock_id == val.stock_id && item.user_id == JSON.parse(localStorage.getItem('user')).user_id);
                if (!WLI) {
                    const payload = {
                        user_id: JSON.parse(localStorage.getItem('user')).user_id,
                        stock_id: val.stock_id,
                        ticker: val.ticker,
                        company_id: val.company_id,
                        name: val.name,
                        conviction: 0,
                        watched_since: new Date().toISOString().substring(0, 10),
                        watched_since_price: val.price_today,
                        isin: val.isin,
                        tags: null
                    };
                    await this.$store.commit("addWatchlistItemToWLI", payload);
                }
                await this.loadUserWatchListItems(JSON.parse(localStorage.getItem('user')).user_id);  // why it is needed? -- Paul
            }
        },
        calcDeltaPercent(stock) {
            let watched_price = stock.watched_since_price;
            let today_price = this.$store.getters['getAllStocks'].find(item => item.stock_id == stock.stock_id).price_today;
            if (watched_price == null || today_price == null) {
                return '';
            } else {
                return ~~((watched_price - today_price) / watched_price * 100);
            }
        },
        async click_newWatchlist(newWL_name = '') {
            let newWlName = newWL_name;
            const watchlists = _.orderBy(this.$store.getters.getWatchlists, ['name'], ['asc']);

            if (!newWlName) {
                newWlName = this.$t('new_watchlist');
            }

            let counter = 1;
            let conterText = '';

            for(const watchlist of watchlists) {
                if(newWlName === watchlist.name) {
                    newWlName = newWlName.replace(conterText, '');
                    counter++;
                    conterText = ` (${counter})`;
                    newWlName = `${newWlName}${conterText}`;
                }
            }

            try {
                const watchlist = (await ApiStocks.insertWatchlist({name: newWlName, user_id: JSON.parse(localStorage.getItem('user')).user_id})).data;
                this.$store.commit('addWatchlist', watchlist);
                this.$router.push({name: 'landing-page.watchlist-detail', params: {id: watchlist.watchlist_id}});
            } catch(error) {
                console.log(error.message);
            }
        },
        navigateWatchlist(index) {
            let watchlists = this.$store.getters['getWatchlists']
            let length = watchlists.length
            if (length == 0) {
                this.click_newWatchlist(this.$t('My_First_Watchlist'))
            } else {
                let watchlist = watchlists[index === length ? index - 1 : index];
                this.$router.push({name: 'landing-page.watchlist-detail', params: {id: watchlist.watchlist_id}});
            }
        },
        renameWatchlist(name) {
            this.is_nameEditor = false;

            if (!name) {
                return;
            }

            let id = this.$store.getters['getWatchlists'].find((item) => item.name === this.watchlistText).watchlist_id;

            ApiStocks.changeWatchlistName({
                name: name,
                watchlist_id: id,
            })
                .then((res) => {
                    let data = {
                        name: name,
                        watchlist_id : id
                    };

                    this.$store.commit('renameWatchlist' , data);
                })
                .catch((error) => {
                    console.log(error);
                });
        },
    }
}
</script>

<style scoped>
.no-research-created:hover {
    cursor: pointer;
}

.button-group-left-design {
    min-width: 125px;
    /* height: 32px; */
    background-color: #ffffff;
    border: 2px solid #4077AB;
    color: #4077AB;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
    padding: 3px;
}

.button-group-right-design {
    min-width: 125px;
    /* height: 32px; */
    background-color: #ffffff;
    border: 2px solid #4077AB;
    color: #4077AB;
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    padding: 3px;
}

.button-group-middle-design {
    min-width: 125px;
    /* height: 32px; */
    background-color: #ffffff;
    border-top: 2px solid #4077AB;
    border-bottom: 2px solid #4077AB;
    color: #4077AB;
    padding: 3px;
}

.button-active {
    background-color: #4077AB;
    color: #ffffff !important;
}

.link-hover:hover {
    background-color: #E0E6EB;
    color: #4077AB !important;
}

.link-hover:hover > .button-active {
    background-color: #E0E6EB;
    color: #4077AB !important;
}
</style>
<style>
.button {
  margin-top: 35px;
}

.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

.list-group {
  min-height: 20px;
}

.list-group-item {
  cursor: move;
  border:none;
}

.list-group-item i {
  cursor: pointer;
}

.list-group span {
    display:flex;
}

.list-group .list-group-item {
    margin: 7px 3px;
    padding: 0px;
    box-shadow:0 11px 15px -7px rgba(0,0,0,.2), 0 24px 38px 3px rgba(0,0,0,.05), 0 9px 46px 8px rgba(0,0,0,.12)
}

table thead>tr>th {
    text-align: left;
}

table tbody>tr>td {
    text-align: left;
}

.custom-td {
    min-width: 0;
    max-width: 100px;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.statistic.table td, .statistic.table th {
    padding:0!important;
}

.sortable {
  cursor: pointer;
}

.sortable:hover:after {
  background-color: #00cccc;
}

.stock-list .v-input__slot {
    box-shadow: none!important;
    border:1px solid #949494;
}
</style>
