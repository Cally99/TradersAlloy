<template lang="pug">
    div
        AgGridVue(
            style="margin:12px;"
            :frameworkComponents="frameworkComponents"
            :class="{'ag-theme-dark':$vuetify.theme.isDark,'ag-theme-alpine':!$vuetify.theme.isDark}"
            id="myGrid"
            gridApi=null
            gridColumnApi=null
            :gridOptions="gridOptions"
            :defaultColDef="defaultColDef"
            cellValueChanged="onCellValueChanged"
            :animateRows="true"
            :columnDefs="tradesColumns"
            :rowData="trades"
        )
</template>

<script>
    import { AgGridVue } from "ag-grid-vue";
    import "ag-grid-enterprise";
    import "ag-grid-community/dist/styles/ag-grid.css";
    import "ag-grid-community/dist/styles/ag-theme-dark.css";
    import "ag-grid-community/dist/styles/ag-theme-alpine.css";
    import { mapGetters } from "vuex";
    import ApiService from "../../Services/ApiService.js";

    const helper = require("../../util/helper.js");

    const formatter = new Intl.DateTimeFormat('sv', { month: 'short' });

    window.createShowCellRenderer = function createShowCellRenderer() {
        function ShowCellRenderer() {}
        ShowCellRenderer.prototype.init = function(params) {
            var cellBlank = !params.value;
            if (cellBlank) {
                return null;
            }
            this.ui = document.createElement('div');
            this.ui.innerHTML =
                '<div class="show-name">' +
                params.value.ticker +
                '</div>' +
                '<div class="show-presenter">' +
                3.4%
                '</div>';
        };
        ShowCellRenderer.prototype.getGui = function() {
            return this.ui;
        };
        return ShowCellRenderer;
    };

    export default {
        name: "TransactionHistory",
        components: {AgGridVue},
        beforeMount() {
            this.frameworkComponents =
                {
                }
        },
        async created() {
            await this.loadRowData();
        },
        mounted() {
            this.gridOptions.api.setDomLayout("autoHeight");
        },
        watch : {
            async getShowSelectedAccounts() {
                await this.loadRowData();
            },
            async competition_user_account_id() {
                console.log('test: ' + this.competition_user_account_id);
                await this.loadRowData();
            }
        },
        computed: {
            ...mapGetters(["getUserAccounts"]),
            getUserAccountsShownAmount() {
                return this.getUserAccounts.filter((a) => a.is_selected === true && a.competition_id === null).length;
            },
            getUserAccountsShown() {
                return this.getUserAccounts.filter((a) => a.is_selected === true && a.competition_id === null);
            },
            getShowSelectedAccounts() {
                return this.$store.getters.getShowSelectedAccounts;
            },
            user_id() {
                return this.user.user_id;
            },
            competition_id() {
                return (this.$route.params.competition_id !== undefined) ? Number(this.$route.params.competition_id) : -1;
            },
            competition_user_account_id() {
                return this.competition_id !== -1 ? this.getUserAccounts.find((a) => a.competition_id === this.competition_id).user_account_id : -1;
            },
            getUserAccountOnCompetitionId() {
                return this.getUserAccounts.filter((a) => a.competition_id === this.competition_id);
            }
        },
        methods: {
            async loadRowData() {
                    const response = await ApiService.selectUserTrades(this.user_id);
                    let tradesWithAccountAdded = [];

                    const tradesShown = [];

                    if(this.competition_user_account_id === -1) {
                        tradesWithAccountAdded = response.filter((t) => t.user_account_id !== null);

                        for(const account of this.getUserAccountsShown) {
                            for(const trade of tradesWithAccountAdded) {
                                if(trade.user_account_id === account.user_account_id) {
                                    tradesShown.push(trade);
                                }
                            }
                        }
                    } else {
                        tradesWithAccountAdded = response.filter((t) => t.user_account_id === this.competition_user_account_id);

                        for(const account of this.getUserAccountOnCompetitionId) {
                            for(const trade of tradesWithAccountAdded) {
                                if(trade.user_account_id === account.user_account_id) {
                                    tradesShown.push(trade);
                                }
                            }
                        }
                    }

                    this.trades = tradesShown;
            },
            priceFormatter(params) {
                return helper.thousandFormatter(params.value);
            },
            currencyFormatter(params) {
                return this.formatNumber(params.value);
            },
            formatNumber(number) {
                // this puts commas into the number eg 1000 goes to 1,000,
                // i pulled this from stack overflow, i have no idea how it works
                // +(\.[0-9][0-9]?)
                return Math.floor(number)
                    .toString()
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');
            },
            onFirstDataRendered(params) {  // this is not working : https://www.ag-grid.com/javascript-grid-resizing/
                params.api.sizeColumnsToFit();
            },
            onCellValueChanged(params) {
                const colId = params.column.getId();
                if (colId === "activite") {
                    alert(99);
                }
            },
            greet: function (x) {
                // `this` inside methods points to the Vue instance
                alert('Hello !'+x)
                // `event` is the native DOM event
                if (event) {
                    alert(event.target.tagName)
                }
            },
            updateZzz: function(x) {
                alert(x);
//                ApiService.updateConviction({})
            }
        },
        data(){
            return {
                user: JSON.parse(localStorage.getItem('user')),
                trades: [],
                defaultColDef: {
                    flex: 1,
                    cellClass: 'number-cell',
                    resizable: false
                },
                gridOptions: {
                    getRowStyle: function(params) {
                        if (params.data.exit_date !== null && (params.data.exit_date).substring(5, 7) %2 === 0) {
                            return '{background-color: red;';  // this background colour hides row hover highlight of ag-grid
                        }
                    }
                },
                tradesColumns:[
                    {headerName: "trade_id",field: "trade_id", hide: true},
                    {headerName: "user_id",     field: "user_id", hide: true},
                    {headerName: "stock_id",      field: "stock_id", hide: true},
                    {
                        headerName: "-",
                        hide: true,
                        rowSpan: params => {
                            if (params.data.exit_date !== null && (params.data.exit_date).substring(5, 7) ==  "11") {
                                return 6;
                            } else {
                                return 1;
                            }
                        },
                        cellClass: function (params) {
                            if(params.data.exit_date !== null) {
                                return (((params.data.exit_date).substring(5, 7) %2 === 0) ? 'rag1' : 'rag2');
                            }
                        },
                        cellRenderer: function(params) {
                            return '<span style="line-height: 30px">' + formatter.format(new Date( params.data.exit_date)) + '3.1%</span>' +
                                '<div style="font-size: 3rem; color: dimgrey">2.6%</div>';
                        },
                        minWidth: 100,
                        maxWidth: 100
                    },
                    {
                        headerName: this.$t('entry'),
                        headerClass: "header-background-top",
                        children: [
                            {
                                headerName: this.$t('date'),
                                field: "entry_date",
                                headerClass: () => {
                                    return 'header-background';
                                },
                                cellStyle: () => {
                                    return {
                                        backgroundColor: 'rgba(90, 190, 184, 0.18)'
                                    };
                                },
                                maxWidth: 130,
                                minWidth: 110
                            },
                            {
                                headerName: this.$t('price'),
                                field: "entry_price",
                                headerClass: () => {
                                    return 'header-background';
                                },
                                cellStyle: () => {
                                    return {
                                        backgroundColor: 'rgba(90, 190, 184, 0.18)'
                                    };
                                },
                                suppressMenu: false,
                                valueFormatter: this.priceFormatter,
                                type: 'rightAligned',
                                minWidth: 90,
                                maxWidth: 90
                            },
                            {
                                headerName: this.$t('qty'),
                                field: "entry_qty",
                                headerClass: () => {
                                    return 'header-background';
                                },
                                cellStyle: () => {
                                    return {
                                        backgroundColor: 'rgba(90, 190, 184, 0.18)'
                                    };
                                },
                                type: 'rightAligned',
                                maxWidth: 120,
                                minWidth: 90,
                                valueFormatter: (params) => {
                                    return helper.thousandFormatter(params.value);
                                }
                            }
                        ]
                    },
                    {headerName: "cost",
                        valueGetter: function(params) {
                            return params.data.entry_price * params.data.entry_qty;
                        },
                        valueFormatter: this.currencyFormatter,
                        type: 'rightAligned',
                        suppressMenu: false,
                        minWidth: 110,
                        maxWidth: 130,
                        hide: true
                    },
                    {headerName: this.$t('ticker'),
                        field: "ticker",
                        cellRenderer: function(params) {
                            return '<span class="ticker" style="line-height: 17px">' + params.value + '</span>';
                        },
                        suppressMenu: true,
                        minWidth: 110,
                        maxWidth: 110},
                    {
                        headerName: this.$t('exit'),
                        headerClass: "header-background-top",
                        children: [
                            {
                                headerName: this.$t('date'),
                                field: "exit_date",
                                headerClass: () => {
                                    return 'header-background';
                                },
                                cellStyle: () => {
                                    return {
                                        backgroundColor: 'rgba(90, 190, 184, 0.18)'
                                    };
                                },
                                suppressMenu: false,
                                minWidth: 110,
                                maxWidth: 130
                            },
                            {
                                headerName: this.$t('price'),
                                field: "exit_price",
                                headerClass: () => {
                                    return 'header-background';
                                },
                                cellStyle: () => {
                                    return {
                                        backgroundColor: 'rgba(90, 190, 184, 0.18)'
                                    };
                                },
                                minWidth: 90,
                                maxWidth: 90,
                                type: 'rightAligned',
                                suppressMenu: false,
                                valueFormatter: this.priceFormatter
                            },
                            {
                                headerName: this.$t('qty'),
                                field: "exit_qty",
                                headerClass: () => {
                                    return 'header-background';
                                },
                                cellStyle: () => {
                                    return {
                                        backgroundColor: 'rgba(90, 190, 184, 0.18)'
                                    };
                                },
                                type: 'rightAligned',
                                maxWidth: 120,
                                minWidth: 90,
                                valueFormatter: (params) => {
                                    return helper.thousandFormatter(params.value);
                                }
                            }
                        ]
                    },
                    {headerName: this.$t('result'),
                        headerClass: "ma-2 mx-3 grey lighten-2",
                        children: [
                            {headerName: this.$t('commission'),
                                field: "commission",
                                type: 'rightAligned',
                                maxWidth: 140,
                                minWidth: 120,
                                valueFormatter: (params) => {
                                    return helper.thousandFormatter(params.value);
                                }
                            },
                            {headerName: this.$t('profit_loss'),
                                valueGetter: function(params) {
                                    if (params.data.pnl != null) {
                                        return params.data.pnl;
                                    } else {
                                        return Math.round((params.data.exit_price - params.data.entry_price) * params.data.entry_qty);
                                    }
                                },
                                cellClass: function(params) {
                                    return (params.value > 0 ? 'green--text right-align-cell' : 'red--text right-align-cell');
                                },
                                type: 'rightAligned',
                                minWidth: 110,
                                maxWidth: 150},
                            {headerName: this.$t('pl_pct'),
                                valueGetter: function (params) {
                                    return Math.round(((params.data.exit_price - params.data.entry_price) / params.data.entry_price) * 100);
                                },
                                cellClass: function (params) {
                                    return (params.value > 0 ? 'green--text right-align-cell' : 'red--text right-align-cell');
                                },
                                cellRenderer: function (params) {
                                    return params.value + '%';
                                },
                                type: 'rightAligned',
                                minWidth: 90,
                                maxWidth: 130
                            }],},
                    {headerName: this.$t('notes'),
                        field: "notes",
                        editable: true,
                        onCellValueChanged: "greet",
                        cellEditor: 'agLargeTextCellEditor',
                        minWidth: 600},
                ],
            }
        }
    }
</script>

<style>
    .rag1 {
        color: royalblue;
    }
    .rag2 {
        color: #1a6611;
    }
    .header-background {
        background: rgba(90, 190, 184, 0.18);
    }
    .header-background-top {
        font-size: 30px;
        color: #545353;
        background: rgba(90, 190, 184, 0.28);
    }
    .ag-header-group-cell-label {
        justify-content: center !important;
    }

    .right-align-cell {
        text-align: right;
    }
</style>
