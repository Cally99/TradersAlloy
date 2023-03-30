<template lang="pug">
    v-sheet(class="ma-0")
        v-overlay(:value="isLoaded")
            v-progress-circular(indeterminate size="64")

        div(class="d-flex justify-space-between mt-4 px-4")
            div(style="margin-left:250px;")
                span(v-if="!is_nameEditor" style="font-size:24px;" @click="is_nameEditor=true") {{filters.name}}
                v-text-field(v-else
                            v-model="init_name"
                            style="margin:0; padding:0; font-size:24px;"
                            @keyup.enter="renameScreener(final_name)"
                            @change="renameScreener(final_name)"
                            @blur="renameScreener(final_name)"
                            :autofocus="is_nameEditor")
            v-btn(color="primary" @click="click_saveBtn()") Save
            

            div(class="wl-container")
                div
                    WatchlistAddTo(:stocks="chosenStocks" :disabled="addSelected")

                ScreenerDropDown( @navigateScreener="navigateScreener" :screenername="''" @saveNewFilter="saveNewFilter" style="margin-bottom: 50px;")

                div( class="wl-util" style="margin-right: 20px;")
                    v-btn(style="float: right;" outlined class="grey lighten-3"
                        @click="newScreener")
                        v-icon(style="margin-right:8px; ") mdi-target
                        span New Screener
                    ScreenerDropDown( @navigateScreener="navigateScreener" :screenername="filters.name")


        div
            AgGridVue(
                ref="agGrid"
                :context="context"
                :frameworkComponents="frameworkComponents"
                style="position:absolute; top:200px; bottom:0; left:260px; right:20px; margin-left:12px;"
                :class="{'ag-theme-dark':$vuetify.theme.isDark,'ag-theme-balham':!$vuetify.theme.isDark}"
                id="screen"
                gridApi=null
                gridColumnApi=null
                :animateRows="true"
                :pagination="false"
                :gridOptions="gridOptions"
                :defaultColDef="defaultColDef"
                rowSelection="multiple"
                :rowData="stocks"
                :columnDefs="columnDefs"
                :suppressRowTransform="true"
                :postProcessPopup="postProcessPopup"
                @selection-changed="selectChanged"
                @firstDataRendered="onFirstDataRendered"
                @filterChanged="onFilterChanged"
                @sortChanged="onSortChanged"
            )
                //- @grid-ready="onGridReady"
        v-dialog(v-model="dialog" width="550")
             v-card
                v-card-title(class="headline d-flex justify-space-between align-center" style="width:100%;")
                    div Create a new Watchlist
                    v-icon(class="cursor-pointer" @click="dialog=false") mdi-close
                v-divider(class="mt-0")
                v-card-text(class="black--text")
                    p Watchlists help you monitor multiple interesting Companies and capture qualitative and quantitative (that is the “data” and the “story”).
                    p Your watchlists organize with convienence.
                    label(class=" font-weight-bold mb-0") Name
                    v-text-field(v-model="newWatchlistName" label="Watchlist Name" solo dense)

                v-divider(class="mb-0")

                v-card-actions
                    v-spacer
                    v-btn(
                        depressed
                        color="primary"
                        @click="newWatchlist"
                        :disabled='newWatchlistName.length<3') Add
        v-dialog(v-model="newScreenerDiag" persistent max-width="600px" )
            v-card
                v-card-title(class="headline grey lighten-2") Save Filter
                v-card-text
                    v-container
                        v-row
                            v-col(cols="12")
                            v-text-field(label="Filter Name" v-model="filterName")
                v-divider
                v-card-actions(class="d-flex justify-end")
                    v-btn(color="primary" @click="filterSave") Save
                    v-btn(color="grey lighten-2" @click="newScreenerDiag = false") Close
</template>

