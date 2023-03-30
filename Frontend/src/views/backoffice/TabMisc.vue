<template lang="pug">
    v-container(fluid)
        v-row
            v-col(cols=6)
                v-card
                    v-card-text
                        div(class="display-1 font-weight-thin") Reporting in next 30 days
                        div(class="subheading font-weight-light grey--text") Last Campaign Performance
                        v-divider
                        ChartDataLoad(:loadedVsExpectedReports="loadedVsExpectedReports")
                        //ChartDataLoad4(:loadedVsExpectedReports="loadedVsExpectedReports")
                        v-divider
            v-col(cols=6)
                    v-sheet(class="v-sheet--offset mx-auto"  color="orange darken-4" max-width="calc(100% - 32px)")
                        v-sparkline(
                            :labels="labels"
                            :value="companiesReportingCount60_count"
                            color="white"
                            type="trend"
                            line-width="1"
                            padding="16"
                            stroke-linecap="round"
                            smooth)
                    v-icon(class="mr-2" small) mdi-clock
                    span(class="caption grey--text font-weight-light") last registration 26 minutes ago
        v-row
            v-col(cols=6)
                v-card(class="mt-4 mx-auto" max-width="700")
                    v-card-text
                        div(class="display-1 font-weight-thin") EPS Example
                        ChartEPS(:company_id="82832")


</template>

<script>
    import ChartDataLoad from'./ChartDataLoad.vue'
    import ChartDataLoad4 from'./ChartDataLoad4.vue'
    import ChartEPS from'./ChartEPS.vue'

export default {
    name: 'TabMisc',
    components:   {
        ChartDataLoad,
        ChartDataLoad4,
        ChartEPS,
    },
    props: {
        companiesWithNoFutureEvents: Array,
        companiesReportingCount60_count: Array,
        loadedVsExpectedReports: Array,
    },
    data() {
        return {
            labels: [
                '1','2','3',' 4',' 5',
                '-','-','-','-','10',
                '-','-','-','-','15',
                '-','-','-','-','20',
                '-','-','-','-','25',
                '-','-','-','-','30',
                '-','-','-','-','35',
                '-','-','-','-','40',
                '-','-','-','-',
            ],
            ch_zero_events: [
                {text: "name", value:"name"},
                {text: "company_id", value:"company_id"},

            ],
            company_calendar: [
                {text: "company", value:""},
                {text: "period", value:""},
                {text: "date_report", value:""},
                {text: "type", value:""},
            ]
        }
    },
}
</script>
