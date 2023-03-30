<template lang="pug">
    //- div( :style="`max-height:${(bottomX - 160) + scrollY}px;`" style="overflow:auto;")
        //- table(  v-if="watchlists.length > -1"
        //-         class="table table-striped sortable"
        //-         id="sortable"
        //-         style="text-align:left;"
        //-         disable-pagination)
        //-     thead( style="background:#eeeeee; margin:5px; border-top:1px solid #DEE2E6;")
        //-         th( v-for="(header, index) in watch_headers"
        //-             :key="header.text"
        //-             scope="col"
        //-             @click="sortColumn(header)" class="sortable"
        //-             style="font-size:13px; font-weight:lighter; border:0px solid red;"
        //-         )
        //-             table( style="border:0px solid green; width:100%;")
        //-                 tr
        //-                     td(
        //-                         style="padding:0; margin:0; border:0px solid;"
        //-                         :style="[(header.text === 'Last Earnings Date' || header.text === 'Next Earnings Date' || header.text === 'Price (EOD)' || header.text === 'Last Eps' || header.text === 'Sales') ? {'text-align':'right'} : {'text-align':'left'}]"
        //-                     ) {{ headerText(header.text) }}
        //-                     td( v-if="header.show && index < watch_headers.length - 1" style="padding:0; margin:0; vertical-align:bottom; border:0;")
        //-                         v-icon( v-if="header.direction === 'desc'" style="font-size:13px; font-weight:lighter;") mdi-arrow-up
        //-                         v-icon( v-else style="font-size:13px; font-weight:lighter;") mdi-arrow-down
        //-         th( width="5%")

        //-     tbody
        //-         tr( v-for="item in (!useSort ? watchlists : watchlistsSorted)" :key="item.ticker" style="background:white;")
        //-             td( v-for="header in watch_headers" :key="header.text" style="line-height:28px; padding:5px;")
        //-                 div( v-if="header.value === 'Ticker'" class="pt-2")
        //-                     Ticker( :stock="item" class="pl-2 pr-2")

        //-                 div( v-if="header.value === 'Name'" class="custom-td pt-2") {{ item.Name }}
        //-                 div( v-if="header.value === 'Price (EOD)'" class="pt-2" style="text-align:right;") {{ item.price_today }}
        //-                 div( v-if="header.value === 'Last Eps'" class="pt-2" style="text-align:right;") {{ item.Eps }}
        //-                 div( v-if="header.value === 'Sales'" class="pt-2" style="text-align:right;") {{ item.Sales }}
        //-                 div( v-if="header.value === 'Sector'" class="pt-2" style="width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;") {{ item.Sector }}
        //-                 div( v-if="header.value === 'Last Earnings Date'" class="pt-2" style="text-align:right;")
        //-                     span( style="display:inline-flex !important;" ) {{ item.EarningsDate }}

        //-                 div( v-if="header.value === 'Next Earnings Date'" class="pt-2" style="text-align:right;")
        //-                     span( :style="`color:${earningsDateColor(item.next_earnings_date)};`" style="display:inline-flex !important;" ) {{ item.next_earnings_date }}

        //-                 div( v-if="header.value === 'Watched Since'" class="pt-2" style="text-align:right;")
        //-                     WatchedSinceDropDown( :value="item['Watched Since']" :wli_id="item['wli_id']")

        //-                 div( v-if="header.value === '∆%'" class="pt-2" style="text-align:right;") {{ item['∆%'] }}%
        //-                 div( v-if="header.value === 'Conviction'" class="pt-2")
        //-                     Conviction( :value="item.Conviction" :stock="item" :dense="true")

        //-                 div( v-if="header.value==='Research'" class="pt-2" style="float:right;")
        //-                     div( v-if="item.research_state === 'EXISTS'")
        //-                         v-icon( @click="gotoResearch(item)" style="margin-right:18px;") $researchNew

        //-                     div( v-else)
        //-                         div( v-if="item.Research.numberOfMonths > 3" @click="gotoResearch(item)" style="position:relative;")
        //-                             v-tooltip( bottom)
        //-                                 template( v-slot:activator="{ on, attrs }")
        //-                                     div( v-bind="attrs" v-on="on" style="padding-bottom:18px;")
        //-                                         div( style="position:absolute; z-index:1; left:-40px;")
        //-                                             v-icon $researchNew
        //-                                         div( style="position:absolute; z-index:2; top:10px; left:-31px;")
        //-                                             v-icon $circle

        //-                                 span Not updated in {{ Math.floor(item.Research.numberOfMonths) }} months

        //-                         div( v-else style="position: relative;")
        //-                             v-tooltip( bottom)
        //-                                 template( v-slot:activator="{ on, attrs }")
        //-                                     div( v-bind="attrs" v-on="on" style="padding-bottom:17px;")
        //-                                         div( style="position: absolute;left: -40px;")
        //-                                             v-icon( @click="gotoResearch(item)") $researchNoNew

        //-                                 span Write Research

        //-                 div( v-if="header.value === 'Trade Plan'" class="d-flex justify-center pt-2")
        //-                     DropDownTradePlans( :stock="item" )

        //-                 div( v-if="header.value === 'Diary Notes'" class="pt-2")
        //-                     UserDiaryDropDown( :stock="item")

        //-                 div( v-if="header.value==='Tags'" class="pt-2")
        //-                     TagDropDown1( :tagsString="item.tags" :stock="item" from='wl')

        //-             td
        //-                 div
        //-                     v-icon(v-if="watchlistID != -1" class="remove-watchlist-item-design mt-2" @click="deleteWLI(item)") mdi-close

        //-         template( v-if="paywallCriteria")
        //-             tr( style="background:#FAFAFA;")
        //-                 td( colspan="17" class="pl-0 pr-0")
        //-                     table( style="width:100%;")
        //-                         tr( v-for="index in (10 - watchlistLength)" style="background:#FAFAFA;")
        //-                             td( class="text-right" style="border:1px dashed #D3D3D3!important;")
        //-                                 span( v-if="index < (10 - watchlistLength)") &nbsp;
        //-                                 template( v-else)
        //-                                     div( class="d-flex justify-space-between align-center")
        //-                                         span(style="font-size:18px; color:#B4B4B4;") {{ $t('watchlist_free_plan') }}

        //-         tr
        //-             td( colspan="17" style="padding:10px;background-color:white;")

        //-         tr( class="blue5")
        //-             td( colspan="8") {{this.$t('Count')}} {{ watchlistInfo.length }}
        //-             td
        //-                 div( style="text-align:right;") {{this.$t('Average')}}
        //-                 div( style="text-align:right;") {{ averageNumberOfDays }}&nbsp;
        //-                     template( v-if="averageNumberOfDays > 1 || averageNumberOfDays === 0") {{this.$t('Days')}}
        //-                     template( v-else) {{this.$t('Day')}}
        //-             td
        //-                 div( style="text-align:center;") %
        //-                 div( style="text-align:right;")
        //-                     template( v-if="!isNaN(deltaProcentAverage)") {{ deltaProcentAverage }}&nbsp;%
        //-             td
        //-             td
        //-                 div( style="text-align:center;") {{ researchStats.document }}&nbsp;{{this.$t('Documents')}}
        //-                 div( style="text-align:center;") {{ researchStats.missing }}&nbsp;{{this.$t('Missing')}}

        //-             td
        //-             td( colspan="4" style="text-align:right;")
        //-                 PremiumButton( v-if="paywallCriteria" :value="true")

        //- PremiumButton( ref="myPremiumButton")


    div
        AgGridVue(
            ref="agGridVueContainer"
            :context="context"
            style="position:absolute; top:150px; bottom:0; left:215px; right:20px; margin-left:12px; margin-bottom:10px;"
            :frameworkComponents="frameworkComponents"
            :class="{'ag-theme-dark':$vuetify.theme.isDark,'ag-theme-balham':!$vuetify.theme.isDark}"
            id="watchlist"
            gridApi=null
            gridColumnApi=null
            :gridOptions="gridOptions"
            :defaultColDef="defaultColDef"
            :animateRows="true"
            :postProcessPopup="postProcessPopup"
            :columnDefs="columnDefs"
            :getRowHeight="getRowHeight"
            :rowData="watchlists"
            @sortChanged="saveColumnUserSetting"
            @gridColumnsChanged="saveColumnUserSetting"
            @columnResized="saveColumnUserSetting"
        )
        div(v-show="!this.userSubscribed" style="position: absolute; bottom: 10px; right:122px;")
            PremiumButton( ref="myPremiumButton")

