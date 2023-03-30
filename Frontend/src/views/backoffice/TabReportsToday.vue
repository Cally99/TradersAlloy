<template lang="pug">
    div
        v-card(class="mt-4 mx-auto" )
            v-card-title Companies reporting Today (Got {{this.reportedCount}} of {{companiesReportingToday.length}})
            v-card-subtitle company_calendar / company_report
            div( class="white mx-1 body-2" style="height:800px;overflow-y:auto;")

                v-data-table(
                    disable-pagination=true
                    fixed-header=true
                    hide-default-footer=true
                    filter=true

                    :headers="ch_report"
                    :items="companiesReportingToday"
                )
                    // from TABLE company... default black

                    // from TABLE company_calendar
                    template(v-slot:item.date_report="{ item }")
                        span(class="blue--text") {{ item.date_report }}
                    template(v-slot:item.period="{ item }")
                        span(class="blue--text") {{ item.period }}

                    // from TABLE company_report
                    template(v-slot:item.type_report="{ item }")
                        span(class="green--text") {{ item.type_report }}
                    template(v-slot:item.currency="{ item }")
                        span(class="green--text") {{ item.currency }}
                    template(v-slot:item.eps="{ item }")
                        span(class="green--text") {{ item.eps }}
                    template(v-slot:item.sales="{ item }")
                        span(class="green--text") {{ item.sales }}

                    // from TABLE company_calendar
                    template(v-slot:item.language="{ item }")
                        span(class="blue--text text--darken-3") {{ item.language }}
                    template(v-slot:item.uuid="{ item }")
                        a(class="blue--text text--darken-3" :href="getPdfUrl(item.uuid)") {{item.uuid}}

                    template(v-slot:item.actions="{ item }")
                        v-icon(class="mr-2" @click="getReportFromMillistream(item.company_id, item.period)")  mdi-refresh

</template>

<script>
import ApiService from "@/Services/ApiService";

export default {
    name: "TabReportsToday",

    props: {
        companiesReportingToday: Array,
    },

    computed: {
        reportedCount: function() {
            return  this.companiesReportingToday.reduce ( (n, record)  => {
                if (record.type_report === 'Q' || record.type_report === 'Y') {
                    n++;
                }
                return n;
            }, 0);
        },
    },

    methods: {
        getPdfUrl(uuid) {
            return 'https://documents.millistream.com/'+uuid;
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
            ch_report: [
                {text: "Company id", value:"company_id"},
                {text: "Name", value:"name"},
                {text: "Date Report", value:"date_report"},
                {text: "Period", value:"period"},
                {text: "Type", value:"type_report"},
                {text: "Currency", value:"currency"},
                {text: "EPS", value:"eps"},
                {text: "Sales", value:"sales"},
                {text: "language", value:"language"},
                {text: "PDF", value:"uuid"},
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
