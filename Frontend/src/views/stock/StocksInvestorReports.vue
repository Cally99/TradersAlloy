<template lang="pug">
    div(v-if="reports.length>0")
        div(style="max-width:890px; height:140px;")
            CalendarScroll
                ChartCalendarIR(@clickPDF="clickPDF" @clickMedia="clickMedia" :pdf_array="reports" :media_array="medias")

        div(style="max-width:890px;")
            template
                //- object(data="https://tv.streamfabriken.com/eg7-q3-2021" width="100%" style="height: calc( 100vh - 16rem );")
                object(:data="`${active_pdf_link}#view=FitH`" width="100%" style="height: calc( 100vh - 29rem );")
</template>

<script>
import VueFroala from "vue-froala-wysiwyg";
const _ = require('lodash');
import ChartCalendarIR from '../../components/ChartCalendarIR.vue'
import CalendarScroll from'./../../components/CalendarScroll.vue'

export default {
    components: {
        VueFroala,
        ChartCalendarIR,
        CalendarScroll
    },
    props: {
        stock_id: Number,
        company_id: Number,
        flag: Number
    },
    data() {
        return {
            checkReloadPDF: true,
            reports: null,
            years: ["2018", "2019", "2020", "2021"],  //TODO: change this to be year dynamic... before december
            quarters: ["Q1", "Q2" ,"Q3" ,"Q4", "FY"],
            activePeriod: null,
            activeGroupOnYear: null,
            medias: null,
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
            this.active_pdf_link = 'https://documents.millistream.com/' + pdf;
        },
        clickMedia(media) {
            console.log('parent click Media===========', media);
            this.active_pdf_link = media;
        },
        computedPDFFromQueryString() {
            let report = '';

            if (this.$route.query.firstTime === 0) {
                this.$router.push({ query: Object.assign({}, this.$route.query, { firstTime: 1 }) });
                this.activePeriod = this.$route.query.active_report;

                 this.checkReloadPDF = false;

                 setTimeout(() => {
                    this.checkReloadPDF = true;
                }, 50);
            } else {
                this.$route.query.active_report = this.activePeriod;
            }

            if (this.$route.query.active_report.substring(5, 7) !== 'FY') {
                report  = this.reports.find(    r =>    this.$route.query.active_report === r.period   );
            } else {
                report  = this.reports.find(    r =>    this.$route.query.active_report.substring(0, 4) === r.period   );
            }

            return `https://documents.millistream.com/${report.pdf_link}`;
        },

        getReport (yyyy, qq) {
            if(qq !== 'FY') {
                return this.reports.find( r =>  r.period === `${yyyy}-${qq}`);
            }

            return this.reports.find( r =>  r.period === yyyy);
        },

        showPdf(yyyy, qq) {
            this.activePeriod = `${yyyy}-${qq}`;
        },

        getPdfLink(year) {
        },

        init() {
            // bug appears here : not laoding the PDF : now the PDF is in each report (not a separate table
            //let pdf_array = this.$store.getters['getCRP'].get(this.company_id)
            this.company = this.$store.getters['getMapCompanies'].get(this.company_id);
            if (this.company) {
                let reports_init = this.company.CompanyReports;
                if (reports_init.length > 0) {
                    let reports_order = _.orderBy(reports_init, ['date_report'],['asc']);
                    reports_order[reports_order.length-1].active = true;
                    this.reports = reports_order;
                    // this.activePeriod = _.maxBy(this.reports, 'period').period;
                }
    
                let webcasts_init = this.$store.getters['getCompanyWebcasts'].filter(item=> item.company_id == this.company_id);
                this.medias = _.orderBy(webcasts_init, ['publish_date'],['asc']);
    
                let active_pdf_link_init = this.reports[this.reports.length-1].pdf_link;
                this.active_pdf_link = 'https://documents.millistream.com/' + active_pdf_link_init;
                console.log('QQQQQQQQQQQQQ', this.active_pdf_link);
            } else {
                this.reports = [];
                this.medias = [];
            }

            this.$root.$on('forReloadOfPDF', (checkReloadPDF) => {
                this.checkReloadPDF = checkReloadPDF;

                // Add this timeout so it will set checkReloadPDF to true again
                // so the PDF Reader is removed from the DOM and then added again
                // as soon as checkReloadPDF variable are true again.
                setTimeout(() => {
                    this.checkReloadPDF = true;
                }, 50);
            });
        }
    },
    computed: {
        computedPDF() {
            let report = '';

            if(this.activePeriod.substring(5, 7) !== 'FY') {
                report  = this.reports.find(    r =>    this.activePeriod === r.period   );
            } else {
                report  = this.reports.find(    r =>    this.activePeriod.substring(0, 4) === r.period   );
            }

            return `https://documents.millistream.com/${report.pdf_link}`;
        }
    },
    mounted() {
        this.init()
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
