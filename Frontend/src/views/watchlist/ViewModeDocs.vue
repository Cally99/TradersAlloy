<template lang="pug">
    div( @dragover="$store.commit('setIsDragged', -1)" :style="`height:${windowHeight - 215}px;`" style="width:100%; overflow-y:scroll; overflow-x:hidden; border:0px solid;")
        v-row( ref="mainSection")
            v-col( @dragover="$store.commit('setIsDraggedOverWatchlistItem', true), showResearchBlock = false" ref="watchlistResearchSection" class="d-flex justify-start" style="border:0px solid;")
                div( v-if="watchlistID !== -1")
                    div( :style="$store.getters.getIsDraggedOverWatchlistItem && $store.getters.getIsDragged === -1 && pressingDownOnWatchlist ? 'border:1px dashed;' : ''" class="d-flex mb-6" style="width:100%; height:100%;")
                        draggable( v-model="watchlistsWithResearch" group="watchlist" @start="watchlistsOnStartOfDrag($event)" @end="watchlistsOnEndOfDrag($event)" :style="`width:${watchlistResearchSectionWidth}px;`" style="border:0px dashed;")
                            template(v-if="watchlistsWithResearch.length > 0")
                                ResearchView( v-for="(watchlist, index) in watchlistsWithResearch" :identifier="`item${watchlist.stock_id}`" :key="watchlist.watchlist_item_id" :watchlist="watchlist" class="mr-3 ml-3")
                                    div( v-if="index === 9 && !userSubscribed" style="position:absolute; left:168px; top:295px;")
                                        PremiumButton

                            template( v-if="watchlistItemsOnId.length < 10 && user.type !== 'admin' && !userSubscribed")
                                div( v-for="index in ((10 - watchlistsWithResearch.length) - actualWatchlistItemsLength)"
                                    :key="index"
                                    class="mr-3 ml-3"
                                    style="rgba(0, 0, 0, 0, 0); width:250px; height:300px; margin-top:25px; position:relative; float:left; border:1px dashed; "
                                )
                                    div( style="height: 110px;border: 0px solid;")
                                    div( style="transform:rotate(-50deg); margin-left:10px; border:0px solid;") {{ $t('research_free_plan_line_one') }}
                                        br
                                        span {{ $t('research_free_plan_line_two') }}

                                    div( v-if="index === ((10 - watchlistsWithResearch.length) - actualWatchlistItemsLength) && !userSubscribed"
                                        style="position:absolute; left:92px; top:270px;"
                                    )
                                        PremiumButton

                template( v-else)
                    div( v-if="watchlistsWithResearch.length > 0" class="mb-6" style="width:100%; height:100%;")
                        draggable( v-model="watchlistsWithResearch" group="watchlist" @start="watchlistsOnStartOfDrag($event)" @end="watchlistsOnEndOfDrag($event)")
                            template( v-for="watchlist in watchlistsWithResearch")
                                ResearchView( :key="watchlist.watchlist_item_id" :watchlist="watchlist" class="mr-3 ml-3")

                        template( v-if="watchlistsWithResearch.length < 10 && user.type !== 'admin' && !userSubscribed")
                            div( v-for="index in ((10 - watchlistsWithResearch.length) - actualWatchlistItemsLength)"
                                :key="index"
                                class="mr-3 ml-3"
                                style="rgba(0, 0, 0, 0, 0); width:250px; height:300px; margin-top:25px; position:relative; float:left; border:1px dashed; "
                            )
                                div( style="height: 110px;border: 0px solid;")
                                div( style="transform:rotate(-50deg); margin-left:10px; border:0px solid;") {{ $t('research_free_plan_line_one') }}
                                    br
                                    span {{ $t('research_free_plan_line_two') }}

                                div( v-if="index === ((10 - watchlistsWithResearch.length) - actualWatchlistItemsLength) && !userSubscribed"
                                    style="position:absolute; left:92px; top:270px;"
                                )
                                    PremiumButton

                    div( v-else class="mb-6" style="width:250px; height:300px;") &nbsp;

        v-row( @dragover="$store.commit('setIsDraggedOverWatchlistItem', false), showResearchBlock = true" style="background-color:#ECECEC" ref="mainSection")
            div( v-if="researchesWithNoWatchlist.length > 0 || watchlistsWithNoResearch.length > 0" :style="!$store.getters.getIsDraggedOverWatchlistItem && pressingDownOnResearch && showResearchBlock ? 'border:1px dashed;' : ''")
                v-col( cols="12" class="d-flex justify-start pb-0 pl-6 mb-3" style="border:0px solid;") {{ $t('research_not_allocated_to_watchlist') }}

                v-col( cols="12" class="d-flex justify-start pt-0" style="border:0px solid;")
                    draggable( v-model="researchs" group="watchlist" @start="researchsOnStartOfDrag($event)" @end="researchsOnEndOfDrag($event)" id="researchesNotAdded" style="border:0px solid;")
                        ResearchWithoutStockView( v-for="(element, index) in researchs" :key="index" :research="element" class="mr-3 ml-3 mb-6" style="border:0px solid;")
                        div( v-if="watchlistsWithNoResearch.length > 0" @mousedown="preventDefaultOnCard($event)" class="ml-3 pl-2 pr-2 pt-1" style="width:250px; height:300px; position:relative; float:left; border:1px dashed;") {{ $t('research_for_your_watchlist') }}
                            div( class="pt-4" style="height:240px; overflow-y:scroll;")
                                div( v-for="watchlist in watchlistsWithNoResearch"
                                    :key="watchlist.watchlist_item_id"
                                    @click="gotoResearch(watchlist)"
                                    class="no-research-created"
                                    style="color: #6C84D7;"
                                ) {{ watchlist.name }}
