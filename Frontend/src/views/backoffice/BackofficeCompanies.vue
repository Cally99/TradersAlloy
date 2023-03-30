<template lang="pug">
    div
        h1(class="subheading grey--text") Back office: Companies

        v-tabs
            v-tab Data Integrity
            v-tab Misc
            v-tab Reports TODAY
            v-tab Reports Missing
            v-tab Company
            v-tab Delisted

            v-tab-item
                TabDataIntegrity

            v-tab-item
                TabMisc(
                    :companiesWithNoFutureEvents="this.data_dump.companiesWithNoFutureEvents"
                    :companiesReportingCount60_count="this.data_dump.companiesReportingCount60_count"
                    :loadedVsExpectedReports="this.data_dump.loadedVsExpectedReports"
                )

            v-tab-item
                TabReportsToday(
                    :companiesReportingToday="this.data_dump.companiesReportingToday"
                )

            v-tab-item
                TabReportsMissing(
                    :companiesReportMissing="this.data_dump.companiesReportMissing"
                )

            v-tab-item
                TabCompany

            v-tab-item
                TabCompanyDelisted(
                    :companiesDelisted="this.data_dump.companiesDelisted"
                )

</template>

<script>
import TabCompany from "./TabCompany.vue";
import TabCompanyDelisted from "./TabCompanyDelisted.vue";
import TabReportsMissing from "./TabReportsMissing.vue";
import TabMisc from "./TabMisc.vue";
import TabReportsToday from "./TabReportsToday.vue";
import TabDataIntegrity from "./TabDataIntegrity.vue";

import ApiService from "@/Services/ApiService";

export default {
    components: {
        TabCompany,
        TabCompanyDelisted,
        TabReportsMissing,
        TabMisc,
        TabReportsToday,
        TabDataIntegrity,
    },

    name: "BackofficeCompanies",

    mounted: async function() {
        this.data_dump = (await ApiService.getBackofficeCompanyData()).data;
        // console.log('DATA_DUMP=' + this.data_dump.companiesReportingToday);

//        this.company = this.$store.getters["getMapCompanies"].get(814832);
    },

    computed: {
    },

    methods: {
    },

    data() {
        return {
            data_dump: null,
        }
    },
}
</script>