<script>
    import { AgGridVue } from "ag-grid-vue";
    import 'ag-grid-enterprise';
    import "ag-grid-community/dist/styles/ag-grid.css";
    import "ag-grid-community/dist/styles/ag-theme-dark.css";
    import "ag-grid-community/dist/styles/ag-theme-balham.css";
    import "ag-grid-community/dist/styles/ag-theme-alpine.css";
    import ApiService from "../Services/ApiService";
    import ApiStocks from "../Services/ApiStocks";
    import SparkLine from "./grid-parts/SparkLine.vue";
    import SparkSales from "./grid-parts/SparkSales.vue";
    import SparkDebt from "./grid-parts/SparkDebt.vue";
    import SparkBar from "./grid-parts/SparkBar.vue";
    import ButtonWatchlist from "./grid-parts/ButtonWatchlist.vue";
    import FilterSlider from './grid-parts/FilterSlider.vue';
    import FilterExchanges from './grid-parts/FilterExchanges.vue';
    import FilterSector from './grid-parts/FilterSector.vue';
    import FilterDebt from './grid-parts/FilterDebt.vue';
    import FilterMarketCap from './grid-parts/FilterMarketCap.vue';
    import FilterSolidity from './grid-parts/FilterSolidity.vue';
    import FilterEnterpriseValue from './grid-parts/FilterEnterpriseValue.vue';
    import FilterEVEBIT from './grid-parts/FilterEVEBIT.vue';
    import FilterEVEBITDA from './grid-parts/FilterEVEBITDA.vue';
    import FilterPB from './grid-parts/FilterPB.vue';
    import FilterPE from './grid-parts/FilterPE.vue';
    import FilterGP from './grid-parts/FilterGP.vue';
    import FilterPTP from './grid-parts/FilterPTP.vue';
    import FilterEbitda from './grid-parts/FilterEbitda.vue';
    import FilterEbit from './grid-parts/FilterEbit.vue';
    import FilterNP from './grid-parts/FilterNP.vue';
    import FilterAsset from './grid-parts/FilterAsset.vue';
    import FilterEquity from './grid-parts/FilterEquity.vue';
    import FilterProfitPct from './grid-parts/FilterProfitPct.vue';
    import FilterSalesPct from './grid-parts/FilterSalesPct.vue';
    import ScreenerDropDown from "./ScreenerDropDown";
    import ScreenerTicker from "./grid-parts/ScreenerTicker";
    import AddColumnBtn from "./grid-parts/AddColumnBtn.vue"
    import FilterLastReport from "./grid-parts/FilterLastReport.vue";
    import FilterNextReport from "./grid-parts/FilterNextReport.vue";
    import SaveBtn from "./grid-parts/SaveBtn.vue"
    import {store} from "../stores"
    import WatchlistAddTo  from "@/components/WatchlistAddTo.vue";
    import moment from 'moment';


    function formatNumberWithSpaces(x) {
        x = isNaN(x) ? 0 : x*1;

        let parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.join(".");
    }

    function formatPercentage(x) {
        return Math.round(x)+"%";
    }

    function getSolidity(params) {
        if(params.data.totalassets && params.data.totalassets.length > 0 && params.data.shequity && params.data.shequity.length > 0)
            return ~~(params.data.totalassets[params.data.totalassets.length-1] / params.data.shequity[params.data.shequity.length-1]);
    }

    function getEquityPercent(params) {
        if(params.data.ebit && params.data.ebit.length > 0 && params.data.shequity && params.data.shequity.length > 0)
            return ~~(params.data.ebit[params.data.ebit.length-1] / params.data.shequity[params.data.shequity.length-1]);
    }

    function getAssetsPercent(params) {
        if(params.data.ptp && params.data.ptp.length > 0 && params.data.totalassets && params.data.totalassets.length > 0)
            return ~~(params.data.ptp[params.data.ptp.length-1] / params.data.totalassets[params.data.totalassets.length-1]);
    }

    window.numberSort = function numberSort(num1, num2) {
        return num1 - num2;
    };

    export default {
        name: "SheetScreen",
        components: {AgGridVue, FilterExchangeComp, FilterNetDebt, FilterSectorComp, FilterMarketCapComp, FilterSolidityComp, FilterEnterpriseValueComp,FilterEVEBITComp, FilterEVEBITDAComp, FilterPBComp, FilterPEComp, FilterPSComp, FilterGPComp, ScreenerDropDown, WatchlistAddTo, FilterLastReportDateComp, FilterNextReportDateComp, FilterSalesComp, FilterPTPComp, FilterEbitdaComp, FilterEbitComp, FilterNPComp },
        props: {
        },
        created: function () {
            // this.stocks = this.$store.getters.getAllStocks;
            // this.stocks = this.$store.getters.getMapStocks;
            // this.gridApi.setRowData("stocks");
            const that = this
            // ApiService.getUserScreenerFilters(JSON.parse(localStorage.user).user_id).then(res=> {
            //     res.data.map(item=> {
            //         that.$store.commit("addScreenerFilters" , {name: item.name , filter: JSON.parse(item.filter) , screen_id: item.screen_id})
            //     })
            // })
        },
        beforeMount() {
            this.frameworkComponents =
            {   sparkLine: SparkLine,
                sparkSales: SparkSales,
                sparkDebt: SparkDebt,
                sparkBar: SparkBar,
                filterSlider: FilterSlider,
                filterExchanges: FilterExchanges,
                filterSector: FilterSector,
                filterDebt: FilterDebt,
                buttonWatchlist: ButtonWatchlist,
                filterMarketCap: FilterMarketCap,
                filterSolidity: FilterSolidity,
                filterEnterpriseValue: FilterEnterpriseValue,
                filterEVEBIT: FilterEVEBIT,
                filterEVEBITDA: FilterEVEBITDA,
                filterPB: FilterPB,
                filterPE: FilterPE,
                filterGP: FilterGP,
                filterPTP: FilterPTP,
                filterEbitda: FilterEbitda,
                filterEbit: FilterEbit,
                filterNP: FilterNP,
                filterLastReport: FilterLastReport,
                filterNextReport: FilterNextReport,
                filterAsset: FilterAsset,
                filterEquity: FilterEquity,
                filterProfitPct: FilterProfitPct,
                filterSalesPct: FilterSalesPct,
                filterSales:FilterSales,
                filterPS: FilterPS,
                screenerTicker: ScreenerTicker,
                addColumnBtn: AddColumnBtn,
                saveBtn: SaveBtn
            },
            // menu screen is below addcolumn column
            this.postProcessPopup = (params) => {
                if (params.type !== 'columnMenu') {
                    return;
                }
                var columnId = params.column.getId();
                if (columnId === 'addColumn') {
                    var ePopup = params.ePopup;
                    var oldTopStr = ePopup.style.top;
                    oldTopStr = oldTopStr.substring(0, oldTopStr.indexOf('px'));
                    var oldTop = parseInt(oldTopStr);
                    var newTop = oldTop + 25;
                    ePopup.style.top = newTop + 'px';
                    this.columnMenu = params.ePopup;
                    this.columnMenu.addEventListener('click', event => {
                        window.mouseOverBind1();
                    })
                }
            };
            this.context = {
                componentParent: this
            }
        },
        mounted() {
            // this.overlay = true;
            this.$intercom.hide();
            this.$intercom.update({utm_content: 'bbb', utm_campaign: 'screener'});
            this.gridApi = this.gridOptions.api;
            this.gridColumnApi = this.gridOptions.columnApi;    
            // console.log(this.filters.filter);
            // if (this.filters.filter) {
            //     this.gridApi.setFilterModel(JSON.parse(this.filters.filter));
            // } else {
            //     this.gridApi.setFilterModel(null);
            // }
            
            // ApiService.fetchSectorsTree()  // PAUL: This should  be in VUEX
            //     .then(response => {
            //         this.overlay = false;
            //         var list = response.data;
            //         this.sectorLists = list;
            //         var map = {},
            //             node,
            //             roots = [],
            //             i;
            //         for (i = 0; i < list.length; i += 1) {
            //             map[list[i].sector_id] = i;
            //             list[i].children = [];
            //         }
            //         for (i = 0; i < list.length; i += 1) {
            //             node = list[i];
            //             if (node.parent_sector_id !== -1 && node.parent_sector_id !== null) {
            //                 list[map[node.parent_sector_id.toString()]].children.push(node);
            //             } else {
            //                 roots.push(node);
            //             }
            //         }
            //         this.items = roots;
            //     });
            window.mouseOverBind();
        },
        beforeDestroy() {
            window.mouseOverUnBind();
        },
        data() {
            return {
                mounted_once: false,
                context: {},
                columnMenu: null,
                final_name: "",
                name: "",
                is_nameEditor: false,
                savedFilter: '',
                addSelected: true,
                gridApi: null,
                filterName: "",
                newScreenerDiag: false,
                screener: "",
                newItem: 5,
                dialog: false,
                newWatchlistName: "",
                frameworkComponents: null,
                // overlay: false,
                // watchlists: ['Exemplelista','Medical', 'Technology', 'Work in Progress', 'Bubble theme', 'Small Cap Growthy'],
                values: [10,20, 30,32,36, 40, 30, 25],
                defaultColDef: {
                    resizable: true,
                    sortable: true,
                    floatingFilter: true,
                },
                postProcessPopup: null,
                gridOptions: {
                    rowStyle: {
                        border: 'none'
                    },
                    borders: false,
                    headerColumnSeparatorColor: 'white',
                    enableSorting: true,
                    enableCharts: true,
                    enableRangeSelection: true,
                    rowMultiSelectWithClick: true,
                    rowHeight: 45,
                    headerHeight: 40,
                    floatingFiltersHeight: 100,
                    statusBar: {
                        statusPanels: [
                            { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
                            { statusPanel: 'agAggregationComponent' },
                        ],
                    },
                    columnsMenuParams: {
                        suppressSyncLayoutWithGrid: true,
                        suppressColumnExpandAll: true,
                        suppressColumnFilter: true,
                        suppressColumnSelectAll: true,
                        contractColumnSelection: true
                    },
                },
                columnDefs: [
                    {headerName: "",
                        children: [
                            {
                                headerName: "",
                                width: 40,
                                cellStyle: {'background-color': '#FFFFFF'},
                                checkboxSelection: true,
                                pinned: "left",
                                lockVisible: true,
                                suppressMovable: true,
                                suppressSizeToFit: true,
                                floatingFilter: true,
                                // floatingFilterComponent: FilterSaveComp,
                                filter: 'saveBtn',
                                floatingFilterComponentParams: {
                                    suppressFilterButton: true,
                                },
                            }
                        ]
                    },
                    {headerName: "Info",
                        children: [
                            {headerName: "Exchange",
                                field: "exchange",
                                filter: 'filterExchanges',
                                floatingFilter: true,
                                cellRenderer: function(params) {
                                    let isoCountryCode = params.data.country||'none';
                                    return `<img src="/images/flag_${isoCountryCode}.png" style="width:28px; height:;16px"/> ${params.value} `;
                                },
                                floatingFilterComponent: FilterExchangeComp,
                                suppressMenu: true,
                                // lockVisible: true,
                                // headerComponentParams: { template: '<i class="fa fa-star"></i>' },
                            },
                            {headerName: "Ticker",
                                field: "ticker",
                                width: 90,
                                floatingFilter: true,
                                // cellRenderer: function(params) {
                                //     return '<span class="ticker" style="line-height: 17px" (@click)="clickTicker">' + params.value + '</span>';
                                // },
                                cellRenderer: 'screenerTicker',
                                cellRendererParams: {
                                    action : this.doSomeAction.bind(this),
                                },
                                suppressMenu: true,
                                filter: 'agTextColumnFilter',
                                floatingFilterComponentParams: {
                                    suppressFilterButton: true,
                                },
                                lockVisible: true,
                            },
                            {headerName: "Name",
                                field: "name",
                                filter: 'agTextColumnFilter',
                                floatingFilterComponentParams: {
                                    suppressFilterButton: true,
                                },
                                suppressMovable: true,
                                suppressMenu: true,
                                hide: true
                            },
                            {headerName: "Exchange",
                                field: "exchange",
                                filter: 'filterExchanges',
                                floatingFilter: true,
                                cellRenderer: function(params) {
                                    let isoCountryCode = params.data.country||'none';
                                    return `<img src="/images/flag_${isoCountryCode}.png" style="width:28px; height:;16px"/> ${params.value} `;
                                },
                                floatingFilterComponent: FilterExchangeComp,
                                suppressMenu: true,
                                // hide: true
                                // lockVisible: true,
                                // headerComponentParams: { template: '<i class="fa fa-star"></i>' },
                            },
                            {headerName: "Sector",
                                field: "sector_name",
                                filter: 'filterSector',
                                floatingFilter: true,
                                headerTooltip: 'Business Sector/Industry as defined by the Exchange on which it is traded.',
                                floatingFilterComponent: FilterSectorComp,
                                suppressMenu: true,
                                // hide: true
                            },
                            {headerName: "Next Report Date",
                                field: "next_report_date",
                                filter: 'filterNextReport',
                                hide: true,
                                suppressMenu: true,
                                floatingFilter: true,
                                floatingFilterComponent: FilterNextReportDateComp,
                            },
                            {headerName: "Latest Report Date",
                                field: "last_report_date",
                                filter: 'filterLastReport',
                                floatingFilter: true,
                                hide: true,
                                floatingFilterComponent: FilterLastReportDateComp,
                                suppressMenu: true
                            },
                            {headerName: "Price",
                                field: "price_today",
                                hide: true,
                                suppressMenu: true,
                            },

                        ]},
                    {headerName: "Valuation",
                        children: [
                            {
                                headerName: "Enterprise Value",
                                field: "enterprise_q_array",
                                // hide: true,
                                suppressMenu: true,
                                cellRenderer: 'sparkBar',
                                type: "numericColumn",
                                minWidth: 230,
                                floatingFilter: true,
                                filter: 'filterEnterpriseValue',
                                floatingFilterComponent: FilterEnterpriseValueComp,
                                hide: true,
                            },
                            {
                                headerName: "Market Cap (±€)",
                                field: "market_cap",
                                type: "numericColumn",
                                filter: 'filterMarketCap',
                                floatingFilter: true,
                                floatingFilterComponent: FilterMarketCapComp,
                                minWidth: 230,
                                suppressMenu: true,
                                comparator: numberSort,
                                // hide: true
                            },
                            {
                                headerName: "EV/EBIT",
                                field: "ev_ebit_q_array",
                                suppressMenu: true,
                                cellRenderer: 'sparkBar',
                                type: "numericColumn",
                                filter: 'filterEVEBIT',
                                floatingFilter: true,
                                floatingFilterComponent: FilterEVEBITComp,
                                minWidth: 230,
                                comparator: numberSort,
                                hide: true
                            },
                            {
                                headerName: "EV/EBITDA",
                                field: "ev_ebitda_q_array",
                                hide: true,
                                suppressMenu: true,
                                cellRenderer: 'sparkBar',
                                type: "numericColumn",
                                filter: 'filterEVEBITDA',
                                floatingFilter: true,
                                floatingFilterComponent: FilterEVEBITDAComp,
                                minWidth: 230,
                                comparator: numberSort,
                            },
                            {
                                headerName: "P/B",
                                field: "pb_q_array",
                                cellRenderer: 'sparkBar',
                                hide: true,
                                suppressMenu: true,
                                type: "numericColumn",
                                filter: 'filterPB',
                                floatingFilter: true,
                                floatingFilterComponent: FilterPBComp,
                                minWidth: 230,
                                comparator: numberSort,
                            },
                            {
                                headerName: "P/E",
                                field: "pe_q_array",
                                cellRenderer: 'sparkBar',
                                hide: true,
                                suppressMenu: true,
                                type: "numericColumn",
                                filter: 'filterPE',
                                floatingFilter: true,
                                floatingFilterComponent: FilterPEComp,
                                minWidth: 230,
                                comparator: numberSort,
                            },
                            {
                                headerName: "P/S",
                                field: "ps_q_array",
                                cellRenderer: 'sparkBar',
                                hide: true,
                                suppressMenu: true,
                                type: "numericColumn",
                                filter: 'filterPS',
                                floatingFilter: true,
                                floatingFilterComponent: FilterPSComp,
                                minWidth: 230,
                                comparator: numberSort,
                            },
                        ]
                    },
                    {headerName: "Income Statement",
                        children: [
                            {headerName: "Sales",
                                field: "sales_q_array",
                                hide: true,
                                // cellRenderer: 'sparkSales',
                                type: "numericColumn",
                                suppressMenu: true,
                                cellRenderer: 'sparkBar',
                                // hide: true,
                                filter: 'filterSales',
                                floatingFilter: true,
                                floatingFilterComponent: FilterSalesComp,
                                minWidth: 230,
                                comparator: numberSort,
                            },
                            // {headerName: "Sales Growth %",
                            //     field: "sales_array_growth",
                            //     filter: 'agNumberColumnFilter',
                            //     cellRenderer: 'sparkBar',
                            //     hide: true,
                            //     suppressMenu: true,
                            // },
                            // // {headerName: "Sales (last Quarter ∆%)",
                            // //     floatingFilter: true,
                            // //     field: "sales_array_growth",
                            // //     floatingFilterComponent: 'filterSalesPct',
                            // //     floatingFilterComponentParams: {
                            // //         suppressFilterButton: true,
                            // //     },
                            // //     filter: 'agNumberColumnFilter',
                            // //     cellRenderer: 'sparkBar',
                            // //     filterParams: {
                            // //         filterOptions: [
                            // //             {
                            // //                 displayKey: 'lessThanWithNulls',
                            // //                 displayName: 'Less Than with Nulls',
                            // //                 test: function(filterValue, cellValue) {
                            // //                     return cellValue !== undefined && cellValue[cellValue.length-1] < filterValue;
                            // //                 },
                            // //                 hideFilterInput: false,
                            // //             },
                            // //             {
                            // //                 displayKey: 'greaterThanWithNulls',
                            // //                 displayName: 'Greater Than with Nulls',
                            // //                 test: function(filterValue, cellValue) {
                            // //                     return cellValue !== undefined && cellValue[cellValue.length-1] > filterValue;
                            // //                 },
                            // //                 hideFilterInput: false,
                            // //             }
                            // //         ]
                            // //     },
                            // //     hide: true,
                            // //     suppressMenu: true,
                            // // },
                            // {headerName: "Gross Profit", 
                            //     field: "gp_q_array", 
                            //     cellRenderer: 'sparkBar',
                            //     hide: true, 
                            //     suppressMenu: true,
                            //     type: "numericColumn",
                            //     filter: 'filterGP',
                            //     floatingFilter: true,
                            //     floatingFilterComponent: FilterGPComp,
                            //     minWidth: 230,
                            //     comparator: numberSort,
                            // },
                            // {headerName: "Gross Profit Growth %", 
                            //     field: "sales_gross_growth", 
                            //     hide: true, 
                            //     suppressMenu: true,
                            //     cellRenderer: 'sparkBar',
                            // },
                            // {headerName: "Gross Margin %", 
                            //     field: "gross_margin", 
                            //     hide: true, 
                            //     suppressMenu: true,
                            //     cellRenderer: 'sparkBar',
                            // },
                            // {headerName: "Gross Margin Growth %", 
                            //     field: "gross_margin_growth", 
                            //     hide: true, 
                            //     suppressMenu: true,
                            //     cellRenderer: 'sparkBar',
                            // },
                            // {headerName: "COGS", 
                            //     field: "cogs", 
                            //     hide: true, 
                            //     suppressMenu: true,
                            //     cellRenderer: 'sparkBar',
                            // },
                            // {headerName: "Pre-Tax Profit", 
                            //     field: "ptp_q_array", 
                            //     hide: true, 
                            //     suppressMenu: true,
                            //     cellRenderer: 'sparkBar',
                            //     type: "numericColumn",
                            //     filter: 'filterPTP',
                            //     floatingFilter: true,
                            //     floatingFilterComponent: FilterPTPComp,
                            //     minWidth: 230,
                            //     comparator: numberSort,
                            // },
                            {headerName: "EBITDA", 
                                field: "ebitda_q_array", 
                                // hide: true, 
                                suppressMenu: true,
                                cellRenderer: 'sparkBar',
                                type: "numericColumn",
                                filter: 'filterEbitda',
                                floatingFilter: true,
                                floatingFilterComponent: FilterEbitdaComp,
                                minWidth: 230,
                                comparator: numberSort,
                            },
                            // {headerName: "EBITDA Growth %", 
                            //     field: "ebitda_growth", 
                            //     hide: true, 
                            //     suppressMenu: true,
                            //     cellRenderer: 'sparkBar',
                            // },
                            // {headerName: "EBITDA Margin %", 
                            //     field: "ebitda", 
                            //     hide: true, 
                            //     suppressMenu: true,
                            //     cellRenderer: 'sparkBar',
                            // },
                            // {headerName: "EBITDA Margin Growth %", 
                            //     field: "ebitda_margin_growth", 
                            //     hide: true, 
                            //     suppressMenu: true,
                            //     cellRenderer: 'sparkBar',
                            // },
                            // {headerName: "EBIT", 
                            //     field: "ebit_q_array", 
                            //     hide: true, 
                            //     suppressMenu: true,
                            //     cellRenderer: 'sparkBar',
                            //     type: "numericColumn",
                            //     filter: 'filterEbit',
                            //     floatingFilter: true,
                            //     floatingFilterComponent: FilterEbitComp,
                            //     minWidth: 230,
                            //     comparator: numberSort,
                            // },
                            // {headerName: "EBIT Growth %",
                            //     field: "ebit_growth", 
                            //     hide: true, 
                            //     suppressMenu: true,
                            //     cellRenderer: 'sparkBar',
                            // },
                            // {headerName: "EBIT Margin %", 
                            //     field: "ebit_margin", 
                            //     hide: true, 
                            //     suppressMenu: true,
                            //     cellRenderer: 'sparkBar',
                            // },
                            // {headerName: "EBIT Margin Growth %", 
                            //     field: "ebit_margin_growth", 
                            //     hide: true, 
                            //     suppressMenu: true,
                            //     cellRenderer: 'sparkBar',
                            // },
                            // {headerName: "Profit", 
                            //     field: "np_q_array", 
                            //     hide: true, 
                            //     suppressMenu: true,
                            //     cellRenderer: 'sparkBar',
                            //     type: "numericColumn",
                            //     filter: 'filterNP',
                            //     floatingFilter: true,
                            //     floatingFilterComponent: FilterNPComp,
                            //     minWidth: 230,
                            //     comparator: numberSort,
                            // },
                            // {headerName: "Profit Growth %", 
                            //     field: "profit_data_growth", 
                            //     hide: true, 
                            //     suppressMenu: true,
                            //     cellRenderer: 'sparkBar',
                            // },
                            // {headerName: "Profit Margin %", 
                            //     field: "profit_margin_array", 
                            //     hide: true, 
                            //     suppressMenu: true,
                            //     cellRenderer: 'sparkBar',
                            // },
                            // {headerName: "Profit Margin Growth %", 
                            //     field: "profit_margin_growth", 
                            //     hide: true, 
                            //     suppressMenu: true,
                            //     cellRenderer: 'sparkBar',
                            // },
                        ]},
                    // {headerName: "Balance Sheet",
                    //     children: [
                    //         {headerName: "Intangable Assets", field: 
                    //             "intangibleasset", 
                    //             hide: true, 
                    //             suppressMenu: true,
                    //             cellRenderer: 'sparkBar',
                    //         },
                    //         {headerName: "Material Assets", 
                    //             field: "fixedasset", 
                    //             hide: true, 
                    //             suppressMenu: true,
                    //             cellRenderer: 'sparkBar',
                    //         },
                    //         {headerName: "Financial Assets", 
                    //             field: "financialasset", 
                    //             hide: true, 
                    //             suppressMenu: true,
                    //             cellRenderer: 'sparkBar',
                    //         },
                    //         {headerName: "Tangible Assets", 
                    //             field: "noncurrentasset", 
                    //             hide: true, 
                    //             suppressMenu: true,
                    //             cellRenderer: 'sparkBar',
                    //         },
                    //         {headerName: "Current Asset", 
                    //             field: "currentAssets", 
                    //             hide: true, 
                    //             suppressMenu: true,
                    //             cellRenderer: 'sparkBar',
                    //         },
                    //         {headerName: "Cash", 
                    //             field: "cce", 
                    //             hide: true, 
                    //             suppressMenu: true,
                    //             cellRenderer: 'sparkBar',
                    //         },
                    //         {headerName: "Total Assets", 
                    //             field: "totalassets", 
                    //             hide: true, 
                    //             suppressMenu: true,
                    //             cellRenderer: 'sparkBar',
                    //         },
                    //         {headerName: "Total Equity", 
                    //             field: "shequity", 
                    //             hide: true, 
                    //             suppressMenu: true,
                    //             cellRenderer: 'sparkBar',
                    //         },
                    //         {headerName: "Long Term Debt", 
                    //             field: "ltliabilities", 
                    //             hide: true, 
                    //             suppressMenu: true,
                    //             cellRenderer: 'sparkBar',
                    //         },
                    //         {headerName: "Short Term Debt", 
                    //             field: "curliabilities", 
                    //             hide: true, 
                    //             suppressMenu: true,
                    //             cellRenderer: 'sparkBar',
                    //         },
                    //         {headerName: "Total Debt", 
                    //             field: "totalDebt_array", 
                    //             hide: true, 
                    //             suppressMenu: true,
                    //             cellRenderer: 'sparkBar',
                    //         },
                    //         {headerName: "Total Equity & Liabillities", 
                    //             field: "totalEquity_array", 
                    //             hide: true, 
                    //             suppressMenu: true,
                    //             cellRenderer: 'sparkBar',
                    //         },
                    //     ]
                    // },
                    // {headerName: "Ratio",
                    //     children: [
                    //         {headerName: "EPS", 
                    //             field: "eps", 
                    //             hide: true, 
                    //             suppressMenu: true,
                    //             cellRenderer: 'sparkBar',
                    //         },
                    //         {headerName: "Sales Per Share", 
                    //             field: "sales_per_share", 
                    //             hide: true, 
                    //             suppressMenu: true,
                    //             cellRenderer: 'sparkBar',
                    //         },
                    //         {headerName: "Dividend", field: "", hide: true, suppressMenu: true },
                    //         {headerName: "Dividend Yield %", field: "", hide: true, suppressMenu: true },
                    //         {headerName: "Dividend Payout", field: "", hide: true, suppressMenu: true },
                    //         {headerName: "Number of stocks", 
                    //             field: "totalnumberofshares", 
                    //             hide: true, 
                    //             suppressMenu: true,
                    //             cellRenderer: 'sparkBar',
                    //         },
                    //         {headerName: "Number of stocks growth %", 
                    //             field: "totalnumberofshares_growth", 
                    //             hide: true, 
                    //             suppressMenu: true,
                    //             cellRenderer: 'sparkBar',
                    //         },
                    //         {headerName: "ROE %", 
                    //             field: "roe", 
                    //             hide: true, 
                    //             suppressMenu: true,
                    //             cellRenderer: 'sparkBar',
                    //         },
                    //         {headerName: "ROA %", 
                    //             field: "roa", 
                    //             hide: true, 
                    //             suppressMenu: true,
                    //             cellRenderer: 'sparkBar',
                    //         },
                    //         {headerName: "Net debt", 
                    //             field: "netDebt", 
                    //             hide: true, 
                    //             suppressMenu: true,
                    //             cellRenderer: 'sparkBar',
                    //         },
                    //         {headerName: "Solidity",
                    //             // valueGetter: getSolidity,
                    //             field: "solidity",
                    //             type: "numericColumn",
                    //             minWidth: 230,
                    //             floatingFilter: true,
                    //             filter: 'filterSolidity',
                    //             floatingFilterComponent: FilterSolidityComp,
                    //             // floatingFilterComponentParams: {
                    //             //     suppressFilterButton: true,
                    //             // },
                    //             suppressMenu: true,
                    //             cellRenderer: 'sparkBar',
                    //             hide: true,
                    //             // comparator: numberSort
                    //         },
                    //         // {headerName: "Return on equity %",
                    //         //     field: "equity",
                    //         //     // valueGetter: getEquityPercent,
                    //         //     type: "numericColumn",
                    //         //     minWidth: 230,
                    //         //     floatingFilter: true,
                    //         //     filter: 'agNumberColumnFilter',
                    //         //     floatingFilterComponent: 'filterEquity',
                    //         //     floatingFilterComponentParams: {
                    //         //         suppressFilterButton: true,
                    //         //     },
                    //         //     hide: true,
                    //         //     suppressMenu: true,
                    //         // },
                    //         // {headerName: "Return on assets %",
                    //         //     field: "asset",
                    //         //     // valueGetter: getAssetsPercent,
                    //         //     type: "numericColumn",
                    //         //     minWidth: 230,
                    //         //     floatingFilter: true,
                    //         //     filter: 'agNumberColumnFilter',
                    //         //     floatingFilterComponent: 'filterAsset',
                    //         //     floatingFilterComponentParams: {
                    //         //         suppressFilterButton: true,
                    //         //     },
                    //         //     hide: true,
                    //         //     suppressMenu: true,
                    //         // },
                    //         // {headerName: "Net debt",
                    //         //     // field: "ltliabiliites + curliabilities - cce",
                    //         //     // type: "numericColumn",
                    //         //     // minWidth: 230,
                    //         //     field: "netDebt_array",
                    //         //     filter: 'filterDebt',
                    //         //     cellRenderer: 'sparkDebt',
                    //         //     floatingFilter: true,
                    //         //     floatingFilterComponent: FilterNetDebt,
                    //         //     suppressMenu: true,
                    //         //     hide: true
                    //         // },
                    //     ]},
                    
                    // {headerName: "Profitability",
                    //     children: [
                    //         {headerName: "Profit Margin",
                    //             // cellRenderer: function(params) {
                    //             //     return params.data.profit +'/'+ params.data.sales;
                    //             // },
                    //             field: "profit_margin",
                    //             type: "numericColumn",
                    //             filter: 'agNumberColumnFilter',
                    //             floatingFilter: true,
                    //             floatingFilterComponent: 'filterProfitPct',
                    //             floatingFilterComponentParams: {
                    //                 suppressFilterButton: true,
                    //             },
                    //             hide: true,
                    //             suppressMenu: true,
                    //         },
                    //         {headerName: "EBIT %",
                    //             field: "ebit_pct",
                    //             hide: true,
                    //             suppressMenu: true,
                    //         },
                    //         {headerName: "EBITDA %",
                    //             field: "ebitda_pct",
                    //             hide: true ,
                    //             suppressMenu: true,
                    //         },
                    //         {headerName: "Gross Margin",
                    //             field: "gross_margin",
                    //             hide: true,
                    //             suppressMenu: true,
                    //         },
                    //     ]},
                    
                    
                    {headerName: "",
                        // type: "numericColumn",
                        width: 130,
                        field: 'addColumn',
                        floatingFilter: true,
                        filter: 'addColumnBtn',
                        floatingFilterComponent: 'addColumnBtn',
                        floatingFilterComponentParams: {
                            suppressFilterButton: true,
                        },
                        lockVisible: true,
                        pinned: "right",
                        suppressMenu: true,
                        suppressMovable: true,
                        suppressSorting : true,
                        cellStyle: {'background-color': '#FFFFFF'},
                        rowSpan: function(params) {
                            return 1;
                        },
                        cellClassRules: { 'show-cell': 'value === undefined' },
                        cellRenderer: function(params) {
                            // if (params.node.childIndex == 5)
                            //     return `<span class="add-column custom-menu-button"/>Add Columns `;
                            // return null;
                        },
                        menuTabs : ['columnsMenuTab'],
                    },
                ],
                selectedSectorsList: [],
                sectorLists: [],
                open: [1, 2],
                search: null,
                caseSensitive: false,
                chosenStocks: null,
            };
        },
        methods: {
            setFilter() {
                console.log('parent model setfilter ==============')
                if (!this.mounted_once) {
                    this.mounted_once = true;
                    if (this.filters && this.filters.filter) {
                        this.gridApi.setFilterModel(JSON.parse(this.filters.filter));
                    } else {
                        this.gridApi.setFilterModel(null);
                    }
                }
            },


            click_saveBtn() {
                if (this.filters.name == 'No name Screener, not saved') {
                    this.$store.commit("setMessage", {text: 'Set the Screener name', type: 'error'});
                } else {
                    let columns = this.gridOptions.columnApi.getColumnState()
                    let activeColumns = []
                    columns.forEach(element => {
                        if (!element.hide) {
                            let colDef = this.gridOptions.columnApi.getColumn(element.colId)
                            let header_name = colDef.colDef.headerName
                            activeColumns.push(header_name)
                        }
                    });
                    // this.gridOptions.api.setColumnDefs(columnDefs);
                    // this.gridOptions.api.refreshCells({ force: true });
                    // window.mouseOverBind();
                    
                    let filter = this.gridApi.getFilterModel();   // get filtersModel from the default filter
                    filter.columns = activeColumns;   // save active columns into DB
                    filter.exchange = exchange_filter;  // add exchange filter
                    filter.market_cap = market_cap_filter;   // add market_cap filter
                    filter.last_report_date = last_report_date_filter;
                    filter.next_report_date = next_report_date_filter;
                    filter.enterprise = enterprise_filter;   // add enterprise filter
                    filter.evebit = ev_ebit_filter;
                    filter.evebitda = ev_ebitda_filter;
                    filter.pb = pb_filter;
                    filter.pe = pe_filter;
                    filter.ps = ps_filter;
                    filter.sales = sales_filter;
                    filter.gp = gp_filter;
                    filter.ptp = ptp_filter;
                    filter.ebitda = ebitda_filter;
                    filter.ebit = ebit_filter;
                    filter.np = np_filter;
                    filter.sector_name = sector_filter;

                        
                    if (this.$store.getters['screenerFilters'].find(item => item.name == this.filters.name)) {   // update sub-screener
                        let screen_id = this.$store.getters['screenerFilters'].find(item => item.name == this.filters.name).screen_id
                        
                        const payload = {
                            user_id: JSON.parse(localStorage.user).user_id,
                            name: this.filters.name,
                            filter: JSON.stringify(filter),
                            screen_id: screen_id
                        };
                        store.commit('updateScreenerFilters', payload);
                        ApiService.updateUserScreenerFilters(payload)
                            .then(res => {})
                    } else {    // save new screener
                        const payload = {
                            user_id: JSON.parse(localStorage.user).user_id,
                            name: this.filters.name,
                            filter: JSON.stringify(filter),
                        }
                        const that = this;
                        ApiService.saveUserScreenerFilters(payload).then(res=> {
                            that.$store.commit("addScreenerFilters" , {name: res.data.name , filter: JSON.parse(res.data.filter) , screen_id: res.data.screen_id});
                            that.screener = {
                                name: res.data.name,
                                filter: JSON.parse(res.data.filter),
                                screen_id: res.data.screen_id
                            };
                            this.$router.push({name: 'landing-page.screener-detail', params: {id: this.screener.screen_id}});
                        });
                    }
                }                
            },

            // Solidity
            setFilterSolidity_q_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef, index)  {
                    if (colDef.headerName == 'Ratio') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Solidity') {
                                element.field = 'solidity_q_latest'
                                element.cellRenderer = undefined
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterSolidity_q_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Ratio') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Solidity') {
                                element.field = "solidity";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterSolidity_y_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Ratio') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Solidity') {
                                element.field = "solidity_y_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterSolidity_y_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Ratio') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Solidity') {
                                element.field = "solidity_y_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterSolidity_t_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Ratio') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Solidity') {
                                element.field = "solidity_t_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterSolidity_t_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Ratio') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Solidity') {
                                element.field = "solidity_t_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },



            // Enterprise Value
            setFilterEnterprise_q_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef, index)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Enterprise Value') {
                                element.field = 'enterprise_q_latest'
                                element.cellRenderer = undefined
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterEnterprise_q_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Enterprise Value') {
                                element.field = "enterprise_q_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterEnterprise_y_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Enterprise Value') {
                                element.field = "enterprise_y_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterEnterprise_y_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Enterprise Value') {
                                element.field = "enterprise_y_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterEnterprise_t_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Enterprise Value') {
                                element.field = "enterprise_t_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterEnterprise_t_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Enterprise Value') {
                                element.field = "enterprise_t_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },





            // EV/EBIT Value
            setFilterev_ebit_q_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef, index)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EV/EBIT') {
                                element.field = 'ev_ebit_q_latest'
                                element.cellRenderer = undefined
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterev_ebit_q_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EV/EBIT') {
                                element.field = "ev_ebit_q_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterev_ebit_y_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EV/EBIT') {
                                element.field = "ev_ebit_y_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterev_ebit_y_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EV/EBIT') {
                                element.field = "ev_ebit_y_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterev_ebit_t_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EV/EBIT') {
                                element.field = "ev_ebit_t_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterev_ebit_t_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EV/EBIT') {
                                element.field = "ev_ebit_t_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },





            // EV/EBITDA Value
            setFilterev_ebitda_q_latest() {

                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef, index)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EV/EBITDA') {
                                element.field = 'ev_ebitda_q_latest'
                                element.cellRenderer = undefined
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterev_ebitda_q_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EV/EBITDA') {
                                element.field = "ev_ebitda_q_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterev_ebitda_y_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EV/EBITDA') {
                                element.field = "ev_ebitda_y_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterev_ebitda_y_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EV/EBITDA') {
                                element.field = "ev_ebitda_y_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterev_ebitda_t_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EV/EBITDA') {
                                element.field = "ev_ebitda_t_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterev_ebitda_t_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EV/EBITDA') {
                                element.field = "ev_ebitda_t_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },





            // P/B Value
            setFilterpb_q_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef, index)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'P/B') {
                                element.field = 'pb_q_latest'
                                element.cellRenderer = undefined
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterpb_q_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'P/B') {
                                element.field = "pb_q_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterpb_y_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'P/B') {
                                element.field = "pb_y_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterpb_y_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'P/B') {
                                element.field = "pb_y_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterpb_t_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'P/B') {
                                element.field = "pb_t_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterpb_t_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'P/B') {
                                element.field = "pb_t_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },





            // P/E Value
            setFilterpe_q_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef, index)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'P/E') {
                                element.field = 'pe_q_latest'
                                element.cellRenderer = undefined
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterpe_q_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'P/E') {
                                element.field = "pe_q_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterpe_y_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'P/E') {
                                element.field = "pe_y_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterpe_y_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'P/E') {
                                element.field = "pe_y_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterpe_t_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'P/E') {
                                element.field = "pe_t_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterpe_t_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'P/E') {
                                element.field = "pe_t_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },






            // P/S Value
            setFilterps_q_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef, index)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'P/S') {
                                element.field = 'ps_q_latest'
                                element.cellRenderer = undefined
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterps_q_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'P/S') {
                                element.field = "ps_q_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterps_y_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'P/S') {
                                element.field = "ps_y_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterps_y_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'P/S') {
                                element.field = "ps_y_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterps_t_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'P/S') {
                                element.field = "ps_t_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterps_t_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Valuation') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'P/S') {
                                element.field = "ps_t_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },




            
            // Sales
            setFiltersales_q_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef, index)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Sales') {
                                element.field = 'sales_q_latest'
                                element.cellRenderer = undefined
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFiltersales_q_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Sales') {
                                element.field = "sales_q_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFiltersales_y_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Sales') {
                                element.field = "sales_y_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFiltersales_y_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Sales') {
                                element.field = "sales_y_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFiltersales_t_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Sales') {
                                element.field = "sales_t_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFiltersales_t_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Sales') {
                                element.field = "sales_t_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },








            // Pre-tax Profit
            setFilterptp_q_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef, index)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Pre-Tax Profit') {
                                element.field = 'ptp_q_latest'
                                element.cellRenderer = undefined
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterptp_q_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Pre-Tax Profit') {
                                element.field = "ptp_q_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterptp_y_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Pre-Tax Profit') {
                                element.field = "ptp_y_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterptp_y_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Pre-Tax Profit') {
                                element.field = "ptp_y_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterptp_t_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Pre-Tax Profit') {
                                element.field = "ptp_t_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterptp_t_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Pre-Tax Profit') {
                                element.field = "ptp_t_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },







            // Ebitda
            setFilterebitda_q_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef, index)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EBITDA') {
                                element.field = 'ebitda_q_latest'
                                element.cellRenderer = undefined
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterebitda_q_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EBITDA') {
                                element.field = "ebitda_q_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterebitda_y_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EBITDA') {
                                element.field = "ebitda_y_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterebitda_y_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EBITDA') {
                                element.field = "ebitda_y_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterebitda_t_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EBITDA') {
                                element.field = "ebitda_t_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterebitda_t_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EBITDA') {
                                element.field = "ebitda_t_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },








            // Ebit
            setFilterebit_q_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef, index)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EBIT') {
                                element.field = 'ebit_q_latest'
                                element.cellRenderer = undefined
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterebit_q_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EBIT') {
                                element.field = "ebit_q_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterebit_y_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EBIT') {
                                element.field = "ebit_y_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterebit_y_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EBIT') {
                                element.field = "ebit_y_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterebit_t_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EBIT') {
                                element.field = "ebit_t_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilterebit_t_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'EBIT') {
                                element.field = "ebit_t_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },








            // Profit
            setFilternp_q_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef, index)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Profit') {
                                element.field = 'np_q_latest'
                                element.cellRenderer = undefined
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilternp_q_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Profit') {
                                element.field = "np_q_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilternp_y_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Profit') {
                                element.field = "np_y_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilternp_y_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Profit') {
                                element.field = "np_y_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilternp_t_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Profit') {
                                element.field = "np_t_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFilternp_t_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Profit') {
                                element.field = "np_t_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },







            // Gross Profit
            setFiltergp_q_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef, index)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Gross Profit') {
                                element.field = 'gp_q_latest'
                                element.cellRenderer = undefined
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFiltergp_q_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Gross Profit') {
                                element.field = "gp_q_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFiltergp_y_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Gross Profit') {
                                element.field = "gp_y_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFiltergp_y_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Gross Profit') {
                                element.field = "gp_y_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFiltergp_t_latest() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Gross Profit') {
                                element.field = "gp_t_latest";
                                element.cellRenderer = undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },
            setFiltergp_t_chart() {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == 'Income Statement') {
                        colDef.children.forEach(element => {
                            if (element.headerName == 'Gross Profit') {
                                element.field = "gp_t_array";
                                element.cellRenderer = 'sparkBar';
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs)
            },




            updateColDefs(columnDefs) {
                this.gridOptions.api.setColumnDefs(columnDefs);
                this.gridOptions.api.refreshCells({ force: true });
                window.mouseOverBind();
            },
            
            newWatchlist() {
                let selectedNodes = this.gridApi.getSelectedNodes();
                let selectedData = selectedNodes.map(node => node.data);
                const that = this;
                ApiStocks.insertWatchlist({name: this.newWatchlistName, user_id: JSON.parse(localStorage.getItem('user')).user_id}).then((res) => {
                    that.$store.commit('addWatchlist' , res.data );
                    selectedData.map(item=> {
                        that.saveWatchListItem(item,res.data.watchlist_id)
                    });
                    that.confDlg = false;
                    that.dialog = false;
                    this.gridApi.deselectAll();
                })
            },

            doSomeAction(ticker) {
                let stock = this.$store.getters["getAllStocks"].find(s=> s.ticker === ticker);
                this.$router.push({name: 'landing-page.stock-detail', params: {stock_id: stock.stock_id}});
            },

            selectChanged() {
                const chosenStocks = this.gridApi.getSelectedNodes().map((item) => item.data);
                this.addSelected = !this.gridApi.getSelectedNodes().length;
                this.chosenStocks = chosenStocks;
            },
            screenerInput(val) {
            },
            copyFilter(filter) {
                this.screener = filter.name + " copy (unsaved)";
                this.gridApi.setFilterModel(filter.filter);
            },

            getDateString() {
                const date = new Date();
                var mm = date.getMonth() + 1; // getMonth() is zero-based
                var dd = date.getDate();
                // return [date.getFullYear(),
                //         (mm>9 ? '' : '0') + mm,
                //         (dd>9 ? '' : '0') + dd
                //     ].join('');
                return `${date.getFullYear()}-${(mm>9 ? '' : '0') + mm}-${(dd>9 ? '' : '0') + dd} ${date.getHours()}:${date.getSeconds()}`
            },

            saveFilter(e) {
                if (e.target.classList.contains('isDisabled')) {
                    return;
                }

                if (this.screener.screen_id === undefined) {
                    this.filterSave();
                } else {
                    this.filterUpdate();
                }
                this.$store.commit("setMessage", {text: 'Screener Saved', type: 'success'});
            },

            saveNewFilter(name) {
                this.screener = name;
                this.filterSave();
            },

            filterUpdate() {

            },
            filterSave() {
                // this.$store.commit("setMessage", {text: 'Screener Saved', type: 'error'});

                let filter = this.gridApi.getFilterModel();
                let name = this.screener || `Untitled ${this.getDateString()}`;
                name = name.replace("(unsaved)" , "");
                // this.screener = {name: name , filter: filter}
                // this.filterName = ""
                const payload = {
                    user_id: JSON.parse(localStorage.user).user_id,
                    name: name,
                    filter: JSON.stringify(filter),
                }
                const that = this;
                ApiService.saveUserScreenerFilters(payload).then(res=> {
                    that.$store.commit("addScreenerFilters" , {name: res.data.name , filter: JSON.parse(res.data.filter) , screen_id: res.data.screen_id});
                    that.screener = {
                        name: res.data.name,
                        filter: JSON.parse(res.data.filter),
                        screen_id: res.data.screen_id
                    };
                    this.$router.push({name: 'landing-page.screener-detail', params: {id: this.screener.screen_id}});
                });

                // this.newScreenerDiag = false
            },

            saveWatchListItem(data , watchlist_id) {
                const that = this
                const payload = {
                    watchlist_id: watchlist_id,
                    user_id: JSON.parse(localStorage.user).user_id,
                    company_id: data.company_id,
                    insref: data.insref,
                    ticker: data.ticker,
                    isin: data.isin,
                    name: data.name,
                    conviction: 0,
                    watched_since: new Date().toISOString().substring(0, 10),
                    watched_since_price: data.price_today
                };

                ApiStocks.insertWatchlistItem(payload)
                    .then(response => {
                        that.$store.commit("addWatchlistItem", response.data);
                    })
            },

            onFirstDataRendered() {
                /////////// this is for "add columns" button in cell
                // const that = this
                // const button = window.document.querySelector('.add-column')
                // window.document.querySelector('.add-column').onclick = function(evt){
                //     that.gridApi.showColumnMenuAfterButtonClick('addColumn', button)
                // }
                //// change filter icon
                // const spanList = window.document.querySelectorAll('.ag-floating-filter-button span.ag-icon')
                // spanList[2].classList.remove("ag-icon-filter")
                // spanList[2].classList.add("ag-icon-grip")
                // spanList[3].classList.remove("ag-icon-filter")
                // spanList[3].classList.add("ag-icon-grip")
            },

            onFilterChanged(){
                // let filt = this.gridApi.getFilterModel();
                // if (this.filters.screen_id) {
                //     if (this.filters.filter == JSON.stringify(filt)) {
                //         window.changeSaveButtonColor(false, this.filters);
                //     } else {
                //         window.changeSaveButtonColor(true, this.filters);
                //     }
                // } else {
                //     window.changeSaveButtonColor(true, this.filters);
                // }

                this.onFirstDataRendered();

            },

            onSortChanged(){
                this.onFirstDataRendered();
            },

            renameScreener(name) {
                this.is_nameEditor = false;
                
                if (this.$store.getters['screenerFilters'].find(item => item.name == this.filters.name)) {
                    let screen_id = this.$store.getters['screenerFilters'].find(item => item.name == this.filters.name).screen_id
                    let screen_index = this.$store.getters['screenerFilters'].findIndex((s) => s.name == this.filters.name);
                    ApiService.updateScreenFilters({
                            name: name,
                            screen_id: screen_id,
                        }).then((res) => {
                            let data = {
                                name: name,
                                index : screen_index
                            };
                            this.$store.commit('renameScreenerFilters' , data );
                        });
                } else {
                    if (name) {
                        this.filters.name = name
                    }
                }
            },

            navigateScreener(index) {
                let screeners = this.$store.getters['screenerFilters'];
                let length = screeners.length;
                if (length == 0) {
                    this.saveNewFilter(this.$t('My_First_Screener'));
                } else {
                    let screener = screeners[index === length ? index - 1 : index];
                    this.$router.push({name: 'landing-page.screener-detail', params: {id: screener.screen_id}});
                }
            },

            newScreener() {
                this.gridApi.setFilterModel(null)
            },
            updateColumns(columns) {
                console.log('!!!!!!!!!!!!!!!!!!!!!!', columns)
                var cols = this.gridOptions.columnApi.columnController.columnDefs
                cols.forEach(function(colDef)  {
                    if (colDef.children) {
                        colDef.children.forEach(element => {
                            element.hide = true
                            if (columns.includes(element.headerName)) {
                                element.hide = false
                            }
                        });
                    }
                });
                
                this.refreshColumns(cols)
            },
            refreshColumns(cols) {
                console.log('!@!!!@@@@@@@@@@!!!!!!!!!', cols[1])
                var test = [
                    {headerName: "",
                        children: [
                            {
                                headerName: "",
                                width: 40,
                                cellStyle: {'background-color': '#FFFFFF'},
                                checkboxSelection: true,
                                pinned: "left",
                                lockVisible: true,
                                suppressMovable: true,
                                suppressSizeToFit: true,
                                floatingFilter: true,
                                // floatingFilterComponent: FilterSaveComp,
                                filter: 'saveBtn',
                                floatingFilterComponentParams: {
                                    suppressFilterButton: true,
                                },
                            }
                        ]
                    },
                    {headerName: "Info",
                        children: [
                            {headerName: "Ticker",
                                field: "ticker",
                                width: 90,
                                floatingFilter: true,
                                // cellRenderer: function(params) {
                                //     return '<span class="ticker" style="line-height: 17px" (@click)="clickTicker">' + params.value + '</span>';
                                // },
                                cellRenderer: 'screenerTicker',
                                cellRendererParams: {
                                    action : this.doSomeAction.bind(this),
                                },
                                suppressMenu: true,
                                filter: 'agTextColumnFilter',
                                floatingFilterComponentParams: {
                                    suppressFilterButton: true,
                                },
                                lockVisible: true,
                            },
                            {headerName: "Name",
                                field: "name",
                                filter: 'agTextColumnFilter',
                                floatingFilterComponentParams: {
                                    suppressFilterButton: true,
                                },
                                suppressMovable: true,
                                suppressMenu: true,
                                hide: false
                            },
                            {headerName: "Exchange",
                                field: "exchange",
                                filter: 'filterExchanges',
                                floatingFilter: true,
                                cellRenderer: function(params) {
                                    let isoCountryCode = params.data.country||'none';
                                    return `<img src="/images/flag_${isoCountryCode}.png" style="width:28px; height:;16px"/> ${params.value} `;
                                },
                                floatingFilterComponent: FilterExchangeComp,
                                suppressMenu: true,
                                // hide: true
                                // lockVisible: true,
                                // headerComponentParams: { template: '<i class="fa fa-star"></i>' },
                            },
                        ]
                    },
                    {headerName: "",
                        // type: "numericColumn",
                        width: 130,
                        field: 'addColumn',
                        floatingFilter: true,
                        filter: 'addColumnBtn',
                        floatingFilterComponent: 'addColumnBtn',
                        floatingFilterComponentParams: {
                            suppressFilterButton: true,
                        },
                        lockVisible: true,
                        pinned: "right",
                        suppressMenu: true,
                        suppressMovable: true,
                        suppressSorting : true,
                        cellStyle: {'background-color': '#FFFFFF'},
                        rowSpan: function(params) {
                            return 1;
                        },
                        cellClassRules: { 'show-cell': 'value === undefined' },
                        cellRenderer: function(params) {
                            // if (params.node.childIndex == 5)
                            //     return `<span class="add-column custom-menu-button"/>Add Columns `;
                            // return null;
                        },
                        menuTabs : ['columnsMenuTab'],
                    },
                ];
                this.gridOptions.api.setColumnDefs(test);
                window.mouseOverBind();
            },

        },
        computed: {
            init_name: {
                get() {
                    return this.filters.name;
                },
                set(val) {
                    this.name = val;
                }
            },
            filters() {
                let screen_id = this.$route.params.id;
                console.log('********* computed filters ************', this.$store.getters.screenerFilters.find((item) => item.screen_id === screen_id))
                if (screen_id) {
                    // setTimeout(function(){ 
                    //     var filters = this.$store.getters.screenerFilters.find((item) => item.screen_id === screen_id)
                    //     if (JSON.parse(filters.filter).columns) {
                    //         this.updateColumns(JSON.parse(filters.filter).columns)
                    //     }
                    // }, 1000);
                    
                    return this.$store.getters.screenerFilters.find((item) => item.screen_id === screen_id);
                } else {
                    return {
                        name: "No name Screener, not saved"
                    };
                }
            },
            stocks() {
                return this.$store.getters.getMapStocks;
            },
            isLoaded() {
                // loading time for vuex is longer.
                return (this.$store.getters.getAllStocks.length === 0);
            },
            saveText() {
                if (this.screener.filter === undefined) {
                    return "Save";
                }
                return "Edit";
            },
            calcNewScreener() {
                return this.screener === "" || this.screener.screen_id !== undefined;

                // if(this.gridApi == null) return true
                // let filter = this.gridApi.getFilterModel()
                // let screener = this.screener.filter || {}
                // console.log(filter,screener.filter)
                // return filter == screener
            },
            // screeners() {
            //     return this.$store.getters["screenerFilters"];
            // },
            watchlists() {
                let items = [];
                this.$store.getters.getWatchlists.map(item => {
                    items.push(item.name);
                })
                return items;
            },
            watchlistItemsByCategory() {
                return watchlist_id => {
                    let temp_array = this.$store.getters.getWatchlistItems;
                    let items = temp_array.filter(
                        item => item.watchlist_id === watchlist_id
                    );
                    if (items === undefined) {
                        return [];
                    }
                    let temp = [];
                    items.map(item => {
                        if (temp.find(i => i.ticker === item.ticker) !== undefined) {
                            return;
                        }
                        temp.push(item);
                    });
                    return temp;
                };
            },
        },
        watch: {
            name() {
                this.final_name = this.name;
            },
            filters: function(newVal, oldVal) {
                console.log('********* watch filters ************')
                if (newVal.filter) {
                    this.gridApi.setFilterModel(JSON.parse(newVal.filter));
                    if (JSON.parse(newVal.filter).columns) {
                        this.updateColumns(JSON.parse(newVal.filter).columns)
                    }
                } else {
                    this.gridApi.setFilterModel(null);
                }
            },
            // screener(val) {
            //     if (val === '') {
            //         this.gridApi.setFilterModel(null);
            //     } else if (val.filter !== undefined) {
            //         this.gridApi.setFilterModel(val.filter);
            //     }
            // },
            newItem(val) {
                const that = this;
                let selectedNodes = this.gridApi.getSelectedNodes();
                let selectedData = selectedNodes.map(node => node.data);
                let existWatchList = this.$store.getters.getWatchlists.find(item=>item.name === this.watchlists[val]);
                if (this.watchlists[val]) {
                    let oldItems = this.watchlistItemsByCategory(existWatchList.watchlist_id);
                    selectedData = selectedData.filter(item=> !oldItems.find(olditem=>olditem.company_id === item.company_id));
                    selectedData.map(item=> {
                        that.saveWatchListItem(item,existWatchList.watchlist_id);
                    });
                    this.gridApi.deselectAll();
                }
            }
        }
    };

    window.rowSpan = function rowSpan(params) {
        return 4;
    };

    //// Save button
    // let screener_data;
    // let is_changed = false;
    // window.changeSaveButtonColor = function(bol, data) {
    //     screener_data = data;
    //     const button = window.document.querySelector(".filterSaveButton");
    //     if (bol) {
    //         button.classList.remove('display-none');
    //         button.classList.remove('no-filter');
    //         button.classList.add('apply-filter');
    //         is_changed = true;
    //     } else {
    //         button.classList.remove('display-none');
    //         button.classList.remove('apply-filter');
    //         button.classList.add('no-filter');
    //         is_changed = false;
    //     }

    // };
    // function FilterSaveComp() {
    // }

    // FilterSaveComp.prototype.init = function(params) {
    //     this.eGui = document.createElement('div');
    //     this.eGui.innerHTML =
    //         '<div class="filterSaveButton no-filter" style="padding: 5px 15px; border-radius: 5px; color: white;margin-top:15px">'+ 'Save'+
    //         '</div>';
    //     this.eGui.addEventListener('click', function(){
    //         if (is_changed) {
    //             if (screener_data.screen_id) {
    //                 let filter = params.api.getFilterModel();
    //                 const payload = {
    //                     user_id: JSON.parse(localStorage.user).user_id,
    //                     name: screener_data.name,
    //                     filter: JSON.stringify(filter),
    //                     screen_id: screener_data.screen_id
    //                 };
    //                 store.commit('updateScreenerFilters', payload);
    //                 ApiService.updateUserScreenerFilters(payload)
    //                     .then(res => {})
    //             } else {
    //                 let filter = params.api.getFilterModel();
    //                 let final_name = 'New ' + moment(new Date()).format('YYYY-MM-DD HH:mm');
    //                 const payload = {
    //                     user_id: JSON.parse(localStorage.user).user_id,
    //                     name: final_name,
    //                     filter: JSON.stringify(filter),
    //                 };
    //                 store.commit('updateScreenerFilters', payload);
    //                 ApiService.saveUserScreenerFilters(payload).then(res=> {
    //                     store.commit("addScreenerFilters" , {
    //                         name: res.data.name ,
    //                         filter: JSON.parse(res.data.filter),
    //                         screen_id: res.data.screen_id}
    //                         );
    //                 })
    //             }
    //         }
    //     })
    // };

    // FilterSaveComp.prototype.onParentModelChanged = function(params,aa) {
    // }

    // function filterChangedCallbackSave(params) {
    // }

    // FilterSaveComp.prototype.onRbChanged = function() {
    //     this.filterActive = this.rbSince2010.checked;
    //     this.filterChangedCallbackSave();
    // };

    // FilterSaveComp.prototype.getGui = function() {
    //     return this.eGui;
    // };

    // FilterSaveComp.prototype.doesFilterPass = function(params) {
    //     return params.data.year >= 2010;
    // };

    // FilterSaveComp.prototype.isFilterActive = function() {
    //     return this.filterActive;
    // };

    // // this example isn't using getModel() and setModel(),
    // // so safe to just leave these empty. don't do this in your code!!!
    // FilterSaveComp.prototype.getModel = function() {
    // };

    // FilterSaveComp.prototype.getModelAsString = function(model) {
    //     return model || '';
    // };

    // FilterSaveComp.prototype.setModel = function() {
    // };

    /// Exchange filter
    function FilterExchangeComp() {
    }

    FilterExchangeComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        // this.eGui.innerHTML =
        //     '<div>' +
        //     '  <v-range-slider /> Profit Margin LAST Q' +
        //     '</div>';
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> All Exchanges' +
            '</div>';
    };

    function setFilteredName(list, that) {
        let text_string;
        if (list['11']) text_string = "All Exchanges1";
        else if (!list['0']) text_string = "Null";
        else text_string = list['0'];
        that.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> ' + text_string +
            '</div>';
    }

    /**
     * exchange_filter is a variable for saving exchange filter into DB.
     * why did I use...if(aa.column.colId == 'exchange' && !aa.min)... ?
     * when I get the filtered model from the custom filter, console log is showed in every custom filters.
     * I didn't distinguish each filter via column.colId.
     * So that I had to explore every returned values.
     */
    var exchange_filter = []
    FilterExchangeComp.prototype.onParentModelChanged = function(params,aa) {
        if (aa && aa.column.colId == 'exchange' && !aa.min) {
            if (aa[0] && !aa[0].children) {
                exchange_filter = []
                for (var i=0; i<12; i++) {
                    if (aa[i]) {
                        exchange_filter.push(aa[i])
                    }
                }
                setFilteredName(aa, this);
            }
        }
    }

    function filterChangedCallback(params) {
    }

    FilterExchangeComp.prototype.onRbChanged = function() {
        this.filterActive = this.rbSince2010.checked;
        this.filterChangedCallback();
    };

    FilterExchangeComp.prototype.getGui = function() {
        return this.eGui;
    };

    FilterExchangeComp.prototype.doesFilterPass = function(params) {
        return params.data.year >= 2010;
    };

    FilterExchangeComp.prototype.isFilterActive = function() {
        return this.filterActive;
    };

    // this example isn't using getModel() and setModel(),
    // so safe to just leave these empty. don't do this in your code!!!
    FilterExchangeComp.prototype.getModel = function() {
    };

    FilterExchangeComp.prototype.getModelAsString = function(model) {
        return model || '';
    };

    FilterExchangeComp.prototype.setModel = function() {
    };


    /// Sector Filter
    var sector_filter = []
    function FilterSectorComp() {
    }

    FilterSectorComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> Aerospace, Asset Management & Custody, Precious Metals, Material Handling Equipment' +
            '</div>';
    };

    function setFilteredSectorName(list, that) {
        let text_string;
        if (list) {
            if (list['0']) {
                text_string = list['0'].name;
            } else {
                text_string = "Aerospace, Asset Management & Custody, Precious Metals, Material Handling Equipment";
            }
        } else {
            text_string = "Aerospace, Asset Management & Custody, Precious Metals, Material Handling Equipment";
        }
        that.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> ' + text_string +
            '</div>';
    }
    FilterSectorComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'sector_name') {
            if (value[0] && value[0].children) {
                sector_filter = []
                for (var i=0; i<76; i++) {
                    if (value[i]) {
                        sector_filter.push(value[i])
                    }
                }
            }
            setFilteredSectorName(value, this);
        }
        
    }
    FilterSectorComp.prototype.getGui = function() {
        return this.eGui;
    };

    FilterSectorComp.prototype.doesFilterPass = function(params) {
        return true;
    };

    FilterSectorComp.prototype.isFilterActive = function() {
        return this.filterActive;
    };
    FilterSectorComp.prototype.getModel = function() {
    };

    FilterSectorComp.prototype.getModelAsString = function(model) {
        return model || '';
    };

    FilterSectorComp.prototype.setModel = function() {
    };





    /// Last Report Date
    var last_report_date_filter = 'no filter';
    function FilterLastReportDateComp() {
    }

    FilterLastReportDateComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> no filter' +
            '</div>';
    };
    function setFilteredLastReportDateName(value, that) {
        let text_string = 'no filter';
        if (value) text_string = value
        that.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> ' + text_string +
            '</div>';
    }
    FilterLastReportDateComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'last_report_date' && value.last_report_date_filter) {
            last_report_date_filter = value.last_report_date_filter
            setFilteredLastReportDateName(value.last_report_date_filter, this)
        }
    }

    FilterLastReportDateComp.prototype.onRbChanged = function() {
        this.filterActive = this.rbSince2010.checked;
    };

    FilterLastReportDateComp.prototype.getGui = function() {
        return this.eGui;
    };

    FilterLastReportDateComp.prototype.doesFilterPass = function(params) {
        return params.data.year >= 2010;
    };

    FilterLastReportDateComp.prototype.isFilterActive = function() {
        return this.filterActive;
    };

    FilterLastReportDateComp.prototype.getModel = function() {
    };

    FilterLastReportDateComp.prototype.getModelAsString = function(model) {
        return model || '';
    };

    FilterLastReportDateComp.prototype.setModel = function() {
    };





    /// Next Report Date
    var next_report_date_filter = 'no filter';
    function FilterNextReportDateComp() {
    }

    FilterNextReportDateComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> no filter' +
            '</div>';
    };
    function setFilteredNextReportDateName(value, that) {
        let text_string = 'no filter';
        if (value) text_string = value
        that.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> ' + text_string +
            '</div>';
    }
    FilterNextReportDateComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'next_report_date' && value.next_report_date_filter) {
            next_report_date_filter = value.next_report_date_filter
            setFilteredNextReportDateName(value.next_report_date_filter, this)
        }
    }

    FilterNextReportDateComp.prototype.onRbChanged = function() {
        this.filterActive = this.rbSince2010.checked;
    };

    FilterNextReportDateComp.prototype.getGui = function() {
        return this.eGui;
    };

    FilterNextReportDateComp.prototype.doesFilterPass = function(params) {
        return params.data.year >= 2010;
    };

    FilterNextReportDateComp.prototype.isFilterActive = function() {
        return this.filterActive;
    };

    FilterNextReportDateComp.prototype.getModel = function() {
    };

    FilterNextReportDateComp.prototype.getModelAsString = function(model) {
        return model || '';
    };

    FilterNextReportDateComp.prototype.setModel = function() {
    };







    // Filter Market cap
    function FilterMarketCapComp() {
    }

    FilterMarketCapComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> Market Cap' +
            '</div>';
    };

    function setFilteredMarketCapName(min, max, that) {
        that.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> ' + min + ' to ' + max +
            '</div>';
    }
    
    // this variable is for saving filter of Market_cap
    /**
     * market_cap has max/min variables.
     */
    var market_cap_filter = {min:0, max:150000};
    FilterMarketCapComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'market_cap' && value.max) {
            market_cap_filter.min = value.min;
            market_cap_filter.max = value.max;
            setFilteredMarketCapName(value.min, value.max, this);
        }
    }

    FilterMarketCapComp.prototype.onRbChanged = function() {
        this.filterActive = this.rbSince2010.checked;
    };

    FilterMarketCapComp.prototype.getGui = function() {
        return this.eGui;
    };

    FilterMarketCapComp.prototype.doesFilterPass = function(params) {
        return params.data.year >= 2010;
    };

    FilterMarketCapComp.prototype.isFilterActive = function() { 
        return this.filterActive;
    };

    FilterMarketCapComp.prototype.getModel = function() {
    };

    FilterMarketCapComp.prototype.getModelAsString = function(model) {
        return model || '';
    };

    FilterMarketCapComp.prototype.getFilterModel = function(model) {
        return model;
    }

    FilterMarketCapComp.prototype.setModel = function() {
    };



    // Filter Solidity
    function FilterSolidityComp() {
    }

    FilterSolidityComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> Solidity' +
            '</div>';
    };

    FilterSolidityComp.prototype.onParentModelChanged = function(params, value) {
    }

    FilterSolidityComp.prototype.onRbChanged = function() {
        this.filterActive = this.rbSince2010.checked;
    };

    FilterSolidityComp.prototype.getGui = function() {
        return this.eGui;
    };

    FilterSolidityComp.prototype.doesFilterPass = function(params) {
        return params.data.year >= 2010;
    };

    FilterSolidityComp.prototype.isFilterActive = function() { 
        return this.filterActive;
    };

    FilterSolidityComp.prototype.getModel = function() {
    };

    FilterSolidityComp.prototype.getModelAsString = function(model) {
        return model || '';
    };

    FilterSolidityComp.prototype.getFilterModel = function(model) {
        return model;
    }

    FilterSolidityComp.prototype.setModel = function() {
    };




        // Filter EnterpriseValue
    var enterprise_filter = {min:-1000000000000, max: 1000000000000}
    function FilterEnterpriseValueComp() {
    }
    FilterEnterpriseValueComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> Enterprise Value' +
            '</div>';
    };
    FilterEnterpriseValueComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'enterprise_q_array' && value.enterprise_min) {
            enterprise_filter.min = value.enterprise_min
            enterprise_filter.max = value.enterprise_max
        }
    }
    FilterEnterpriseValueComp.prototype.onRbChanged = function() {
        this.filterActive = this.rbSince2010.checked;
    };
    FilterEnterpriseValueComp.prototype.getGui = function() {
        return this.eGui;
    };
    FilterEnterpriseValueComp.prototype.doesFilterPass = function(params) {
        return params.data.year >= 2010;
    };
    FilterEnterpriseValueComp.prototype.isFilterActive = function() { 
        return this.filterActive;
    };
    FilterEnterpriseValueComp.prototype.getModel = function() {
    };
    FilterEnterpriseValueComp.prototype.getModelAsString = function(model) {
        return model || '';
    };
    FilterEnterpriseValueComp.prototype.getFilterModel = function(model) {
        return model;
    }
    FilterEnterpriseValueComp.prototype.setModel = function() {
    };







            // Filter EV/EBIT
    var ev_ebit_filter = {min:-500, max: 300}
    function FilterEVEBITComp() {
    }
    FilterEVEBITComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> EV/EBIT' +
            '</div>';
    };
    FilterEVEBITComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ev_ebit_q_array' && value.ev_ebit_min) {
            ev_ebit_filter.min = value.ev_ebit_min
            ev_ebit_filter.max = value.ev_ebit_max
        }
    }
    FilterEVEBITComp.prototype.onRbChanged = function() {
        this.filterActive = this.rbSince2010.checked;
    };
    FilterEVEBITComp.prototype.getGui = function() {
        return this.eGui;
    };
    FilterEVEBITComp.prototype.doesFilterPass = function(params) {
        return params.data.year >= 2010;
    };
    FilterEVEBITComp.prototype.isFilterActive = function() { 
        return this.filterActive;
    };
    FilterEVEBITComp.prototype.getModel = function() {
    };
    FilterEVEBITComp.prototype.getModelAsString = function(model) {
        return model || '';
    };
    FilterEVEBITComp.prototype.getFilterModel = function(model) {
        return model;
    }
    FilterEVEBITComp.prototype.setModel = function() {
    };






                // Filter EV/EBITDA
    var ev_ebitda_filter = {min:-500, max: 300}
    function FilterEVEBITDAComp() {
    }
    FilterEVEBITDAComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> EV/EBITDA' +
            '</div>';
    };
    FilterEVEBITDAComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ev_ebitda_q_array' && value.ev_ebitda_min) {
            ev_ebitda_filter.min = value.ev_ebitda_min
            ev_ebitda_filter.max = value.ev_ebitda_max
        }
    }
    FilterEVEBITDAComp.prototype.onRbChanged = function() {
        this.filterActive = this.rbSince2010.checked;
    };
    FilterEVEBITDAComp.prototype.getGui = function() {
        return this.eGui;
    };
    FilterEVEBITDAComp.prototype.doesFilterPass = function(params) {
        return params.data.year >= 2010;
    };
    FilterEVEBITDAComp.prototype.isFilterActive = function() { 
        return this.filterActive;
    };
    FilterEVEBITDAComp.prototype.getModel = function() {
    };
    FilterEVEBITDAComp.prototype.getModelAsString = function(model) {
        return model || '';
    };
    FilterEVEBITDAComp.prototype.getFilterModel = function(model) {
        return model;
    }
    FilterEVEBITDAComp.prototype.setModel = function() {
    };





                // Filter P/B
    var pb_filter = {min:-500, max: 300}
    function FilterPBComp() {
    }
    FilterPBComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> P/B' +
            '</div>';
    };
    FilterPBComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'pb_q_array' && value.pb_min) {
            pb_filter.min = value.pb_min
            pb_filter.max = value.pb_max
        }
    }
    FilterPBComp.prototype.onRbChanged = function() {
        this.filterActive = this.rbSince2010.checked;
    };
    FilterPBComp.prototype.getGui = function() {
        return this.eGui;
    };
    FilterPBComp.prototype.doesFilterPass = function(params) {
        return params.data.year >= 2010;
    };
    FilterPBComp.prototype.isFilterActive = function() { 
        return this.filterActive;
    };
    FilterPBComp.prototype.getModel = function() {
    };
    FilterPBComp.prototype.getModelAsString = function(model) {
        return model || '';
    };
    FilterPBComp.prototype.getFilterModel = function(model) {
        return model;
    }
    FilterPBComp.prototype.setModel = function() {
    };





        // Filter P/E
    var pe_filter = {min:-500, max: 300}
    function FilterPEComp() {
    }
    FilterPEComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> P/E' +
            '</div>';
    };
    FilterPEComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'pe_q_array' && value.pe_min) {
            pe_filter.min = value.pe_min
            pe_filter.max = value.pe_max
        }
    }
    FilterPEComp.prototype.onRbChanged = function() {
        this.filterActive = this.rbSince2010.checked;
    };
    FilterPEComp.prototype.getGui = function() {
        return this.eGui;
    };
    FilterPEComp.prototype.doesFilterPass = function(params) {
        return params.data.year >= 2010;
    };
    FilterPEComp.prototype.isFilterActive = function() { 
        return this.filterActive;
    };
    FilterPEComp.prototype.getModel = function() {
    };
    FilterPEComp.prototype.getModelAsString = function(model) {
        return model || '';
    };
    FilterPEComp.prototype.getFilterModel = function(model) {
        return model;
    }
    FilterPEComp.prototype.setModel = function() {
    };






        // Filter P/S
    var ps_filter = {min:-500, max: 300}
    function FilterPSComp() {
    }
    FilterPSComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> P/S' +
            '</div>';
    };
    FilterPSComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ps_q_array' && value.ps_min) {
            ps_filter.min = value.ps_min
            ps_filter.max = value.ps_max
        }
    }
    FilterPSComp.prototype.onRbChanged = function() {
        this.filterActive = this.rbSince2010.checked;
    };
    FilterPSComp.prototype.getGui = function() {
        return this.eGui;
    };
    FilterPSComp.prototype.doesFilterPass = function(params) {
        return params.data.year >= 2010;
    };
    FilterPSComp.prototype.isFilterActive = function() { 
        return this.filterActive;
    };
    FilterPSComp.prototype.getModel = function() {
    };
    FilterPSComp.prototype.getModelAsString = function(model) {
        return model || '';
    };
    FilterPSComp.prototype.getFilterModel = function(model) {
        return model;
    }
    FilterPSComp.prototype.setModel = function() {
    };





