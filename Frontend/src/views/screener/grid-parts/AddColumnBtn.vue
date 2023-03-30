<template lang="pug">
    div
        div(style="position:absolute;top:130px;right:20px;z-index:10000;")
            v-btn(class="blue3 white--text" style="text-transform:none !important;" @click="add_columns()")
                v-icon(class="mr-2" size="18") mdi-plus
                span {{ $t('add_columns') }}
            
        v-container(v-if="is_open" style="height:600px;width:650px;position:absolute;top:168px;right:20px;z-index:10000; background: white; border: 1px solid rgba(0, 0, 0, 0.1);box-shadow: 10px 13px 48px -4px rgb(0 0 0 / 49%); overflow-y:auto")
            div(style="width:20px;height:20px;border-radius:50%;float:right;cursor:pointer" @click="close_add_columns()")
                v-icon(class="mr-2" size="24") mdi-close
            h5 {{ $t('company_info') }}
                div(v-for="item in companyInformation" style="margin:1px 0px -18px 25px; display: flex; justify-content: space-between;")
                    v-checkbox(v-model="item.checked" color="blue3" dense :label="item.label" class="ma-0 pa-0 my-checkbox" style="height:35px;" @change="changeValue(item.label)")
            h5 {{ $t('Valuation') }}
                div(v-for="item in valuation" style="margin:1px 0px -18px 25px; display: flex;")
                    div(class="left" style="width: 50%")
                        v-checkbox(v-model="item.checked" color="blue3" dense :label="item.label" class="ma-0 pa-0 my-checkbox" style="height:35px;" @change="changeValue(item.label)")
                    div(class="right" style="width: 50%; padding-left: 60px;")
                        span(v-if="item.placeHolder" style="font-size:13px; color:#ccc; margin-top:3px;") {{item.placeHolder}}
            h5 {{ $t('Income_Statement') }}
                div(v-for="item in incomeStatement" style="margin:1px 0px -18px 25px; display: flex;")
                    div(class="left" style="width: 50%; display: flex; justify-content: space-between")
                        v-checkbox(v-model="item.checked" color="blue3" dense :label="item.label" class="ma-0 pa-0 my-checkbox" style="height:35px;" @change="changeValue(item.label)")
                        v-checkbox(v-if="item.child" color="blue3" dense v-model="item.child[0].checked" :label="item.child[0].label" class="ma-0 pa-0 my-checkbox" style="height:35px;" @change="changeValue(item.child[0].name)")
                    div(class="right" style="width: 40%; padding-left: 60px;")
                        span(v-if="item.placeHolder" style="font-size:13px; color:#ccc; margin-top:3px;") {{item.placeHolder}}
            h5 {{ $t('Balance_sheet') }}
                div(v-for="item in balanceSheet" style="margin:1px 0px -18px 25px; display: flex;")
                    div(class="left" style="width: 50%")
                        v-checkbox(v-model="item.checked" color="blue3" dense :label="item.label" class="ma-0 pa-0 my-checkbox" style="height:35px;" @change="changeValue(item.label)")
                    div(class="right" style="width: 50%; padding-left: 60px;")
                        span(v-if="item.placeHolder" style="font-size:13px; color:#ccc; margin-top:3px;") {{item.placeHolder}}
            h5 {{ $t('Ratios') }}
                div(v-for="item in ratios" style="margin:1px 0px -18px 25px; display: flex;")
                    div(class="left" style="width: 50%; display: flex; justify-content: space-between")
                        v-checkbox(v-model="item.checked" color="blue3" dense :label="item.label" class="ma-0 pa-0 my-checkbox" style="height:35px;" @change="changeValue(item.label)")
                        v-checkbox(v-if="item.child" v-model="item.child[0].checked" color="blue3" dense :label="item.child[0].label" class="ma-0 pa-0 my-checkbox" style="height:35px;" @change="changeValue(item.child[0].name)")
                    div(class="right" style="width: 50%; padding-left: 60px;")
                        span(v-if="item.placeHolder" style="font-size:13px; color:#ccc; margin-top:3px;") {{item.placeHolder}}

</template>

<script>

