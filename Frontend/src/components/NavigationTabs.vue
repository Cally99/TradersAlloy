    <template lang="pug">
    div( class="main-page d-flex")
        v-navigation-drawer( permanent style="min-width:19px;" class="main-sidebar blue8" :style="`height:${windowHeight-72.5}px;`")

            //- Dashboard
            router-link(v-if="user.access==='admin'" :to="{name: 'landing-page.dashboard'}" )
                div(class="v-list-item v-list-non-sub-item mb-1 mt-2"
                        :class="otherMenuItemSelected('dashboard') ? 'highlighted-background highlighted-right-border' : ''"
                        @click="setActiveMenuItem('dashboard'), setShowUserAccountMenu(false)")
                    v-list-item-icon(class="my-0" style="border:0px solid;")
                        v-icon(:class="otherMenuItemSelected('dashboard') ? 'highlighted-background' : ''") mdi-view-dashboard
                    v-list-item-title(style="border:0px solid;") Dashboard


            //- Recents, last 8
            div(class="v-list-item v-list-non-sub-item mb-3 mt-2")
                v-list-item-title
                    v-list-item-icon(class="my-0")
                        v-icon mdi-history
                    span {{this.$t('Recent')}}
                    v-list-item(v-for="(recent) in recents"
                        @click="setActiveMenuItem(), setShowUserAccountMenu(false)"
                        :key="recent"
                        class="ml-3 mt-1"
                        :id="'stock-' + recent"
                    )
                        div
                            TickerComponent(:tickerLabel="getTicker(recent)" :stockId="recent" :isClickable="true")
                            span(
                                class="ml-3"
                                @mouseover="hoverEffect = true"
                                @mouseout="hoverEffect = false")
                                router-link(:to="{name: 'landing-page.stock-detail', params: {stock_id: recent}}" )
                                    v-icon(class="vv" size="95%" ) home

                                router-link(:to="{name: 'landing-page.stock-detail', params: {stock_id: recent}, query: {tab: 1}}" )
                                    v-icon(class="vv ml-1 " size="95%") mdi-file-document

                                router-link(:to="{name: 'landing-page.stock-detail', params: {stock_id: recent}, query: {tab: 2}}" )
                                    v-icon(class="vv ml-1" size="95%") mdi-chart-line

            //- Watchlists
            div( class="mb-1")
                router-link( :to="{name: 'landing-page.watchlist'}")
                    div(:id="'watchlist'" :class="otherMenuItemSelected('watchlist') ? 'highlighted-background highlighted-right-border' : ''"
                        @click="setActiveMenuItem('watchlist'), setShowUserAccountMenu(false)"
                        class="v-list-item v-list-non-sub-item cursor-pointer v-list-item--link")
                        v-list-item-icon(class="my-0")
                            v-icon(:class="otherMenuItemSelected('watchlist') ? 'highlighted-background' : ''") mdi-eye-outline
                        v-list-item-title {{this.$t('Watchlists')}}

                div( v-for="(wl, index) in watchlists"
                    @click="setActiveWatchlistSubMenuItem(index), setShowUserAccountMenu(false)"
                    @dragover="$store.commit('setIsDragged', index), $store.commit('setIsDraggedOverWatchlistItem', false)"
                    :class="($store.getters.getIsDragged === index) ? 'dashed-border' : checkWatchlistSubMenuActive(index) ? 'highlighted-background highlighted-right-border' : ''"
                    style="height:22px; overflow:hidden;")
                    draggable( group="watchlist" @start="drag=true" @end="false")
                        v-list-item(
                            :key="wl.watchlist_id"
                            class="cursor-pointer v-list-item--link v-list-sub-item"
                            style="width:100%;"
                            :id="'watchlist-' + wl.watchlist_id")
                            router-link( :to="{name: 'landing-page.watchlist-detail', params: {id: wl.watchlist_id}}"
                                style="width:100%;")
                                v-list-item-title( class="ellipsis blue1--text" style="border:0px solid;") {{ wl.name }}

            //- Research
            router-link(:to="{name: 'landing-page.research'}")
                div(:id="'research'" :class="otherMenuItemSelected('research') ? 'highlighted-background highlighted-right-border' : ''"
                    @click="setActiveMenuItem('research'), setShowUserAccountMenu(false)"
                    class="v-list-item v-list-non-sub-item cursor-pointer")
                    v-list-item-icon( class)
                        v-icon $research
                    v-list-item-title  {{this.$t('research_analyser')}}

            //- News
            router-link(:to="{name: 'landing-page.news'}")
                div(:id="'news'" :class="otherMenuItemSelected('news') ? 'highlighted-background highlighted-right-border' : ''"
                    @click="setActiveMenuItem('news'), setShowUserAccountMenu(false)"
                    class="v-list-item v-list-non-sub-item cursor-pointer")
                    v-list-item-icon( class)
                        v-icon mdi-web
                    v-list-item-title  {{this.$t('news')}}

            //- Screener
            router-link( :to="{name: 'landing-page.screener'}" )
                div(:id="'screener'" :class="otherMenuItemSelected('screener') ? 'highlighted-background highlighted-right-border' : ''"
                    @click="setActiveMenuItem('screener'), setShowUserAccountMenu(false)"
                    class="v-list-item v-list-non-sub-item cursor-pointer")
                    v-list-item-icon(class="my-0")
                        v-icon(:class="otherMenuItemSelected('screener') ? 'highlighted-background' : ''") mdi-target
                    v-list-item-title {{this.$t('Screen')}}
                    //- span(class="sticker") beta

            div
                v-list-item(v-for="(screen, index) in screeners"
                    @click="clickedScreener=index, setShowUserAccountMenu(false)"
                    :key="screen.name"
                    :id="'screener-' + screen.screen_id"
                    :class="clickedScreener === index ? 'highlighted-background highlighted-right-border' : ''"
                    class="cursor-pointer v-list-item--link v-list-sub-item"
                )
                    router-link(:to="{name: 'landing-page.screener-detail', params: {id: screen.screen_id}}" )
                        v-list-item-title(class="ellipsis" ) {{ screen.name }}

            //- Text Search
            //-router-link(:to="{name: 'landing-page.textSearch'}")
            div(v-if="this.user.access === 'admin'")
                div(class="v-list-item v-list-non-sub-item mt-4")
                    v-list-item-icon(class="my-0")
                        v-icon mdi-magnify
                    v-list-item-title Full Text Search
                div(style="color:#999999; margin-left:40px; margin-bottom:10px;")
                    input(@keyup.enter="searchTextGo(), setShowUserAccountMenu(false)"
                        label="Search"
                        v-model="searchString"
                        style="border:1px #aaaaaa solid; border-radius:3px; background-color:white;margin-top:0;padding:1px 4px;"
                        class="ml-1")
                    div(class="mx-2") saas, supply chain, Q3, ränta, ARPU, Löfven, Retail, 5G

            //- Portfolio
            div(v-if="this.user.access === 'admin' || this.user.access === 'vip'" class="mb-0")
                div( class="mb-1")
                    router-link( :to="{name: 'landing-page.plan'}")
                        div(:id="'plan'" :class="otherMenuItemSelected('plan') ? 'highlighted-background highlighted-right-border' : ''"
                            @click="setActiveMenuItem('plan'), setShowUserAccountMenu(false)"
                            class="v-list-item v-list-non-sub-item cursor-pointer v-list-item--link")
                            v-list-item-icon(class="my-0")
                                v-icon(:class="otherMenuItemSelected('plan') ? 'highlighted-background' : ''") mdi-currency-usd
                            v-list-item-title Portfolio

                div
                    //- router-link( :to="{name: 'landing-page.plan'}")
                        v-list-item(
                            @click="setActiveDecidedSubMenuItem(1), setShowUserAccountMenu(false)"
                            :class="checkDecidedSubMenuActive(1) ? 'highlighted-background highlighted-right-border' : ''"
                            key="plan"
                            id="plan"
                            class="cursor-pointer v-list-item--link v-list-sub-item"
                        )
                            v-list-item-title( class="blue1--text")  Portfolio Plan

                    router-link( :to="{name: 'landing-page.transactionTabs'}")
                        v-list-item(
                            @click="setActiveDecidedSubMenuItem(2)"
                            :class="checkDecidedSubMenuActive(2) ? 'highlighted-background highlighted-right-border' : ''"
                            key="transactionTabs"
                            id="transactionTabs"
                            class="cursor-pointer v-list-item--link v-list-sub-item mt-1"
                        )
                            v-list-item-title( class="blue1--text")  Transactions

                    router-link( :to="{name: 'landing-page.positions'}")
                        v-list-item(
                            @click="setActiveDecidedSubMenuItem(3)"
                            :class="checkDecidedSubMenuActive(3) ? 'highlighted-background highlighted-right-border' : ''"
                            key="positions"
                            id="positions"
                            class="cursor-pointer v-list-item--link v-list-sub-item mt-1"
                        )
                            v-list-item-title( class="blue1--text")  Positions

                    router-link( :to="{name: 'landing-page.performance'}")
                        v-list-item(
                            @click="setActiveDecidedSubMenuItem(4)"
                            :class="checkDecidedSubMenuActive(4) ? 'highlighted-background highlighted-right-border' : ''"
                            key="performance"
                            id="performance"
                            class="cursor-pointer v-list-item--link v-list-sub-item mt-1"
                        )
                            v-list-item-title( class="blue1--text")  Performance


            //- Competitions
            template(v-if="userCompetitions.length > 0")
                //- div(v-if="this.user.access === 'admin' || this.user.access === 'vip'" id="competitionContainer" class="mb-0 mt-3")
                div(id="competitionContainer" class="mb-0 mt-3")
                    div( class="v-list-item v-list-non-sub-item")
                        v-list-item-icon(class="my-0")
                            v-icon $trophy
                        v-list-item-title  {{$t('competitions')}}

                    div(v-for="(competition, index) in userCompetitions")
                        v-list-item(
                            @click="setActiveCompetitionItem(`competitionPlan${index}`), navigate('competitionPlan', competition.competition_id)"
                            :class="checkCompetitionMenuActive(`competitionPlan${index}`) ? 'highlighted-background highlighted-right-border' : ''"
                            class="cursor-pointer v-list-item--link v-list-sub-item"
                        )
                            v-list-item-title( class="blue1--text")
                                span(v-html="competition.svg_icon")
                                span &nbsp;{{competition.title}}
                        v-list-item(
                            @click="setActiveCompetitionItem(`competitionTransactions${index}`), navigate('competitionTransactions', competition.competition_id)"
                            :class="checkCompetitionMenuActive(`competitionTransactions${index}`) ? 'highlighted-background highlighted-right-border' : ''"
                            :id="`competitionTransactions${competition.competition_id}`"
                            class="cursor-pointer v-list-item--link v-list-sub-item"
                        )
                            v-list-item-title(class="ml-15 blue1--text" ) {{$t('transactions')}}
                        v-list-item(
                            @click="setActiveCompetitionItem(`competitionPositions${index}`), navigate('competitionPositions', competition.competition_id)"
                            :class="checkCompetitionMenuActive(`competitionPositions${index}`) ? 'highlighted-background highlighted-right-border' : ''"
                            :id="`competitionPositions${competition.competition_id}`"
                            class="cursor-pointer v-list-item--link v-list-sub-item"
                        )
                            v-list-item-title(class="ml-15 mt-1 blue1--text" ) {{$t('positions')}}
                        //- v-list-item(
                        //-     @click="setActiveCompetitionItem(`competitionPerformance${index}`), navigate('competitionPerformance', competition.competition_id)"
                        //-     :class="checkCompetitionMenuActive(`competitionPerformance${index}`) ? 'highlighted-background highlighted-right-border' : ''"
                        //-     class="cursor-pointer v-list-item--link v-list-sub-item"
                        //- )
                        //-     v-list-item-title(class="ml-15 mt-1 mb-3 blue1--text" ) Performance




            //- Backoffice
            div(v-if="this.user.access === 'admin'")
                div( class="v-list-item v-list-non-sub-item")
                    v-list-item-icon(class="mt-2 mb-2")
                        v-icon mdi-chart-bar
                    v-list-item-title Backoffice
                div
                    router-link( :to="{name: 'landing-page.backofficeUsers'}")
                        v-list-item(
                            @click="setActiveDecidedSubMenuItem(5), setShowUserAccountMenu(false)"
                            :class="checkDecidedSubMenuActive(5) ? 'highlighted-background highlighted-right-border' : ''"
                            key="backofficeUsers"
                            id="backofficeUsers"
                            class="cursor-pointer v-list-item--link v-list-sub-item"
                        )
                            v-list-item-title( class="blue1--text") Users

                    router-link( :to="{name: 'landing-page.backofficeCompanies'}")
                        v-list-item(
                            @click="setActiveDecidedSubMenuItem(6), setShowUserAccountMenu(false)"
                            :class="checkDecidedSubMenuActive(6) ? 'highlighted-background highlighted-right-border' : ''"
                            key="backofficeCompanies"
                            id="backofficeCompanies"
                            class="cursor-pointer v-list-item--link v-list-sub-item"
                        )
                            v-list-item-title( class="blue1--text") Companies

                    router-link( :to="{name: 'landing-page.vuexViewer'}")
                        v-list-item(
                            @click="setActiveDecidedSubMenuItem(7), setShowUserAccountMenu(false)"
                            :class="checkDecidedSubMenuActive(7) ? 'highlighted-background highlighted-right-border' : ''"
                            key="vuexViewer"
                            id="vuexViewer"
                            class="cursor-pointer v-list-item--link v-list-sub-item"
                        )
                            v-list-item-title( class="blue1--text") VUEX

                    router-link( :to="{name: 'landing-page.logViewer'}")
                        v-list-item(
                            @click="setActiveDecidedSubMenuItem(8), setShowUserAccountMenu(false)"
                            :class="checkDecidedSubMenuActive(8) ? 'highlighted-background highlighted-right-border' : ''"
                            key="backofficeUsers"
                            id="backofficeUsers"
                            class="cursor-pointer v-list-item--link v-list-sub-item"
                        )
                            v-list-item-title( class="blue1--text") Health Check Log

        div( class="main-section")
            router-view


