<template lang="pug">
    div
        div( class="pt-8 pl-3")
            v-row
                div( style="min-width:100%;")
                    div( id="containerOfAgGrid" style="overflow:auto; margin-top:47px;" :style="`height:${windowHeight - 314}px;`")
                        AgGridVue(
                            ref="agGridVueCompetitionContainer"
                            style="margin:0; padding:0 overflow:auto;"
                            :frameworkComponents="frameworkComponents"
                            :class="{'ag-theme-dark':$vuetify.theme.isDark,'ag-theme-balham':!$vuetify.theme.isDark}"
                            id="transaction"
                            gridApi=null
                            gridColumnApi=null
                            :gridOptions="gridOptions"
                            :defaultColDef="defaultColDef"
                            cellValueChanged="onCellValueChanged"
                            :animateRows="true"
                            :columnDefs="columnDefs"
                            :rowData="transaction_array"
                        )
</template>

<script>
import { AgGridVue } from "ag-grid-vue";
import "ag-grid-enterprise";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-dark.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import {mapGetters, mapActions} from "vuex";
import _ from "lodash";

import TransactionsImportButton from "./TransactionsImportButton";

const helper = require("../../util/helper.js");

export default {
    name: "TransactionBuySell",
    components: {
        AgGridVue,
        TransactionsImportButton
    },
    watch : {
        async getShowSelectedAccounts() {
            await this.loadRowData();

            const accountItemsElement = document.getElementById('accountItems');

            if(accountItemsElement !== null) {
                accountItemsElement.innerHTML = '';

                for(const account of this.getUserAccountsShown) {
                    accountItemsElement.innerHTML += `<option value="${account.user_account_id}">${account.account_name}</option>`;
                }
            }
        },
        async competition_user_account_id() {
            this.gridOptions.api.setDomLayout("autoHeight");
            this.gridOptions.api.sizeColumnsToFit();

            await this.loadRowData();
        }
    },
    computed: {
        ...mapGetters(["getTx", "getUserAccounts"]),
        getAllStocks() {
            return this.$store.getters.getAllStocks;
        },
        getAllTickers() {
            return this.getAllStocks.map((item) => item.ticker);
        },
        getUserAccountsShownAmount() {
            return this.$store.getters.getUserAccounts.filter((a) => a.is_selected === true && a.competition_id === null).length;
        },
        getUserAccountsShown() {
            return this.$store.getters.getUserAccounts.filter((a) => a.is_selected === true && a.competition_id === null);
        },
        getShowSelectedAccounts() {
            return this.$store.getters.getShowSelectedAccounts;
        },
        competition_id() {
            return (this.$route.params.competition_id !== undefined) ? Number(this.$route.params.competition_id) : -1;
        },
        competition_user_account_id() {
            return this.competition_id !== -1 ? this.getUserAccounts.find((a) => a.competition_id === this.competition_id).user_account_id : -1;
        }
    },
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
        this.gridOptions.api.sizeColumnsToFit();

        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;

        const agHeaderFirstTime = document.getElementsByClassName('ag-header')[1];
        agHeaderFirstTime.style.width = '100%';

        const agStatusBarFirstTime = document.getElementsByClassName('ag-status-bar')[1];
        agStatusBarFirstTime.style.width = '100%';

        const agStatusBarCenterElement = document.getElementsByClassName('ag-status-bar-left')[1];

        const node = document.createElement('span');
        const resultNode = document.createElement('span');

        node.style.marginTop = '7px';
        node.style.marginRight = '5px';
        node.style.marginLeft = '300px';

        resultNode.id = 'sumCompetitionCommissionsTotal';
        resultNode.style.color = '#000000';
        resultNode.style.marginTop = '7px';

        const textNode = document.createTextNode('Commissions Total:');
        const textResultNode = document.createTextNode('');

        node.appendChild(textNode);
        resultNode.appendChild(textResultNode);

        agStatusBarCenterElement.appendChild(node);
        agStatusBarCenterElement.appendChild(resultNode);
    },
    methods: {
        ...mapActions(["loadTx", "saveTx", "updateTx", "deleteTx", "saveOneTx", "loadUserAccounts"]),
        async loadRowData() {
            await this.loadTx(JSON.parse(localStorage.getItem('user')).user_id);
            await this.loadUserAccounts(JSON.parse(localStorage.getItem('user')).user_id);

            let final_array = [];
            let sort_array = [];

            final_array = this.getTx.filter((tx) => tx.user_account_id === this.competition_user_account_id && tx.user_account_id !== null);

            final_array.map((item, i) => {
                if (this.getAllStocks.find((s) => s.stock_id === item.stock_id)) {
                    let ticker = this.getAllStocks.find((s) => s.stock_id === item.stock_id).ticker;
                    let stock_id = this.getAllStocks.find((s) => s.stock_id === item.stock_id).stock_id;
                    let account_name = this.$store.getters.getUserAccounts.find((a) => a.user_account_id === item.user_account_id).account_name;

                    final_array[i].ticker = ticker;
                    final_array[i].stock_id = stock_id;
                    final_array[i].edited = 'false';
                    final_array[i].account_name = account_name;

                    if (item.tx_type === 'SELL' || item.tx_type === 'BUY') {
                        sort_array.push(final_array[i]);
                    }
                }
            });

            sort_array = _.orderBy(sort_array, ["tx_date"], ["desc"]);

            this.transaction_array = sort_array;
            this.transaction_array_copy = JSON.parse(JSON.stringify(this.transaction_array));

            this.commissionsTotal(this.transaction_array);
        },
        commissionsTotal(array) {
            const sumCommissionsTotal = document.getElementById('sumCompetitionCommissionsTotal');

            const sumCommissinsText = _.sumBy(array, 'commission');

            sumCommissionsTotal.innerHTML = sumCommissinsText;
        }
    },
    data() {
        return {
            windowWidth: 0,
            windowHeight: 0,
            user_id: JSON.parse(localStorage.getItem('user')).user_id,
            transaction_array: [],
            transaction_array_copy: [],
            defaultColDef: {
                cellClass: 'number-cell',
                resizable: true
            },
            gridOptions: {
                rowHeight: 40,
                headerHeight: 40,
                floatingFiltersHeight: 0,
                statusBar: {
                    statusPanels: [
                        { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
                        { statusPanel: 'agAggregationComponent' },
                    ],
                },
            },
            columnDefs: [
                {
                    headerName: "Date for sort",
                    field: "tx_date",
                    sortable: true,
                    hide: true,
                    maxWidth: 80
                },
                {
                    headerName: this.$t('account'),
                    field: "account_name",
                    suppressMenu: true,
                    editable: false,
                    maxWidth: 150
                },
                {
                    headerName: this.$t('date'),
                    field: "tx_date",
                    floatingFilter: true,
                    suppressMenu: true,
                    editable: false,
                    maxWidth: 120
                },
                {
                    headerName: this.$t('ticker'),
                    field: "ticker",
                    editable: false,
                    cellRenderer: function(params) {
                        return '<span class="ticker blue1" style="line-height:17px; padding-top:3.6px; margin-top:4px;">' + params.value + '</span>';
                    },
                    maxWidth: 120
                },
                {
                    headerName: "Stock_id",
                    field: "stock_id",
                    sortable: true,
                    hide: true,
                    maxWidth: 80
                },
                {
                    headerName: this.$t('account'),
                    field: "account",
                    hide: true,
                    maxWidth: 90
                },
                {
                    headerName: this.$t('qty'),
                    field: "qty",
                    editable: false,
                    maxWidth: 100,
                    type: 'rightAligned',
                    cellRenderer: (row) => {
                        return helper.thousandFormatter(row.value);
                    }
                },
                {
                    headerName: this.$t('price'),
                    field: "price",
                    editable: false,
                    maxWidth: 100,
                    type: 'rightAligned',
                    cellRenderer: (row) => {
                        return helper.thousandFormatter(row.value);
                    }
                },
                {
                    headerName: this.$t('commission'),
                    field: "commission",
                    editable: false,
                    maxWidth: 120,
                    type: 'rightAligned',
                    cellRenderer: (row) => {
                        return helper.thousandFormatter(row.value);
                    }
                },
                {
                    headerName: this.$t('transaction_type'),
                    field: "tx_type",
                    editable: false,
                    maxWidth: 150
                },
                {
                    headerName: "Exchange_rate",
                    field: "exchange_rate",
                    hide: true,
                    maxWidth: 130
                },
                {
                    headerName: this.$t('amount'),
                    field: "amount",
                    editable: false,
                    maxWidth: 90,
                    type: 'rightAligned',
                    cellRenderer: (row) => {
                        return helper.thousandFormatter(row.value);
                    }
                },
                {
                    headerName: this.$t('Currency'),
                    field: "currency",
                    editable: false,
                    maxWidth: 100
                },
                {
                    headerName: "Description",
                    field: "description",
                    hide: true,
                    maxWidth: 200
                },
                {
                    headerName: "",
                    editable: false,
                    type: 'rightAligned'
                }
            ]
        }
    }
}
</script>

