<template lang="pug">
    div(class="px-0")
        PortfolioHeader(:competition="competition" title="Performance" )

        v-container(fluid)
            v-row
                v-col(cols="4")
                    div(class="panel" )
                        AgGridVue(
                            style="width: 100%; height:380px;"
                            :class="{'ag-theme-dark':$vuetify.theme.isDark,'ag-theme-balham':!$vuetify.theme.isDark}"
                            id="monthlyPerformance"
                            :gridOptions="gridOptions"
                            :defaultColDef="gridOptions.defaultColDef"
                            :columnDefs="gridOptions.columnDefs"
                            :rowData="monthlyPerformance")


                v-col(cols="4")
                    div(class="panel" )
                        ChartPerformanceTradesByMonth

                v-col(cols="4")
                    div(class="panel" )
                        ChartKelly2D
            v-row
                v-col(cols="4")
                    div(class="panel" )
                        PerformanceSummary

                v-col(cols="4")
                    div(class="panel" style="height:100%; ")
                        //ChartPerformanceCAGR

                v-col(cols="4")
                    div(class="panel" )
                        h4 30 day winners
                        table(class="thirtyDay")
                            tr
                                th
                                th weight
                                th return
                                th contribution

                            tr(v-for="item of ThirtyDayWinners")
                                td
                                    span(class="ticker blue1 pt-0 py-1" style="display:inline-block;" @click="tabAddStocks(item)") {{ item.ticker }}
                                td(class="data")
                                    span {{ item.weight }}
                                td(class="data")
                                    span {{ item.return }}
                                td(class="data")
                                    span {{ item.contribution }}

                        v-divider

                        h4 30 day losers
                        table(class="thirtyDay")
                            tr
                                th
                                th weight
                                th return
                                th contribution

                            tr(v-for="item of ThirtyDayLosers")
                                td
                                    span(class="ticker blue1 pt-0 py-1" style="display:inline-block;" @click="tabAddStocks(item)") {{ item.ticker }}
                                td(class="data")
                                    span {{ item.weight }}
                                td(class="data")
                                    span {{ item.return }}
                                td(class="data")
                                    span {{ item.contribution }}



</template>

<script>
    import ChartKelly2D from './ChartKelly2D.vue';
    import ChartPerformanceTradesByMonth from './ChartPerformanceTradesByMonth.vue';
    import ChartPerformanceCAGR from './ChartPerformanceCAGR.vue';
    import UserAccountDropdownMenu from "./../../components/UserAccountDropdownMenu";
    import PerformanceSummary from "./PerformanceSummary";
    import { mapGetters, mapActions } from "vuex";
    import { AgGridVue } from "ag-grid-vue";
    import "ag-grid-enterprise";
    import "ag-grid-community/dist/styles/ag-grid.css";
    import "ag-grid-community/dist/styles/ag-theme-dark.css";
    import "ag-grid-community/dist/styles/ag-theme-alpine.css";
    import PortfolioHeader from "./PortfolioHeader";


    export default {
        name: "PortfolioPerformance",
        components: {
            PortfolioHeader,
            AgGridVue,
            ChartKelly2D,
            UserAccountDropdownMenu,
            ChartPerformanceCAGR,
            ChartPerformanceTradesByMonth,
            PerformanceSummary
        },
        data() {
            return {
                ThirtyDayHeaders: [
                    {text: "Ticker", align: "left", value: "ticker"},
                    {text: "Weight", align: "right", value: "weight"},
                    {text: "Return", align: "right", value: "return"},
                    {text: "Contribution", align: "right", value: "contribution"}
                ],

                ThirtyDayWinners: [
                    {ticker: "SMG", weight:"10%", return:"22", contribution: "12.1"},
                    {ticker: "GTG", weight:"11%", return:"19", contribution: "10.2"},
                    {ticker: "JM", weight:"4%", return:"10", contribution: "2.1"},
                ],
                ThirtyDayLosers: [
                    {ticker: "GTG", weight:"11%", return:"19", contribution: -10.2},
                    {ticker: "JM", weight:"4%", return:"10", contribution: -2.1},
                    {ticker: "SYS", weight:"3%", return:"9", contribution: -1.1},
                ],

                gridOptions: {
                    defaultColDef : {
                        width: 60,
                        cellStyle: {textAlign: "right"},
                        hide: false,
                        sortable: false,
                        suppressMenu: true,
                    },
                    columnDefs: [
                        {headerName: "Month",
                            field: "month",
                            width: 80,
                        },
                        {headerName: "wins",
                            field: "wins",
                            type: 'rightAligned',
                        },
                        {headerName: "losses",
                            field: "losses",
                            type: 'rightAligned',
                        },
                        {headerName: "best",
                            field: "max_win",
                            width: 80,
                            type: 'rightAligned',
                        },
                        {headerName: "worst",
                            field: "max_loss",
                            width: 80,
                            type: 'rightAligned',
                        },
                        {headerName: "P/L %",
                            field: "pnl_pct",
                            type: 'rightAligned',

                        },
                    ]
                }
            }
        },
        mounted() {
            this.$store.commit('setShowUserAccountMenu', true);
        },

        computed: {
            ...mapGetters(['getCompetitions', 'tradeHistory']),

            monthlyPerformance() {
                return this.$store.getters.monthlyPerformance;
            },

            trades() {
                return this.$store.getters.tradeHistory;
            },

            competition() {
                this.competition_id = Number(this.$route.params.competition_id);
                if (this.competition_id) {
                    return this.$store.getters.getCompetitions.find( x => x.competition_id === this.competition_id);
                } else {
                    return null;
                }
            },
        }

    }
</script>

<style scoped>
table.thirtyDay {
    margin-left:10px;
    width: 300px;
}

table.thirtyDay > tr > td {
    width: 80px;
    height: 22px;
}

table.thirtyDay > tr > td.data {
    text-align: right;
    height: 22px;
}

.headline-text {
    font-size: 30px;
    font-weight: bold;
}

.neg {
    color: #b6504b;
}

.wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    gap: 1em;
    margin: 10px 20px;


}
>>> div.panel {
    background: #e5efed;
    border-radius: 8px;
    padding:10px;

}
</style>

