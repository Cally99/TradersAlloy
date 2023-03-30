<template lang="pug">
    DIV
        v-row(no-gutters style="max-width:1800px;")
            v-col(cols="3")
                div(class="chart-item blue9 ml-2 mr-2 mt-2 mb-2" style="max-width:450px; overflow-x:hidden;overflow-y:hidden;")
                    ChartPrice(:stock_id='stock.stock_id' :company_id='company_id' :width="400" :height="398" :toolbar="false" :legendView="false" :single="true" page="overview" class="ml-4 mr-4 mt-4 mb-8" style="overflow:hidden;")

            v-col(cols="3")
                div(class="chart-item blue9 ml-2 mr-2 mt-2 mb-2")
                    CanvasEPS( :company_id='company_id' class="ml-4 mr-4 mt-4 mb-8" style="max-width:450px; background-color:#ffffff;")

            v-col(cols="3")
                div(class="chart-item blue9 ml-2 mr-2 mt-2 mb-2")
                    CanvasRevenue( :company_id='company_id' class="ml-4 mr-4 mt-4 mb-8" style="max-width:450px; background-color:#ffffff;")

            v-col(cols="3")
                div(class="chart-item blue9 ml-2 mr-2 mt-2 mb-2")
                    CanvasPE( :company_id='company_id' class="ml-4 mr-4 mt-4 mb-8" style="max-width:450px; background-color:#ffffff;")

        v-row(dense style="max-width:1800px;")
            v-col(cols="3")
                DIV( class="white mx-1 body-2" style="height:380px;")
                    div( class="blue2 white--text pl-3 pt-1 pb-1" style="border-radius:3px;") {{this.$t('company_information')}}
                    CompanyInformation(:company_id='company_id' :stock_id='stock_id')

            v-col(cols="3")
                DIV(class="white mx-1 body-2" style="height:380px;")
                    div( class="blue2 white--text pl-3 pt-1 pb-1" style="border-radius:3px;") {{this.$t('About')}} {{stockData.ticker}}
                    img(:src="logoURL" style="width:160px; margin:20px 10px 20px 20px; float:right;")
                    DIV(v-if="stockData.description" class="pa-2 black--text")
                        span(v-if="stockData.description.length >= 700") {{stockData.description.substring(0,700)}} ...
                        span(v-else) {{stockData.description}}
                        v-divider

            v-col(cols="3")
                DIV( class="white mx-1 body-2" style="height:380px;")
                    div(class="blue2 white--text pl-3 pt-1 pb-1" style="border-radius:3px;") {{this.$t('ceo_comments')}}
                    CompanyPdfTable( v-if="$store.getters.getIsPdfReportsTableLoaded === 1" :company_id='company_id' :stock_id='stock_id')

            v-col(cols="3")
                DIV(class="white mx-1 body-2 peers" style="height:380px;")
                    div(class="blue2 white--text pl-3 pt-1 pb-1" style="border-radius:3px;") {{this.$t('sector_peers_in')}} {{$t(stockData.sector_name)}}

                    v-data-table(:headers="headers"
                        :items="stocksInSector"
                        dense
                        height="356"
                        width="400"
                        disable-pagination
                        fixed-header
                        no-data-text: "no peers were identified for comparison"
                        hide-default-footer)
                        template(v-slot:item.ticker="{ item }")
                            div(style="position:relative; white-space:nowrap;")
                                TickerComponent(:tickerLabel="item.ticker" :stockId="item.stock_id" :isClickable="true")
                                img( :src="'/images/flag_' + item.country + '.png'" style="width:24px; margin-top:0; margin-left:5px; margin-right:13px; margin-bottom:4px; top:5px;")
                        template(v-slot:item.name="{ item }")
                            span(class="ellipsis3") {{ item.name }}
                        template( v-slot:item.market_cap="{ item }")
                            span(class="ellipsis") {{ item.market_cap }}
                        template(v-slot:item.earningsDate="{ item }")
                            span(class="ellipsis2" style="white-space:nowrap;") {{ item.last_report_date }}

</template>