<style scoped>
>>> .ag-center-cols-container .ag-row {
  background-color: #ffffff;
}

>>> .set-trash-can-container {
    width: 23px;
    height: 23px;
}

>>> .set-trash-can-color {
    stroke: #333333;
}

>>> span:hover .set-trash-can-color {
    stroke: red;
}

>>> span:hover {
    cursor: pointer;
}

>>> .save-button-layout {
    width: 90px;
    float: left;
    height: 27px;
    padding-top: 5px;
}

>>> .save-button-design {
    height: 27px;
    background: #408DF2;
    vertical-align: top;
    padding-left: 7px;
    padding-right: 7px;
}

>>> .save-button-design-blocked {
    display: none;
}

>>> .remove-button-layout {
    display: inline-block;
    margin-top: 5px;
}

>>> .block-save-button {
    position: absolute;
    display: block;
    width: 50px;
    height: 34px;
    top: 1px;
    left: -4px;
    color: black;
}

>>> .unblock-save-button {
    display: none;
}

>>> .ag-header {
    background-color: #EEEEEE;
}

.option-design {
    cursor: pointer;
}

.option-design:hover {
    background-color: lightgrey;
}

>>> #addDate {
    font-size: 11px;
}

>>> .ag-status-bar {
    position: fixed;
    bottom: 3px;
}

>>> .ag-header {
    position: fixed;
    top: 250px;
}
</style>
