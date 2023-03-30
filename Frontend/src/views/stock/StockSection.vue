<template lang="pug">
    div(v-if="data && Object.keys(data).length" class="stock-section" style="position:relative; height:100%;" ref="stocks")
        v-navigation-drawer(ref="drawer" absolute right :width="navigation.width" v-model="navigation.shown" :class="{'shadow-box': navigation.shown}" style="z-index:1000;")
            div(class="pa-3")
                div(v-show="target=='research'" class="grey4 pl-4 pr-2" )
                    span(class="ticker blue1 pt-1 pl-2 pr-2 mb-5") {{stockData.ticker}}
                    span(class="pt-2 pl-2 pr-2 ml-8 mb-4" style="font-size:1.4em;") {{this.$t('Research_notes')}}
                    froala(v-if="(((user.type === 'new' || user.type === 'freemium') && (researchTotalNumber <= 10 || researchs.find(item => item.stock_id == this.data.stock_id))) || user.subscription_id !== null || user.type === 'admin')" :tag="'textarea'" :config="froalaConfig" v-model="froalaContent" id="edit" style="width:30px;")
                div(v-show="target=='journal'" class="grey4 pl-4 pr-2" )
                    journal(@updateChart="updateChart" :stock_id="data.stock_id")
                div(v-if="target === 'research' && paywallCriteria" style="position: absolute; z-index: 1000; width:100%; top:250px;")
                    div(class="pt-8 pb-8 pl-4 pr-4" style="background:#FDF5CA; width:75%; margin:auto; text-align:center; box-shadow: 12px 12px 20px 0 rgba(0, 0, 0, 0.3); border:1px solid;")
                        div This research will not be saved with your free plan.
                        div (10 document limit)
                        div(class="mt-4 mb-4") We want to build World class investment tools but we must also pay for the electricity... sign-up for a premium plan
                        PremiumButton
                        div(class="mt-4")
                            span and
                            span
                                b send us a message&nbsp;
                            span on how we can&nbsp;
                            span
                                b better serve you

        v-btn(v-if="navigation.shown"
                @click="closeNavigation"
                tile
                :style="`right:${toggleRight1 + 32}px;`"
                class="green2 white--text"
                style="transform:rotate(90deg); padding:0 10px; min-width:36px; position:absolute; z-index:1000; top:calc(4.3rem);")
            v-icon(center) mdi-close

        v-btn(@click="toggleEvent(false,'journal')"
                tile
                :style="`right:${toggleRight1}px;`"
                class="green2 white--text"
                style="width:110px; transform:rotate(90deg); position:absolute; z-index: 1000; top:calc(10.7rem);") {{this.$t('Journal')}}

        v-btn(@click="toggleEvent(false,'research')"
                tile
                :style="`right:${toggleRight2}px; top:calc(${topPositionResearch}rem);`"
                class="green2 white--text"
                style="transform:rotate(90deg); position:absolute; z-index: 1000;")

            v-icon(v-if="paywallCriteria" style="position:absolute; left:-15px; top:-5px; border:0px solid;") $redIcon
            div(v-if="paywallCriteria" style="border:0px solid;") &nbsp;&nbsp;Research
            div(v-else style="width:90px; border:0px solid;") {{this.$t('research')}}

        v-row(no-gutters="true" class="pt-2 px-4 stock-section-header" algin-content="space-between" align="center")
            v-col(cols=4 class="align-items-center d-flex")
                TickerComponent(:stockId="stockData.stock_id" :tickerLabel="stockData.ticker" :isClickable="false")
                span(style="display:inline-block; font-size:1.5rem; margin-left:16px;") {{stockData.name}}
            
            v-col(cols=3)
                WatchlistAddTo(:stocks="[stockData]")
                
            v-col(cols=2 v-if="isInWatchlist" class="align-items-center d-flex")
                    span(style="font-size:0.6rem") {{$t('conviction')}}
                        Conviction(:value="rating_value" :stock="stockData" :dense="true")

            v-col(v-if="isInWatchlist")
                    TagSelector(:stock="stockData" :tagsString="tags" from='stock' class="m-0")
                        //- template(v-slot:selection="{ attrs, item, select, selected }")
                        //-     v-chip(
                        //-         v-bind="attrs"
                        //-         :input-value="selected"
                        //-         close
                        //-         outlined label color="orange"
                        //-         @click="select"
                        //-         @click:close="remove(item)") strong {{ item }}
        v-row(no-gutters="true" class="px-4")
            v-col    
                div {{$t(stockData.sector_name)}}

        v-tabs(v-model="tab" background-color="#ffffff" align-with-title hide-slider class="ml-4")
            v-tab(v-for="(item, index) in items" :key="item"
                class="stock-section m-0"
                @click="getTabInd(index)") {{ item }}
        v-tabs-items(v-model="tab" class="transparent" )
            v-tab-item(:transition="false" :reverse-transition="false" class="m-1 transparent")
                StocksOverview( v-if="data.company_id" :company_id="data.company_id" :stock="data")

            v-tab-item(:transition="false" :reverse-transition="false" class="pl-4 pt-3 transparent")
                StocksInvestorReports(v-if="tmp_data.company_id" :company_id="tmp_data.company_id" :stock_id="tmp_data.stock_id" :flag="flag" ref="stocksInvestorReports")

            v-tab-item(:transition="false" :reverse-transition="false" class="p-1")
                ChartPrice( v-if="data.company_id" :company_id="data.company_id" :stock_id="data.stock_id" :width="1500" :height="700" ref="chartPrice" page="main")

            v-tab-item(:transition="false" :reverse-transition="false" class="p-1")
                CompanyNews( v-if="data.company_id" :company_id="data.company_id" :stock_id="data.stock_id")

            v-tab-item(:transition="false" :reverse-transition="false" class="p-1")
                StocksFinancials( v-if="data.company_id" :company_id="data.company_id" :stock_id="data.stock_id")

            v-tab-item(:transition="false" :reverse-transition="false" class="p-1")
                StocksInsiders( v-if="data.company_id" :company_id="data.company_id" :stock_id="data.stock_id")
            v-tab-item(:transition="false" :reverse-transition="false" class="p-1 transparent container" /*style="width: 55%;"*/)
                StockAnalysis(v-if="tmp_data.company_id" :company_id="tmp_data.company_id" :stock_id="tmp_data.stock_id" ref="stockAnalysis")
