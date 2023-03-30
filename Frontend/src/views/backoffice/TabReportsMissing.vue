<template lang="pug">
    v-row
        v-col
            v-card(class="mt-4 mx-auto")
                v-card-title Companies Missing Reports ({{companiesReportMissing.length}})
                v-card-subtitle company_calendar / company_report
                div( class="white mx-1 body-2" style="width:1100px; height:800px;overflow-y:auto;")

                    v-data-table(
                        disable-pagination=true
                        fixed-header=true
                        hide-default-footer=true
                        :headers="ch_report_missing"
                        :items="companiesReportMissing"
                        )

                        // from TABLE company_calendar
                        template( v-slot:item.date_report="{ item }")
                            span(class="blue--text") {{ item.date_report }}
                        template( v-slot:item.period="{ item }")
                            span(class="blue--text") {{ item.period }}

                        template( v-slot:item.actions="{ item }")
                            v-icon( class="mr-2" @click="getReportFromMillistream(item.company_ref, item.period)")  mdi-refresh

        v-col
            v-card(class="mt-4 mx-auto pa-8" max-width="800")
                v-btn(depressed color="primary" @click="getMissingReports()") Get Reports from Millistream

                v-card-text(class="my-6 grey darken-3 yellow--text " style="font: Courier;") {{this.missingReports}}

            v-card(class="mt-4 mx-auto black text--red" )
                v-card-text(
                    class="mt-4 mx-auto my-10 headline cyan--text"
                    style="font: Courier;"
                    ) /home/trader/tail -n 60 -f application.log


</template>

<script>
import ApiService from "@/Services/ApiService";

export default {
    name: "TabReportsMissing",
    
    props: {
        companiesReportMissing: Array,
    },
    
    methods: {
        async getMissingReports() {
            this.missingReports = (await ApiService.getMissingReports()).data;
        },

        async getReportFromMillistream(company_id, period) {
            const response = await ApiService.getReportFromMillistream(company_id, period);
            console.log(response);
            if (response.status === 200) {
                const message_text = response.data.text;
                const message_type = response.data.type;
                this.$store.commit("setMessage", {text: message_text, type: message_type});
            } else {
                this.$store.commit("setMessage", {text: 'failed with '+response.status, type: "warning"});
            }
        }
    },
    data() {
        return {    
            missingReports: "jjjj",
            ch_report_missing: [
                {text: "Company Ref", value:"company_id"},
                {text: "Name", value:"name"},
                {text: "Date Report", value:"date_report"},
                {text: "Period", value:"period"},
                {text: "Get from Millistream", value:"actions", sortable: "false"},
            ],
            company_calendar: [
                {text: "Company", value:""},
                {text: "Period", value:""},
                {text: "Date_report", value:""},
                {text: "Subtype", value:""},
            ],
            data_dump: null,
        }
    },
}
</script>
