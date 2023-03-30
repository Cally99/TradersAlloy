<template lang="pug">
    div
        div( v-if="company.ceo_comments !== '' && company.ceo_comments !== null"  class="pa-2 black--text")
            v-img(src='/images/pdf.png' style="width:30px;margin:9px;float:left;")
            span {{company.ceo_comments.substring(0, 320)}} ...
            router-link( :to="{name: 'landing-page.stock-detail', params: {stock_id: stock_id}, query: {tab: 1}}"
                style="float:right; color:cornflowerblue;") read more...

        table(class="mx-8 white black--text" style="margin-top:10px; float:left")
            tr
                //- th(width="80px" ) Year
                th(width="80px" )
                th(width="80px" ) Q1
                th(width="80px" ) Q2
                th(width="80px" ) Q3
                th(width="80px" ) Q4
                th(width="80px" ) FY
            tr( v-for=" year in years")
                td {{year}}
                td( v-for=" quarter in quarters")
                    a( v-if="getPdfLink( year, quarter) !== undefined" @click="gotoPdf( year, quarter)" class="stock-pdf")
                        v-icon(size="80%") $pdfFile
</template>

<script>
export default {
    name: "CompanyPdfTable",
    props: {
        company_id: Number,
        stock_id: Number,
    },
    data() {
        return {
            company: null,
            last_report: null,
            years: ["2021", "2020", "2019", "2018"],  // TODO: change this to be year dynamic... before december
            quarters: ["Q1", "Q2" ,"Q3" ,"Q4", "FY"],
        }
    },
    methods: {
        getPdfLink(year, quarter) {
            if(quarter !== 'FY') {
                return this.company.CompanyReports.find((r) => `${year}-${quarter}` === r.period);
            }

            return this.company.CompanyReports.find((r) => year === r.period);
        },

        gotoPdf(year, quarter) {
            let pdf_link = '';
            let active_report = '';

            if(quarter !== 'FY') {
                pdf_link = this.company.CompanyReports.find((r) => `${year}-${quarter}` === r.period).pdf_link;
                active_report = `${year}-${quarter}`;
            } else {
                pdf_link = this.company.CompanyReports.find((r) => year === r.period).pdf_link;
                active_report = `${year}-FY`;
            }

            this.$router.push({name: 'landing-page.stock-detail', params: {stock_id: this.stock_id}, query: {tab: 1, pdf: pdf_link, active_report: active_report, firstTime: 0}});
        },
    },

    created: function () {
        this.company = this.$store.getters["getMapCompanies"].get(this.company_id);

        const reportDates = this.company.CompanyReports;
        this.last_report = reportDates.reduce( (rMax, rCurrent) => {
            return (rCurrent.date_report > rMax.date_report ? rCurrent : rMax);
        }, reportDates[0] );
    }
}
</script>

<style scoped>
span.bigText {
    font-size: 1.3em;
}

a.tool-tip[data-tool-tip]::after {
    content: attr(data-tool-tip);
    display: block;
    position: absolute;
    background-color: #dad88c;
    padding: 1em 3em;
    color: #4c5667;
    border-radius: 5px;
    font-size: 1em;

    left: 0;
    white-space: nowrap;
    transform: scale(0);
    transition: transform ease-out 150ms;
}

a.tool-tip[data-tool-tip]:hover::after {
    transform: scale(1);
}

table>tr>td{
    padding:6px 4px;
    border-spacing: 3px;
}

table{
    font-size: 1.2em;
}

>>> .set-pdf-file-container {
    width: 24px;
    height: 32px;
}

>>> .set-pdf-file-color {
    fill: #E72929;
}
</style>