</template>

<script>
    import {mapGetters, mapActions} from "vuex";
    import draggable from "vuedraggable";
    import TickerComponent from "./TickerComponent"
    export default {
        components: {
            draggable,
            TickerComponent
        },
        data() {
            return {
                windowHeight: 0,
                hoverEffect: false,
                activeMenuItem: 'watchlist',
                searchString: '',
                clickedWatchlist: null,
                clickedScreener: null,
                clickedOther: null,
                clickedCompetition: null
            }
        },
        mounted() {
            this.windowHeight = window.innerHeight;
            window.addEventListener('resize', this.setWindowHeight);
        },
        created: async function () {
            this.user = JSON.parse(localStorage.user);
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.setWindowHeight);
        },
        // updated() {
        //     let unique_id = '';
        //     let url = window.location.pathname;
        //     if (url.includes('watchlist')) {
        //         const watchlist_id = url.split('watchlist/')[1];
        //         unique_id = 'watchlist' + (watchlist_id ? '-' + watchlist_id : '');
        //     }
        //     if (url.includes('stock')) {
        //         const stock_id = url.split('stock/')[1];
        //         unique_id = 'stock' + (stock_id ? '-' + stock_id : '');
        //     }
        //     if (url.includes('screener')) {
        //         const screen_id = url.split('screener/')[1];
        //         unique_id = 'screener' + (screen_id ? '-' + screen_id : '');
        //     }

        //     let elements = document.getElementsByClassName("v-list-item");
        //     for (let index in elements) {
        //         let element = elements[index];
        //         if (element) {
        //             if (element.classList) {
        //                 element.classList.remove("active");
        //                 element.classList.remove("ticker-active");
        //             }
        //         }
        //     }

        //     let element = document.getElementById(unique_id);
        //     if (element && unique_id.includes('stock')) {
        //         element.classList.add("ticker-active");
        //     } else if (element){
        //         element.classList.add("active");
        //     }
        // },
        methods: {
            ...mapActions([
                "loadUserTabs",
            ]),
            navigate(routerName, competition_id) {
                this.$router.push({name: `landing-page.${routerName}`, params: {competition_id: competition_id}});
            },
            setShowUserAccountMenu(value) {
                this.$store.commit('setShowUserAccountMenu', value);
            },
            setActiveWatchlistSubMenuItem(index) {
                this.clickedWatchlist = index;
                this.clickedScreener = null;
                this.clickedCompetition = null;
            },
            checkWatchlistSubMenuActive(index) {
                return (
                    this.clickedWatchlist === index &&
                    this.clickedScreener === null &&
                    this.clickedCompetition === null
                );
            },
            checkDecidedSubMenuActive(index) {
                return (
                    this.clickedOther === index &&
                    this.clickedWatchlist === null &&
                    this.clickedScreener === null &&
                    this.clickedCompetition === null
                );
            },
            checkCompetitionMenuActive(index) {
                return (
                    this.clickedCompetition === index &&
                    this.clickedWatchlist === null &&
                    this.clickedScreener === null &&
                    this.clickedOther === null
                );
            },
            setActiveMenuItem(item = null) {
                this.activeMenuItem = item;
                this.clickedWatchlist = null;
                this.clickedScreener = null;
                this.clickedOther = null;
                this.clickedCompetition = null;
            },
            otherMenuItemSelected(item) {
                return (
                    this.activeMenuItem === item &&
                    this.clickedWatchlist === null &&
                    this.clickedScreener === null &&
                    this.clickedOther === null &&
                    this.clickedCompetition === null
                );
            },
            setActiveDecidedSubMenuItem(index) {
                this.clickedOther = index;
                this.clickedWatchlist = null;
                this.clickedScreener = null;
                this.clickedCompetition = null;
            },
            setActiveCompetitionItem(index) {
                this.clickedCompetition = index;
                this.clickedWatchlist = null;
                this.clickedScreener = null;
                this.clickedOther = null;
            },
            searchTextGo() {
                if(this.searchString === '') {
                    this.$store.commit('setMessage', { text: 'No text inserted yet...', type: 'error' });
                    return;
                }

                this.$router.push({name: 'landing-page.textSearch'}).catch(()=>{});

                const textSearchInterval = setInterval(() => {
                    if (typeof this.$children[1].search === 'function') {
                        this.$children[1].search(this.searchString);
                        clearInterval(textSearchInterval);
                    }
                }, 50);
            },
            setWindowHeight() {
                this.windowHeight = window.innerHeight;
            },
            isPdfReportsTableLoaded() {
                this.$store.commit('setIsPdfReportsTableLoaded', 0);

                setTimeout(() => {
                    this.$store.commit('setIsPdfReportsTableLoaded', 1);
                }, 50);
            },
            slug(name) {
                return name.replace(/\s+/g, '-');
            },
            getTicker(stock_id) {
                const s = this.getMapStocks.find(s => s.stock_id == stock_id);
                if (! s) {
//                    this.$store.commit("setMessage", {text: "cannot find the stock / ticker", type: 'error'});
                    return null;
                }

                return s.ticker;
            },
        },
        computed: {
            ...mapGetters(["getUserSettings",
                "getSelectedResearchTabIndex",
                "getRecents",
                "getWatchlists",
                "getMapStocks",
                "screenerFilters",
                "pageId",
                "getUserCurrentWatchlistId",
                "getUserCompetitions",
                ]
            ),
            recents() {
                return this.getRecents;
            },

            watchlists() {
                return this.$store.getters["getWatchlists"];
            },

            userCompetitions() {
                const x = this.getUserCompetitions;
                console.log('----------');
                console.log(x);
                return x;
            },

            watchlistItems() {
                return tmpArrthis.getWatchlistItems;
            },

            screeners() {
                return this.screenerFilters.filter(filter => filter.screen_id > -1 && filter.name != "No name Screener, not saved");  // the screen_id of default screener is -1.
            }
        }
    }