export default {
    name: "AddColumnBtn",
    props: {
        filters: Object
    },
    data: function() {
        return {
            is_filter: false,
            is_open: false,
            defaultColumns: [
                "",
                this.$t('Ticker'),
                this.$t('Name'),
                this.$t('Exchange'),
                this.$t('Sector'),
                this.$t('Sales')
            ],
            list:[
                this.$t('Ticker'),
                this.$t('Name'),
                this.$t('Exchange'),
                this.$t('P_B'),
                this.$t('P_S'),
                this.$t('P_E'),
            ],
            companyInformation : [
                {
                    checked: true,
                    label: this.$t('Ticker'),
                },
                {
                    checked: false,
                    label: this.$t('Name')
                },
                {
                    checked: false,
                    label: this.$t('Exchange')
                },
                {
                    checked: false,
                    label: this.$t('Sector')
                },
                {
                    checked: false,
                    label: this.$t('last_report_date')
                },
                {
                    checked: false,
                    label: this.$t('next_report_date')
                },
                {
                    checked: false,
                    label: this.$t('Price')
                },
            ],
            valuation : [
                {
                    checked: false,
                    label: this.$t('Enterprise_value'),
                    placeHolder: this.$t('Market_cap_cash_debt')
                },
                {
                    checked: false,
                    label: this.$t('Market_cap'),
                    placeHolder: this.$t('Price_x_number_of_shares')
                },
                {
                    checked: false,
                    label: this.$t('EV_EBIT'),
                },
                {
                    checked: false,
                    label: this.$t('EV_EBITDA'),
                },
                {
                    checked: false,
                    label: this.$t('P_B'),
                    placeHolder: this.$t('Price_nominal_value_of_assets')
                },
                {
                    checked: false,
                    label: this.$t('P_S'),
                    placeHolder: this.$t('Price_sales_ttm')
                },
                {
                    checked: false,
                    label: this.$t('P_E'),
                    placeHolder: this.$t('Price_earnings_ttm')
                },
            ],
            incomeStatement : [
                {
                    checked: false,
                    label: this.$t('Sales'),
                    child: [
                        {
                            checked : false,
                            label : this.$t('percent_growth'),
                            name: this.$t('Sales_growth_percent')
                        }
                    ]
                },
                {
                    checked: false,
                    label: this.$t('gp'),
                    child: [
                        {
                            checked : false,
                            label : this.$t('percent_growth'),
                            name: this.$t('Gross_profit_growth_percent')
                        }
                    ]
                },
                {
                    checked: false,
                    label: this.$t('Gross_margin_percent'),
                    child: [
                        {
                            checked : false,
                            label : this.$t('percent_growth'),
                            name: this.$t('Gross_margin_growth_percent')
                        }
                    ]
                },
                {
                    checked: false,
                    label: this.$t('Cost_of_goods_sold'),
                    placeHolder : this.$t('Materials_plus_g_and_a')
                },
                {
                    checked: false,
                    label: this.$t('ptp'),
                    placeHolder: this.$t('Sales_costs')
                },
                {
                    checked: false,
                    label: this.$t('ebitda'),
                    child: [
                        {
                            checked : false,
                            label : this.$t('percent_growth'),
                            name: this.$t('ebitda_growth_percent')
                        }
                    ]
                },
                {
                    checked: false,
                    label: this.$t('ebitda_margin_percent'),
                    child: [
                        {
                            checked : false,
                            label : this.$t('percent_growth'),
                            name: this.$t('ebitda_margin_growth_percent')
                        }
                    ]
                },
                {
                    checked: false,
                    label: this.$t('EBIT'),
                    child: [
                        {
                            checked : false,
                            label : this.$t('percent_growth'),
                            name: this.$t('ebit_growth_percent')
                        }
                    ]
                },
                {
                    checked: false,
                    label: this.$t('ebit_margin_percent'),
                    child: [
                        {
                            checked : false,
                            label : this.$t('percent_growth'),
                            name: this.$t('ebit_margin_growth_percent')
                        }
                    ]
                },
                {
                    checked: false,
                    label: this.$t('Profit'),
                    child: [
                        {
                            checked : false,
                            label : this.$t('percent_growth'),
                            name : this.$t('Profit_growth_percent')
                        }
                    ]
                },
                {
                    checked: false,
                    label: this.$t('Profit_margin_percent'),
                    child: [
                        {
                            checked : false,
                            label : this.$t('percent_growth'),
                            name : this.$t('Profit_margin_growth_percent')
                        }
                    ]
                },
            ],
            balanceSheet: [
                {
                    checked: false,
                    label: this.$t('Intangable_assets'),
                    placeHolder: this.$t('Assets')
                },
                {
                    checked: false,
                    label: this.$t('Material_assets'),
                    placeHolder: this.$t('Assets')
                },{
                    checked: false,
                    label: this.$t('Financial_assets'),
                    placeHolder: this.$t('Assets')
                },{
                    checked: false,
                    label: this.$t('Tangible_assets'),
                    placeHolder: this.$t('Assets')
                },{
                    checked: false,
                    label: this.$t('Current_assets'),
                    placeHolder: this.$t('Assets')
                },{
                    checked: false,
                    label: this.$t('Cash'),
                    placeHolder: this.$t('Assets')
                },{
                    checked: false,
                    label: this.$t('totalassets'),
                    // placeHolder: this.$t('Assets')
                },{
                    checked: false,
                    label: this.$t('Total_equity'),
                    placeHolder: this.$t('Liabillities')
                },{
                    checked: false,
                    label: this.$t('Long_term_debt'),
                    placeHolder: this.$t('Liabillities')
                },{
                    checked: false,
                    label: this.$t('Short_term_debt'),
                    placeHolder: this.$t('Liabillities')
                },{
                    checked: false,
                    label: this.$t('Total_debt'),
                },{
                    checked: false,
                    label: this.$t('Total_equity_and_liabilities'),
                }
            ],
            ratios: [
                {
                    checked: false,
                    label: this.$t('eps'),
                    placeHolder: this.$t('Earnings_share')
                },
                {
                    checked: false,
                    label: this.$t('Sales_per_share'),
                    placeHolder: this.$t('Sales_share')
                },
                {
                    checked: false,
                    label: this.$t('Number_of_stocks'),
                    child: [
                        {
                            checked: false,
                            label: this.$t('percent_growth'),
                            name: this.$t('Number_of_stocks_growth_percent')
                        }
                    ]
                },
                {
                    checked: false,
                    label: this.$t('roe_percent'),
                    placeHolder: this.$t('Net_income_equity')
                },
                {
                    checked: false,
                    label: this.$t('roa_percent'),
                    placeHolder: this.$t('Net_income_assets')
                },
                {
                    checked: false,
                    label: this.$t('Net_debt_percent'),
                },
                {
                    checked: false,
                    label: this.$t('Solidity_percent'),
                },
            ]
        };
    },
    beforeMount() {
    },
    computed: {
        canFilter() {
            return this.is_filter;
        },
        screenerId() {
            return this.$route.params.id;
        }
    },
    mounted() {
        console.log("================================")
        console.log(this.filters)
        if (this.filters.filter) {
            const filter = typeof this.filters.filter === "object" ? this.filters.filter : JSON.parse(this.filters.filter);
            if (filter.columns) {
                this.list = filter.columns;
            } else {
                this.list = filter.defaultColumns;
            }
            this.list.map(item => {
                this.companyInformation.filter((element) => { if (element.label == item) element.checked = true; });
                this.valuation.filter((element) => { if (element.label == item) element.checked = true; });
                this.incomeStatement.filter((element) => { if (element.label == item) element.checked = true; if (element.child && element.label == element.child[0].name) element.checked[0].checked = true; });
                this.balanceSheet.filter((element) => { if (element.label == item) element.checked = true; });
                this.ratios.filter((element) => { if (element.label == item) element.checked = true; if (element.child && element.label == element.child[0].name) element.checked[0].checked = true; });
            });
        }
        this.is_filter = true;
    },
    methods: {
        add_columns() {
            this.is_open = true;
        },
        close_add_columns(event) {
            this.is_open = false;
        },
        changeValue(value) {
            const id = this.list.indexOf(value);
            if (id === -1) {
                this.list.push(value);
            } else {
                this.list.splice(id, 1);
            }
            this.$emit('setFilterAddColumn', this.list);
        },
        setModel(model) {
            this.is_filter = true;
        },
        isFilterActive() {
            return true;
        },
        getModel() {
        },
        doesFilterPass(params) {
            return true;
        }
    },
    watch: {
        screenerId(val) {
            this.is_filter = true;
        },
        canFilter(val) {
            if (val) {
                let filter = this.params.context.componentParent.filters.filter;
                if (this.params.context.componentParent.filters.filter) {
                    filter = typeof filter === "object" ? filter : JSON.parse(filter);
                }
                let model = filter && filter.columns ? filter.columns : ["",this.$t('Ticker'),this.$t('Name'),this.$t('Exchange'),this.$t('Sector'),this.$t('Sales')];
                this.list = [];
                this.companyInformation = this.companyInformation.map((item) => {
                    return {...item, checked: model.includes(item.label)};
                })
                this.valuation = this.valuation.map((item) => {
                    return {...item, checked: model.includes(item.label)};
                })
                this.incomeStatement = this.incomeStatement.map((item) => {
                    return {...item, checked: model.includes(item.label)};
                })
                this.balanceSheet = this.balanceSheet.map((item) => {
                    return {...item, checked: model.includes(item.label)};
                })
                this.ratios = this.ratios.map((item) => {
                    return {...item, checked: model.includes(item.label)};
                })
                model.forEach(label => {
                    this.list.push(label);
                });
                
                this.is_filter = false;
            }
        }
    }
}

</script>

<style scoped>
.v-messages {
    min-height: 0px !important;
}
::v-deep .my-checkbox .v-label {
    font-size: 13px;
}
</style>
<style>
.v-input--selection-controls__ripple::before {
    width: 0px !important;
    height: 0px !important;
}
</style>