<template lang="pug">
    div
        div(class="pt-1") Deposits and Withdrawals suggest - Net cash balance is: SEK {{ netCashBalance }}
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
        name: "WithdrawalsAndDeposites",
        components: {
            AgGridVue
        },
        props: ['arrAvanza', 'netCashBalance'],
        beforeMount() {
            this.frameworkComponents =
                {
                }
        },
        mounted() {
            // this.gridApi = this.gridOptions.api;
            // this.gridColumnApi = this.gridOptions.columnApi;
        },
        data() {
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
                        headerName: "Ticker",
                        field: "company_id",
                        cellRenderer: function(params) {
                            return '<span class="ticker" style="line-height: 17px">' + params.value + '</span>';
                        },
                        // filter: 'filterExchanges',
                        // floatingFilter: true,
                        // floatingFilterComponent: FilterMarginPct,
                        // suppressMenu: true,
                        maxWidth: 120,
                        hide: true
                    },
                    {headerName: "Date",
                        field: "tx_date",
                        filter: 'filterExchanges',
                        floatingFilter: true,
                        // floatingFilterComponent: FilterMarginPct,
                        suppressMenu: true,
                        maxWidth: 100
                    },
                    {headerName: "Acount",
                        field: "account",
                        // filter: 'filterExchanges',
                        // floatingFilter: true,
                        // floatingFilterComponent: FilterMarginPct,
                        // suppressMenu: true,
                        maxWidth: 90
                    },
                    {headerName: "Price",
                        field: "qty",
                        // filter: 'filterExchanges',
                        // floatingFilter: true,
                        // floatingFilterComponent: FilterMarginPct,
                        // suppressMenu: true,
                        maxWidth: 120,
                        hide: true
                    },
                    {headerName: "Transaction Type",
                        field: "tx_type",
                        // filter: 'filterExchanges',
                        // floatingFilter: true,
                        // floatingFilterComponent: FilterMarginPct,
                        // suppressMenu: true,
                        maxWidth: 170
                    },
                    {headerName: "Description",
                        field: "description",
                        // filter: 'filterExchanges',
                        // floatingFilter: true,
                        // floatingFilterComponent: FilterMarginPct,
                        // suppressMenu: true,
                        // editable: true,
                        maxWidth: 200
                    },
                    {headerName: "QTY",
                        field: "qty",
                        // filter: 'filterExchanges',
                        // floatingFilter: true,
                        // floatingFilterComponent: FilterMarginPct,
                        // suppressMenu: true,
                        maxWidth: 100,
                        hide: true
                    },
                    {headerName: "Exchange_rate",
                        field: "exchange_rate",
                        // filter: 'filterExchanges',
                        // floatingFilter: true,
                        // floatingFilterComponent: FilterMarginPct,
                        // suppressMenu: true,
                        maxWidth: 120,
                        hide: true
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
                    {headerName: "Notes",
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
