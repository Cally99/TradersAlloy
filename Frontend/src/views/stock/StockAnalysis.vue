<template lang="pug">
    div(class="investor-report" v-if="reports.length > 0")
        ChartCalendarAnalysis(:pdf_array="reports" @clickPDF="clickPDF")

        v-card(class="d-flex")
            div(style="width:100%;")
                template
                    object(:data="active_pdf_link" width="100%" style="height: calc( 100vh - 16rem );")
                //- template(v-if="$route.query.pdf === undefined")
                //-     object(v-if="getPdfLink( activePeriod ) !== '' " :data="computedPDF+`#view=fitH`" width="100%" style="height: calc( 100vh - 16rem );")
                //- template(v-else)
                //-     object(v-if="getPdfLink( activePeriod ) !== '' && checkReloadPDF " :data="computedPDFFromQueryString()+`#view=fitH`" width="100%" style="height: calc( 100vh - 16rem );")
</template>

<script>
const _ = require('lodash');
import ChartCalendarAnalysis from '../../components/ChartCalendarAnalysis.vue'

export default {
    components: {
        ChartCalendarAnalysis
    },
    props: {
        stock_id: Number,
        company_id: Number
    },
    data() {
        return {
            checkReloadPDF: true,
            reports: null,
            years: ["2018", "2019", "2020", "2021"],  //TODO: change this to be year dynamic... before december
            quarters: ["Q1", "Q2" ,"Q3" ,"Q4", "FY"],
            activePeriod: null,
            activeGroupOnYear: null,
            active_pdf_link: null
        }
    },
    watch: {
        stock_id() { //  TODO: maybe add company_id to the watch ???
            this.init()
        },
        pdf() {
            this.init()
        }
    },
    methods: {
        clickPDF(pdf) {
            this.active_pdf_link = '/companyanalysis/' + pdf;
        },
        init() {
            let analysis_array = this.$store.getters['getCompanyAnalystsOne'];
            let analysis_init = analysis_array.filter(item => item.company_id == this.company_id);
            if (analysis_init.length > 0) {
                let analysis_order = _.orderBy(analysis_init, ['publish_date'],['asc']);
                analysis_order[analysis_order.length-1].active = true;
                this.reports = analysis_order;
                let active_pdf_link_init = analysis_order[analysis_order.length-1].pdf_link;
                this.active_pdf_link = '/companyanalysis/' + active_pdf_link_init;
            } else {
                this.reports = [];
            }
        }
    },
    computed: {
    },
    created() {
        this.init();
    },
    mounted() {
    }
}
</script>

<style scoped>
    table>tr>td{
        padding:6px 4px;
        border-spacing: 3px;
    }

    table.quater-table thead th {
        font-weight: unset;
    }

    >>> .set-pdf-file-container {
        width: 24px;
        height: 32px;
    }

    >>> .set-pdf-file-color {
        fill: #E72929;
    }

    >>> .set-pdf-file-active-container {
        width: 24px;
        height: 32px;
    }

    >>> .set-pdf-file-active-color {
        fill: #E72929;
    }
</style>
