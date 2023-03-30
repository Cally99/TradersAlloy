<template lang="pug">
    v-sheet(class="ma-0")
        v-overlay(:value="isLoaded")
            v-progress-circular(indeterminate size="64")

        div(class="d-flex justify-space-between mt-1 px-1")
            div(style="margin-left:10px;")
                span(v-if="!is_nameEditor" style="font-size:24px;" @click="is_nameEditor=true") {{filters.name}}
                v-text-field(v-else
                            v-model="init_name"
                            style="margin:0; padding:0; font-size:24px;"
                            @keyup.enter="renameScreener(final_name)"
                            @change="renameScreener(final_name)"
                            @blur="renameScreener(final_name)"
                            :autofocus = "is_nameEditor"
                        )

            v-btn(class="blue3 white--text" style="text-transform:none !important;" @click="click_saveBtn()")
                v-icon(class="mr-2" size="18") mdi-target
                span {{ $t('save_screener') }}

            div(class="wl-container")
                div
                    WatchlistAddTo(:stocks="chosenStocks" :disabled="addSelected")

                ScreenerDropDown( @navigateScreener="navigateScreener" :screenername="''" @saveNewFilter="saveNewFilter" style="margin-bottom: 10px;")

                div( class="wl-util")
                    v-btn(style="text-transform:none !important; float:right;" outlined class="blue3--text"
                        @click="newScreener")
                        v-icon(class="mr-2" size="18") mdi-target
                        span {{ $t('new_screener') }}

                ScreenerDropDown( @navigateScreener="navigateScreener" :screenername="filters.name")

        div
            div
                AddColumnBtn(@setFilterAddColumn="setFilterAddColumn" :filters="filters")
            AgGridVue(
                ref="agGrid"
                :context="context"
                :frameworkComponents="frameworkComponents"
                style="position:absolute; top:130px; bottom:0; left:215px; right:20px; margin-left:12px; margin-bottom:10px;"
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

                @grid-ready="onGridReady"
                :components="components"
                :rowBuffer="rowBuffer"
                :rowModelType="rowModelType"
                :cacheBlockSize="cacheBlockSize"
                :cacheOverflowSize="cacheOverflowSize"
                :maxConcurrentDatasourceRequests="maxConcurrentDatasourceRequests"
                :infiniteInitialRowCount="infiniteInitialRowCount"
                :maxBlocksInCache="maxBlocksInCache"
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
                    v-btn(color="primary" @click="filterSave") {{this.$t('Save')}}
                    v-btn(color="grey lighten-2" @click="newScreenerDiag = false") Close
</template>

<script>
    import { AgGridVue } from "ag-grid-vue";
    import 'ag-grid-enterprise';
    import "ag-grid-community/dist/styles/ag-grid.css";
    import "ag-grid-community/dist/styles/ag-theme-dark.css";
    import "ag-grid-community/dist/styles/ag-theme-balham.css";
    import "ag-grid-community/dist/styles/ag-theme-alpine.css";
    import ApiService from "@/Services/ApiService.js";
    import ApiStocks from "@/Services/ApiStocks";
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
    import FilterGrossProfit from './grid-parts/FilterGrossProfit.vue';
    import FilterGrossProfitGrowth from './grid-parts/FilterGrossProfitGrowth.vue';
    import FilterGrossMargin from './grid-parts/FilterGrossMargin.vue';
    import FilterGrossMarginGrowth from './grid-parts/FilterGrossMarginGrowth.vue';
    import FilterEbitdaGrowth from './grid-parts/FilterEbitdaGrowth.vue';
    import FilterEbitdaMargin from './grid-parts/FilterEbitdaMargin.vue';
    import FilterEbitdaMarginGrowth from './grid-parts/FilterEbitdaMarginGrowth.vue';
    import FilterEbitGrowth from './grid-parts/FilterEbitGrowth.vue';
    import FilterEbitMargin from './grid-parts/FilterEbitMargin.vue';
    import FilterEbitMarginGrowth from './grid-parts/FilterEbitMarginGrowth.vue';
    import FilterNPGrowth from './grid-parts/FilterNPGrowth.vue';
    import FilterNPMargin from './grid-parts/FilterNPMargin.vue';
    import FilterNPMarginGrowth from './grid-parts/FilterNPMarginGrowth.vue';
    import FilterCogs from './grid-parts/FilterCogs.vue';
    import FilterPTP from './grid-parts/FilterPTP.vue';
    import FilterEbitda from './grid-parts/FilterEbitda.vue';
    import FilterEbit from './grid-parts/FilterEbit.vue';
    import FilterNP from './grid-parts/FilterNP.vue';
    import FilterAsset from './grid-parts/FilterAsset.vue';
    import FilterEquity from './grid-parts/FilterEquity.vue';
    import FilterProfitPct from './grid-parts/FilterProfitPct.vue';
    import FilterSalesPct from './grid-parts/FilterSalesPct.vue';
    import FilterSales from './grid-parts/FilterSales.vue';
    import FilterSalesGrowth from './grid-parts/FilterSalesGrowth.vue';
    import FilterEPS from './grid-parts/FilterEPS.vue';
    import FilterPS from './grid-parts/FilterPS.vue';
    import FilterCash from './grid-parts/FilterCash.vue';
    import FilterIntangableAssets from './grid-parts/FilterIntangableAssets.vue';
    import FilterFinancialAssets from './grid-parts/FilterFinancialAssets.vue';
    import FilterMaterialAssets from './grid-parts/FilterMaterialAssets.vue';
    import FilterTangibleAssets from './grid-parts/FilterTangibleAssets.vue';
    import FilterCurrentAssets from './grid-parts/FilterCurrentAssets.vue';
    import FilterTotalDebt from './grid-parts/FilterTotalDebt.vue';
    import FilterTotalEquityLiabilities from './grid-parts/FilterTotalEquityLiabilities.vue';
    import FilterTotalAssets from './grid-parts/FilterTotalAssets.vue';
    import FilterTotalEquity from './grid-parts/FilterTotalEquity.vue';
    import FilterLongTermDebt from './grid-parts/FilterLongTermDebt.vue';
    import FilterShortTermDebt from './grid-parts/FilterShortTermDebt.vue';
    import FilterSalesPerShare from './grid-parts/FilterSalesPerShare.vue';
    import FilterNumberOfStocks from './grid-parts/FilterNumberOfStocks.vue';
    import FilterNumberOfStocksGrowth from './grid-parts/FilterNumberOfStocksGrowth.vue';
    import FilterROA from './grid-parts/FilterROA.vue';
    import FilterROE from './grid-parts/FilterROE.vue';
    import FilterNetDebt from './grid-parts/FilterNetDebt.vue';
    import ScreenerDropDown from "./ScreenerDropDown";
    import ScreenerTicker from "./grid-parts/ScreenerTicker";
    import AddColumnBtn from "./grid-parts/AddColumnBtn.vue";
    import FilterLastReport from "./grid-parts/FilterLastReport.vue";
    import FilterNextReport from "./grid-parts/FilterNextReport.vue";
    import SaveBtn from "./grid-parts/SaveBtn.vue"
    import {store} from "@/stores"
    import WatchlistAddTo  from "@/components/WatchlistAddTo.vue";
    import { mapActions, mapGetters } from "vuex";
    import moment from 'moment';

    import i18n from '@/plugins/i18n';
    import _ from 'lodash';

    var sales_type = 'sales_q_array';
    var enterprise_type = 'enterprise_q_latest';

    const helper = require("../../util/helper.js");

    window.numberSort = function numberSort(num1, num2) {
        return num1 - num2;
    };

    export default {
        name: "SheetScreen",
        components: {AgGridVue, FilterExchangeComp, FilterNetDebtComp, FilterSectorComp, FilterMarketCapComp, FilterSolidityComp, FilterEnterpriseValueComp,FilterEVEBITComp, FilterEVEBITDAComp, FilterPBComp, FilterPEComp, FilterPSComp, FilterGrossProfitComp, FilterGrossProfitGrowthComp, ScreenerDropDown, WatchlistAddTo, FilterLastReportDateComp, FilterNextReportDateComp, FilterSalesComp, FilterPTPComp, FilterEbitdaComp, FilterEbitComp, FilterNPComp, FilterEPSComp, FilterCashComp, FilterTotalDebtComp, FilterSalesGrowthComp, FilterGrossMarginComp, FilterGrossMarginGrowthComp, FilterCogsComp, FilterEbitdaMarginComp, FilterEbitdaGrowthComp, FilterEbitdaMarginGrowthComp, FilterEbitGrowthComp, FilterEbitMarginComp, FilterEbitMarginGrowthComp, FilterNPGrowthComp, FilterNPMarginComp, FilterNPMarginGrowthComp, FilterIntangableAssetsComp, FilterFinancialAssetsComp, FilterMaterialAssetsComp, FilterTangibleAssetsComp, FilterCurrentAssetsComp, FilterTotalEquityLiabilitiesComp, FilterTotalAssetsComp, FilterTotalEquityComp, FilterLongTermDebtComp, FilterShortTermDebtComp, FilterSalesPerShareComp, FilterNumberOfStocksComp, FilterNumberOfStocksGrowthComp, FilterROAComp, FilterROEComp, AddColumnBtnComp, AddColumnBtn },
        props: {
        },
        created: function () {
            this.components = {
                loadingRenderer: (params) => {
                    if (params.value !== undefined) {
                    return params.value;
                    } else {
                    return '<img src="https://www.ag-grid.com/example-assets/loading.gif">';
                    }
                },
            };
            this.rowBuffer = 0;
            this.rowSelection = 'multiple';
            this.rowModelType = 'infinite';
            this.cacheBlockSize = 50;
            this.cacheOverflowSize = 2;
            this.maxConcurrentDatasourceRequests = 1;
            this.infiniteInitialRowCount = 50;
            this.maxBlocksInCache = 10;
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
                filterGrossProfit: FilterGrossProfit,
                filterGrossProfitGrowth: FilterGrossProfitGrowth,
                filterGrossMargin: FilterGrossMargin,
                filterGrossMarginGrowth: FilterGrossMarginGrowth,
                filterEbitdaMargin: FilterEbitdaMargin,
                filterEbitdaGrowth: FilterEbitdaGrowth,
                filterEbitdaMarginGrowth: FilterEbitdaMarginGrowth,
                filterEbitMargin: FilterEbitMargin,
                filterEbitGrowth: FilterEbitGrowth,
                filterEbitMarginGrowth: FilterEbitMarginGrowth,
                filterNPMargin: FilterNPMargin,
                filterNPGrowth: FilterNPGrowth,
                filterNPMarginGrowth: FilterNPMarginGrowth,
                filterCogs: FilterCogs,
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
                filterEPS: FilterEPS,
                filterCash: FilterCash,
                filterIntangableAssets: FilterIntangableAssets,
                filterFinancialAssets: FilterFinancialAssets,
                filterMaterialAssets: FilterMaterialAssets,
                filterTangibleAssets: FilterTangibleAssets,
                filterCurrentAssets: FilterCurrentAssets,
                filterTotalEquityLiabilities: FilterTotalEquityLiabilities,
                filterTotalDebt: FilterTotalDebt,
                filterTotalAssets: FilterTotalAssets,
                filterTotalEquity: FilterTotalEquity,
                filterLongTermDebt: FilterLongTermDebt,
                filterShortTermDebt: FilterShortTermDebt,
                filterSalesGrowth: FilterSalesGrowth,
                filterNetDebt: FilterNetDebt,
                filterSalesPerShare: FilterSalesPerShare,
                filterNumberOfStocks: FilterNumberOfStocks,
                filterNumberOfStocksGrowth: FilterNumberOfStocksGrowth,
                filterROE: FilterROE,
                filterROA: FilterROA,
                screenerTicker: ScreenerTicker,
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
                        window.mouseOverBind();
                    })
                }
            };
            this.context = {
                componentParent: this
            }
        },
        mounted() {
            // this.overlay = true;
            this.mounted = true;
            this.$intercom.hide();
            this.$intercom.update({utm_content: 'bbb', utm_campaign: 'screener'});
            this.gridApi = this.gridOptions.api;
            this.gridColumnApi = this.gridOptions.columnApi;
            window.mouseOverBind();

            // Footer of ag-grid
            const agStatusBarCenter = document.getElementsByClassName('ag-status-bar-left')[0];
            const plChild = document.createElement('span');
            plChild.style.paddingLeft = "20px";
            plChild.style.paddingRight = "4px";
            plChild.style.paddingTop = "8px";
            plChild.style.paddingBottom = "8px";
            plChild.innerHTML = '<span ref="eValue" id="research_sum" class="ag-status-name-value-value">0</span>' +
                                '<span>  Stocks</span>' +
                                '<div>'
                                ;

            agStatusBarCenter.append(plChild);

        },
        beforeDestroy() {
            var columns_array = this.gridOptions.columnApi.getColumnState();
            var activeColumns_array = [];
            columns_array.forEach(element => {
                if (!element.hide) {
                    let colDef = this.gridOptions.columnApi.getColumn(element.colId);
                    let header_name = colDef.colDef.headerName;
                    activeColumns_array.push(header_name);
                }
            });

            let screen_id;
            if (this.id) {
                screen_id = this.id
            } else {
                screen_id = -1;
            }

            let screener_name = "No name Screener, not saved";
            let filter = {};
            if (this.$store.getters.screenerFilters.find((item) => item.screen_id === screen_id)) {
                let temp_filter = this.$store.getters.screenerFilters.find((item) => item.screen_id === screen_id);
                filter = typeof temp_filter.filter==='object' ? temp_filter.filter : JSON.parse(temp_filter.filter);
                filter.columns = activeColumns_array
                screener_name = temp_filter.name
            } else {
                filter.columns = activeColumns_array
            }


            filter.exchange = exchange_filter;  // add exchange filter
            filter.market_cap = market_cap_filter;   // add market_cap filter
            filter.last_report_date = last_report_date_filter;
            filter.next_report_date = next_report_date_filter;
            filter.enterprise_q_latest = enterprise_filter;   // add enterprise filter
            filter.sales_q_array = sales_filter;
            filter.sector_name = sector_filter;
            filter.eps_q_latest = eps_filter;
            filter.solidity_q_latest = solidity_filter;
            filter.ev_ebit_q_latest = ev_ebit_filter;
            filter.ev_ebitda_q_latest = ev_ebitda_filter;
            filter.pb_q_latest = pb_filter;
            filter.pe_q_latest = pe_filter;
            filter.ps_q_latest = ps_filter;
            filter.cash_q_latest = cash_filter;
            filter.totalDebt_q_latest = totalDebt_filter;
            filter.salesGrowth_q_latest = salesGrowth_filter;
            filter.grossProfit_q_latest = grossProfit_filter;
            filter.grossProfitGrowth_q_latest = grossProfitGrowth_filter;
            filter.grossMargin_q_latest = grossMargin_filter;
            filter.grossMarginGrowth_q_latest = grossMarginGrowth_filter;
            filter.cogs_q_latest = cogs_filter;
            filter.ebitda_q_latest = ebitda_filter;
            filter.ebit_q_latest = ebit_filter;
            filter.ptp_q_latest = ptp_filter;
            filter.np_q_latest = np_filter;
            filter.ebitdaMargin_q_latest = ebitdaMargin_filter;
            filter.ebitdaGrowth_q_latest = ebitdaGrowth_filter;
            filter.ebitdaMarginGrowth_q_latest = ebitdaMarginGrowth_filter;
            filter.ebitMargin_q_latest = ebitMargin_filter;
            filter.ebitGrowth_q_latest = ebitGrowth_filter;
            filter.ebitMarginGrowth_q_latest = ebitMarginGrowth_filter;
            filter.npMargin_q_latest = npMargin_filter;
            filter.npGrowth_q_latest = npGrowth_filter;
            filter.npMarginGrowth_q_latest = npMarginGrowth_filter;
            filter.ia_q_latest = ia_filter;
            filter.ma_q_latest = ma_filter;
            filter.fa_q_latest = fa_filter;
            filter.ta_q_latest = ta_filter;
            filter.ca_q_latest = ca_filter;
            filter.tel_q_latest = tel_filter;
            filter.totalAssets_q_latest = totalAssets_filter;
            filter.totalEquity_q_latest = totalEquity_filter;
            filter.ltd_q_latest = ltd_filter;
            filter.std_q_latest = std_filter;
            filter.sps_q_latest = sps_filter;
            filter.nos_q_latest = nos_filter;
            filter.nosg_q_latest = nosg_filter;
            filter.roe_q_latest = roe_filter;
            filter.roa_q_latest = roa_filter;
            filter.netDebt_q_latest = netDebt_filter;

            const payload = {
                user_id: JSON.parse(localStorage.user).user_id,
                filter: JSON.stringify(filter),
                name: screener_name,
                screen_id: screen_id
            };
            store.commit('updateScreenerFilters', payload);

            store.commit('setScreenID', this.id);
            window.mouseOverUnBind();

            store.commit('setIsScreener', false);

            this.init_filters();
        },
        data() {
            return {
                components: null,
                rowBuffer: null,
                rowSelection: null,
                rowModelType: null,
                cacheBlockSize: null,
                cacheOverflowSize: null,
                maxConcurrentDatasourceRequests: null,
                infiniteInitialRowCount: null,
                maxBlocksInCache: null,


                is_renamed: false,
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
                // columnDefs: [
                //     {
                //     headerName: 'ID',
                //     maxWidth: 100,
                //     valueGetter: 'node.id',
                //     cellRenderer: 'loadingRenderer',
                //     },
                //     { field: 'athlete', minWidth: 150 },
                //     { field: 'age' },
                //     { field: 'country', minWidth: 150 },
                //     { field: 'year' },
                //     { field: 'date', minWidth: 150 },
                //     { field: 'sport', minWidth: 150 },
                //     { field: 'gold' },
                //     { field: 'silver' },
                //     { field: 'bronze' },
                //     { field: 'total' },
                // ],
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
                                suppressFilterButton: true,
                                suppressSizeToFit: true,
                                floatingFilter: true,
                                suppressMenu: true,
                                suppressSorting : true,
                                // floatingFilterComponent: FilterSaveComp,
                                filter: 'saveBtn',
                                floatingFilterComponentParams: {
                                    suppressFilterButton: true,
                                },
                                hide: false
                            }
                        ]
                    },
                    {headerName: this.$t('company_info'),
                        children: [
                            {headerName: this.$t('Ticker'),
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
                                hide: false
                            },
                            {headerName: this.$t('Name'),
                                field: "name",
                                filter: 'agTextColumnFilter',
                                filterParams: {
                                    // textCustomComparator: (filter, value, filterText) => {
                                    //     console.log('00000000000000000', filter, filterText);
                                    //     if(filterText.length>0){
                                    //         document.querySelectorAll('.ag-header-cell .ag-text-field-input-wrapper')[1].classList.add('fill');
                                    //     } else {
                                    //         document.querySelectorAll('.ag-header-cell .ag-text-field-input-wrapper')[1].classList.remove('fill');
                                    //     }
                                    //     return filterText;
                                    // }
                                },
                                floatingFilterComponentParams: {
                                    suppressFilterButton: true,
                                },
                                suppressMovable: true,
                                suppressMenu: true,
                                hide: false,
                                cellRenderer: 'loadingRenderer',
                            },
                            {headerName: this.$t('Exchange'),
                                field: "exchange",
                                filter: 'filterExchanges',
                                floatingFilter: true,
                                cellRenderer: function(params) {
                                    var isoCountryCode = params.data && params.data.country ? params.data.country : 'none';
                                    return `<img src="/images/flag_${isoCountryCode}.png" style="width:28px; height:;16px"/> ${params.value} `;
                                },
                                floatingFilterComponent: FilterExchangeComp,
                                suppressMenu: true,
                                hide: false
                                // lockVisible: true,
                                // headerComponentParams: { template: '<i class="fa fa-star"></i>' },
                            },
                            {headerName: this.$t('Sector'),
                                field: "sector_name",
                                filter: 'filterSector',
                                floatingFilter: true,
                                headerTooltip: 'Business Sector/Industry as defined by the Exchange on which it is traded.',
                                floatingFilterComponent: FilterSectorComp,
                                suppressMenu: true,
                                hide: false,
                                valueFormatter: (params) => {
                                    return helper.sectorNameConverter(params.value, this);
                                }
                            },
                            {headerName: this.$t('next_report_date'),
                                field: "next_report_date",
                                filter: 'filterNextReport',
                                hide: true,
                                suppressMenu: true,
                                floatingFilter: true,
                                floatingFilterComponent: FilterNextReportDateComp,
                            },
                            {headerName: this.$t('last_report_date'),
                                field: "last_report_date",
                                filter: 'filterLastReport',
                                floatingFilter: true,
                                hide: true,
                                floatingFilterComponent: FilterLastReportDateComp,
                                suppressMenu: true
                            },
                            {headerName: this.$t('Price'),
                                field: "price_today",
                                hide: true,
                                suppressMenu: true,
                                comparator: numberSort,
                                type: 'rightAligned',
                                minWidth: 100,
                                maxWidth: 130,
                            },

                        ]},
                    {headerName: this.$t('Valuation'),
                        children: [
                            {
                                headerName: this.$t('Enterprise_value'),
                                field: "enterprise_q_latest",
                                suppressMenu: true,
                                // cellRenderer: 'sparkBar',
                                // type: "numericColumn",
                                minWidth: 150,
                                maxWidth: 180,
                                floatingFilter: true,
                                filter: 'filterEnterpriseValue',
                                floatingFilterComponent: FilterEnterpriseValueComp,
                                hide: true,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {
                                headerName: this.$t('Market_cap'),
                                field: "market_cap",
                                // type: "numericColumn",
                                filter: 'filterMarketCap',
                                floatingFilter: true,
                                floatingFilterComponent: FilterMarketCapComp,
                                minWidth: 150,
                                maxWidth: 180,
                                suppressMenu: true,
                                hide: true,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {
                                headerName: this.$t('EV_EBIT'),
                                field: "ev_ebit_q_latest",
                                suppressMenu: true,
                                filter: 'filterEVEBIT',
                                floatingFilter: true,
                                floatingFilterComponent: FilterEVEBITComp,
                                minWidth: 150,
                                maxWidth: 180,
                                hide: true,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {
                                headerName: this.$t('EV_EBITDA'),
                                field: "ev_ebitda_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterEVEBITDA',
                                floatingFilter: true,
                                floatingFilterComponent: FilterEVEBITDAComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {
                                headerName: this.$t('P_B'),
                                field: "pb_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterPB',
                                floatingFilter: true,
                                floatingFilterComponent: FilterPBComp,
                                minWidth: 130,
                                maxWidth: 150,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {
                                headerName: this.$t('P_E'),
                                field: "pe_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterPE',
                                floatingFilter: true,
                                floatingFilterComponent: FilterPEComp,
                                minWidth: 130,
                                maxWidth: 150,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {
                                headerName: this.$t('P_S'),
                                field: "ps_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterPS',
                                floatingFilter: true,
                                floatingFilterComponent: FilterPSComp,
                                minWidth: 130,
                                maxWidth: 150,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                        ]
                    },
                    {headerName: this.$t('Income_Statement'),
                        children: [
                            {headerName: this.$t('Sales'),
                                field: "sales_q_array",
                                hide: false,
                                suppressMenu: true,
                                cellRenderer: 'sparkBar',
                                filter: 'filterSales',
                                floatingFilter: true,
                                floatingFilterComponent: FilterSalesComp,
                                minWidth: 150,
                                maxWidth: 180,
                                // comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Sales_growth_percent'),
                                field: "salesGrowth_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterSalesGrowth',
                                floatingFilter: true,
                                floatingFilterComponent: FilterSalesGrowthComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
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
                            {headerName: this.$t('gp'),
                                field: "grossProfit_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterGrossProfit',
                                floatingFilter: true,
                                floatingFilterComponent: FilterGrossProfitComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Gross_profit_growth_percent'),
                                field: "grossProfitGrowth_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterGrossProfitGrowth',
                                floatingFilter: true,
                                floatingFilterComponent: FilterGrossProfitGrowthComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Gross_margin_percent'),
                                field: "grossMargin_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterGrossMargin',
                                floatingFilter: true,
                                floatingFilterComponent: FilterGrossMarginComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Gross_margin_growth_percent'),
                                field: "grossMarginGrowth_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterGrossMarginGrowth',
                                floatingFilter: true,
                                floatingFilterComponent: FilterGrossMarginGrowthComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Cost_of_goods_sold'),
                                field: "cogs_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterCogs',
                                floatingFilter: true,
                                floatingFilterComponent: FilterCogsComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('ptp'),
                                field: "ptp_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterPTP',
                                floatingFilter: true,
                                floatingFilterComponent: FilterPTPComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('ebitda'),
                                field: "ebitda_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterEbitda',
                                floatingFilter: true,
                                floatingFilterComponent: FilterEbitdaComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('ebitda_growth_percent'),
                                field: "ebitdaGrowth_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterEbitdaGrowth',
                                floatingFilter: true,
                                floatingFilterComponent: FilterEbitdaGrowthComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('ebitda_margin_percent'),
                                field: "ebitdaMargin_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterEbitdaMargin',
                                floatingFilter: true,
                                floatingFilterComponent: FilterEbitdaMarginComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('ebitda_margin_growth_percent'),
                                field: "ebitdaMarginGrowth_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterEbitdaMarginGrowth',
                                floatingFilter: true,
                                floatingFilterComponent: FilterEbitdaMarginGrowthComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('EBIT'),
                                field: "ebit_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterEbit',
                                floatingFilter: true,
                                floatingFilterComponent: FilterEbitComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('ebit_growth_percent'),
                                field: "ebitGrowth_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterEbitGrowth',
                                floatingFilter: true,
                                floatingFilterComponent: FilterEbitGrowthComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('ebit_margin_percent'),
                                field: "ebitMargin_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterEbitMargin',
                                floatingFilter: true,
                                floatingFilterComponent: FilterEbitMarginComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('ebit_margin_growth_percent'),
                                field: "ebitMarginGrowth_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterEbitMarginGrowth',
                                floatingFilter: true,
                                floatingFilterComponent: FilterEbitMarginGrowthComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Profit'),
                                field: "np_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterNP',
                                floatingFilter: true,
                                floatingFilterComponent: FilterNPComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Profit_growth_percent'),
                                field: "npGrowth_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterNPGrowth',
                                floatingFilter: true,
                                floatingFilterComponent: FilterNPGrowthComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Profit_margin_percent'),
                                field: "npMargin_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterNPMargin',
                                floatingFilter: true,
                                floatingFilterComponent: FilterNPMarginComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Profit_margin_growth_percent'),
                                field: "npMarginGrowth_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterNPMarginGrowth',
                                floatingFilter: true,
                                floatingFilterComponent: FilterNPMarginGrowthComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                        ]},
                    {headerName: this.$t('Balance_sheet'),
                        children: [
                            {headerName: this.$t('Intangable_assets'),
                                field: "ia_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterIntangableAssets',
                                floatingFilter: true,
                                floatingFilterComponent: FilterIntangableAssetsComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Material_assets'),
                                field: "ma_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterMaterialAssets',
                                floatingFilter: true,
                                floatingFilterComponent: FilterMaterialAssetsComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Financial_assets'),
                                field: "fa_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterFinancialAssets',
                                floatingFilter: true,
                                floatingFilterComponent: FilterFinancialAssetsComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Tangible_assets'),
                                field: "ta_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterTangibleAssets',
                                floatingFilter: true,
                                floatingFilterComponent: FilterTangibleAssetsComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Current_assets'),
                                field: "ca_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterCurrentAssets',
                                floatingFilter: true,
                                floatingFilterComponent: FilterCurrentAssetsComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Cash'),
                                field: "cash_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterCash',
                                floatingFilter: true,
                                floatingFilterComponent: FilterCashComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('totalassets'),
                                field: "totalAssets_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterTotalAssets',
                                floatingFilter: true,
                                floatingFilterComponent: FilterTotalAssetsComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Total_equity'),
                                field: "totalEquity_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterTotalEquity',
                                floatingFilter: true,
                                floatingFilterComponent: FilterTotalEquityComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Long_term_debt'),
                                field: "ltd_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterLongTermDebt',
                                floatingFilter: true,
                                floatingFilterComponent: FilterLongTermDebtComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Short_term_debt'),
                                field: "std_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterShortTermDebt',
                                floatingFilter: true,
                                floatingFilterComponent: FilterShortTermDebtComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Total_debt'),
                                field: "totalDebt_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterTotalDebt',
                                floatingFilter: true,
                                floatingFilterComponent: FilterTotalDebtComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Total_equity_and_liabilities'),
                                field: "tel_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterTotalEquityLiabilities',
                                floatingFilter: true,
                                floatingFilterComponent: FilterTotalEquityLiabilitiesComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                        ]
                    },
                    {headerName: this.$t('Ratios'),
                        children: [
                            {headerName: this.$t('eps'),
                                field: "eps_q_latest",
                                hide: true,
                                suppressMenu: true,
                                // cellRenderer: 'sparkBar',
                                filter: 'filterEPS',
                                floatingFilter: true,
                                floatingFilterComponent: FilterEPSComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Sales_per_share'),
                                field: "sps_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterSalesPerShare',
                                floatingFilter: true,
                                floatingFilterComponent: FilterSalesPerShareComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Number_of_stocks'),
                                field: "nos_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterNumberOfStocks',
                                floatingFilter: true,
                                floatingFilterComponent: FilterNumberOfStocksComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Number_of_stocks_growth_percent'),
                                field: "nosg_q_latest",
                                hide: true,
                                suppressMenu: true,
                                // filter: 'filterNumberOfStocksGrowth',
                                // floatingFilter: true,
                                // floatingFilterComponent: FilterNumberOfStocksGrowthComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('roe_percent'),
                                field: "roe_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterROE',
                                floatingFilter: true,
                                floatingFilterComponent: FilterROEComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('roa_percent'),
                                field: "roa_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterROA',
                                floatingFilter: true,
                                floatingFilterComponent: FilterROAComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Net_debt_percent'),
                                field: "netDebt_q_latest",
                                hide: true,
                                suppressMenu: true,
                                filter: 'filterNetDebt',
                                floatingFilter: true,
                                floatingFilterComponent: FilterNetDebtComp,
                                minWidth: 150,
                                maxWidth: 180,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },
                            {headerName: this.$t('Solidity_percent'),
                                field: "solidity_q_latest",
                                minWidth: 150,
                                maxWidth: 180,
                                floatingFilter: true,
                                filter: 'filterSolidity',
                                floatingFilterComponent: FilterSolidityComp,
                                suppressMenu: true,
                                // cellRenderer: 'sparkBar',
                                hide: true,
                                comparator: numberSort,
                                type: 'rightAligned',
                                valueFormatter: (params) => {
                                    return helper.thousandFormatterWithDecimal(params.value, 2);
                                }
                            },

                        ]
                    },
                ],
                selectedSectorsList: [],
                sectorLists: [],
                open: [1, 2],
                search: null,
                caseSensitive: false,
                chosenStocks: null,
                defaultColumns: [
                    "",
                    this.$t('Ticker'),
                    this.$t('Name'),
                    this.$t('Exchange'),
                    this.$t('Sector'),
                    this.$t('Sales')
                ],
                mounted: false,
                screenerIdChanged: false,
                id: '',
            };
        },
        methods: {
            ...mapActions([
                'loadScreenerData',
                'loadScreenerDataOnePage',
                'loadCompanyDataNeeded'
            ]),
            async onGridReady(params) {
                this.gridApi = params.api;
                this.gridColumnApi = params.columnApi;

                const updateData = (data) => {
                    var dataSource = {
                    rowCount: null,
                    getRows: function (params) {
                        console.log(
                        'asking for ' + params.startRow + ' to ' + params.endRow
                        );
                        setTimeout(function () {
                            var dataAfterSortingAndFiltering = sortAndFilter(
                                data,
                                params.sortModel,
                                params.filterModel
                            );

                            var rowsThisPage = dataAfterSortingAndFiltering.slice(params.startRow, params.endRow);
                            var lastRow = -1;
                            if (dataAfterSortingAndFiltering.length <= params.endRow) {
                                lastRow = dataAfterSortingAndFiltering.length;
                            }
                            params.successCallback(rowsThisPage, lastRow);
                        }, 500);
                    },
                    };
                    params.api.setDatasource(dataSource);
                };

                let dataScreener = null;
                if (this.$store.getters['getDataScreener'].length == 0) {
                    dataScreener = await this.loadScreenerDataOnePage();
                    let self = this;
                    // get the all data in 1 sec
                    setTimeout(() => {
                        self.loadScreenerData().then(res => {
                            dataScreener = res;
                            updateData(dataScreener);
                        });
                    }, 1000);
                } else {
                    dataScreener = this.$store.getters['getDataScreener'];
                }

                // display 2 decimal places
                dataScreener.forEach(item => {
                    for (const [key, value] of Object.entries(item)) {
                        if (!isNaN(value) && value && typeof value != Object && typeof value != Array) {
                            if (value % 1 != 0) {
                                // console.log(`${key}: ${value}`);
                                let key_string = `${key}`;
                                let value_string = `${value}`;
                                item[key_string] = parseFloat(value_string).toFixed(2);
                            }
                        }
                    }
                })
                updateData(dataScreener);
            },


            /**
             * setFilter() is called from the child component.
             * I made this function because of histogram. Histogram is not moutned yet, but setMdel() is called... it is a bug.
             * So that I called setFilter() in mounted() of child component.
             * In this case, I used this.moutned_once flag... this is because the function falls into an infinite loop.
             */
            setFilter() {
                if (!this.mounted_once) {
                    this.mounted_once = true;
                    if (this.filters && this.filters.filter) {
                        let filter = typeof this.filters.filter === 'object' ? this.filters.filter : JSON.parse(this.filters.filter);
                        this.gridApi.setFilterModel(filter);
                    } else {
                        this.gridApi.setFilterModel(null);
                    }
                }
            },

            // init filters after save to DB/VUEX
            init_filters() {
                exchange_filter = [];
                market_cap_filter = {};
                last_report_date_filter = this.$t('no_filter');
                next_report_date_filter = this.$t('no_filter');
                enterprise_filter = {};
                sales_filter = {};
                sector_filter = [];
                eps_filter = {};
                solidity_filter = {};
                ev_ebit_filter = {};
                ev_ebitda_filter = {};
                pb_filter = {};
                ps_filter = {};
                pe_filter = {};
                cash_filter = {};
                totalDebt_filter = {};
                salesGrowth_filter = {};
                grossProfit_filter = {};
                grossProfitGrowth_filter = {};
                grossMargin_filter = {};
                grossMarginGrowth_filter = {};
                cogs_filter = {};
                ptp_filter = {};
                ebitda_filter = {};
                ebit_filter = {};
                np_filter = {};
                ebitdaMargin_filter = {};
                ebitdaGrowth_filter = {};
                ebitdaMarginGrowth_filter = {};
                ebitMargin_filter = {};
                ebitGrowth_filter = {};
                ebitMarginGrowth_filter = {};
                npMargin_filter = {};
                npGrowth_filter = {};
                npMarginGrowth_filter = {};
                ia_filter = {};
                ma_filter = {};
                fa_filter = {};
                ta_filter = {};
                ca_filter = {};
                tel_filter = {};
                totalAssets_filter = {};
                totalEquity_filter = {};
                ltd_filter = {};
                std_filter = {};
                sps_filter = {};
                nos_filter = {};
                nosg_filter = {};
                roe_filter = {};
                roa_filter = {};
                netDebt_filter = {};
            },

            async click_saveBtn() {
                if (this.filters.name == 'No name Screener, not saved') {
                    this.$store.commit("setMessage", {text: 'Set the Screener name', type: 'error'});
                } else {
                    var columns = this.gridOptions.columnApi.getColumnState();
                    var activeColumns = [];
                    columns.forEach(element => {
                        if (!element.hide) {
                            let colDef = this.gridOptions.columnApi.getColumn(element.colId);
                            let header_name = colDef.colDef.headerName;
                            activeColumns.push(header_name);
                        }
                    });

                    var filter = this.gridApi.getFilterModel();   // get filtersModel from the default filter
                    filter.columns = activeColumns;   // save active columns into DB
                    filter.exchange = exchange_filter;  // add exchange filter
                    filter.market_cap = market_cap_filter;   // add market_cap filter
                    filter.last_report_date = last_report_date_filter;
                    filter.next_report_date = next_report_date_filter;
                    filter.enterprise_q_latest = enterprise_filter;   // add enterprise filter
                    filter.sales_q_array = sales_filter;
                    filter.sector_name = sector_filter;
                    filter.eps_q_latest = eps_filter;
                    filter.solidity_q_latest = solidity_filter;
                    filter.ev_ebit_q_latest = ev_ebit_filter;
                    filter.ev_ebitda_q_latest = ev_ebitda_filter;
                    filter.pb_q_latest = pb_filter;
                    filter.ps_q_latest = ps_filter;
                    filter.pe_q_latest = pe_filter;
                    filter.cash_q_latest = cash_filter;
                    filter.totalDebt_q_latest = totalDebt_filter;
                    filter.salesGrowth_q_latest = salesGrowth_filter;
                    filter.grossProfit_q_latest = grossProfit_filter;
                    filter.grossProfitGrowth_q_latest = grossProfitGrowth_filter;
                    filter.grossMargin_q_latest = grossMargin_filter;
                    filter.grossMarginGrowth_q_latest = grossMarginGrowth_filter;
                    filter.cogs_q_latest = cogs_filter;
                    filter.ebitda_q_latest = ebitda_filter;
                    filter.ebit_q_latest = ebit_filter;
                    filter.ptp_q_latest = ptp_filter;
                    filter.np_q_latest = np_filter;
                    filter.ebitdaMargin_q_latest = ebitdaMargin_filter;
                    filter.ebitdaGrowth_q_latest = ebitdaGrowth_filter;
                    filter.ebitdaMarginGrowth_q_latest = ebitdaMarginGrowth_filter;
                    filter.ebitMargin_q_latest = ebitMargin_filter;
                    filter.ebitGrowth_q_latest = ebitGrowth_filter;
                    filter.ebitMarginGrowth_q_latest = ebitMarginGrowth_filter;
                    filter.npMargin_q_latest = npMargin_filter;
                    filter.npGrowth_q_latest = npGrowth_filter;
                    filter.npMarginGrowth_q_latest = npMarginGrowth_filter;
                    filter.ia_q_latest = ia_filter;
                    filter.ma_q_latest = ma_filter;
                    filter.fa_q_latest = fa_filter;
                    filter.ta_q_latest = ta_filter;
                    filter.ca_q_latest = ca_filter;
                    filter.tel_q_latest = tel_filter;
                    filter.totalAssets_q_latest = totalAssets_filter;
                    filter.totalEquity_q_latest = totalEquity_filter;
                    filter.ltd_q_latest = ltd_filter;
                    filter.std_q_latest = std_filter;
                    filter.sps_q_latest = sps_filter;
                    filter.nos_q_latest = nos_filter;
                    filter.nosg_q_latest = nosg_filter;
                    filter.roe_q_latest = roe_filter;
                    filter.roa_q_latest = roa_filter;
                    filter.netDebt_q_latest = netDebt_filter;


                    if (this.$store.getters['screenerFilters'].find(item => item.name == this.filters.name)) {   // update sub-screener
                        var screen_id = this.$store.getters['screenerFilters'].find(item => item.name == this.filters.name).screen_id;

                        if (screen_id == -1) {
                            const payload = {
                                user_id: JSON.parse(localStorage.user).user_id,
                                name: this.filters.name,
                                filter: JSON.stringify(filter),
                            }
                            const that = this;
                            const res = await ApiService.saveUserScreenerFilters(payload);
                            that.$store.commit("addScreenerFilters" , {name: res.data.name , filter: JSON.parse(res.data.filter) , screen_id: res.data.screen_id});
                            that.screener = {
                                name: res.data.name,
                                filter: JSON.parse(res.data.filter),
                                screen_id: res.data.screen_id
                            };
                            this.$router.push({name: 'landing-page.screener-detail', params: {id: this.screener.screen_id}});
                        } else {
                            const payload = {
                                user_id: JSON.parse(localStorage.user).user_id,
                                name: this.filters.name,
                                filter: JSON.stringify(filter),
                                screen_id: screen_id
                            };
                            store.commit('updateScreenerFilters', payload);
                            await ApiService.updateUserScreenerFilters(payload);
                        }
                    } else {    // save new screener
                        const payload = {
                            user_id: JSON.parse(localStorage.user).user_id,
                            name: this.filters.name,
                            filter: JSON.stringify(filter),
                        }
                        const that = this;
                        const res = await ApiService.saveUserScreenerFilters(payload);
                        that.$store.commit("addScreenerFilters" , {name: res.data.name , filter: JSON.parse(res.data.filter) , screen_id: res.data.screen_id});
                        that.screener = {
                            name: res.data.name,
                            filter: JSON.parse(res.data.filter),
                            screen_id: res.data.screen_id
                        };
                        this.$router.push({name: 'landing-page.screener-detail', params: {id: this.screener.screen_id}});
                    }
                    this.init_filters();
                }
            },

            async renameScreener(name) {
                if (!name) {
                    this.$store.commit("setMessage", {text: 'Set the Screener name', type: 'error'});
                    return;
                }
                this.is_renamed = true;
                this.is_nameEditor = false;
                const _filters = [...this.$store.getters['screenerFilters']];
                if (_filters.find(item => item.name == this.filters.name)) {
                    var screen_id = _filters.find(item => item.name == this.filters.name).screen_id;
                    var screen_index = _filters.findIndex((s) => s.name == this.filters.name);
                    await ApiService.updateScreenFilters({name: name, screen_id: screen_id});
                    var data = {
                        name: name,
                        index : screen_index
                    };
                    this.$store.commit('renameScreenerFilters' , data );
                } else {
                    this.filters.name = name;
                }
            },

            // Enterprise Value
            setFilterEnterprise(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                enterprise_type = 'enterprise_' + category + '_' + type;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Valuation')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Enterprise_value')) {
                                element.field = 'enterprise_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },


            // EPS
            setFilterEPS(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Ratios')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('eps')) {
                                element.field = 'eps_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },



            // EV/EBIT Value
            setFilterEVEBIT(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Valuation')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('EV_EBIT')) {
                                element.field = 'ev_ebit_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },



            // EV/EBITDA Value
            setFilterEVEBITDA(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Valuation')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('EV_EBITDA')) {
                                element.field = 'ev_ebitda_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },


            // P/B Value
            setFilterPB(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Valuation')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('P_B')) {
                                element.field = 'pb_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },



            // P/E Value
            setFilterPE(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Valuation')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('P_E')) {
                                element.field = 'pe_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },



            // P/S Value
            setFilterPS(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Valuation')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('P_S')) {
                                element.field = 'ps_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },

            // Sales
            setFilterSales(category, type) {
                console.log(category + '_' + type);
                sales_type = 'sales_' + category + '_' + type;
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Income_Statement')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Sales')) {
                                element.field = 'sales_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },

            // Sales Growth Percent
            setFilterSalesGrowth(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Income_Statement')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Sales_growth_percent')) {
                                element.field = 'salesGrowth_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },

            // Gross Profit
            setFilterGrossProfit(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Income_Statement')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('gp')) {
                                element.field = 'grossProfit_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },


            // Gross Profit %
            setFilterGrossProfitGrowth(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Income_Statement')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Gross_profit_growth_percent')) {
                                element.field = 'grossProfitGrowth_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },

            // Gross Margin %
            setFilterGrossMargin(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Income_Statement')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Gross_margin_percent')) {
                                element.field = 'grossMargin_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },

            // Gross Margin Growth %
            setFilterGrossMarginGrowth(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Income_Statement')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Gross_margin_growth_percent')) {
                                element.field = 'grossMarginGrowth_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },

            // COGS
            setFilterCogs(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Income_Statement')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Cost_of_goods_sold')) {
                                element.field = 'cogs_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },



            // Intangable Assets
            setFilterIA(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Balance_sheet')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Intangable_assets')) {
                                element.field = 'ia_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },
            // Material Assets
            setFilterMA(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Balance_sheet')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Material_assets')) {
                                element.field = 'ma_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },
            // Financial Assets
            setFilterFA(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Balance_sheet')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Financial_assets')) {
                                element.field = 'fa_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },
            // Tangible Assets
            setFilterTA(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Balance_sheet')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Tangible_assets')) {
                                element.field = 'ta_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },
            // Cash
            setFilterCash(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Balance_sheet')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Cash')) {
                                element.field = 'cash_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },
            // Current Assets
            setFilterCA(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Balance_sheet')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Current_assets')) {
                                element.field = 'ca_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },

            // Total Debt
            setFilterTotalDebt(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Balance_sheet')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Total_debt')) {
                                element.field = 'totalDebt_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },
            // Total Equity & Liabillities
            setFilterTEL(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Balance_sheet')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Total_equity_and_liabilities')) {
                                element.field = 'tel_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },

            // Total Assets
            setFilterTotalAssets(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Balance_sheet')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('totalassets')) {
                                element.field = 'totalAssets_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },
            // Total Equity
            setFilterTotalEquity(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Balance_sheet')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Total_equity')) {
                                element.field = 'totalEquity_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },
            // Long Term Debt
            setFilterLTD(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Balance_sheet')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Long_term_debt')) {
                                element.field = 'ltd_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },
            // Short Term Debt
            setFilterSTD(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Balance_sheet')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Short_term_debt')) {
                                element.field = 'std_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },





            // Pre-tax Profit
            setFilterPTP(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Income_Statement')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('ptp')) {
                                element.field = 'ptp_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },





            // Ebitda
            setFilterEbitda(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Income_Statement')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('ebitda')) {
                                element.field = 'ebitda_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },


            // Ebitda Growth
            setFilterEbitdaGrowth(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Income_Statement')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('ebitda_growth_percent')) {
                                element.field = 'ebitdaGrowth_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },

            // Ebitda Margin
            setFilterEbitdaMargin(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Income_Statement')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('ebitda_margin_percent')) {
                                element.field = 'ebitdaMargin_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },

            // Ebitda Margin Growth
            setFilterEbitdaMarginGrowth(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Income_Statement')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('ebitda_margin_growth_percent')) {
                                element.field = 'ebitdaMarginGrowth_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },





            // Ebit
            setFilterEbit(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Income_Statement')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('EBIT')) {
                                element.field = 'ebit_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },
            // Ebit Margin
            setFilterEbitMargin(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Income_Statement')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('ebit_margin_percent')) {
                                element.field = 'ebitMargin_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },
            // Ebit Growth
            setFilterEbitGrowth(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Income_Statement')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('ebit_growth_percent')) {
                                element.field = 'ebitGrowth_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },
            // Ebit Margin Growth
            setFilterEbitMarginGrowth(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Income_Statement')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('ebit_margin_growth_percent')) {
                                element.field = 'ebitMarginGrowth_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },





            // Profit
            setFilterProfit(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Income_Statement')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Profit')) {
                                element.field = 'np_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },
            // Profit Growth
            setFilterProfitGrowth(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Income_Statement')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Profit_growth_percent')) {
                                element.field = 'npGrowth_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },
            // Profit Margin
            setFilterProfitMargin(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Income_Statement')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Profit_margin_percent')) {
                                element.field = 'npMargin_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },
            // Profit Margin Growth
            setFilterProfitMarginGrowth(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef)  {
                    if (colDef.headerName == i18n.t('Income_Statement')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Profit_margin_growth_percent')) {
                                element.field = 'npMarginGrowth_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },

            // Sales Per Share
            setFilterSPS(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef, index)  {
                    if (colDef.headerName == i18n.t('Ratios')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Sales_per_share')) {
                                element.field = 'sps_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },

            // Number of stocks
            setFilterNOS(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef, index)  {
                    if (colDef.headerName == i18n.t('Ratios')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Number_of_stocks')) {
                                element.field = 'nos_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },

            // Number of stocks growth %
            setFilterNOSG(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef, index)  {
                    if (colDef.headerName == i18n.t('Ratios')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Number_of_stocks_growth_percent')) {
                                element.field = 'nosg_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },

            // ROE %
            setFilterROE(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef, index)  {
                    if (colDef.headerName == i18n.t('Ratios')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('roe_percent')) {
                                element.field = 'roe_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },

            // ROA %
            setFilterROA(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef, index)  {
                    if (colDef.headerName == i18n.t('Ratios')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('roa_percent')) {
                                element.field = 'roa_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },

            // Net debt
            setFilterNetDebt(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef, index)  {
                    if (colDef.headerName == i18n.t('Ratios')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Net_debt_percent')) {
                                element.field = 'netDebt_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },

            // Solidity
            setFilterSolidity(category, type) {
                var columnDefs = this.gridOptions.columnApi.columnController.columnDefs;
                columnDefs.forEach(function(colDef, index)  {
                    if (colDef.headerName == i18n.t('Ratios')) {
                        colDef.children.forEach(element => {
                            if (element.headerName == i18n.t('Solidity_percent')) {
                                element.field = 'solidity_' + category + '_' + type;
                                element.cellRenderer = type === 'array' ? 'sparkBar' : undefined;
                            }
                        });
                    }
                });
                this.updateColDefs(columnDefs);
            },






            updateColDefs(columnDefs) {
                this.gridOptions.api.setColumnDefs(columnDefs);
                this.gridOptions.api.refreshCells({ force: true });
                window.mouseOverBind();
            },

            newWatchlist() {
                var selectedNodes = this.gridApi.getSelectedNodes();
                var selectedData = selectedNodes.map(node => node.data);
                const that = this;
                const res = ApiStocks.insertWatchlist({name: this.newWatchlistName, user_id: JSON.parse(localStorage.getItem('user')).user_id});
                that.$store.commit('addWatchlist' , res.data );
                selectedData.map(item=> {
                    that.saveWatchListItem(item,res.data.watchlist_id);
                });
                that.confDlg = false;
                that.dialog = false;
                this.gridApi.deselectAll();
            },

            async doSomeAction(ticker) {
                var stock = this.$store.getters["getAllStocks"].find(s=> s.ticker === ticker);
                await this.loadCompanyDataNeeded(stock);
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
                return `${date.getFullYear()}-${(mm>9 ? '' : '0') + mm}-${(dd>9 ? '' : '0') + dd} ${date.getHours()}:${date.getSeconds()}`;
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

                var filter = this.gridApi.getFilterModel();
                var name = this.screener || `Untitled ${this.getDateString()}`;
                name = name.replace("(unsaved)" , "");
                // this.screener = {name: name , filter: filter}
                // this.filterName = ""
                const payload = {
                    user_id: JSON.parse(localStorage.user).user_id,
                    name: name,
                    filter: JSON.stringify(filter),
                }
                const that = this;
                const res = ApiService.saveUserScreenerFilters(payload);
                that.$store.commit("addScreenerFilters" , {name: res.data.name , filter: JSON.parse(res.data.filter) , screen_id: res.data.screen_id});
                that.screener = {
                    name: res.data.name,
                    filter: JSON.parse(res.data.filter),
                    screen_id: res.data.screen_id
                };
                this.$router.push({name: 'landing-page.screener-detail', params: {id: this.screener.screen_id}});

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

                const response = ApiStocks.insertWatchlistItem(payload);
                that.$store.commit("addWatchlistItem", response.data);
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
                // var filt = this.gridApi.getFilterModel();
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

            navigateScreener(index) {
                var screeners = this.$store.getters['screenerFilters'];
                var length = screeners.length;
                if (length == 0) {
                    this.saveNewFilter(this.$t('My_First_Screener'));
                } else {
                    var screener = screeners[index === length ? index - 1 : index];
                    this.$router.push({name: 'landing-page.screener-detail', params: {id: screener.screen_id}});
                }
            },

            newScreener() {
                let screen_id = this.$route.params.id || -1;

                let temp_filter = this.$store.getters.screenerFilters.find((item) => item.screen_id === screen_id);
                if (temp_filter) {
                    let filter = typeof temp_filter.filter === "object" ? temp_filter.filter : JSON.parse(temp_filter.filter);
                    let screener_name = temp_filter.name;
                    filter.exchange = [];
                    filter.market_cap = {};
                    filter.last_report_date = this.$t('no_filter');
                    filter.next_report_date = this.$t('no_filter');
                    filter.enterprise_q_latest = {};
                    filter.sales_q_array = {};
                    filter.sector_name = [];
                    filter.eps_q_latest = {};
                    filter.solidity_q_latest = {};
                    filter.ev_ebit_q_latest = {};
                    filter.ev_ebitda_q_latest = {};
                    filter.pb_q_latest = {};
                    filter.pe_q_latest = {};
                    filter.ps_q_latest = {};
                    filter.cash_q_latest = {};
                    filter.totalDebt_q_latest = {};
                    filter.salesGrowth_q_latest = {};
                    filter.grossProfit_q_latest = {};
                    filter.grossProfitGrowth_q_latest = {};
                    filter.grossMargin_q_latest = {};
                    filter.grossMarginGrowth_q_latest = {};
                    filter.cogs_q_latest = {};
                    filter.ebitda_q_latest = {};
                    filter.ptp_q_latest = {};
                    filter.ebit_q_latest = {};
                    filter.np_q_latest = {};
                    filter.ebitdaMargin_q_latest = {};
                    filter.ebitdaGrowth_q_latest = {};
                    filter.ebitdaMarginGrowth_q_latest = {};
                    filter.ebitMargin_q_latest = {};
                    filter.ebitGrowth_q_latest = {};
                    filter.ebitMarginGrowth_q_latest = {};
                    filter.npMargin_q_latest = {};
                    filter.npGrowth_q_latest = {};
                    filter.npMarginGrowth_q_latest = {};
                    filter.ia_q_latest = {};
                    filter.ma_q_latest = {};
                    filter.fa_q_latest = {};
                    filter.ta_q_latest = {};
                    filter.ca_q_latest = {};
                    filter.tel_q_latest = {};
                    filter.totalAssets_q_latest = {};
                    filter.totalEquity_q_latest = {};
                    filter.ltd_q_latest = {};
                    filter.std_q_latest = {};
                    filter.sps_q_latest = {};
                    filter.nos_q_latest = {};
                    filter.nosg_q_latest = {}
                    filter.roe_q_latest = {};
                    filter.roa_q_latest = {};
                    filter.netDebt_q_latest = {};

                    const payload = {
                        user_id: JSON.parse(localStorage.user).user_id,
                        filter: JSON.stringify(filter),
                        name: screener_name,
                        screen_id: screen_id
                    };
                    store.commit('updateScreenerFilters', payload);
                }
                this.init_filters();

                this.gridApi.setFilterModel(null);
            },
            updateColumns(columns) {
                var cols = this.gridOptions.columnApi.columnController.columnDefs;

                cols.forEach(function(colDef)  {
                    if (colDef && colDef.children) {
                        colDef.children.forEach(element => {
                            element.hide = true;
                            if (columns.includes(element.headerName)) {
                                element.hide = false;
                            }
                        });
                    }
                });
                this.refreshColumns(cols);
            },
            refreshColumns(cols) {
                let filtered_models = this.gridApi.getFilterModel();
                let name_filter = filtered_models.name ? filtered_models.name : null;
                let ticker_filter = filtered_models.ticker ? filtered_models.ticker : null;

                this.gridOptions.api.setColumnDefs([cols[cols.length - 1]]);
                this.gridOptions.api.setColumnDefs(cols);
                // this.gridOptions.api.refreshView({ force: true });
                this.gridOptions.api.redrawRows();
                window.mouseOverBind();

                var is_screener = this.$store.getters.is_screener;
                if (is_screener) {
                    var columns_array = this.gridOptions.columnApi.getColumnState();
                    var activeColumns_array = [];
                    columns_array.forEach(element => {
                        if (!element.hide) {
                            let colDef = this.gridOptions.columnApi.getColumn(element.colId);
                            let header_name = colDef.colDef.headerName;
                            activeColumns_array.push(header_name);
                        }
                    });

                    let screen_id = this.$store.getters.screen_id;
                    if (screen_id) {
                        screen_id = this.$store.getters.screen_id;
                    } else {
                        if (this.$route.params.id) {
                            screen_id = this.$route.params.id;
                        } else {
                            screen_id = -1;
                        }
                    }

                    let screener_name = "TEST name Screener, not saved";
                    let filter = {};

                    if (this.$store.getters.screenerFilters.find((item) => item.screen_id === screen_id)) {
                        let temp_filter = this.$store.getters.screenerFilters.find((item) => item.screen_id === screen_id);
                        filter = typeof temp_filter.filter === "object" ? temp_filter.filter : JSON.parse(temp_filter.filter);
                        filter.columns = activeColumns_array;
                        screener_name = temp_filter.screen_id == -1 ? "No name Screener, not saved" : temp_filter.name;
                    } else {
                        filter.columns = activeColumns_array
                    }

                    if (exchange_filter.length != 12) { // don't save exchange filter if all exchnages
                        filter.exchange = exchange_filter;  // add exchange filter
                    }

                    let nameFilterInstance = this.gridApi.getFilterInstance('name');
                    nameFilterInstance.setModel(name_filter);
                    nameFilterInstance.onFilterChanged();
                    let tickerFilterInstance = this.gridApi.getFilterInstance('ticker');
                    tickerFilterInstance.setModel(ticker_filter);
                    tickerFilterInstance.onFilterChanged();

                    filter.name = name_filter;
                    filter.ticker = ticker_filter;
                    filter.market_cap = market_cap_filter;
                    filter.last_report_date = last_report_date_filter;
                    filter.next_report_date = next_report_date_filter;
                    filter.enterprise_q_latest = enterprise_filter;
                    filter.sales_q_array = sales_filter;
                    filter.eps_q_latest = eps_filter;
                    filter.solidity_q_latest = solidity_filter;
                    filter.ev_ebit_q_latest = ev_ebit_filter;
                    filter.ev_ebitda_q_latest = ev_ebitda_filter;
                    filter.pb_q_latest = pb_filter;
                    filter.ps_q_latest = ps_filter;
                    filter.pe_q_latest = pe_filter;
                    filter.cash_q_latest = cash_filter;
                    filter.totalDebt_q_latest = totalDebt_filter;
                    filter.sector_name = sector_filter;
                    filter.salesGrowth_q_latest = salesGrowth_filter;
                    filter.grossProfit_q_latest = grossProfit_filter;
                    filter.grossProfitGrowth_q_latest = grossProfitGrowth_filter;
                    filter.grossMargin_q_latest = grossMargin_filter;
                    filter.grossMarginGrowth_q_latest = grossMarginGrowth_filter;
                    filter.cogs_q_latest = cogs_filter;
                    filter.ebitda_q_latest = ebitda_filter;
                    filter.ptp_q_latest = ptp_filter;
                    filter.ebit_q_latest = ebit_filter;
                    filter.np_q_latest = np_filter;
                    filter.ebitdaMargin_q_latest = ebitdaMargin_filter;
                    filter.ebitdaGrowth_q_latest = ebitdaGrowth_filter;
                    filter.ebitdaMarginGrowth_q_latest = ebitdaMarginGrowth_filter;
                    filter.ebitMargin_q_latest = ebitMargin_filter;
                    filter.ebitGrowth_q_latest = ebitGrowth_filter;
                    filter.ebitMarginGrowth_q_latest = ebitMarginGrowth_filter;
                    filter.npMargin_q_latest = npMargin_filter;
                    filter.npGrowth_q_latest = npGrowth_filter;
                    filter.npMarginGrowth_q_latest = npMarginGrowth_filter;
                    filter.ia_q_latest = ia_filter;
                    filter.ma_q_latest = ma_filter;
                    filter.fa_q_latest = fa_filter;
                    filter.ta_q_latest = ta_filter;
                    filter.ca_q_latest = ca_filter;
                    filter.tel_q_latest = tel_filter;
                    filter.totalAssets_q_latest = totalAssets_filter;
                    filter.totalEquity_q_latest = totalEquity_filter;
                    filter.ltd_q_latest = ltd_filter;
                    filter.std_q_latest = std_filter;
                    filter.sps_q_latest = sps_filter;
                    filter.nos_q_latest = nos_filter;
                    filter.nosg_q_latest = nosg_filter;
                    filter.roe_q_latest = roe_filter;
                    filter.roa_q_latest = roa_filter;
                    filter.netDebt_q_latest = netDebt_filter;

                    const payload = {
                        user_id: JSON.parse(localStorage.user).user_id,
                        filter: JSON.stringify(filter),
                        name: screener_name,
                        screen_id: screen_id
                    };

                    store.commit('updateScreenerFilters', payload);
                }
                this.gridApi.onFilterChanged();
            },

            // Add columns Btn
            setFilterAddColumn(list) {
                this.updateColumns(list);
            },



        },
        computed: {
            ...mapGetters({
                screenerFilters: 'screenerFilters',
            }),
            init_name: {
                get() {
                    return this.filters.name;
                },
                set(val) {
                    this.name = val;
                }
            },
            canUpdateColumn() {
                return this.mounted && this.screenerIdChanged;
            },
            filters() {
                var screen_id = this.$route.params.id;
                if (this.id !== screen_id) {
                    this.screenerIdChanged = true;
                }
                this.id = screen_id;
                if (screen_id) {
                    return {...this.$store.getters.screenerFilters.find((item) => item.screen_id === screen_id)};
                } else {
                    if (this.$store.getters.screenerFilters.find((item) => item.screen_id === -1)) {
                        return {...this.$store.getters.screenerFilters.find((item) => item.screen_id === -1)};
                    } else {
                        return {
                            name: "No name Screener, not saved"
                        };
                    }
                }
            },
            stocks() {
                return this.$store.getters.getAllStocks;
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
                // var filter = this.gridApi.getFilterModel()
                // var screener = this.screener.filter || {}
                // console.log(filter,screener.filter)
                // return filter == screener
            },
            // screeners() {
            //     return this.$store.getters["screenerFilters"];
            // },
            watchlists() {
                var items = [];
                this.$store.getters.getWatchlists.map(item => {
                    items.push(item.name);
                })
                return items;
            },
            watchlistItemsByCategory() {
                return watchlist_id => {
                    var temp_array = this.$store.getters.getWatchlistItems;
                    var items = temp_array.filter(
                        item => item.watchlist_id === watchlist_id
                    );
                    if (items === undefined) {
                        return [];
                    }
                    var temp = [];
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
            canUpdateColumn(val) {
                if (val) {
                    var is_screener = this.$store.getters.is_screener;
                    if (is_screener) {
                        console.log('is Screener---------------')
                        var columns_array = this.gridOptions.columnApi.getColumnState();
                        var activeColumns_array = [];
                        columns_array.forEach(element => {
                            if (!element.hide) {
                                let colDef = this.gridOptions.columnApi.getColumn(element.colId);
                                let header_name = colDef.colDef.headerName;
                                activeColumns_array.push(header_name);
                            }
                        });
                        let screen_id = this.$store.getters.screen_id;
                        if (screen_id) {
                            screen_id = this.$store.getters.screen_id;
                        } else {
                            if (this.$route.params.id) {
                                screen_id = this.$route.params.id;
                            } else {
                                screen_id = -1;
                            }
                        }

                        let screener_name = "No name Screener, not saved";
                        let filter = this.gridApi.getFilterModel();
                        let name_filter = filter.name? filter.name : null;   // save name filter before go to other saved screener
                        let ticker_filter = filter.ticker ? filter.ticker : null; // save filter filter before go to other saved screener

                        if (this.$store.getters.screenerFilters.find((item) => item.screen_id === screen_id)) {
                            let temp_filter = this.$store.getters.screenerFilters.find((item) => item.screen_id === screen_id);
                            filter = typeof temp_filter.filter === "object" ? temp_filter.filter : JSON.parse(temp_filter.filter);
                            filter.columns = activeColumns_array;
                            screener_name = temp_filter.screen_id == -1 ? "No name Screener, not saved" : temp_filter.name;
                        } else {
                            filter.columns = activeColumns_array
                        }

                        if (exchange_filter.length != 12) { // don't save exchange filter if all exchnages
                            filter.exchange = exchange_filter;  // add exchange filter
                        }
                        filter.name = name_filter;
                        filter.ticker = ticker_filter;
                        filter.market_cap = market_cap_filter;
                        filter.last_report_date = last_report_date_filter;
                        filter.next_report_date = next_report_date_filter;
                        filter.enterprise_q_latest = enterprise_filter;
                        filter.sales_q_array = sales_filter;
                        filter.eps_q_latest = eps_filter;
                        filter.solidity_q_latest = solidity_filter;
                        filter.ev_ebit_q_latest = ev_ebit_filter;
                        filter.ev_ebitda_q_latest = ev_ebitda_filter;
                        filter.pb_q_latest = pb_filter;
                        filter.ps_q_latest = ps_filter;
                        filter.pe_q_latest = pe_filter;
                        filter.cash_q_latest = cash_filter;
                        filter.totalDebt_q_latest = totalDebt_filter;
                        filter.sector_name = sector_filter;
                        filter.salesGrowth_q_latest = salesGrowth_filter;
                        filter.grossProfit_q_latest = grossProfit_filter;
                        filter.grossProfitGrowth_q_latest = grossProfitGrowth_filter;
                        filter.grossMargin_q_latest = grossMargin_filter;
                        filter.grossMarginGrowth_q_latest = grossMarginGrowth_filter;
                        filter.cogs_q_latest = cogs_filter;
                        filter.ebitda_q_latest = ebitda_filter;
                        filter.ptp_q_latest = ptp_filter;
                        filter.ebit_q_latest = ebit_filter;
                        filter.np_q_latest = np_filter;
                        filter.ebitdaMargin_q_latest = ebitdaMargin_filter;
                        filter.ebitdaGrowth_q_latest = ebitdaGrowth_filter;
                        filter.ebitdaMarginGrowth_q_latest = ebitdaMarginGrowth_filter;
                        filter.ebitMargin_q_latest = ebitMargin_filter;
                        filter.ebitGrowth_q_latest = ebitGrowth_filter;
                        filter.ebitMarginGrowth_q_latest = ebitMarginGrowth_filter;
                        filter.npMargin_q_latest = npMargin_filter;
                        filter.npGrowth_q_latest = npGrowth_filter;
                        filter.npMarginGrowth_q_latest = npMarginGrowth_filter;
                        filter.ia_q_latest = ia_filter;
                        filter.ma_q_latest = ma_filter;
                        filter.fa_q_latest = fa_filter;
                        filter.ta_q_latest = ta_filter;
                        filter.ca_q_latest = ca_filter;
                        filter.tel_q_latest = tel_filter;
                        filter.totalAssets_q_latest = totalAssets_filter;
                        filter.totalEquity_q_latest = totalEquity_filter;
                        filter.ltd_q_latest = ltd_filter;
                        filter.std_q_latest = std_filter;
                        filter.sps_q_latest = sps_filter;
                        filter.nos_q_latest = nos_filter;
                        filter.nosg_q_latest = nosg_filter;
                        filter.roe_q_latest = roe_filter;
                        filter.roa_q_latest = roa_filter;
                        filter.netDebt_q_latest = netDebt_filter;

                        const payload = {
                            user_id: JSON.parse(localStorage.user).user_id,
                            filter: JSON.stringify(filter),
                            name: screener_name,
                            screen_id: screen_id
                        };
                        store.commit('updateScreenerFilters', payload);
                    }

                    this.gridApi.onFilterChanged();
                    if (this.filters.filter) {
                        const filter = typeof this.filters.filter === "object" ? this.filters.filter : JSON.parse(this.filters.filter);
                        if (filter.columns) {
                            this.updateColumns(filter.columns);
                        } else {
                            this.updateColumns(this.defaultColumns);
                        }

                        let saved_filters = typeof this.filters.filter === "object" ? this.filters.filter : JSON.parse(this.filters.filter);
                        if (saved_filters.name) {
                            let nameFilterInstance = this.gridApi.getFilterInstance('name');
                            let name_filter = saved_filters.name;
                            nameFilterInstance.setModel(name_filter);
                            nameFilterInstance.onFilterChanged();
                        }
                        if (saved_filters.ticker) {
                            let tickerFilterInstance = this.gridApi.getFilterInstance('ticker');
                            let ticker_filter = saved_filters.ticker;
                            tickerFilterInstance.setModel(ticker_filter);
                            tickerFilterInstance.onFilterChanged();
                        }
                    }
                    else {
                        this.updateColumns(this.defaultColumns);
                    }
                    this.screenerIdChanged = false;

                    let vuex_id = this.$route.params.id ? this.$route.params.id : -1
                    store.commit('setScreenID', vuex_id); // save the old screen_id to VUEX
                    if (is_screener === false) {
                        store.commit('setIsScreener', true);   // recognize whether switch between the saved screeners or other views
                    }
                    this.init_filters();

                    // this.gridApi.setFilterModel(JSON.parse(this.filters.filter))
                }
            },
            filters: function(newVal, oldVal) {
                // if (newVal.filter) {
                //     let filter = typeof newVal.filter === "object" ? newVal.filter : JSON.parse(newVal.filter);
                //     this.gridApi.setFilterModel(filter);
                //     // if (JSON.parse(newVal.filter).columns) {
                //     //     this.updateColumns(JSON.parse(newVal.filter).columns, true)
                //     // }
                // } else {
                //     this.gridApi.setFilterModel(null);
                // }
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
                var selectedNodes = this.gridApi.getSelectedNodes();
                var selectedData = selectedNodes.map(node => node.data);
                var existWatchList = this.$store.getters.getWatchlists.find(item=>item.name === this.watchlists[val]);
                if (this.watchlists[val]) {
                    var oldItems = this.watchlistItemsByCategory(existWatchList.watchlist_id);
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



    window.sortAndFilter = function sortAndFilter(
        allOfTheData,
        sortModel,
        filterModel
    ) {
        return sortData(sortModel, filterData(filterModel, allOfTheData));
    };

    window.sortData = function sortData(sortModel, data) {
        var sortPresent = sortModel && sortModel.length > 0;
        if (!sortPresent) {
            return data;
        }
        var resultOfSort = data.slice();
        resultOfSort.sort(function (a, b) {
            for (var k = 0; k < sortModel.length; k++) {
                var sortColModel = sortModel[k];
                var valueA = a[sortColModel.colId];
                var valueB = b[sortColModel.colId];
                if (valueA == valueB) {
                    continue;
                }
                var sortDirection = sortColModel.sort === 'asc' ? 1 : -1;
                if (valueA > valueB) {
                    return sortDirection;
                } else {
                    return sortDirection * -1;
                }
            }
            return 0;
        });
        return resultOfSort;
    };


    window.filterData = function filterData(filterModel, data) {
        var resultOfFilter = [];
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            if (filterModel.name) {  // name filter
                var name = item.name.toLowerCase();
                var allowedName = filterModel.name.filter;
                if (!name.includes(allowedName.toLowerCase())) {
                    continue;
                }
            }
            if (filterModel.ticker) {  // ticker filter
                var ticker = item.ticker.toLowerCase();
                var allowedTicker = filterModel.ticker.filter;
                if (!ticker.includes(allowedTicker.toLowerCase())) {
                    continue;
                }
            }
            if (exchange_filter.length > 0) {  // exchange filter
                if (!exchange_filter.includes(item.exchange)) {
                    continue;
                }
            }
            if (sector_filter.length > 0) {  // sector filter
                let sector_array = sector_filter.filter(sector => sector.id == item.sector_id);
                if (sector_array.length == 0) {
                    continue;
                }
            }
            var next_date_data = new Date(item.next_report_date);
            var today_date = new Date(Date.now());
            if (next_report_date_filter == i18n.t('within_thirty_days')) {
                var days_30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                if (!moment(next_date_data).isBefore(days_30) && moment(next_date_data).isAfter(today_date)) {
                    continue;
                }
            } else if (next_report_date_filter == i18n.t('within_seven_days')) {
                var days_7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                if (!moment(next_date_data).isBefore(days_7) && moment(next_date_data).isAfter(today_date)) {
                    continue;
                }
            } else if (next_report_date_filter == i18n.t('today')) {
                if (!moment(next_date_data).isSame(today_date, 'day')) {
                    continue;
                }
            }
            var last_date_data = new Date(item.last_report_date);
            var yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
            if (last_report_date_filter == i18n.t('thirty_days_ago')) {
                var days_30_ago = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                if (!moment(last_date_data).isAfter(days_30_ago) && moment(last_date_data).isBefore(yesterday)) {
                    continue;
                }
            } else if (last_report_date_filter == i18n.t('seven_days_ago')) {
                var days_7_ago = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                if (!moment(last_date_data).isAfter(days_7_ago) && moment(last_date_data).isBefore(yesterday)) {
                    continue;
                }
            } else if (last_report_date_filter == i18n.t('yesterday')) {
                if (!moment(last_date_data).isSame(yesterday)) {
                    continue;
                }
            }

            if (sales_filter.min) {
                if (sales_type.includes('array')) {
                    if (item[sales_type]) {
                        let latest_item = item[sales_type].slice(-1)[0]; //get the latest item of array
                        if (sales_filter.min > latest_item || sales_filter.max < latest_item) {
                            continue;
                        }
                    } else {
                        continue;
                    }
                } else {
                    if (sales_filter.min > item[sales_type] || sales_filter.max < item[sales_type] || !item[sales_type]) {
                        continue;
                    }
                }
            }

            if (enterprise_filter.min) {
                if (enterprise_type.includes('array')) {
                    if (item[enterprise_type]) {
                        let latest_item = item[enterprise_type].slice(-1)[0]; //get the latest item of array
                        if (enterprise_filter.min > latest_item || enterprise_filter.max < latest_item) {
                            continue;
                        }
                    } else {
                        continue;
                    }
                } else {
                    if (enterprise_filter.min > item[enterprise_type] || enterprise_filter.max < item[enterprise_type] || !item[enterprise_type]) {
                        continue;
                    }
                }
            }

            if(market_cap_filter.min) {
                if(market_cap_filter.min > item['market_cap'] || market_cap_filter.max < item['market_cap'] || !item['market_cap']) {
                    continue;
                }
            }

            if(pb_filter.min) {
                if(pb_filter.min > item['pb_q_latest'] || pb_filter.max < item['pb_q_latest'] || !item['pb_q_latest']) {
                    continue;
                }
            }

            if(pe_filter.min) {
                if(pe_filter.min > item['pe_q_latest'] || pe_filter.max < item['pe_q_latest'] || !item['pe_q_latest']) {
                    continue;
                }
            }

            if(ps_filter.min) {
                if(ps_filter.min > item['ps_q_latest'] || ps_filter.max < item['ps_q_latest'] || !item['ps_q_latest']) {
                    continue;
                }
            }

            resultOfFilter.push(item);
        }
        // mouseOverBind();
        const researchSumElement = document.getElementById('research_sum');
        researchSumElement.innerHTML = resultOfFilter.length;
        return resultOfFilter;
    };




    /// Exchange filter
    var exchange_filter = [];
    function FilterExchangeComp() {
    }

    FilterExchangeComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('all_exchanges') + ' </span>' +
            '</div>';
    };

    function setFilteredExchangeName(list, that) {
        var text_string;
        var innerHtml = '';
        if (list.length > 0 && list.length != 12) {
            text_string = list.map(exchange => exchange).join(', ').substring(0, 100);
            innerHtml = '<div class="all-excahnges-label" style="opacity: 1;">' +
                    '<span>' + (text_string.length < 100 ? text_string : (text_string + '...')) + '</span>' +
                    '</div>';
        } else if (list.length == 0) {
            innerHtml =
                '<div class="all-excahnges-label">' +
                '<span> ' + i18n.t('no_exchange') + ' </span>' +
                '</div>';
        } else {
            innerHtml =
                '<div class="all-excahnges-label">' +
                '<span> ' + i18n.t('all_exchanges') + ' </span>' +
                '</div>';
        }
        that.eGui.innerHTML = innerHtml;
    }
    FilterExchangeComp.prototype.onParentModelChanged = function(params,aa) {
        if (aa && aa.column.colId == 'exchange' && !aa.min) {
            if (aa[0] && !aa[0].children) {
                exchange_filter = [];
                for (var i=0; i<12; i++) {
                    if (aa[i]) {
                        exchange_filter.push(aa[i]);
                    }
                }
                setFilteredExchangeName(exchange_filter, this);
            }
        }
    }
    FilterExchangeComp.prototype.getGui = function() {
        return this.eGui;
    };



    /// Sector Filter
    var sector_filter = []
    function FilterSectorComp() {
    }

    FilterSectorComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_sectors') + ' </span>' +
            '</div>';
    };

    function setFilteredSectorName(list, that) {
        var text_string;
        var innerHtml = '';
        if (list.length) {
            text_string = list.map(sector => sector.name).join(', ').substring(0, 100);
            innerHtml = '<div class="all-excahnges-label" style="opacity: 1;">' +
                    '<span>' + (text_string.length < 100 ? text_string : (text_string + '...')) + '</span>' +
                    '</div>';
        } else {
            innerHtml =
                '<div class="all-excahnges-label">' +
                '<span> ' + i18n.t('no_sectors') + ' </span>' +
                '</div>';
        }
        that.eGui.innerHTML = innerHtml;
    }
    FilterSectorComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'sector_name') {
            if (value[0] && value[0].children) {
                sector_filter = [];
                for (var i=0; i<76; i++) {
                    if (value[i]) {
                        sector_filter.push(value[i]);
                    }
                }
                setFilteredSectorName(sector_filter, this);
            } else {
                if (value.is_sector) {
                    sector_filter = [];
                    setFilteredSectorName([], this);
                }
            }
        }

    }
    FilterSectorComp.prototype.getGui = function() {
        return this.eGui;
    };







    /// Last Report Date
    let last_report_date_filter = i18n.t('no_filter');
    function FilterLastReportDateComp() {
    }

    FilterLastReportDateComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredLastReportDateName(value, that) {
        var text_string = i18n.t('no_filter');
        if (value) text_string = value
        if (text_string == i18n.t('no_filter')) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + text_string + '</span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + text_string + '</span>' +
                '</div>';
        }
    }
    FilterLastReportDateComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'last_report_date' && value.last_report_date_filter) {
            last_report_date_filter = value.last_report_date_filter;
            setFilteredLastReportDateName(value.last_report_date_filter, this);
        }
    }
    FilterLastReportDateComp.prototype.getGui = function() {
        return this.eGui;
    };




    /// Next Report Date
    var next_report_date_filter = i18n.t('no_filter');
    function FilterNextReportDateComp() {
    }

    FilterNextReportDateComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredNextReportDateName(value, that) {
        var text_string = i18n.t('no_filter');
        if (value) text_string = value;
        if (text_string == i18n.t('no_filter')) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + text_string + '</span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + text_string + '</span>' +
                '</div>';
        }
    }
    FilterNextReportDateComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'next_report_date' && value.next_report_date_filter) {
            next_report_date_filter = value.next_report_date_filter;
            setFilteredNextReportDateName(value.next_report_date_filter, this);
        } else {
            setFilteredNextReportDateName(next_report_date_filter, this);
        }
    }
    FilterNextReportDateComp.prototype.getGui = function() {
        return this.eGui;
    };







    // Filter Market cap
    var market_cap_filter = {};
    function FilterMarketCapComp() {
    }
    FilterMarketCapComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('Market_cap') + ' </span>' +
            '</div>';
    };
    function setFilteredMarketCapName(value, that) {
        if (value.min == value.init_from && value.max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterMarketCapComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'market_cap' && value.max) {
            market_cap_filter.min = value.min;
            market_cap_filter.max = value.max;
            setFilteredMarketCapName(value, this);
        }
    }
    FilterMarketCapComp.prototype.getGui = function() {
        return this.eGui;
    };



    // Filter Solidity
    var solidity_filter = {};
    function FilterSolidityComp() {
    }

    FilterSolidityComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredSolidityName(value, that) {
        if (value.solidity_min == value.init_from && value.solidity_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterSolidityComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'solidity_q_latest' && value.solidity_min) {
            solidity_filter.min = value.solidity_min;
            solidity_filter.max = value.solidity_max;
            setFilteredSolidityName(value, this);
        }
    }
    FilterSolidityComp.prototype.getGui = function() {
        return this.eGui;
    };




        // Filter EnterpriseValue
    var enterprise_filter = {};
    var saved_enterprise_filter = {};
    function FilterEnterpriseValueComp() {
    };
    FilterEnterpriseValueComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setfilteredEnterpriseValueName(value, that) {
        if (value.enterprise_min == value.init_from && value.enterprise_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterEnterpriseValueComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'enterprise_q_latest' && value.enterprise_min) {
            enterprise_filter.min = value.enterprise_min;
            enterprise_filter.max = value.enterprise_max;
            saved_enterprise_filter = value;
            setfilteredEnterpriseValueName(value, this);
        } else {
            setfilteredEnterpriseValueName(saved_enterprise_filter, this);
        }
    }
    FilterEnterpriseValueComp.prototype.getGui = function() {
        return this.eGui;
    };



    // Filter Cash
    var cash_filter = {};
    function FilterCashComp() {
    };
    FilterCashComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setfilteredCashName(value, that) {
        if (value.cash_min == value.init_from && value.cash_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterCashComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'cash_q_latest' && value.cash_min) {
            cash_filter.min = value.cash_min;
            cash_filter.max = value.cash_max;
            setfilteredCashName(value, this);
        }
    }
    FilterCashComp.prototype.getGui = function() {
        return this.eGui;
    };



    // Filter Total Debt
    var totalDebt_filter = {};
    function FilterTotalDebtComp() {
    };
    FilterTotalDebtComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setfilteredTotalDebtName(value, that) {
        if (value.totalDebt_min == value.init_from && value.totalDebt_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterTotalDebtComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'totalDebt_q_latest' && value.totalDebt_min) {
            totalDebt_filter.min = value.totalDebt_min;
            totalDebt_filter.max = value.totalDebt_max;
            setfilteredTotalDebtName(value, this);
        }
    }
    FilterTotalDebtComp.prototype.getGui = function() {
        return this.eGui;
    };



    // Filter EPS
    var eps_filter = {};
    function FilterEPSComp() {
    };
    FilterEPSComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setfilteredEPSName(value, that) {
        if (value.eps_min == value.init_from && value.eps_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterEPSComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'eps_q_latest' && value.eps_min) {
            eps_filter.min = value.eps_min;
            eps_filter.max = value.eps_max;
            setfilteredEPSName(value, this);
        }
    }
    FilterEPSComp.prototype.getGui = function() {
        return this.eGui;
    };




    // Filter EV/EBIT
    var ev_ebit_filter = {};
    function FilterEVEBITComp() {
    }
    FilterEVEBITComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('EV_EBIT') + ' </span>' +
            '</div>';
    };
    function setfilteredEVEBITName(value, that) {
        if (value.ev_ebit_min == value.init_from && value.ev_ebit_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterEVEBITComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ev_ebit_q_latest' && value.ev_ebit_min) {
            ev_ebit_filter.min = value.ev_ebit_min;
            ev_ebit_filter.max = value.ev_ebit_max;
            setfilteredEVEBITName(value, this)
        }
    }
    FilterEVEBITComp.prototype.getGui = function() {
        return this.eGui;
    };





    // Filter EV/EBITDA
    var ev_ebitda_filter = {};
    function FilterEVEBITDAComp() {
    }
    FilterEVEBITDAComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setfilteredEVEBITDAName(value, that) {
        if (value.ev_ebitda_min == value.init_from && value.ev_ebitda_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterEVEBITDAComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ev_ebitda_q_latest' && value.ev_ebitda_min) {
            ev_ebitda_filter.min = value.ev_ebitda_min;
            ev_ebitda_filter.max = value.ev_ebitda_max;
            setfilteredEVEBITDAName(value, this);
        }
    }
    FilterEVEBITDAComp.prototype.getGui = function() {
        return this.eGui;
    };





    // Filter P/B
    var pb_filter = {};
    function FilterPBComp() {
    }
    FilterPBComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setfilteredPBName(value, that) {
        if (value.pb_min == value.init_from && value.pb_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterPBComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'pb_q_latest' && value.pb_min) {
            pb_filter.min = value.pb_min;
            pb_filter.max = value.pb_max;
            setfilteredPBName(value, this);
        }
    }
    FilterPBComp.prototype.getGui = function() {
        return this.eGui;
    };



        // Filter P/E
    var pe_filter = {}
    function FilterPEComp() {
    }
    FilterPEComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setfilteredPEName(value, that) {
        if (value.pe_min == value.init_from && value.pe_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterPEComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'pe_q_latest' && value.pe_min) {
            pe_filter.min = value.pe_min;
            pe_filter.max = value.pe_max;
            setfilteredPEName(value, this);
        }
    }
    FilterPEComp.prototype.getGui = function() {
        return this.eGui;
    };




    // Filter P/S
    var ps_filter = {};
    function FilterPSComp() {
    };
    FilterPSComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('P_S') + ' </span>' +
            '</div>';
    };
    function setfilteredPSName(value, that) {
        if (value.ps_min == value.init_from && value.ps_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterPSComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ps_q_latest' && value.ps_min) {
            ps_filter.min = value.ps_min;
            ps_filter.max = value.ps_max;
            setfilteredPSName(value, this);
        }
    }
    FilterPSComp.prototype.getGui = function() {
        return this.eGui;
    };




    // Filter Sales
    var sales_filter = {};
    var saved_sales_filter = null;
    function FilterSalesComp() {
    };
    FilterSalesComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setfilteredSalesName(value, that) {
        if (value.sales_min == value.init_from && value.sales_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterSalesComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'sales_q_array' && value.sales_max) {
            sales_filter.min = value.sales_min;
            sales_filter.max = value.sales_max;
            saved_sales_filter = value;
            setfilteredSalesName(value, this);
        } else if (saved_sales_filter) {
            setfilteredSalesName(saved_sales_filter, this);
        }
    }
    FilterSalesComp.prototype.getGui = function() {
        return this.eGui;
    };


    // Filter Sales
    var salesGrowth_filter = {};
    function FilterSalesGrowthComp() {
    };
    FilterSalesGrowthComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setfilteredSalesGrowthName(value, that) {
        if (value.salesGrowth_min == value.init_from && value.salesGrowth_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterSalesGrowthComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'salesGrowth_q_latest' && value.salesGrowth_max) {
            salesGrowth_filter.min = value.salesGrowth_min;
            salesGrowth_filter.max = value.salesGrowth_max;
            setfilteredSalesGrowthName(value, this);
        }
    }
    FilterSalesGrowthComp.prototype.getGui = function() {
        return this.eGui;
    };




    // Filter Gross Profit
    var grossProfit_filter = {};
    function FilterGrossProfitComp() {
    };
    FilterGrossProfitComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setfilteredGrossProfitName(value, that) {
        if (value.grossProfit_min == value.init_from && value.grossProfit_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterGrossProfitComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'grossProfit_q_latest' && value.grossProfit_min) {
            grossProfit_filter.min = value.grossProfit_min;
            grossProfit_filter.max = value.grossProfit_max;
            setfilteredGrossProfitName(value, this);
        }
    }
    FilterGrossProfitComp.prototype.getGui = function() {
        return this.eGui;
    };




        // Filter Gross Profit %
    var grossProfitGrowth_filter = {};
    function FilterGrossProfitGrowthComp() {
    };
    FilterGrossProfitGrowthComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setfilteredGrossProfitGrowthName(value, that) {
        if (value.grossProfitGrowth_min == value.init_from && value.grossProfitGrowth_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterGrossProfitGrowthComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'grossProfitGrowth_q_latest' && value.grossProfitGrowth_min) {
            grossProfitGrowth_filter.min = value.grossProfitGrowth_min;
            grossProfitGrowth_filter.max = value.grossProfitGrowth_max;
            setfilteredGrossProfitGrowthName(value, this);
        }
    }
    FilterGrossProfitGrowthComp.prototype.getGui = function() {
        return this.eGui;
    };



    // Filter PTP
    var ptp_filter = {};
    function FilterPTPComp() {
    }
    FilterPTPComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setfilteredPTPName(value, that) {
        if (value.ptp_min == value.init_from && value.ptp_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterPTPComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ptp_q_latest' && value.ptp_min) {
            ptp_filter.min = value.ptp_min;
            ptp_filter.max = value.ptp_max;
            setfilteredPTPName(value, this);
        }
    }
    FilterPTPComp.prototype.getGui = function() {
        return this.eGui;
    };



    // Filter Gross Margin %
    var grossMargin_filter = {};
    function FilterGrossMarginComp() {
    }
    FilterGrossMarginComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setfilteredGrossMarginName(value, that) {
        if (value.grossMargin_min == value.init_from && value.grossMargin_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterGrossMarginComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'grossMargin_q_latest' && value.grossMargin_min) {
            grossMargin_filter.min = value.grossMargin_min;
            grossMargin_filter.max = value.grossMargin_max;
            setfilteredGrossMarginName(value, this);
        }
    }
    FilterGrossMarginComp.prototype.getGui = function() {
        return this.eGui;
    };



    // Filter Gross Margin Growth %
    var grossMarginGrowth_filter = {};
    function FilterGrossMarginGrowthComp() {
    }
    FilterGrossMarginGrowthComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setfilteredGrossMarginGrowthName(value, that) {
        if (value.grossMarginGrowth_min == value.init_from && value.grossMarginGrowth_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterGrossMarginGrowthComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'grossMarginGrowth_q_latest' && value.grossMarginGrowth_min) {
            grossMarginGrowth_filter.min = value.grossMarginGrowth_min;
            grossMarginGrowth_filter.max = value.grossMarginGrowth_max;
            setfilteredGrossMarginGrowthName(value, this);
        }
    }
    FilterGrossMarginGrowthComp.prototype.getGui = function() {
        return this.eGui;
    };


    // COGS
    var cogs_filter = {};
    function FilterCogsComp() {
    }
    FilterCogsComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setfilteredCogsName(value, that) {
        if (value.cogs_min == value.init_from && value.cogs_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterCogsComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'cogs_q_latest' && value.cogs_min) {
            cogs_filter.min = value.cogs_min;
            cogs_filter.max = value.cogs_max;
            setfilteredCogsName(value, this);
        }
    }
    FilterCogsComp.prototype.getGui = function() {
        return this.eGui;
    };



    // Filter Ebitda
    var ebitda_filter = {};
    function FilterEbitdaComp() {
    }
    FilterEbitdaComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredEbitdaName(value, that) {
        if (value.ebitda_min == value.init_from && value.ebitda_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterEbitdaComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ebitda_q_latest' && value.ebitda_min) {
            ebitda_filter.min = value.ebitda_min;
            ebitda_filter.max = value.ebitda_max;
            setFilteredEbitdaName(value, this);
        }
    }
    FilterEbitdaComp.prototype.getGui = function() {
        return this.eGui;
    };


    // Filter Ebitda Growth
    var ebitdaGrowth_filter = {};
    function FilterEbitdaGrowthComp() {
    }
    FilterEbitdaGrowthComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredEbitdaGrowthName(value, that) {
        if (value.ebitdaGrowth_min == value.init_from && value.ebitdaGrowth_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterEbitdaGrowthComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ebitdaGrowth_q_latest' && value.ebitdaGrowth_min) {
            ebitdaGrowth_filter.min = value.ebitdaGrowth_min;
            ebitdaGrowth_filter.max = value.ebitdaGrowth_max;
            setFilteredEbitdaGrowthName(value, this);
        }
    }
    FilterEbitdaGrowthComp.prototype.getGui = function() {
        return this.eGui;
    };


    // Filter Ebitda Margin
    var ebitdaMargin_filter = {};
    function FilterEbitdaMarginComp() {
    }
    FilterEbitdaMarginComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredEbitdaMarginName(value, that) {
        if (value.ebitdaMargin_min == value.init_from && value.ebitdaMargin_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterEbitdaMarginComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ebitdaMargin_q_latest' && value.ebitdaMargin_min) {
            ebitdaMargin_filter.min = value.ebitdaMargin_min;
            ebitdaMargin_filter.max = value.ebitdaMargin_max;
            setFilteredEbitdaMarginName(value, this);
        }
    }
    FilterEbitdaMarginComp.prototype.getGui = function() {
        return this.eGui;
    };


    // Filter Ebitda Margin Growth
    var ebitdaMarginGrowth_filter = {};
    function FilterEbitdaMarginGrowthComp() {
    }
    FilterEbitdaMarginGrowthComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredEbitdaMarginGrowthName(value, that) {
        if (value.ebitdaMarginGrowth_min == value.init_from && value.ebitdaMarginGrowth_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterEbitdaMarginGrowthComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ebitdaMarginGrowth_q_latest' && value.ebitdaMarginGrowth_min) {
            ebitdaMarginGrowth_filter.min = value.ebitdaMarginGrowth_min;
            ebitdaMarginGrowth_filter.max = value.ebitdaMarginGrowth_max;
            setFilteredEbitdaMarginGrowthName(value, this);
        }
    }
    FilterEbitdaMarginGrowthComp.prototype.getGui = function() {
        return this.eGui;
    };




    // Filter Ebit
    var ebit_filter = {};
    function FilterEbitComp() {
    };
    FilterEbitComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredEbitName(value, that) {
        if (value.ebit_min == value.init_from && value.ebit_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterEbitComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ebit_q_latest' && value.ebit_min) {
            ebit_filter.min = value.ebit_min;
            ebit_filter.max = value.ebit_max;
            setFilteredEbitName(value, this);
        }
    }
    FilterEbitComp.prototype.getGui = function() {
        return this.eGui;
    };

    // Filter Ebit Margin
    var ebitMargin_filter = {};
    function FilterEbitMarginComp() {
    };
    FilterEbitMarginComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredEbitMarginName(value, that) {
        if (value.ebitMargin_min == value.init_from && value.ebitMargin_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterEbitMarginComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ebitMargin_q_latest' && value.ebitMargin_min) {
            ebitMargin_filter.min = value.ebitMargin_min;
            ebitMargin_filter.max = value.ebitMargin_max;
            setFilteredEbitMarginName(value, this);
        }
    }
    FilterEbitMarginComp.prototype.getGui = function() {
        return this.eGui;
    };

    // Filter Ebit Growth
    var ebitGrowth_filter = {};
    function FilterEbitGrowthComp() {
    };
    FilterEbitGrowthComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredEbitGrowthName(value, that) {
        if (value.ebitGrowth_min == value.init_from && value.ebitGrowth_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterEbitGrowthComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ebitGrowth_q_latest' && value.ebitGrowth_min) {
            ebitGrowth_filter.min = value.ebitGrowth_min;
            ebitGrowth_filter.max = value.ebitGrowth_max;
            setFilteredEbitGrowthName(value, this);
        }
    }
    FilterEbitGrowthComp.prototype.getGui = function() {
        return this.eGui;
    };

    // Filter Ebit Margin Growth
    var ebitMarginGrowth_filter = {};
    function FilterEbitMarginGrowthComp() {
    };
    FilterEbitMarginGrowthComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredEbitMarginGrowthName(value, that) {
        if (value.ebitMarginGrowth_min == value.init_from && value.ebitMarginGrowth_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterEbitMarginGrowthComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ebitMarginGrowth_q_latest' && value.ebitMarginGrowth_min) {
            ebitMarginGrowth_filter.min = value.ebitMarginGrowth_min;
            ebitMarginGrowth_filter.max = value.ebitMarginGrowth_max;
            setFilteredEbitMarginGrowthName(value, this);
        }
    }
    FilterEbitMarginGrowthComp.prototype.getGui = function() {
        return this.eGui;
    };



    // Filter Profit (NP)
    var np_filter = {};
    function FilterNPComp() {
    }
    FilterNPComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredNPName(value, that) {
        if (value.np_min == value.init_from && value.np_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterNPComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'np_q_latest' && value.np_min) {
            np_filter.min = value.np_min;
            np_filter.max = value.np_max;
            setFilteredNPName(value, this);
        }
    }
    FilterNPComp.prototype.getGui = function() {
        return this.eGui;
    };

    // Filter Profit Margin
    var npMargin_filter = {};
    function FilterNPMarginComp() {
    }
    FilterNPMarginComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredNPMarginName(value, that) {
        if (value.npMargin_min == value.init_from && value.npMargin_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterNPMarginComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'npMargin_q_latest' && value.npMargin_min) {
            npMargin_filter.min = value.npMargin_min;
            npMargin_filter.max = value.npMargin_max;
            setFilteredNPMarginName(value, this);
        }
    }
    FilterNPMarginComp.prototype.getGui = function() {
        return this.eGui;
    };

    // Filter Profit Growth
    var npGrowth_filter = {};
    function FilterNPGrowthComp() {
    }
    FilterNPGrowthComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredNPGrowthName(value, that) {
        if (value.npGrowth_min == value.init_from && value.npGrowth_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterNPGrowthComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'npGrowth_q_latest' && value.npGrowth_min) {
            npGrowth_filter.min = value.npGrowth_min;
            npGrowth_filter.max = value.npGrowth_max;
            setFilteredNPGrowthName(value, this);
        }
    }
    FilterNPGrowthComp.prototype.getGui = function() {
        return this.eGui;
    };


    // Filter Profit Margin Growth
    var npMarginGrowth_filter = {};
    function FilterNPMarginGrowthComp() {
    }
    FilterNPMarginGrowthComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredNPMarginGrowthName(value, that) {
        if (value.npMarginGrowth_min == value.init_from && value.npMarginGrowth_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterNPMarginGrowthComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'npMarginGrowth_q_latest' && value.npMarginGrowth_min) {
            npMarginGrowth_filter.min = value.npMarginGrowth_min;
            npMarginGrowth_filter.max = value.npMarginGrowth_max;
            setFilteredNPMarginGrowthName(value, this);
        }
    }
    FilterNPMarginGrowthComp.prototype.getGui = function() {
        return this.eGui;
    };

    // Filter Intangable Assets
    var ia_filter = {};
    function FilterIntangableAssetsComp() {
    }
    FilterIntangableAssetsComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredIAName(value, that) {
        if (value.ia_min == value.init_from && value.ia_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterIntangableAssetsComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ia_q_latest' && value.ia_min) {
            ia_filter.min = value.ia_min;
            ia_filter.max = value.ia_max;
            setFilteredIAName(value, this);
        }
    }
    FilterIntangableAssetsComp.prototype.getGui = function() {
        return this.eGui;
    };


    // Filter Material Assets
    var ma_filter = {};
    function FilterMaterialAssetsComp() {
    }
    FilterMaterialAssetsComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredMAName(value, that) {
        if (value.ma_min == value.init_from && value.ma_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterMaterialAssetsComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ma_q_latest' && value.ma_min) {
            ma_filter.min = value.ma_min;
            ma_filter.max = value.ma_max;
            setFilteredMAName(value, this);
        }
    }
    FilterMaterialAssetsComp.prototype.getGui = function() {
        return this.eGui;
    };


    // Filter Financial Assets
    var fa_filter = {};
    function FilterFinancialAssetsComp() {
    }
    FilterFinancialAssetsComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredFAName(value, that) {
        if (value.fa_min == value.init_from && value.fa_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterFinancialAssetsComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'fa_q_latest' && value.fa_min) {
            fa_filter.min = value.fa_min;
            fa_filter.max = value.fa_max;
            setFilteredFAName(value, this);
        }
    }
    FilterFinancialAssetsComp.prototype.getGui = function() {
        return this.eGui;
    };


    // Filter Tangible Assets
    var ta_filter = {};
    function FilterTangibleAssetsComp() {
    }
    FilterTangibleAssetsComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredTAName(value, that) {
        if (value.ta_min == value.init_from && value.ta_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterTangibleAssetsComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ta_q_latest' && value.ta_min) {
            ta_filter.min = value.ta_min;
            ta_filter.max = value.ta_max;
            setFilteredTAName(value, this);
        }
    }
    FilterTangibleAssetsComp.prototype.getGui = function() {
        return this.eGui;
    };

    // Filter Current Assets
    var ca_filter = {};
    function FilterCurrentAssetsComp() {
    }
    FilterCurrentAssetsComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredCAName(value, that) {
        if (value.ca_min == value.init_from && value.ca_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterCurrentAssetsComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ca_q_latest' && value.ca_min) {
            ca_filter.min = value.ca_min;
            ca_filter.max = value.ca_max;
            setFilteredCAName(value, this);
        }
    }
    FilterCurrentAssetsComp.prototype.getGui = function() {
        return this.eGui;
    };

    // Total Equity & Liabillities
    var tel_filter = {};
    function FilterTotalEquityLiabilitiesComp() {
    }
    FilterTotalEquityLiabilitiesComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredTELName(value, that) {
        if (value.tel_min == value.init_from && value.tel_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterTotalEquityLiabilitiesComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'tel_q_latest' && value.tel_min) {
            tel_filter.min = value.tel_min;
            tel_filter.max = value.tel_max;
            setFilteredTELName(value, this);
        }
    }
    FilterTotalEquityLiabilitiesComp.prototype.getGui = function() {
        return this.eGui;
    };

    // Total Assets
    var totalAssets_filter = {};
    function FilterTotalAssetsComp() {
    }
    FilterTotalAssetsComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredTotalAssetsName(value, that) {
        if (value.totalAssets_min == value.init_from && value.totalAssets_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterTotalAssetsComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'totalAssets_q_latest' && value.totalAssets_min) {
            totalAssets_filter.min = value.totalAssets_min;
            totalAssets_filter.max = value.totalAssets_max;
            setFilteredTotalAssetsName(value, this);
        }
    }
    FilterTotalAssetsComp.prototype.getGui = function() {
        return this.eGui;
    };


    // Total Equity
    var totalEquity_filter = {};
    function FilterTotalEquityComp() {
    }
    FilterTotalEquityComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredTotalEquityName(value, that) {
        if (value.totalEquity_min == value.init_from && value.totalEquity_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterTotalEquityComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'totalEquity_q_latest' && value.totalEquity_min) {
            totalEquity_filter.min = value.totalEquity_min;
            totalEquity_filter.max = value.totalEquity_max;
            setFilteredTotalEquityName(value, this);
        }
    }
    FilterTotalEquityComp.prototype.getGui = function() {
        return this.eGui;
    };


    // Long Term Debt
    var ltd_filter = {};
    function FilterLongTermDebtComp() {
    }
    FilterLongTermDebtComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredLTDName(value, that) {
        if (value.ltd_min == value.init_from && value.ltd_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterLongTermDebtComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'ltd_q_latest' && value.ltd_min) {
            ltd_filter.min = value.ltd_min;
            ltd_filter.max = value.ltd_max;
            setFilteredLTDName(value, this);
        }
    }
    FilterLongTermDebtComp.prototype.getGui = function() {
        return this.eGui;
    };


    // Short Term Debt
    var std_filter = {};
    function FilterShortTermDebtComp() {
    }
    FilterShortTermDebtComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredSTDName(value, that) {
        if (value.std_min == value.init_from && value.std_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterShortTermDebtComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'std_q_latest' && value.std_min) {
            std_filter.min = value.std_min;
            std_filter.max = value.std_max;
            setFilteredSTDName(value, this);
        }
    }
    FilterShortTermDebtComp.prototype.getGui = function() {
        return this.eGui;
    };

    // Sales Per Share
    var sps_filter = {};
    function FilterSalesPerShareComp() {
    }
    FilterSalesPerShareComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredSPSName(value, that) {
        if (value.sps_min == value.init_from && value.sps_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterSalesPerShareComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'sps_q_latest' && value.sps_min) {
            sps_filter.min = value.sps_min;
            sps_filter.max = value.sps_max;
            setFilteredSPSName(value, this);
        }
    }
    FilterSalesPerShareComp.prototype.getGui = function() {
        return this.eGui;
    };

    // Number of stocks
    var nos_filter = {};
    function FilterNumberOfStocksComp() {
    }
    FilterNumberOfStocksComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredNOSName(value, that) {
        if (value.nos_min == value.init_from && value.nos_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterNumberOfStocksComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'nos_q_latest' && value.nos_min) {
            nos_filter.min = value.nos_min;
            nos_filter.max = value.nos_max;
            setFilteredNOSName(value, this);
        }
    }
    FilterNumberOfStocksComp.prototype.getGui = function() {
        return this.eGui;
    };

    // Number of stocks growth %
    var nosg_filter = {};
    function FilterNumberOfStocksGrowthComp() {
    }
    FilterNumberOfStocksGrowthComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredNOSGName(value, that) {
        if (value.nosg_min == value.init_from && value.nosg_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterNumberOfStocksGrowthComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'nosg_q_latest' && value.nosg_min) {
            nosg_filter.min = value.nosg_min;
            nosg_filter.max = value.nosg_max;
            setFilteredNOSGName(value, this);
        }
    }
    FilterNumberOfStocksGrowthComp.prototype.getGui = function() {
        return this.eGui;
    };

    // ROE %
    var roe_filter = {};
    function FilterROEComp() {
    }
    FilterROEComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredROEName(value, that) {
        if (value.roe_min == value.init_from && value.roe_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterROEComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'roe_q_latest' && value.roe_min) {
            roe_filter.min = value.roe_min;
            roe_filter.max = value.roe_max;
            setFilteredROEName(value, this);
        }
    }
    FilterROEComp.prototype.getGui = function() {
        return this.eGui;
    };

    // ROA %
    var roa_filter = {};
    function FilterROAComp() {
    }
    FilterROAComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredROAName(value, that) {
        if (value.roa_min == value.init_from && value.roa_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterROAComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'roa_q_latest' && value.roa_min) {
            roa_filter.min = value.roa_min;
            roa_filter.max = value.roa_max;
            setFilteredROAName(value, this);
        }
    }
    FilterROAComp.prototype.getGui = function() {
        return this.eGui;
    };

    // Net Debt
    var netDebt_filter = {};
    function FilterNetDebtComp() {
    }
    FilterNetDebtComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="all-excahnges-label">'+
            '<span> ' + i18n.t('no_filter') + ' </span>' +
            '</div>';
    };
    function setFilteredNetDebtName(value, that) {
        if (value.netDebt_min == value.init_from && value.netDebt_max == value.init_to) {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label">'+
                '<span> ' + i18n.t('no_filter') + ' </span>' +
                '</div>';
        } else {
            that.eGui.innerHTML =
                '<div class="all-excahnges-label" style="opacity: 1">'+
                '<span> ' + value.displayFrom + ' to ' + value.displayTo + '</span>' +
                '</div>';
        }
    }
    FilterNetDebtComp.prototype.onParentModelChanged = function(params, value) {
        if (value && value.column.colId == 'netDebt_q_latest' && value.netDebt_min) {
            netDebt_filter.min = value.netDebt_min;
            netDebt_filter.max = value.netDebt_max;
            setFilteredNetDebtName(value, this);
        }
    }
    FilterNetDebtComp.prototype.getGui = function() {
        return this.eGui;
    };





    function AddColumnBtnComp() {
    }
    AddColumnBtnComp.prototype.init = function(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div style="opacity: 1; margin-top:40px;">'+
            '<span class="blue3" style="padding: 5px 15px; border-radius: 5px; color: white;"> ' + i18n.t('add_columns') + ' </span>' +
            '</div>';
    };
    AddColumnBtnComp.prototype.onParentModelChanged = function(params, value) {
    }
    AddColumnBtnComp.prototype.getGui = function() {
        return this.eGui;
    };





    window.mouseOverBind = function(){
        document.querySelector(".ag-body-horizontal-scroll-viewport").addEventListener("mouseup", function(e){
            // e.stopPropagation();
            e.stopImmediatePropagation();
            window.mouseOverBind_func();
        })
        window.mouseOverBind_func();
    }


    window.mouseOverBind_func = function(){
        let hoverElements = document.querySelectorAll('.ag-header-cell.ag-focus-managed');
        let filtersArray = [];
        hoverElements.forEach((item) => {  // get the only filter popup modals
            if (item.classList.value === "ag-header-cell ag-focus-managed")
                filtersArray.push(item);
        })
        let flag = false;
        if (document.querySelector('.addButton')) {
            if (document.querySelector('.addButton').closest('.ag-theme-balham.ag-popup').style.display != "none")
                flag = true;
        }

        let queries = document.querySelectorAll('.ag-floating-filter-button:not(.ag-hidden) .ag-floating-filter-button-button');
        let length = queries.length;
        queries.forEach((elem, index) => {
            if (index < length - 1) {
                elem.click();
            }
        })

        filtersArray.forEach((item, inx) => {
            if(item.isBinding) {
                return
            };
            // avoid to run repeatly
            item.addEventListener("mousedown", function(){
                const filterButton = item.querySelector('.ag-floating-filter-button:not(.ag-hidden) .ag-floating-filter-button-button');
                document.querySelectorAll('.ag-theme-balham.ag-popup').forEach((elem) => elem.style.display = 'none');
                if(filterButton) {
                    filterButton.click();
                    if(document.querySelector('.addButton')) {
                        document.querySelector('.addButton').closest('.ag-menu.ag-focus-managed').classList.add("movepanel");
                    }
                }
                setTimeout(function(){
                    let dom = document.querySelector('.ag-theme-balham.ag-popup > .ag-menu.ag-focus-managed');
                    if(dom){
                        if (1700 < 500 + parseInt(dom.style.left)) {
                            dom.classList.add("movepanel");
                        }
                    }
                }, 50);
            })
            item.isBinding= true;
        })
        document.querySelectorAll('.ag-theme-balham.ag-popup').forEach(elem => {
            elem.style.display = 'none'
        });

        if(document.querySelector('.addButton') && flag) {
            document.querySelector('.addButton').closest('.ag-theme-balham.ag-popup').style.display = 'block';
            document.querySelector('.addButton').closest('.ag-menu.ag-focus-managed').classList.add("movepanel");
        }

        document.querySelectorAll('.ag-input-field-input.ag-text-field-input').forEach(function(el){
            setTimeout(() => {
                if (el.value) {
                    el.closest('.ag-input-wrapper').classList.add("fill");
                } else {
                    el.addEventListener('keypress', function(ev){
                        if(ev.target.value.length>0){
                            el.closest('.ag-input-wrapper').classList.add("fill");
                        } else {
                            el.closest('.ag-input-wrapper').classList.remove("fill");
                        }
                    });
                    el.addEventListener('change', function(ev){
                        if(ev.target.value.length>0){
                            el.closest('.ag-input-wrapper').classList.add("fill");
                        } else {
                            el.closest('.ag-input-wrapper').classList.remove("fill");
                        }
                    });
                }

            }, 100);
        })
    }


    window.mouseOverUnBind = function(){
        const hoverElements = document.querySelectorAll('.ag-header-cell.ag-focus-managed');
        document.querySelectorAll('.ag-theme-balham.ag-popup').forEach((elem) => elem.style.display = 'none');
        hoverElements.forEach((item) => {
            item.removeEventListener("mousedown");
        })
    }


</script>

<style>
    .movepanel{
        left: 950px !important;
        top: 30px;
    }
</style>
<style scoped>

.isDisabled {
    color: currentColor;
    cursor: not-allowed;
    opacity: 0.5;
    text-decoration: none;
}

>>> span rect {
    fill: #5C91C2;
}

>>> .ag-status-bar {
    min-height: 60px;
    background-color: #F1F2F4;
    padding-top: 10px;
}
</style>
<style>
.ag-header-cell {
    background-color: #F1F2F4;
}
.ag-cell {
    border-bottom-color: #c8d8e7 !important;
}
.ag-header-group-cell.ag-header-group-cell-with-group {
    border-right: 1px solid #c8d8e7;
}
.ag-header-group-text {
    font-weight: 900 !important;
}
/* .ag-header-row-column .ag-header-cell {
    border-right: 1px solid #A3B3C2;
} */

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
.ag-header-cell:hover .ag-input-wrapper, .ag-header-cell .ag-input-wrapper.fill{
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
.ag-theme-balham .ag-header {
    background-color: #F1F2F4;
}
.ag-theme-balham .ag-ltr .ag-header-cell::after, .ag-theme-balham .ag-ltr .ag-header-group-cell::after {
    display: none;
}
.ag-theme-balham .ag-pinned-left-header{
    border-right-color: #c8d8e7;
}
.ag-theme-balham .ag-cell.ag-cell-last-left-pinned:not(.ag-cell-range-right):not(.ag-cell-range-single-cell){
    border-right-color: #c8d8e7;
}
/* .ag-theme-balham .ag-ltr .ag-cell{
    background-color:white !important;
} */
.ag-theme-balham .ag-header-row:not(:first-child) .ag-header-cell, .ag-theme-balham .ag-header-row:not(:first-child) .ag-header-group-cell.ag-header-group-cell-with-group{
    border-top-color: #c8d8e7;
}

.ag-theme-balham .ag-pinned-right-header {
    border-left-color: #c8d8e7;
}

.ag-theme-balham .ag-cell.ag-cell-first-right-pinned:not(.ag-cell-range-left):not(.ag-cell-range-single-cell) {
    border-left-color: #c8d8e7;
}

.ag-tabs.ag-menu.ag-popup-child {
    margin-left: 10px;
    margin-top: 30px;
    font-size: 13px;
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
  hide filter icon
*/
.ag-icon.ag-icon-filter {
    display: none;
}
/**
column hover
 */
.ag-column-hover {
  background-color: rgba(0, 0, 0, 0.04);
}


</style>