<script>
    /* eslint-disable no-console */
    import {mapActions, mapGetters} from "vuex";
    import ChartPrice from "@/components/ChartPrice.vue";
    import CanvasEPS from "@/views/stock/CanvasEPS.vue";
    import CanvasPE from "@/views/stock/CanvasPE.vue";
    import CanvasRevenue from "@/views/stock/CanvasRevenue.vue";
    import CompanyInformation from "@/views/stock/CompanyInformation";
    import CompanyPdfTable from "@/views/stock/CompanyPdfTable";
    import TickerComponent from "../../components/TickerComponent"
    import moment from 'moment';

    // const fs = require('fs')

    export default {
        name: "StocksOverview",
        components: {
            CompanyInformation,
            CompanyPdfTable,
            ChartPrice,
            CanvasEPS,
            CanvasPE,
            CanvasRevenue,
            TickerComponent
        },
        props: {company_id: Number, stock: Object},
        computed: {
            ...mapGetters(["getNavigationTabs"]),
            stock_id() {
                return this.stock.stock_id;
            },
            stockData() {
                return this.$store.getters["getMapStocks"].find(s => s.stock_id == this.stock_id);
            },
            getImageURL() {
                return "/images/flag_DK.png";
            },

            stocksInSector() {
                let stock_data = this.$store.getters["getMapStocks"].find(s => s.stock_id == this.stock_id);
                let stocksInSector = [];
                this.$store.getters["getAllStocks"].forEach(s => {
                    if (s.sector_id === stock_data.sector_id) {
                        const c = this.$store.getters["getAllCompanies"].get(s.company_id);
                        const sx = this.$store.getters["getMapExchanges"].get(s.stock_exchange_id);
                        if (c) {
                            s.last_report_date = c.last_report_date;
                            s.market_cap = c.market_cap;
                            s.country = (sx) ? sx.country: '';
                            // s.country = sx.country;
                            stocksInSector.push(s);
                        }
                    }
                });
                return stocksInSector;
            },

            companyData() {
                return this.$store.getters["getMapCompanies"].get(this.company_id);
            },

            logoURL() {  // display logo if it exists....
                let logo_url = "/images/logos/senofidk/" + this.stockData.company_id + ".png"
                var xhr = new XMLHttpRequest();
                xhr.open('HEAD', logo_url, false);
                xhr.send();

                if (xhr.status === "404") {
                    console.log("File doesn't exist");
                    return false;
                } else {
                    console.log("File exists");
                    return logo_url;
                }

            }
        },

        created: function () {
            this.init()
        },

        watch: {
            company_id() {
                this.init()
            },
            $route (to, from) {
                if(from.path.startsWith('/rapportkollen/stock/') && to.path.startsWith('/rapportkollen/stock/')) {
                    this.$parent.resetData()
                }
            }
        },

        methods: {
            ...mapActions(["setAddNavigationTabsAction"]),
            // tabAddStocks(stock) {
            //     this.$router.push({name: 'landing-page.stock-detail', params: {stock_id: stock.stock_id}, query: {tab: 0}});
            // },
            init() {
                // move to CompanyPdfTable.vue
            }
        },
        data() {
            return {
                user: JSON.parse(localStorage.getItem('user')),
                country_code: null,
                url:
                    "https://documents.millistream.com/9732c7ae-de6a-4d94-9d43-bafab28d9778?language=sv",
                extract_date: "",
                scale: 2,
                last_pdfURL: "",
                textFromPDF: "",
                headers: [
                    {text: "Ticker", align: "left", value: "ticker"},
                    {text: "Name", align: "left", value: "name"},
                    {text: "Mkt Cap", align: "left", value: "market_cap"},
                    {text: "Reported", align: "left", value: "earningsDate"}
                ],
                yearReports: [],
                country_code: null,
            };
        }
    };
</script>

<style scoped>
    .chart-item {
        box-shadow: 1px 1px 6px 1px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        border: 1px #dddddd solid;
    }

    .ellipsis {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        display: inline-block;
    }

    .ellipsis3 {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        width: 140px;
        display: inline-block;
    }

    .ellipsis2 {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        display: inline-block;
    }

    >>> .peers th.text-right .peers th.text-left {
        padding: 0;
        background: #eeeecc;
    }
    >>> .peers td.text-right {
        padding: 0;
    }
    >>> .peers td.text-left {
        padding: 0;
    }

    >>> .v-data-table th {
        font-size: 1em !important;
        padding-left: 5px !important;
    }

    >>> .v-data-table td {
        font-size: 1em !important;
        padding-left: 5px !important;
    }
</style>
