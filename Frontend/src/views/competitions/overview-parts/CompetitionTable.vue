<template lang="pug">
    AgGridVue(
        style="width: 100%; height: 345px"
        :class="{'ag-theme-dark':$vuetify.theme.isDark,'ag-theme-balham':!$vuetify.theme.isDark}"
        id="leaderBoard"
        :gridOptions="gridOptions"
        :defaultColDef="gridOptions.defaultColDef"
        :columnDefs="gridOptions.columnDefs"
        :rowData="competition.tableData"
    )
</template>

<script>
import TickerComponent from "../../../components/TickerComponent";
import { AgGridVue } from "ag-grid-vue";

const tickerRenderer = {
    template: '<TickerCompoent :tickerLabel="params.top_holding" />',
};

export default {
    name: "CompetitionTable",
    props: ["competition"],
    components: {
        TickerComponent,
        AgGridVue,
    },
    data() {
        return {
            gridOptions: {
                defaultColDef: {
                    width: 100,
                    cellStyle: {textAlign: "left"},
                    hide: false,
                    sortable: false,
                    suppressMenu: true,
                    type: "rightAligned",
                },
                columnDefs: [
                    {
                        headerName: this.$t('rank'),
                        valueGetter: "node.rowIndex + 1",
                        width: 60,
                        headerClass: "ag-left-aligned-header"
                    },
                    {
                        headerName: this.$t('user'),
                        field: "account_name",
                        width: 170,
                        headerClass: "ag-left-aligned-header"
                    },
                    {
                        headerName: this.$t('balance'),
                        field: "balance",
                        width: 100,
                        cellStyle: {textAlign: "right"},
                        type: "rightAligned",
                    },
                    {
                        headerName: this.$t('top_holding'),
                        field: "top_holding",
                        suppressMenu: true,
                        headerClass: "ag-left-aligned-header",
                        minwidth:100,
                        // cellRenderer: tickerRenderer,
                    },
                    {
                        headerName: this.$t('exposure'),
                        field: "exposure",
                        cellStyle: {textAlign: "right"},
                        type: "rightAligned",
                    },
                    // {
                    //     headerName: "# Tx",
                    //     field: "tx_count",
                    //     width: 60,
                    //     cellStyle: {textAlign: "right"},
                    //     type: "rightAligned",
                    // },
                ],
            },
        };
    },
};
</script>

<style scoped>

</style>
