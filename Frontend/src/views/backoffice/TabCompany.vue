<template lang="pug">
    v-contaoner
        v-row
            v-col(cols=3)
                    v-autocomplete(
                        v-model="this.search"
                        :label="'Search by company name'"
                        :placeholder="'Search by company name'"
                        data-v-step='0'
                        :items="getAllStocks"
                        item-text="name"
                        item-value="ticker"
                        return-object
                        dense
                        solo
                        @input="onChange"
                        style="")
                        template( v-slot:selection="data")
                            span
                        template( v-slot:item="data")
                            div(style="height:30px;")
                                div(style="display:inline-block; width:60px; vertical-align:top;" class="ticker") {{data.item.ticker}}
                                div(style="display:inline-block; width:200px; vertical-align:top; margin:0 0 0 40px; height:30px;") {{data.item.name}}
                                div(style="display:inline-block; width:200px; margin:0px; vertical-align:top; height:30px;" class="ml-2") {{data.item.sector_name}}

            v-col(cols=3)
                    v-text-field(
                        v-model="input"
                        label="Company ID"
                        @keyup.enter="loadData"
                        )

        v-template(v-if="search != ''")
            v-row
                v-col
                    h3(style="margin-left: 10px") Company
                    v-data-table(
                        dense
                        fixed-header=true
                        hide-default-footer=true
                        style="width:1200px"
                        :items-per-page="1"
                        :headers="ch_report_company"
                        :items="this.filteredCompany"
                        )
                        template(v-slot:default)

            v-row
                v-col
                    h3(style="margin-left: 10px") Company Calendar
                    v-data-table(
                        dense
                        fixed-header=true
                        hide-default-footer=true
                        style="width:450px"
                        :items-per-page="100"
                        :headers="ch_report_company_calendar"
                        :items="this.companyCalendar"
                        )
                        template(v-slot:default)

            v-row
                v-col
                    h3(style="margin-left: 10px") Company Report
                    div {{this.filteredCompanyReport}}

                    v-data-table(
                        dense
                        fixed-header=true
                        hide-default-footer=true
                        style="width:1400px"
                        :items-per-page="15"
                        :headers="ch_report_company_report"
                        :items="this.filteredCompanyReport"
                        )
                        template(v-slot:default)

            v-row
                v-col
                    h3(style="margin-left: 10px") Stock
                        v-btn(
                            style="margin-left:20px"
                            elevation="2"
                            @click="onClickStock"
                        ) View Stocks
                    template(v-slot:default)
                    v-data-table(
                        dense
                        fixed-header=true
                        hide-default-footer=true
                        style="width:1200px;"
                        :items-per-page="6"
                        :headers="ch_report_company_stock"
                        :items="this.filteredCompanyStocks"
                        )
                        template(v-slot:default)

</template>

<script>
import {mapGetters} from "vuex";

export default {
    name: 'TabCompany',
    computed: {
            ...mapGetters([
                "getMapCompanies",
                "getAllStocks",
                "getFinancials"
            ])
    },
    data() {
        return {
            counter: 0,
            calendars: null,
            input: '',
            search: '',
            ch_report_company: [
                {text: "Company ID", value:"company_id"},
                {text: "Name", value:"name"},
                {text: "Description", value:"description"},
                {text: "Ceo Comments", value:"ceo_comments"},
                {text: "Market Cap", value:"market_cap"},
                {text: "Last pe", value:"last_pe"},
                {text: "Last eps", value:"last_eps_ttm"},
                {text: "Next Date Report", value:"next_report_date"},
                {text: "Last Sales", value:"last_sales"},
            ],
            ch_report_company_calendar:[
                {text: "Company ID", value:"company_id"},
                {text: "Period", value:"period"},
                {text: "Date Report", value:"date_report"},
                {text: "Subtype", value:"type_report"},

            ],
            ch_report_company_report:[
                {text: "Company ID", value:"company_id"},
                {text: "Period", value:"period"},
                {text: "Date Report", value:"date_report"},
                {text: "Type Report", value:"type_report"},
                {text: "Currency", value:"currency"},
                {text: "eps_ttm", value:"eps_ttm"},
                {text: "Price", value:"price"},
                {text: "Sales", value:"sales"},
                {text: "eps", value:"eps"},
                {text: "gp", value:"gp"},
                {text: "ebitda", value:"ebitda"},
                {text: "ebit", value:"ebit"},
                {text: "IBL", value:"ibl"},
                {text: "PDF link", value:"pdf_link"},
            ],
            ch_report_company_stock:[
                {text: "Company ID", value:"company_id"},
                {text: "Stock ID", value:"stock_id"},
                {text: "Name", value:"name"},
                {text: "Price Updated", value:"price_updated"},

            ],
            filteredCompany: [],
            companyCalendar: [],
            filteredCompanyReport: [],
            filteredCompanyStocks: '',
            stockIdLoaded: '',
            companyReport: [],
        }
    },

    methods:{
        loadData(){
            this.search = this.input;
            // console.log(this.getMapCompanies);
            let company = this.getMapCompanies.get(parseInt(this.search));
            if (company!=undefined) {
                this.filteredCompany.splice(0,1, company);
                // console.log(company);
            }

            this.companyCalendar = company.CompanyCalendars;
            // console.log(this.companyCalendar);

            this.companyReport = company;
            console.log(this.companyReport);



            if (company!=undefined) {
                let companyReport = this.getFinancials.filter(item=>item.company_id[0] === parseInt(this.search));
                this.filteredCompanyReport = companyReport;
                console.log(this.filteredCompanyReport);
            }



            // console.log(this.getAllStocks);
            if (company!=undefined) {
                let companyStocks = this.getAllStocks.filter(item=>item.company_id === parseInt(this.search));
                this.filteredCompanyStocks = companyStocks;
            // console.log(filteredCompanyStocks);
            }
        },
        onChange(stock) {
           this.input = stock.company_id;
           this.stockIdLoaded = stock.stock_id;
           this.loadData();
        },
        onClickStock() {
            this.$router.push({name: 'landing-page.stock-detail', params: {stock_id: this.stockIdLoaded}});
        },
        changeButtonText(){
            this.counter += 1;
        }
    }
}
</script>
