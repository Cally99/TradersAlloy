<template lang="pug">
    v-container(fluid)
        v-row
            v-col(cols=5)
                v-card(class="mt-4 mx-auto" max-width="600")
                    v-card-title LATE Reports
                    v-card-subtitle The event has passed... waiting for Millistream
                    v-data-table(
                        height="350"
                        dense
                        fixed-header=true
                        disable-pagination=true
                        :headers="waitingForLateReportHeaders"
                        :items="waitingForLateReport"
                    )
                    span
                        a(href="https://mws.millistream.com/mws.fcgi?cmd=fundamentals&insref=82800&startdate=2022-01-01&currency=SEK&fields=eventlink,eventlinklanguages,name,currency,sales,gp,ebitda,ebit,ptp,np,intangibleasset,fixedasset,financialasset,noncurrentasset,cce,currentassets,totalassets,shequity,ltliabilities,curliabilities,eps,totalnumberofshares,ibl&filetype=json&usr=tradersalloy&pwd=zBaly0kTcfneORknIjvnK1kMIj1eO0iJTmdxKEkR"
                          target="_blank") millistream -->
                        div Note 1: Example period is 2022, millistream serves all reports for the year
                        div Note 2: Example currency is SEK, change as needed
            v-col(cols=4)
                v-card(class="mt-4 mx-auto" max-width="600")
                    v-card-title LATE Prices
                    v-card-subtitle based on time before 18:00, including weekend logic.
                    v-data-table(
                        height="350"
                        dense
                        fixed-header=true
                        disable-pagination=true
                        :headers="pricesTwoDaysLateHeaders"
                        :items="pricesTwoDaysLate"
                    )
                    div(style="font-size:1.5rem; margin-left:30px")
                        span Prices:  &nbsp;
                        span(style="font-weight:700; ") {{mostPricesUpdated[0].count}} &nbsp;
                        span updated on &nbsp;
                        span(style="font-weight:700; padding:3px;" :style="styleDay") {{mostPricesUpdated[0].day}}
                    div
                        a(href="https://mws.millistream.com/mws.fcgi?cmd=history&insref=2187&fields=insref,date,closeprice,closequantity,closeturnover,closedayhighprice,closedaylowprice,openprice&startdate=2021-01-20&enddate=2100-01-01&filetype=json&usr=tradersalloy&pwd=zBaly0kTcfneORknIjvnK1kMIj1eO0iJTmdxKEkR"
                            target="_blank") millistream -->

        v-row
            v-col(cols=4)
                v-card(class="mt-4 mx-auto")
                    v-card-title Events Of Millistream We Do Not Have
                    v-card-subtitle Work In Progress ... comparing company_calendar_history
                        v-data-table(
                            height="350"
                            dense
                            fixed-header=true
                            disable-pagination=true
                            :headers="eventsOfMillistreamWeDoNotHaveHeaders"
                            :items="eventsOfMillistreamWeDoNotHave"
                        )
            v-col(cols=4)
                v-card(class="mt-4 mx-auto")
                    v-card-title Delisted Stocks
                    v-card-subtitle ...
                        v-data-table(
                            height="350"
                            dense
                            fixed-header=true
                            disable-pagination=true
                            :headers="delistedStocksHeaders"
                            :items="delistedStocks"
                        )
        v-row
            v-col(cols=4)
                v-card(class="mt-4 mx-auto")
                    v-card-title Stocks with no Company
                    v-card-subtitle ...
                        v-data-table(
                            height="350"
                            dense
                            fixed-header=true
                            disable-pagination=true
                            :headers="stocksWithNoCompanyHeaders"
                            :items="stocksWithNoCompany"
                        )
            v-col(cols=4)
                v-card(class="mt-4 mx-auto")
                    v-card-title Companies with No Reports
                    v-card-subtitle add the **created_at** date to show new companies
                        v-data-table(
                            height="350"
                            dense
                            fixed-header=true
                            disable-pagination=true
                            :headers="companiesWithNoReportsHeaders"
                            :items="companiesWithNoReports"
                        )


        v-row
            v-col(cols=6)
                v-card(class="mt-4 mx-auto")
                    v-card-title REPORT : date Report Is null
                    v-card-subtitle ...
                        v-data-table(
                            height="350"
                            dense
                            fixed-header=true
                            disable-pagination=true
                            :headers="dateReportIsNullHeaders"
                            :items="dateReportIsNull"
                        )
            v-col(cols=6)
                v-card(class="mt-4 mx-auto")
                    v-card-title REPORT : EPS, PS, PE or Price is null
                    v-card-subtitle ...
                        v-data-table(
                            height="350"
                            dense
                            fixed-header=true
                            disable-pagination=true
                            :headers="ePSIsNullHeaders"
                            :items="ePSIsNull"
                        )
        v-row
            v-col(cols=6)
                v-card(class="mt-4 mx-auto")
                    v-card-title Stocks with no Sector
                    v-card-subtitle ...
                        v-data-table(
                            height="350"
                            dense
                            fixed-header=true
                            disable-pagination=true
                            :headers="stocksWithNoSectorHeaders"
                            :items="stocksWithNoSector"
                        )


</template>