</script>

<style scoped>
    .dashed-border {
        border: 1px dashed;
    }

    .vv {
        color: #94A6B8;
    }
    .v-icon:hover {
        cursor: pointer;
        color: #46638a;
    }

    .hoverEffect {
        cursor: pointer;
        color: #5887b9;
    }

    .main-section {
        width: 100%;
    }

    .side-section, .main-section {
        min-height: calc(100vh - 98px);
    }

    .main-sidebar .v-list-item__icon {
        margin-right: 0.3rem !important;
    }

    .main-sidebar .v-list-group--no-action > .v-list-group__items > div > .v-list-item {
        padding-left: 2rem !important;
    }

    .v-list-item.v-list-non-sub-item .v-list-item__title {
        font-size: 18px;
        font-weight: 600;
    }

    .v-list-item.v-list-sub-item .v-list-item__title {
        font-size: 16px;
        font-weight: 400;
        margin-left: 30px;
    }

    .v-list-item {
        font-family: "Arial";
        min-height: 10px !important;
        color: #404040;

    }

    .v-list-item.active .mdi:before {
        color: #587cd9;
    }

    .v-list-item.active .v-list-item__title {
        color: #587cd9;
    }

    .v-list-item .ticker {
        padding: 0px !important;
        margin: 0px !important;
    }

    .v-list-item.ticker-active .ticker {
        color: #58d2d2;
    }

    .v-list-item a {
        color: #000000;
    }
    .sticker {
        padding: 2px 16px 0 16px;
        background: #EBE6BD;
        font-size: 1.1rem;
        font-family: "Rockwell";
        transform: rotate(-10deg);
        border: 1px solid #888888;
        border-radius: 6px;
        box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);

    }

    .highlighted-background {
        color: #4077AB;
        background-color:#ffffff;
    }

    .highlighted-right-border {
        border-right: 3px solid #4077AB;
    }
</style>