</template>

<script>
import ResearchWithoutStockView from "./ResearchWithoutStockView";
import PremiumButton from '../../components/PremiumButton.vue';
import ResearchView from "./ResearchView";
import { mapGetters, mapActions } from "vuex";
import draggable from "vuedraggable";
import _ from "lodash";

export default {
    name: 'ViewModeDocs',
    props: {
        researches: Array
    },
    components: {
        ResearchWithoutStockView,
        PremiumButton,
        ResearchView,
        draggable
    },
    data() {
        return {
            user: JSON.parse(localStorage.getItem('user')),
            researchs: this.researches,
            researchOnStart: [],
            researchOnEnd: [],
            watchlistOnStart: [],
            researchDeleteObject: null,
            windowHeight: window.innerHeight,
            draggToMenu: false,
            draggedElement: null,
            pressingDownOnWatchlist: true,
            pressingDownOnResearch: false,
            showResearchBlock: false,
            watchlistResearchSectionWidth: 0
        };
    },
    mounted() {
        this.watchlistResearchSectionWidth = this.$refs.watchlistResearchSection.offsetWidth - 40;
        this.windowHeight = window.innerHeight;

        window.addEventListener('resize', this.setWindowHeight);
    },
    destroyed() {
        window.removeEventListener('resize', this.setWindowHeight);
    },
    computed: {
        ...mapGetters(["getResearchs", 'getMapStocks']),
        getWatchlistJoins() {
            return this.$store.getters.getWatchlistJoins;
        },
        watchlistItemsOnId() {
            const userId = JSON.parse(localStorage.getItem('user')).user_id;
            let watchlistItems = null;

            if(this.watchlistID !== -1) {
                watchlistItems = this.$store.getters.getWatchlistItems.filter((item) => item.user_id === userId && item.watchlist_id === this.watchlistID);
            } else {
                watchlistItems = this.$store.getters.getWatchlistItems.filter((item) => item.user_id === userId);
            }

            return watchlistItems;
        },
        watchlistID() {
            return this.$route.params.id ? this.$route.params.id : -1;
        },
        watchlistsWithResearch() {
            let watchlistsWithResearch = [];

            if(this.watchlistID !== -1) {
                watchlistsWithResearch = [];

                this.$store.getters.getWatchlistJoins.filter((w) => {
                    if(w.watchlist_id === this.watchlistID) {
                        this.$store.getters.getWatchlistItems.filter((w2) => {
                            if(w2.stock_id === w.stock_id && w2.user_id === w.user_id) {
                                watchlistsWithResearch.push(w2);
                            }
                        });
                    }
                });
            } else {
                watchlistsWithResearch = [];

                const getWatchlistJoinsUnique = _.uniqBy(this.$store.getters.getWatchlistJoins, 'stock_id');

                getWatchlistJoinsUnique.filter((w) => {
                    this.$store.getters.getWatchlistItems.filter((w2) => {
                        if(w2.stock_id === w.stock_id && w2.user_id === w.user_id) {
                            watchlistsWithResearch.push(w2);
                        }
                    });
                });
            }

            return watchlistsWithResearch;
        },
        watchlistsWithNoResearch() {
            let watchlistsWithNoResearch = null;

            if(this.watchlistID !== -1) {
                const getWatchlistJoinsOnWatchId = this.$store.getters.getWatchlistJoins.filter((wj) => wj.watchlist_id === this.watchlistID);

                watchlistsWithNoResearch = getWatchlistJoinsOnWatchId.filter((wj) => {
                    return !this.$store.getters.getResearchs.find((r) => {
                        if(wj.user_id === r.user_id && wj.stock_id === r.stock_id) {
                            return wj;
                        }
                    });
                });
            } else {
                const getWatchlistJoinsOnWatchId = this.$store.getters.getWatchlistJoins;

                watchlistsWithNoResearch = getWatchlistJoinsOnWatchId.filter((wj) => {
                    return !this.$store.getters.getResearchs.find((r) => {
                        if(wj.user_id === r.user_id && wj.stock_id === r.stock_id) {
                            return wj;
                        }
                    });
                });
            }

            const watchlistsWithNoResearchTemp = [];

            for(const item of watchlistsWithNoResearch) {
                const wi = this.$store.getters.getWatchlistItems.find((wi) => wi.user_id === item.user_id && wi.stock_id === item.stock_id);
                watchlistsWithNoResearchTemp.push(wi);
            }

            watchlistsWithNoResearch = watchlistsWithNoResearchTemp;

            return watchlistsWithNoResearch;
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
        actualWatchlistItemsLength() {
            const actualLength = 10 - this.watchlistsWithResearch.length - (10 - this.$store.getters.getWatchlistJoins.length);

            return actualLength;
        },
        userSubscribed() {
            return this.$store.getters.getUserSubscribed;
        },
    },
    methods: {
        ...mapActions([
            'loadUserWatchListItems',
            'loadUserResearch',
            'addStocksToWLJ',
            'removeStocksFromWLJ',
            'removeStocksFromWLI'
        ]),
        checkIfImageExists(url, callback) {
            const img = new Image();
            img.src = url;
        
            if (img.complete) {
                callback(true);
            } else {
                img.onload = () => {
                callback(true);
                };
                
                img.onerror = () => {
                callback(false);
                };
            }
        },
        preventDefaultOnCard(e) {
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
        },
        setWindowHeight() {
            this.windowHeight = window.innerHeight;
            this.watchlistResearchSectionWidth = this.$refs.watchlistResearchSection.offsetWidth - 40;
        },
        watchlistsOnStartOfDrag(event) {
            this.pressingDownOnResearch = true;
            this.pressingDownOnWatchlist = false;

            this.watchlistOnStart = this.watchlistsWithResearch;

            this.draggedElement = event.item;
        },
        async watchlistsOnEndOfDrag(event) {
            this.pressingDownOnResearch = false;
            this.pressingDownOnWatchlist = true;
            this.$store.commit('setIsDraggedOverWatchlistItem', false);

            const identifier = this.draggedElement.getAttribute('identifier');

            if(event.to.id === 'researchesNotAdded') {
                const user_id = this.user.user_id;
                const stock_id = parseInt(identifier.substr(4, identifier.length));
                const watchlist_id = this.watchlistID;

                const removeWatchlistJoinObject = {
                    user_id,
                    stock_id,
                    watchlist_id
                };

                await this.removeStocksFromWLJ(removeWatchlistJoinObject);

                const joinsLeftOfStock = this.$store.getters.getWatchlistJoins.filter((wj) => wj.stock_id === stock_id).length;

                console.log(joinsLeftOfStock);

                if(joinsLeftOfStock === 0) {
                    console.log('remove WLI');
                    await this.removeStocksFromWLI(removeWatchlistJoinObject);
                }

                this.researchs = this.researchesWithNoWatchlist;
            }

            this.$store.commit('setIsDragged', -1);
        },
        researchsOnStartOfDrag(event) {
            this.researchOnStart = this.researchs;
            this.draggedElement = event.item;
            this.draggedElement.style.display = 'none';
        },
        researchsOnEndOfDrag(event) {
            let watchlistIdFromMenu = null;

            try {
                watchlistIdFromMenu = parseInt(event.to.children[0].id.substring(10));
            } catch(error) {
                watchlistIdFromMenu = 'no_id';
            }

            this.draggedElement.style.display = 'block';
            this.researchOnEnd = this.researchs;

            const researchToAdd = _.differenceWith(this.researchOnStart, this.researchOnEnd, _.isEqual)[0];

            if(!researchToAdd.stock_id) {
                return;
            }

            if(this.$store.getters.getIsDraggedOverWatchlistItem || this.$store.getters.getIsDragged > -1) {
                const stock = this.$store.getters["getMapStocks"].find(s => s.stock_id == researchToAdd.stock_id);

                const watchlistItemObject = {
                    stock_id: researchToAdd.stock_id,
                    ticker: researchToAdd.ticker,
                    company_id: stock.company_id,
                    name: stock.name,
                    price_today: stock.price_today
                };

                if(Number.isInteger(watchlistIdFromMenu)) {
                    this.draggToMenu = true;
                    this.addWatchlistItem(watchlistItemObject, watchlistIdFromMenu);

                } else if(this.researchOnStart.length > this.researchOnEnd.length) {
                    this.draggToMenu = false;
                    this.addWatchlistItem(watchlistItemObject, this.watchlistID);
                }
            }

            this.$store.commit('setIsDragged', -1);
            this.$store.commit('setIsDraggedOverWatchlistItem', false);
        },
        async addWatchlistItem(val, watchlistId) {
            const payload = {
                watchlist_id: watchlistId,
                user_id: JSON.parse(localStorage.getItem('user')).user_id,
                stock_id: val.stock_id,
                ticker: val.ticker,
                company_id: val.company_id,
                name: val.name,
                conviction: 0,
                watched_since: new Date().toISOString().substring(0, 10),
                watched_since_price: val.price_today,
            };

            await this.addStocksToWLJ({
                watchlist_id: payload.watchlist_id,
                stock_id: payload.stock_id,
                user_id: JSON.parse(localStorage.getItem('user')).user_id
            });
        },
        gotoResearch(stock) {
            this.$router.push({name: 'landing-page.stock-detail', params: {stock_id: stock.stock_id}, query: {tab: 1}});
        }
    }
}
</script>

<style scoped>
.confirm-delete-popup-design {
    position: absolute;
    font-size: 14px;
    color: #54555E;
    background-color: #ECECEC;
    border: 2px solid #C9C9C9;
}

.confirm-delete-popup-design:hover {
    cursor: pointer;
}

.no-research-created:hover {
    cursor: pointer;
}
</style>