</template>

<script>
import { AgGridVue } from "ag-grid-vue";
import "ag-grid-enterprise";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-dark.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

import WatchedSinceDropDown from "./WatchedSinceDropDown";
import DropDownTradePlans from "../../components/DropDownTradePlans";
import UserDiaryDropDown from './UserDiaryDropDown';
import TagDropDown from './TagDropDown.vue';
import Ticker from "../../components/Ticker";
import PremiumButton from '../../components/PremiumButton';
import ApiService from '../../Services/ApiService.js';
import moment from 'moment';
const _ = require('lodash');
import {mapActions, mapGetters} from "vuex";
import ResearchIcon from "./ResearchIcon.vue";
import TradePlanIcon from "./TradePlanIcon.vue";
// import Conviction from "../../components/Conviction.vue";
import Conviction from "./Conviction.vue";
import AddColumnBtn from "./AddColumnBtn.vue"
import i18n from '@/plugins/i18n';
import ScreenerTicker from "../screener/grid-parts/ScreenerTicker.vue";

const helper = require("../../util/helper.js");

export default {
    name: "ViewModeList",
    props: {
        watchlists: Array
    },
    components: {
        AgGridVue,
        ResearchIcon,
        TradePlanIcon,
        WatchedSinceDropDown,
        DropDownTradePlans,
        UserDiaryDropDown,
        TagDropDown,
        Conviction,
        Ticker,
        PremiumButton,
        AddColumnBtn,
    },
    data() {
        const thisVal = this;
        return {
            missing_researchSum: 0,
            researchSum: 0,
            context: {},
            postProcessPopup: null,
            windowWidth: 0,
            windowHeight: 0,
            posY: 0,
            posX: 0,
            scrollY: 0,
            bottomX: 0,
            is_firstMounted: false,
            useSort: false,
            watchlistsSorted: null,
            sortHeaderDirections: [],
            defaultColDef: {
                cellClass: 'number-cell',
                resizable: true
            },
            gridOptions: {
                headerHeight: 40,
                suppressRowTransform: true,
                statusBar: {
                    statusPanels: [
                        { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
                        { statusPanel: 'agAggregationComponent' },
                        // { statusPanelParams: {
                        //     // possible values are: 'count', 'sum', 'min', 'max', 'avg'
                        //     aggFuncs: ['min', 'max', 'avg']}
                        // }

                    ],
                },
                // groupIncludeFooter: true,
                // groupIncludeTotalFooter: true
            },
            columnDefs: [
                {headerName: this.$t('Ticker'),
                    field: "ticker",
                    cellRenderer: 'screenerTicker',
                    cellRendererParams: {
                        action : this.goToStock.bind(this),
                    },
                    suppressMenu: true,
                    width: 85,
                    hide: false,
                },
                {headerName: this.$t('Name'),
                    field: "Name",
                    suppressMenu: true,
                    sortable: true,
                    width: 120,
                    cellClass: 'pt-2',
                    hide: false,
                },
                {headerName: this.$t('Sector'),
                    field: "Sector",
                    suppressMenu: true,
                    sortable: true,
                    width: 120,
                    cellClass: 'pt-2',
                    hide: false,
                    valueFormatter: (params) => {
                        return helper.sectorNameConverter(params.value, this);
                    }
                },
                {headerName: this.$t('last_earnings'),
                    field: "EarningsDate",
                    suppressMenu: true,
                    sortable: true,
                    width: 96,
                    cellClass: 'pt-2',
                    hide: false,
                    type: 'rightAligned',
                    cellStyle: {textAlign: "right"},
                },
                {headerName: this.$t('next_earnings'),
                    field: "next_earnings_date",
                    suppressMenu: true,
                    sortable: true,
                    width: 100,
                    cellClass: 'pt-2',
                    hide: false,
                    type: 'rightAligned',
                    cellStyle: {textAlign: "right"},
                },
                {headerName: this.$t('price_eod'),
                    field: "price_today",
                    suppressMenu: true,
                    sortable: true,
                    width: 88,
                    cellClass: 'pt-2',
                    hide: false,
                    type: 'rightAligned',
                    cellStyle: {textAlign: "right"},
                },
                {headerName: this.$t('last_eps'),
                    field: "Eps",
                    suppressMenu: true,
                    sortable: true,
                    width: 71,
                    cellClass: 'pt-2',
                    hide: false,
                    type: 'rightAligned',
                    cellStyle: {textAlign: "right"},
                    pinnedRowCellRenderer: function (params) { return '<strong>' + params.data.Eps + '</strong>'},
                },
                {headerName: this.$t('last_sales'),
                    field: "Sales",
                    suppressMenu: true,
                    sortable: true,
                    width: 78,
                    cellClass: 'pt-2',
                    hide: false,
                    type: 'rightAligned',
                    cellStyle: {textAlign: "right"},
                },
                {headerName: this.$t('Watched_Since'),
                    field: "Watched Since",
                    cellRenderer: 'watchedSinceDropDown',
                    suppressMenu: true,
                    sortable: true,
                    width: 100,
                    hide: false,
                },
                {headerName: "∆%",
                    field: "∆%",
                    cellRenderer: function (params) {
                        return params.value + ' %';
                    },
                    cellStyle: {textAlign: "right"},
                    suppressMenu: true,
                    sortable: true,
                    width: 67,
                    cellClass: 'pt-2',
                    hide: false,
                    type: 'rightAligned',
                },
                {headerName: this.$t('Conviction'),
                    field: "Conviction",
                    cellRenderer: 'conviction',
                    cellRendererParams: {
                    },

                    suppressMenu: true,
                    sortable: true,
                    width: 110,
                    hide: false,
                },
                {headerName: this.$t('research'),
                    field: "ticker",
                    cellRenderer: 'researchIcon',
                    cellRendererParams: {
                        action : this.goToResearch.bind(this),
                    },
                    suppressMenu: true,
                    sortable: true,
                    width: 76,
                    hide: false,
                },
                {headerName: this.$t('trade_plan'),
                    field: "ticker",
                    cellRendererFramework: 'DropDownTradePlans',
                    suppressMenu: true,
                    sortable: true,
                    width: 84,
                    hide: false,
                },
                {headerName: this.$t('Trade_Journal'),
                    field: "ticker",
                    suppressMenu: true,
                    sortable: true,
                    // suppressToolPanel: true,
                    width: 214,
                    cellRendererFramework: UserDiaryDropDown,
                    hide: false,
                },
                {headerName: this.$t('My_Tags'),
                    field: "tags",
                    suppressMenu: true,
                    sortable: true,
                    width: 255,
                    cellRendererFramework: TagDropDown,
                    hide: false,
                },

                {headerName: "",
                    width: 120,
                    field: '',
                    headerComponentFramework: 'AddColumnBtn',
                    suppressFilterButton: false,
                    lockVisible: false,
                    pinned: "right",
                    resizable: false,
                    suppressMenu: true,
                    suppressMovable: true,
                    suppressSorting : true,
                    hide: false
                },
                {headerName: "",
                    suppressFilterButton: false,
                    lockVisible: false,
                    pinned: "right",
                    resizable: false,
                    suppressMenu: true,
                    suppressMovable: true,
                    suppressSorting : true,
                    hide: false,
                    field: '',
                    width: 50,
                    cellRenderer: (data) => {
                        if (thisVal.watchlistID != -1) {
                            const element = document.createElement('div');
                            element.className = 'saveRemoveStockBlock';
                            element.style.color = 'white';
                            element.innerHTML = `
                                <span id="remove${data.value}" class="remove-button-layout">
                                    ${thisVal.trashCanIcon()}
                                </span>
                            `;
                            const removeButton = element.querySelector('#remove' + data.value);

                            removeButton.addEventListener('click', async () => {
                                const rowData = JSON.parse(JSON.stringify(data.node.data));
                                await thisVal.clickRemoveButton(rowData);
                            });

                            return element;
                        }
                    }
                },
            ],
            gridColumSaveTrigger: null,
            saveColumnEnabled: false
        };
    },
    beforeMount() {
        this.frameworkComponents = {
            researchIcon: ResearchIcon,
            tradePlanIcon: TradePlanIcon,
            conviction: Conviction,
            tagDropDown: TagDropDown,
            addColumnBtn: AddColumnBtn,
            userDiaryDropDown: UserDiaryDropDown,
            dropDownTradePlans: DropDownTradePlans,
            watchedSinceDropDown: WatchedSinceDropDown,
            screenerTicker: ScreenerTicker,
            // deleteIcon: DeleteIcon
        };
        this.context = {
            componentParent: this
        }
    },
    computed: {
        ...mapGetters(["getWatchlists", "getUserCurrentWatchlistId", "getWatchlistItems", "getWatchlistJoins", "getWL_columns"]),
        watchlistID() {
            this.getFooterValues(); // it is needed when you go to another WL page
            return this.$route.params.id ? this.$route.params.id : -1;
        },
        paywallCriteria() {
            // user.type === 'new' || user.type === 'freemium'
            return (this.user.type === 'new' || this.user.type === 'freemium') && this.user.subscription_id === null;
        },
        watchlistLength() {
            return this.watchlists.length;
        },
        watchlistInfo() {
            return {
                length: this.watchlists.length,
            }
        },
        user() {
            return JSON.parse(localStorage.getItem('user'))
        },
        averageNumberOfDays() {
            let totalNumberOfDays = 0;

            for(const item of this.watchlists) {
                const given = moment(item.Research.watched_since);
                const current = moment().startOf('day');
                const days = moment.duration(given.diff(current)).asDays().toFixed(0).charAt(0) === '-' ? parseInt(-moment.duration(given.diff(current)).asDays().toFixed(0)) : parseInt(moment.duration(given.diff(current)).asDays().toFixed(0));

                totalNumberOfDays += days;
            }

            const averageNumberOfDays = (totalNumberOfDays / this.watchlists.length).toFixed(0);

            return !isNaN(averageNumberOfDays) ? averageNumberOfDays : 0;
        },
        deltaProcentAverage() {
            let deltaCounter = 0;
            let deltaProcentSum = 0;

            for(const item of this.watchlists) {
                if(item['∆%'] !== "") {
                    deltaCounter++;
                    deltaProcentSum += item['∆%'];
                }
            }

            const deltaProcentAverage = (deltaProcentSum / deltaCounter).toFixed(0);

            return deltaProcentAverage;
        },
        researchStats() {
            const researchObject = {
                document: 0,
                missing: 0
            };

            for(const item of this.watchlists) {
                if(item.Research.research_state === 'EXISTS') {
                    researchObject.document += 1;
                } else {
                    researchObject.missing += 1;
                }
            }

            return researchObject;
        },
        userSubscribed: {
            get() {
                return this.$store.getters.getUserSubscribed;
            },
        },
    },
    methods: {
        ...mapActions([
            "removeStocksFromWLJ",
            "removeStocksFromWLI",
            "saveWLColumns"
        ]),

        saveColumnUserSetting() {
            if (this.saveColumnEnabled) {
                if (this.gridColumSaveTrigger != null) {
                    clearTimeout(this.gridColumSaveTrigger);
                }
                this.gridColumSaveTrigger = setTimeout(() => {
                    this.saveColumnConfig()
                }, 100);
            }
        },

        saveColumnConfig() {
            let WL_columns = this.getWL_columns;
            let columnsConf = this.gridOptions.columnApi.getColumnState();
            WL_columns.columnsConf = columnsConf;
            let data = {
                user_id: this.user.user_id,
                content: JSON.stringify(WL_columns),
                feature: 'WATCHLIST'
            }
            this.saveWLColumns(data);
        },

        setAddColumn(columns) {
            var cols = this.gridOptions.columnApi.columnController.columnDefs;
            cols.forEach(element => {
                element.hide = false;
                if (columns.includes(element.headerName)) {
                    element.hide = true;
                }
            });

            this.gridOptions.api.setColumnDefs([cols[cols.length - 1]]);
            this.gridOptions.api.setColumnDefs(cols);
            this.gridOptions.api.redrawRows();
            this.is_firstMounted = true;

            let WL_columns = this.getWL_columns;
            let columnsConf = this.gridOptions.columnApi.getColumnState();
            WL_columns.columns = columns;
            WL_columns.columnsConf = columnsConf;
            let data = {
                user_id: this.user.user_id,
                content: JSON.stringify(WL_columns),
                feature: 'WATCHLIST'
            }
            this.saveWLColumns(data);
        },
        goToStock(ticker) {
            let stock = this.$store.getters["getAllStocks"].find(s=> s.ticker === ticker);
            this.$router.push({name: 'landing-page.stock-detail', params: {stock_id: stock.stock_id}});
        },
        getRowHeight(params) {
            if (params.data.tags) {
                let tags = JSON.parse(params.data.tags);
                if (params.data.tags && tags && tags.length > 2) {
                    if (tags.length % 2 == 1) {
                        return parseInt(tags.length /2 + 1) * 32 + 10;
                    } else {
                        return (tags.length) /2 * 32 + 10;
                    }
                } else {
                    return 50;
                }
            } else {
                return 50;
            }
        },
        async clickRemoveButton(item) {
            await this.removeStocksFromWLJ({
                watchlist_id: this.watchlistID,
                stock_id: item.stock_id,
                user_id: this.user.user_id
            });
            let WL = this.getWatchlistJoins.find(join => join.stock_id == item.stock_id);
            if (!WL) {
                await this.removeStocksFromWLI({
                    watchlist_id: this.watchlistID,
                    stock_id: item.stock_id,
                    user_id: this.user.user_id
                });
            }
            this.getFooterValues();
        },
        goToResearch(ticker) {
            let stock = this.$store.getters["getAllStocks"].find(s=> s.ticker === ticker);
            this.$router.push({name: 'landing-page.stock-detail', params: {stock_id: stock.stock_id}, query: {tab: 1}});
        },
        trashCanIcon() {
            return `
                <svg class="set-trash-can-container" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path class="set-trash-can-color" stroke="#000000" d="M3.33203 5H16.6654L15.3487 16.85C15.3036 17.2578 15.1096 17.6346 14.8039 17.9083C14.4982 18.182 14.1023 18.3334 13.692 18.3333H6.30536C5.89506 18.3334 5.49917 18.182 5.19349 17.9083C4.88781 17.6346 4.69383 17.2578 4.6487 16.85L3.33203 5Z" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
                    <path class="set-trash-can-color" stroke="#000000" d="M6.12083 2.62251C6.25563 2.33664 6.46892 2.095 6.73584 1.92576C7.00275 1.75653 7.31229 1.66667 7.62833 1.66667H12.3717C12.6879 1.66651 12.9976 1.75629 13.2646 1.92554C13.5317 2.09479 13.7451 2.33652 13.88 2.62251L15 5.00001H5L6.12083 2.62251Z" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
                    <path class="set-trash-can-color" stroke="#000000" d="M1.66602 5H18.3327" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
                    <path class="set-trash-can-color" stroke="#000000" d="M8.33203 9.16667V13.3333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
                    <path class="set-trash-can-color" stroke="#000000" d="M11.666 9.16667V13.3333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            `;
        },

        getFooterValues() {
            this.researchSum = 0;
            this.missing_researchSum = 0;

            this.gridOptions.api.forEachNode((rowNode) => {
                if(rowNode.data !== undefined) {
                    this.researchSum ++;
                    if (rowNode.data.research_state == 'MISSING') {
                        this.missing_researchSum ++;
                    }
                }
            });

            const researchSumElement = document.getElementById('research_sum');
            researchSumElement.innerHTML = this.researchSum;

            const missing_research_Element = document.getElementById('missing_research_sum');
            missing_research_Element.innerHTML = this.missing_researchSum;
        }
    },
    async mounted() {
        console.log('mounted() - props watchlists in ViewModelList.vue======', this.watchlists);
        setTimeout(() => {
            let WL_columns = this.getWL_columns;
            if (WL_columns.columnsConf) {
                this.gridOptions.columnApi.applyColumnState({
                    state: WL_columns.columnsConf,
                    applyOrder: true,
                });
            } else {
                this.gridOptions.columnApi.applyColumnState({
                    state: this.columnDefs,
                    applyOrder: true,
                });
            }
            this.saveColumnEnabled = true;
        }, 50);


        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        const urlParams = new URLSearchParams(window.location.search);

        this.is_firstMounted = false;

        // if(urlParams.get('show_premium')) {
        //     this.$refs.myPremiumButton.openPremiumDialog();
        // } else {
        //     this.$refs.myPremiumButton.hidePremiumButton();
        // }

        if(urlParams.get('stock_id') !== null && urlParams.get('tab') !== null) {
            const stock_id = parseInt(urlParams.get('stock_id'));
            const tab = parseInt(urlParams.get('tab'));

            this.$router.push({name: 'landing-page.stock-detail', params: { stock_id }, query: { tab }});
        }


        // Footer of ag-grid
        const agStatusBarCenter = document.getElementsByClassName('ag-status-bar-left')[0];
        const plChild = document.createElement('span');
        plChild.style.paddingLeft = "20px";
        plChild.style.paddingRight = "4px";
        plChild.style.paddingTop = "8px";
        plChild.style.paddingBottom = "8px";
        plChild.innerHTML = '<span ref="eValue" id="research_sum" class="ag-status-name-value-value">0</span>' +
                            '<span>  Documents</span>' +

                            // '&nbsp;' + '&nbsp;'+ '&nbsp;'+ '&nbsp;'+ '&nbsp;'+

                            // '<span>avg' + '&nbsp;<span>' +
                            // '<span ref="eValue" id="trades_sum" class="ag-status-name-value-value">0</span>' + '&nbsp;' +
                            // '<span> trades week' +

                            // '&nbsp;' + '&nbsp;'+ '&nbsp;'+ '&nbsp;'+ '&nbsp;'+
                            // '<span>     Value: </span>' +
                            // ':&nbsp;' +
                            // '<span ref="eValue" id="value_sum" class="ag-status-name-value-value">0</span>' +

                            // '<span> test1 </span>     <span> test1 </span>' +
                            '<div>' +
                            '<span ref="eValue" id="missing_research_sum" class="ag-status-name-value-value">0</span>' +
                            '<span>  Missing</span>' +
                            '</div>'
                            ;

        agStatusBarCenter.append(plChild);

        this.getFooterValues();
    },
    watch: {
        watchlists() { // it is needed when you add WLI
            this.getFooterValues()
        }
    },
    beforeDestroy() {
        this.saveColumnConfig();
    }
}


</script>

<style>
.ag-header-cell-label .ag-header-cell-text {
    white-space: normal !important;
}
.dropDown2 {
    display: none;
    z-index: 0;
    position: absolute;
    background: white;
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 5px 0 0 0 ;
    margin: -5px 0 0 40px;
    min-width: 380px;
    box-shadow: 10px 13px 48px -4px rgba(0,0,0,0.49);
    overflow-y: visible;
    -webkit-overflow-scrolling: touch;
}

.movepanel{
    left: 950px !important;
    top: 30px;
}
</style>

<style scoped>
>>> .set-research-new-container {
    width: 22px;
    height: 26px;
}

>>> .set-research-new-color {
    fill: #25B19A;
}

>>> .set-circle-container {
    width: 20px;
    height: 20px;
}

>>> .set-circle-color {
    fill: #E72929;
}

>>> .set-research-no-new-container {
    width: 22px;
    height: 26px;
}
>>> span:hover .set-trash-can-color {
    stroke: red;
}

>>> .set-research-no-new-color {
    fill: #d1d0d0;
}

>>> .v-icon:hover > .set-research-no-container > .set-research-no-color {
    fill: #8EC690;
}
>>> .set-trash-can-color {
    stroke: #333333;
}
>>> span:hover {
    cursor: pointer;
}


>>> .set-trash-can-container {
    width: 23px;
    height: 23px;
}

>>> .remove-button-layout {
    display: inline-block;
    margin-top: 5px;
}

.remove-watchlist-item-design {
    background-color: white;
    color: gray;
}

.remove-watchlist-item-design:hover {
    color: red;
}


</style>