<script>
    import ChartDataLoad from'./ChartDataLoad.vue'
    import ChartDataLoad4 from'./ChartDataLoad4.vue'
    import ApiService from "@/Services/ApiService"
    import moment from 'moment';

export default {
    name: 'TabDataIntegrity',
    components:   {
        ChartDataLoad,
        ChartDataLoad4,
    },
    mounted: async function() {
        this.data_dump = await ApiService.getDataIntegrity();
        this.waitingForLateReport = this.data_dump.waitingForLateReport;
        this.pricesTwoDaysLate = this.data_dump.pricesTwoDaysLate;
        this.mostPricesUpdated = this.data_dump.mostPricesUpdated;
        this.companiesWithNoReports = this.data_dump.companiesWithNoReports;
        this.eventsOfMillistreamWeDoNotHave = this.data_dump.eventsOfMillistreamWeDoNotHave;
        this.delistedStocks = this.data_dump.delistedStocks;
        this.stocksWithNoCompany = this.data_dump.stocksWithNoCompany;
        this.dateReportIsNull = this.data_dump.dateReportIsNull;
        this.ePSIsNull = this.data_dump.ePSIsNull;
        this.stocksWithNoSector = this.data_dump.stocksWithNoSector;

    },
    computed: {
        styleDay () {
            const gotDataFrom  = this.mostPricesUpdated[0].day
            const time = new Date().toISOString().substring(11,13);
            console.log (time)

            let targetDay;
            if (time > 17) {
                targetDay = moment(new Date()).subtract(1, 'day').format('dddd');
            } else {
                targetDay = moment(new Date()).format('dddd');
            }
            const expectDataFrom = (targetDay==='Saturday' || targetDay==='Sunday' ? 'Friday' : targetDay);


            if (gotDataFrom !== expectDataFrom) {
                return "background: IndianRed; color:Khaki; ";
            } else {
                return "color: green;";
            }

        },
    },

    data() {
        return {
            waitingForLateReport: [],
            waitingForLateReportHeaders: [
                {text: "company_id",    value:  "company_id"   , width: "30"},
                {text: "name",          value:  "name"         , width: "100"},
                {text: "period",        value:  "period"       , width: "80"},
                {text: "date_report",   value:  "date_report"  , width: "100"},
                {text: "Days Late",     value:  "days_late"    , width: "60"},
                {text: "Exchange",      value:  "exchange_name", width: "160"},
            ],
            pricesTwoDaysLate: [],
            pricesTwoDaysLateHeaders: [
                {text: "price_updated", value:  "price_updated" , width: "60"},
                {text: "name",          value:  "name"          , width: "100"},
                {text: "stock_id",      value:  "stock_id"      , width: "60"},
                {text: "Days Late",     value:  "days_late"     , width: "60"},
            ],
            mostPricesUpdated: null,
            companiesWithNoReports:[] ,
            companiesWithNoReportsHeaders: [
                {text: "company_id", value:  "company_id" , width: "60"},
                {text: "name",          value:  "name"          , width: "100"},
                {text: "created_at",      value:  "created_at"      , width: "60"},
            ],
            eventsOfMillistreamWeDoNotHave: [],
            eventsOfMillistreamWeDoNotHaveHeaders: [
                {text: "company_id",    value:  "company_id"   , width: "30"},
                {text: "name",          value:  "name"         , width: "100"},
                {text: "period",        value:  "period"       , width: "80"},
            ],
            delistedStocks: [],
            delistedStocksHeaders: [
                {text: "company_id",    value:  "company_id"   , width: "30"},
                {text: "stock_id",      value:  "stock_id"     , width: "30"},
                {text: "name",          value:  "name"         , width: "100"},
                {text: "status_flag",   value:  "status_flag"  , width: "30"},
            ],
            stocksWithNoCompany: [],
            stocksWithNoCompanyHeaders: [
                {text: "stock_id",      value:  "stock_id"     , width: "30"},
                {text: "name",          value:  "name"         , width: "100"},
            ],

            dateReportIsNull       : [],
            dateReportIsNullHeaders: [
                {text: "name      ", value:  "name",     width: "30"},
                {text: "period    ", value:  "period"   , width: "100"},
                {text: "company_id", value:  "company_id",width: "80"},
            ],
            ePSIsNull              : [],
            ePSIsNullHeaders       : [
                {text: "name      ", value:  "name",     width: "30"},
                {text: "period    ", value:  "period"   , width: "100"},
                {text: "company_id", value:  "company_id",width: "80"},
                {text: "eps       ", value:  "eps"  ,     width: "100"},
                {text: "ps        ", value:  "ps"    ,    width: "60"},
                {text: "pe        ", value:  "pe",        width: "160"},
                {text: "price     ", value:  "price",     width: "160"},
            ],
            stocksWithNoSector: [],
            stocksWithNoSectorHeaders: [
                {text: "name      ", value:  "name",            width: "30"},
                {text: "company_id", value:  "company_id",      width: "80"},
                {text: "stock_id",   value:  "stock_id"     ,   width: "30"},
                {text: "Primary Listing",value:  "primary_listing", width: "30"},
                {text: "Exchange",      value:  "exchange_name",width: "160"},

            ],
        }
    },
}
</script>

<style scoped>
</style>