// Filter Sales
    var sales_filter = {min:-10000000000000, max: 10000000000000}
    function FilterSalesComp() {
    }
    FilterSalesComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> Sales' +
            '</div>';
    };
    FilterSalesComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'sales_q_array' && value.sales_min) {
            sales_filter.min = value.sales_min
            sales_filter.max = value.sales_max
        }
    }
    FilterSalesComp.prototype.onRbChanged = function() {
        this.filterActive = this.rbSince2010.checked;
    };
    FilterSalesComp.prototype.getGui = function() {
        return this.eGui;
    };
    FilterSalesComp.prototype.doesFilterPass = function(params) {
        return params.data.year >= 2010;
    };
    FilterSalesComp.prototype.isFilterActive = function() { 
        return this.filterActive;
    };
    FilterSalesComp.prototype.getModel = function() {
    };
    FilterSalesComp.prototype.getModelAsString = function(model) {
        return model || '';
    };
    FilterSalesComp.prototype.getFilterModel = function(model) {
        return model;
    }
    FilterSalesComp.prototype.setModel = function() {
    };




    // Filter Gross Profit
    var gp_filter = {min:-500, max: 300}
    function FilterGPComp() {
    }
    FilterGPComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> GP' +
            '</div>';
    };
    FilterGPComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'gp_q_array' && value.gp_min) {
            gp_filter.min = value.gp_min
            gp_filter.max = value.gp_max
        }
    }
    FilterGPComp.prototype.onRbChanged = function() {
        this.filterActive = this.rbSince2010.checked;
    };
    FilterGPComp.prototype.getGui = function() {
        return this.eGui;
    };
    FilterGPComp.prototype.doesFilterPass = function(params) {
        return params.data.year >= 2010;
    };
    FilterGPComp.prototype.isFilterActive = function() { 
        return this.filterActive;
    };
    FilterGPComp.prototype.getModel = function() {
    };
    FilterGPComp.prototype.getModelAsString = function(model) {
        return model || '';
    };
    FilterGPComp.prototype.getFilterModel = function(model) {
        return model;
    }
    FilterGPComp.prototype.setModel = function() {
    };




            // Filter PTP
    var ptp_filter = {min:-1000000000000, max: 1000000000000}
    function FilterPTPComp() {
    }
    FilterPTPComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> Pre-Tax Profit' +
            '</div>';
    };
    FilterPTPComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ptp_q_array' && value.ptp_min) {
            ptp_filter.min = value.ptp_min
            ptp_filter.max = value.ptp_max
        }
    }
    FilterPTPComp.prototype.onRbChanged = function() {
        this.filterActive = this.rbSince2010.checked;
    };
    FilterPTPComp.prototype.getGui = function() {
        return this.eGui;
    };
    FilterPTPComp.prototype.doesFilterPass = function(params) {
        return params.data.year >= 2010;
    };
    FilterPTPComp.prototype.isFilterActive = function() { 
        return this.filterActive;
    };
    FilterPTPComp.prototype.getModel = function() {
    };
    FilterPTPComp.prototype.getModelAsString = function(model) {
        return model || '';
    };
    FilterPTPComp.prototype.getFilterModel = function(model) {
        return model;
    }
    FilterPTPComp.prototype.setModel = function() {
    };




                // Filter Ebitda
    var ebitda_filter = {min:-1000000000000, max: 1000000000000}
    function FilterEbitdaComp() {
    }
    FilterEbitdaComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> EBITDA' +
            '</div>';
    };
    function setFilteredEbitdaName(min, max, that) {
        that.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> ' + min + ' to ' + max +
            '</div>';
    }
    FilterEbitdaComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ebitda_q_array' && value.ebitda_min) {
            ebitda_filter.min = value.ebitda_min
            ebitda_filter.max = value.ebitda_max
            setFilteredEbitdaName(value.ebitda_min, value.ebitda_max, this)
        }
    }
    FilterEbitdaComp.prototype.onRbChanged = function() {
        this.filterActive = this.rbSince2010.checked;
    };
    FilterEbitdaComp.prototype.getGui = function() {
        return this.eGui;
    };
    FilterEbitdaComp.prototype.doesFilterPass = function(params) {
        return params.data.year >= 2010;
    };
    FilterEbitdaComp.prototype.isFilterActive = function() { 
        return this.filterActive;
    };
    FilterEbitdaComp.prototype.getModel = function() {
    };
    FilterEbitdaComp.prototype.getModelAsString = function(model) {
        return model || '';
    };
    FilterEbitdaComp.prototype.getFilterModel = function(model) {
        return model;
    }
    FilterEbitdaComp.prototype.setModel = function() {
    };





                // Filter Ebit
    var ebit_filter = {min:-1000000000000, max: 1000000000000}
    function FilterEbitComp() {
    }
    FilterEbitComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> EBIT' +
            '</div>';
    };
    FilterEbitComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ebit_q_array' && value.ebit_min) {
            ebit_filter.min = value.ebit_min
            ebit_filter.max = value.ebit_max
        }
    }
    FilterEbitComp.prototype.onRbChanged = function() {
        this.filterActive = this.rbSince2010.checked;
    };
    FilterEbitComp.prototype.getGui = function() {
        return this.eGui;
    };
    FilterEbitComp.prototype.doesFilterPass = function(params) {
        return params.data.year >= 2010;
    };
    FilterEbitComp.prototype.isFilterActive = function() { 
        return this.filterActive;
    };
    FilterEbitComp.prototype.getModel = function() {
    };
    FilterEbitComp.prototype.getModelAsString = function(model) {
        return model || '';
    };
    FilterEbitComp.prototype.getFilterModel = function(model) {
        return model;
    }
    FilterEbitComp.prototype.setModel = function() {
    };





                    // Filter NP
    var np_filter = {min:-1000000000000, max: 1000000000000}
    function FilterNPComp() {
    }
    FilterNPComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span /> Profit' +
            '</div>';
    };
    FilterNPComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'np_q_array' && value.np_min) {
            np_filter.min = value.np_min
            np_filter.max = value.np_max
        }
    }
    FilterNPComp.prototype.onRbChanged = function() {
        this.filterActive = this.rbSince2010.checked;
    };
    FilterNPComp.prototype.getGui = function() {
        return this.eGui;
    };
    FilterNPComp.prototype.doesFilterPass = function(params) {
        return params.data.year >= 2010;
    };
    FilterNPComp.prototype.isFilterActive = function() { 
        return this.filterActive;
    };
    FilterNPComp.prototype.getModel = function() {
    };
    FilterNPComp.prototype.getModelAsString = function(model) {
        return model || '';
    };
    FilterNPComp.prototype.getFilterModel = function(model) {
        return model;
    }
    FilterNPComp.prototype.setModel = function() {
    };


    /***********/
    function FilterNetDebt() {
    }

    FilterNetDebt.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        // this.eGui.innerHTML =
        //     '<div>' +
        //     '  <v-range-slider /> Profit Margin LAST Q' +
        //     '</div>';
        this.eGui.innerHTML =
            '<div>'
            '</div>';
    };

    FilterNetDebt.prototype.onParentModelChanged = function() {
    }

    FilterNetDebt.prototype.onRbChanged = function() {
        this.filterActive = this.rbSince2010.checked;
        this.filterChangedCallback();
    };

    FilterNetDebt.prototype.getGui = function() {
        return this.eGui;
    };

    FilterNetDebt.prototype.doesFilterPass = function(params) {
        return params.data.year >= 2010;
    };

    FilterNetDebt.prototype.isFilterActive = function() {
        return this.filterActive;
    };

    // this example isn't using getModel() and setModel(),
    // so safe to just leave these empty. don't do this in your code!!!
    FilterNetDebt.prototype.getModel = function() {
    };

    FilterNetDebt.prototype.getModelAsString = function(model) {
        return model || '';
    };

    FilterNetDebt.prototype.setModel = function() {
    };


    window.mouseOverBind1 = function() {
        const hoverElements = document.querySelectorAll('.ag-header-cell.ag-focus-managed');
        hoverElements.forEach((item) => {
            const filterButton = item.querySelector('.ag-floating-filter-button:not(.ag-hidden) .ag-floating-filter-button-button');
            item.addEventListener("mouseover", function(){
                document.querySelectorAll('.ag-theme-balham.ag-popup').forEach((elem) => elem.remove());
                if(filterButton) {
                    filterButton.click();
                }
            })
        })
    }
    window.mouseOverBind = function(){
        const hoverElements = document.querySelectorAll('.ag-header-cell.ag-focus-managed');
        hoverElements.forEach((item) => {
            const filterButton = item.querySelector('.ag-floating-filter-button:not(.ag-hidden) .ag-floating-filter-button-button');
            if (filterButton)
                filterButton.click();
            item.addEventListener("mouseover", function(){
                document.querySelectorAll('.ag-theme-balham.ag-popup').forEach((elem) => elem.style.display = 'none');
                if(filterButton) {
                    filterButton.click();
                }
            })
        })
        document.querySelectorAll('.ag-theme-balham.ag-popup').forEach((elem) => elem.style.display = 'none');
    }
    window.mouseOverUnBind = function(){
        const hoverElements = document.querySelectorAll('.ag-header-cell.ag-focus-managed');
        document.querySelectorAll('.ag-theme-balham.ag-popup').forEach((elem) => elem.style.display = 'none');
        hoverElements.forEach((item) => {
            item.removeEventListener("mouseover");
        })
    }