</template>

<script>
import {mapGetters, mapActions} from "vuex";
/* eslint-disable no-console */
import ApiStocks from "@/Services/ApiStocks.js";
import ApiService from "@/Services/ApiService.js";
import StocksOverview from "@/views/stock/StocksOverview.vue";
import StocksInvestorReports from "@/views/stock/StocksInvestorReports.vue";
import PremiumButton from "@/components/PremiumButton.vue";
import VueFroala from "vue-froala-wysiwyg";
import ChartPrice from "@/components/ChartPrice.vue";
import StocksFinancials from "@/views/stock/StocksFinancials.vue";
import StocksInsiders from "@/views/stock/StocksInsiders.vue";
import StockAnalysis from "@/views/stock/StockAnalysis.vue";
// import TagSelector from "../../components/TagSelector.vue";
import TagSelector from "../watchlist/TagDropDown1.vue";
import Conviction from "../../components/Conviction.vue";
import Journal from '../../components/Journal';
import WatchlistAddTo from "@/components/WatchlistAddTo.vue";
import CompanyNews from './../news/CompanyNews.vue';
import TickerComponent from "../../components/TickerComponent"

export default {
    components: {
        StocksOverview,
        PremiumButton,
        VueFroala,
        StocksInvestorReports,
        ChartPrice,
        StocksFinancials,
        StocksInsiders,
        StockAnalysis,
        TagSelector,
        Conviction,
        Journal,
        WatchlistAddTo,
        CompanyNews,
        TickerComponent
    },
    props: {
    },
    data() {
        return {
            toggleRight1: -36.5,
            toggleRight2: -43,
            topPositionResearch: 20.37,
            user: JSON.parse(localStorage.getItem('user')),
            tmp_data: null,
            target: '',
            is_show_tags_convictions: false,
            froalaConfig: {
                listAdvancedTypes: true,
                fontFamilyDefaultSelection: "Verdana",
                fontSizeDefaultSelection: "13",
                placeholderText: "My Research...    ",
                width: "100%",
                height: "calc(100vh - 190px)",
                immediateVueModelUpdate: true,
                charCounterCount: false,
                documentReady: false,
                attribution: false,
                key: process.env.VUE_APP_FROALA_KEY,
                pluginsEnabled: [
                    "fontSize",
                    "colors",
                    "fontFamily",
                    "paragraphFormat",
                    "getPDF",
                    "align",
                    "lists",
                    "image",
                    "table",
                    "codeView",
                    "fullscreen",
                    "print",
                ],
                language: "sv",
                toolbarButtons: [
                    [
                        "H1",
                        "H2",
                    ],
                    [
                        "bold",
                        "italic",
                        "underline",
                        "highlight",
                    ],
                    [
                        "formatUL",
                        "formatOL",
                        "alignLeft",
                        "alignCenter",
                        "hr",
                        "insertImage",
                    ],
                    [
                        "undo",
                        "redo",
                        "fullscreen",
                    ],
                ],
                toolbarVisibleWithoutSelection: true,
                imageUpload: true,
                imageDefaultAlign: "center",
                imageDefaultDisplay: "inline-block",
                imageMaxSize: 5 * 1024 * 1024,
                imageAllowedTypes: ["jpeg", "jpg", "png"],
                imageUploadParam: "imageFile",
                imageUploadURL: `${process.env.VUE_APP_BACKEND_URL}/froala/image`,
                imageUploadMethod: "POST",
                events: {
                    // eslint-disable-next-line no-unused-vars
                    initialized: function (e, editor) {
                    },
                },
            },
            timer: null,
            newItem: 5,
            navigation: {
                shown: false,
                width: 200,
                borderSize: 10
            },
            watchlist: [],
            tab: 0,
            froalaContent: '',
            default_froalaContent: '',
            flag: 0
        };
    },
    computed: {
        ...mapGetters([
            "getMapCompanies",
            "getCompanyWebcasts"
        ]),
        paywallCriteria() {
            return ((this.user.type === 'new' || this.user.type === 'freemium') && (this.researchTotalNumber > 10 && !this.$store.getters.getResearchs.find(item => item.stock_id == this.data.stock_id))) && this.user.subscription_id === null;
        },
        researchTotalNumber() {
            return this.$store.getters.getResearchs.length;
        },
        researchs() {
            return this.$store.getters.getResearchs;
        },
        data() {
            let stock = this.$store.getters['getMapStocks'].find(s => s.stock_id == Number(this.$route.params.stock_id));

            if (this.$route.query && this.$route.query.tab) {
                stock.tab = Number(this.$route.query.tab);
            }

            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            this.tmp_data = stock;




            return stock;
        },
        stockData() {
            return this.$store.getters["getMapStocks"].find(s => s.stock_id == this.data.stock_id);
        },
        tags() {
            return this.$store.getters["getWatchlistItems"].filter(item => item.stock_id === this.data.stock_id)[0].tags;
        },
        isInWatchlist() {
            return (this.$store.getters["getWatchlistItems"].filter(item => item.stock_id === this.data.stock_id).length > 0 ? true: false);
        },
        // eslint-disable-next-line vue/return-in-computed-property
        rating_value(){
            let is_conviction = (this.$store.getters["getWatchlistItems"].filter(item => item.stock_id === this.data.stock_id).length > 0 ? true: false);
            if (is_conviction)
                return (this.$store.getters["getWatchlistItems"].find(item => item.stock_id === this.data.stock_id).conviction);
        },
        items(){
            let stock = this.$store.getters['getMapStocks'].find(s => s.stock_id == Number(this.$route.params.stock_id));
            let analysis_array = this.$store.getters['getCompanyAnalystsOne'];
            
            let analysis_init = analysis_array.filter(item => item.company_id == stock.company_id);
            if (analysis_init.length > 0) {
                return [
                    this.$t('overview'),
                    this.$t('Investor_reports').toUpperCase(),
                    this.$t('Chart').toUpperCase(),
                    this.$t('news'),
                    this.$t('Financials').toUpperCase(),
                    this.$t('insider_trades'),
                    this.$t('analyst')
                ];
            } else {
                return [
                    this.$t('overview'),
                    this.$t('Investor_reports').toUpperCase(),
                    this.$t('Chart').toUpperCase(),
                    this.$t('news'),
                    this.$t('Financials').toUpperCase(),
                    this.$t('insider_trades'),
                ];
            }
        }

    },
    watch: {
        data() {
            this.init();
        },
        newItem(val) {
            const that = this;
            const payload = {
                watchlist_id: this.watchlist[val].watchlist_id,
                user_id: JSON.parse(localStorage.getItem('user')).user_id,
                company_id: this.stockData.company_id,
                stock_id: this.stockData.stock_id,
                ticker: this.stockData.ticker,
                isin: this.stockData.isin,
                name: this.stockData.name,
                conviction: 0,
                watched_since: new Date().toISOString().substring(0, 10),
                watched_since_price: this.stockData.price_today,
            };
            console.log(JSON.stringify(payload ));

            ApiStocks.insertWatchlistItem(payload).then((response) => {
                console.log(JSON.stringify( response.data ));
                that.$store.commit("addWatchlistItem", response.data);
            });
        },
        froalaContent: function () {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {

                //TODO: This needs to be changed to be on the COMPANY_ID not stock_id
                ApiService.writeContent({
                    stock_id: this.stockData.stock_id,
                    ticker: this.stockData.ticker,
                    user_id: JSON.parse(localStorage.user).user_id,
                    content: this.froalaContent,
                }).then(() => {
                    console.log("successfully froalaContent");
                });

                var temp = {
                    stock_id: this.stockData.stock_id,
                    isin: this.stockData.isin,
                    ticker: this.stockData.ticker,
                    user_id: JSON.parse(localStorage.user).user_id,
                    content: this.froalaContent,
                    last_update_date: new Date(),
                };
                this.$store.commit("addResearchs", temp);
            }, 1000);
        },
        $route (to, from) {
            this.flag = this.flag + 1
		}
    },
    created() {
        if(this.$route.query.tab === undefined) {
            this.data.tab = 0;
        }

        this.init();
        this.watchlist = this.$store.getters["getWatchlists"];
    },
    mounted() {
        this.toggleRight2 = this.paywallCriteria ? -48 : -43;
        this.topPositionResearch = this.paywallCriteria ? 20.87 : 20.37;

        this.$root.$on('changeToInvestorReports', (tab) => {
            this.tab = tab;
        });

        if (this.data.tab === 1) this.toggleEvent(true);
        this.tab = this.data && this.data.tab || 0;
        this.setBorderWidth();
        this.setEvents();
    },

    methods: {
        ...mapActions([
            'loadCompanyDataNeeded',
            'hasCompanyWebcast'
        ]),
        updateChart() {
            if (this.tab === 2) {
                this.$refs.chartPrice.updateChart();
            }
        },
        getTabInd(index) {
            this.$store.commit("setTab_overviewIndex", index);

            if (index === 2) {
                setTimeout(() => {
                    this.$refs.chartPrice.updateChart();
                }, 50);
            }
        },
        init() {
            if (this.data && this.data.company_id){
                ApiService.fetchInsiderData(this.data.company_id)
                    .then((response) => {
                        this.$store.commit("setInsiders", {
                            company_id: this.data.company_id,
                            insiders: response.data,
                        });
                        this.tab = this.data && this.data.tab || 0;
                    });
                ApiService.getOneCompanyAnalysis(this.data.company_id).then((data) => {
                    this.$store.commit("setOneCompanyAnalysts", data.data);
                });
                this.loadCompanyDataNeeded({company_id:this.data.company_id});
                this.hasCompanyWebcast({company_id:this.data.company_id});
                // ApiService.loadCompanyDataNeeded({company_id:this.data.company_id});
            }

            var researchs = this.$store.getters.getResearchs;
            if (researchs.find(item => item.stock_id === this.data.stock_id)) {
                this.froalaContent = researchs.find(item => item.stock_id === this.data.stock_id).content;
            } else {
                this.froalaContent = this.default_froalaContent;
            }

        },
        resetData() {
            let stock = this.$store.getters['getMapStocks'].find(s => s.stock_id == Number(this.$route.params.stock_id));
            this.tmp_data = stock;
            this.data = stock;
        },
        setEvents() {
            if (!this.$refs.drawer) {
                return;
            }

            const el = this.$refs.drawer.$el;
            const drawerBorder = el.querySelector(".v-navigation-drawer__border");
            const vm = this;
            const direction = el.classList.contains("v-navigation-drawer--right")
                ? "right"
                : "left";

            function resize(e) {
                const maxWidth = vm.$refs.stocks.offsetWidth - 50;

                document.body.style.cursor = "ew-resize";
                let f = direction === "right"
                    ? document.body.scrollWidth - e.clientX
                    : e.clientX;

                if (f > maxWidth) {
                    f = maxWidth;
                }

                vm.toggleRight1 = f - 58;
                vm.toggleRight2 = vm.paywallCriteria ? f - 70 : f - 65;
                vm.navigation.width = f - 20 ;
            }

            drawerBorder.addEventListener(
                "mousedown",
                function() {
                    el.style.transition ='initial';
                    document.addEventListener("mousemove", resize, false);
                },
                false
            );

            document.addEventListener(
                "mouseup",
                function() {
                    el.style.transition ='';
                    vm.navigation.width = el.style.width;
                    document.body.style.cursor = "";
                    document.removeEventListener("mousemove", resize, false);
                },
                false
            );
        },

        setBorderWidth() {
            if (!this.$refs.drawer)
                return;
            let i = this.$refs.drawer.$el.querySelector(
                ".v-navigation-drawer__border"
            );
            i.style.width = this.navigation.borderSize + "px";
            i.style.cursor = "ew-resize";
        },

        toggleEvent(key=false,target='research') {
            if (key){
                this.target = 'research';
                this.navigation.shown = true;
            } else  {
                this.target = target;
                this.navigation.shown = true;
            }

            if (this.navigation.shown) {
                console.log(this.$refs.stocks.offsetWidth);
                this.navigation.width = (this.$refs.stocks.offsetWidth <= 900) ? `${this.$refs.stocks.offsetWidth - 50}px` : '830px';
                this.toggleRight1 = this.navigation.width.replace("px" , "") -38;
                this.toggleRight2 = this.paywallCriteria ? this.navigation.width.replace("px" , "") -50 : this.navigation.width.replace("px" , "") -45;
            } else {
                this.toggleRight1 = -36.5;
                this.toggleRight2 = this.paywallCriteria ? -48 : -43;
            }
        },
        closeNavigation() {
            this.navigation.shown = false;
            this.navigation.width = `${this.$refs.stocks.offsetWidth/2 -120}px`;
            this.toggleRight1 = -36.5;
            this.toggleRight2 = this.paywallCriteria ? -48 : -43;
        },
        addToWatchlist() {
            this.is_show_tags_convictions = true;
        },
    }
};
</script>

<style scoped>
.stock-section.v-tab {
    background: #ffffff;
    color: #668099 !important;
    border-bottom: 1px solid #94A6B8;
}

.stock-section.v-tab.v-tab--active {
    font-size: 0.9em;
    color: #244360 !important;
    background-color: #DEE6ED;
    border-bottom: 3px solid #244360;
}

.shadow-box{
    box-shadow: -10px 0px 100px #000000;
}

.fr-element.fr-view {
    padding-top: 10px !important;
    padding-left: 15px !important;
    padding-right: 15px !important;
    padding-bottom: 10px !important;
}
.stock-section-header {
    /* this is becouse i dont want to go down and change in nested components */
    min-height: 52px
}
</style>
