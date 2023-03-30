<template lang="pug">
    DIV
        div(class="pt-1") {{ numberOfCompletedTrades }} completed trades and {{ numberOfDividendPayments }} dividend payments
        div
            AgGridVue(
                :frameworkComponents="frameworkComponents"
                style="width: 100%; height: 550px; margin-left: 0;padding-left: 0;"
                :class="{'ag-theme-dark':$vuetify.theme.isDark,'ag-theme-balham':!$vuetify.theme.isDark}"
                id="screen"
                gridApi=null
                gridColumnApi=null
                :animateRows="true"
                :gridOptions="gridOptions"
                :defaultColDef="defaultColDef"
                rowSelection="multiple"
                :rowData="arrAvanza"
                :columnDefs="columnDefs"
            )

</template>

<script>
    import { AgGridVue } from "ag-grid-vue";
    import 'ag-grid-enterprise';
    import "ag-grid-community/dist/styles/ag-grid.css";
    import "ag-grid-community/dist/styles/ag-theme-dark.css";
    import "ag-grid-community/dist/styles/ag-theme-balham.css";
    import "ag-grid-community/dist/styles/ag-theme-alpine.css";

    export default {
        name: "AllCompletedBuyAndSellPairs",
        components: {
            AgGridVue
        },
        props: ['arrAvanza', 'numberOfCompletedTrades', 'numberOfDividendPayments'],
        beforeMount() {
            this.frameworkComponents =
                {
                }
        },
        mounted() {
            this.gridApi = this.gridOptions.api;
            this.gridColumnApi = this.gridOptions.columnApi;

        },
        data(){
            return {
                checkReadyLoadColumnDefs: true,
                defaultColDef: {
                    resizable: true,
                    sortable: true,
                    floatingFilter: true,
                },
                gridOptions: {
                    rowHeight: 40,
                    headerHeight: 25,
                    floatingFiltersHeight: 0,
                    // statusBar: {
                    //     statusPanels: [
                    //         { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
                    //         { statusPanel: 'agAggregationComponent' },
                    //     ],
                    // },
                },
                columnDefs: [
                    {
                        headerName: this.$t('ticker'),
                        field: "ticker",
                        cellRenderer: function(params) {
                            var val = params.value !== undefined ? params.value : 'NOT SET';
                            return '<span class="ticker" style="line-height: 17px">' + val + '</span>';
                        },
                        // filter: 'filterExchanges',
                        // floatingFilter: true,
                        // floatingFilterComponent: FilterMarginPct,
                        // suppressMenu: true,
                        maxWidth: 120
                    },
                    {headerName: this.$t('date'),
                        field: "tx_date",
                        filter: 'filterExchanges',
                        floatingFilter: true,
                        // floatingFilterComponent: FilterMarginPct,
                        suppressMenu: true,
                        maxWidth: 100
                    },
                    {headerName: this.$t('account'),
                        field: "account",
                        // filter: 'filterExchanges',
                        // floatingFilter: true,
                        // floatingFilterComponent: FilterMarginPct,
                        // suppressMenu: true,
                        maxWidth: 90
                    },
                    {headerName: this.$t('price'),
                        field: "qty",
                        // filter: 'filterExchanges',
                        // floatingFilter: true,
                        // floatingFilterComponent: FilterMarginPct,
                        // suppressMenu: true,
                        maxWidth: 120
                    },
                    {headerName: this.$t('transaction_type'),
                        field: "tx_type",
                        // filter: 'filterExchanges',
                        // floatingFilter: true,
                        // floatingFilterComponent: FilterMarginPct,
                        // suppressMenu: true,
                        maxWidth: 170
                    },
                    {headerName: this.$t('description'),
                        field: "description",
                        // filter: 'filterExchanges',
                        // floatingFilter: true,
                        // floatingFilterComponent: FilterMarginPct,
                        // suppressMenu: true,
                        maxWidth: 200
                    },
                    {headerName: this.$t('qty'),
                        field: "qty",
                        // filter: 'filterExchanges',
                        // floatingFilter: true,
                        // floatingFilterComponent: FilterMarginPct,
                        // suppressMenu: true,
                        hide: true,
                        maxWidth: 100
                    },
                    {headerName: "Exchange_rate",
                        field: "exchange_rate",
                        // filter: 'filterExchanges',
                        // floatingFilter: true,
                        // floatingFilterComponent: FilterMarginPct,
                        // suppressMenu: true,
                        maxWidth: 120
                    },
                    {headerName: "Amount",
                        field: "amount",
                        // filter: 'filterExchanges',
                        // floatingFilter: true,
                        // floatingFilterComponent: FilterMarginPct,
                        // suppressMenu: true,
                        maxWidth: 100
                    },
                    {headerName: "Commission",
                        field: "commission",
                        // filter: 'filterExchanges',
                        // floatingFilter: true,
                        // floatingFilterComponent: FilterMarginPct,
                        // suppressMenu: true,
                        maxWidth: 120
                    },
                    {headerName: "Currency",
                        field: "currency",
                        // filter: 'filterExchanges',
                        // floatingFilter: true,
                        // floatingFilterComponent: FilterMarginPct,
                        // suppressMenu: true,
                        maxWidth: 90
                    },
                    {headerName: "Notes_",
                        field: "notes",
                        editable: true,
                        onCellValueChanged: "greet",
                        cellEditor: 'agLargeTextCellEditor',
                        minWidth: 600
                    }
                ]
            }
        }
    }
</script>

<style>

</style>