</script>


<style scoped>
.isDisabled {
    color: currentColor;
    cursor: not-allowed;
    opacity: 0.5;
    text-decoration: none;
}
</style>
<style>
.wl-container {
    display: flex;
    justify-content: space-between;
    width: 50%;
}
.show-cell{
  background-color: white;
}
.custom-menu-button{
    background-color: #f31727;
    padding: 5px 15px;
    border-radius: 5px;
    color: white;
    position: absolute;
}
.ag-icon {
    font-weight: bold;
}
.no-filter{
    background-color: #ddd;
}
.apply-filter{
    background-color: #00f;
}
.display-none{
    display: none;
}
.ag-header-cell .ag-input-wrapper{
    opacity: 0;
}
.ag-header-cell:hover .ag-input-wrapper{
    opacity: 1;
}
.all-excahnges-label{
    margin-top:15px;
    opacity: 0;
}
.all-excahnges-label span{
    white-space: pre-wrap;
}
.ag-header-cell:hover .all-excahnges-label{
    opacity: 1;
}
.ag-tabs-header.ag-menu-header{
    display: none;
}
.ag-floating-filter-button{
    visibility: hidden;
}
.ag-header-group-cell {
    border: none;
}

/**
bellow style is for removing lines of header
 */
.ag-theme-balham .ag-header{
    background-color: white;
}
.ag-theme-balham .ag-ltr .ag-header-cell::after, .ag-theme-balham .ag-ltr .ag-header-group-cell::after {
    display: none;
}
.ag-theme-balham .ag-root-wrapper {
    border-right-color: white;
    border-left-color: white;
}
.ag-theme-balham .ag-pinned-left-header{
    border-right-color: white;
}
.ag-theme-balham .ag-cell.ag-cell-last-left-pinned:not(.ag-cell-range-right):not(.ag-cell-range-single-cell){
    border-right-color: white;
}
/* .ag-theme-balham .ag-ltr .ag-cell{
    background-color:white !important;
} */
.ag-theme-balham .ag-header-row:not(:first-child) .ag-header-cell, .ag-theme-balham .ag-header-row:not(:first-child) .ag-header-group-cell.ag-header-group-cell-with-group{
    border-top-color: white;
}

.ag-theme-balham .ag-pinned-right-header {
    border-left-color: white;
}

.ag-theme-balham .ag-cell.ag-cell-first-right-pinned:not(.ag-cell-range-left):not(.ag-cell-range-single-cell) {
    border-left-color: white;
}

.ag-tabs.ag-menu.ag-popup-child {
    /* left: 1200px !important; */
    margin-left: -90px;
}
.ag-menu-column-select-wrapper{
    height: 500px !important;
}

.ag-column-select-column-group > .ag-column-select-checkbox{
    display: none;
}

.ag-column-select-header {
    visibility: hidden;
    height: 0px !important;
}

.ag-column-select-list > .ag-column-select-column-group:first-child + div{
    display: none;
}

.ag-column-select-list > .ag-column-select-column-group:first-child{
    display: none;
}

.ag-column-select-column.ag-column-select-add-group-indent:last-child{
    display: none;
}

/**
column hover
 */
.ag-column-hover {
  background-color: rgba(0, 0, 0, 0.04);
}


</style>

