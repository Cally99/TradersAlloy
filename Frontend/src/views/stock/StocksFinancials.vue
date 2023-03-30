<template lang="pug">
    v-row
        v-col(cols="8" class="pt-5")
            button(@click="setTimeToggle('Q')" :class="time_toggle === 'Q' ? 'active-button-design' : ''" class="quarterly-button-design button-hover-design pt-1 pb-1") {{this.$t('Quarterly')}}
            button(@click="setTimeToggle('Y')" :class="time_toggle === 'Y' ? 'active-button-design' : ''" class="annualy-button-design button-hover-design pt-1 pb-1") {{this.$t('Annualy')}}
            div(class="mb-4 mt-5")
                //- AgGridTest
                AgGridVue#myGrid(
                    style="width: 100%; height: 1200px;",
                    :class="{ 'ag-theme-dark': $vuetify.theme.isDark, 'ag-theme-alpine': !$vuetify.theme.isDark }",
                    :gridOptions="gridOptions",
                    :enableRangeSelection="true",
                    :enableCharts="true",
                    :animateRows="true",
                    :isFullWidthCell="isFullWidthCell",
                    :fullWidthCellRenderer="fullWidthCellRenderer",
                    :defaultColDef="defaultColDef",
                    :columnDefs="columnDefs",
                    :rowData="finData"
                )

        VCol(class="p-0 pr-4" cols="4")
            ChartFinancials(:company_id="company_id", :time="time_toggle")
</template>



<script>
    window.pivot = function pivot(data) {
        let iter = function (pivoted, record) {
            for (let key in record) {
                if (!pivoted[key]) pivoted[key] = [];
                pivoted[key].push(record[key]);
            }
            return pivoted;
        };
        return data.reduce(iter, {});
    };

    function numberWithSpaces(x) {
        return isNaN(x) ? 0 : x*1;  /////////// This is my code

        //////////////// this is old code ----------

        // var parts = x.toString().split(".");
        // parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        // return parts.join(".");
    }

    import { AgGridVue } from "ag-grid-vue";
    import { LicenseManager } from "ag-grid-enterprise";
    LicenseManager.setLicenseKey(
        "CompanyName=TradersAlloy OU,LicensedApplication=Traders Alloy,LicenseType=SingleApplication,LicensedConcurrentDeveloperCount=1,LicensedProductionInstancesCount=1,AssetReference=AG-009106,ExpiryDate=27_July_2021_[v2]_MTYyNzM0MDQwMDAwMA==905a1d0e81035375a78176e093d36bb2"
    );
    import "ag-grid-community/dist/styles/ag-grid.css";
    import "ag-grid-community/dist/styles/ag-theme-dark.css";
    import "ag-grid-community/dist/styles/ag-theme-alpine.css";
    import ChartFinancials from "../../components/ChartFinancials";
    import AgGridTest from "../../components/AgGridTest";

    import ApiService from "@/Services/ApiService.js";

    export default {
        name: "StocksFinancials",
        props: { company_id: Number },
        components: { ChartFinancials, AgGridVue ,AgGridTest},
        computed: {
            stockData() {
                return this.$store.getters["getStock"](this.company_id);
            },
            columnDefs() {
                const _ = require("lodash");
                let columnIndex = 0;

                if (this.periodDataForHeaders == null) {
                    return;
                }
                // The first columnDef is easy
                let columnDefs = [
                    {
                        headerName: "",
                        headerClass: () => {
                            return this.time_toggle === "Q" ? "blue5" : "";
                        },
                        children: [{
                            headerName: "",
                            headerClass: () => {
                                return this.time_toggle === 'Q' ? 'white-background' : 'column-background';
                            },
                            field: "metric",
                            pinned: "left",
                            maxWidth: 200
                        }]
                    },
                ];
                // group by the year and create the top level
                const periods = this.periodDataForHeaders;
                let result = _(periods)
                    .groupBy((x) => x.substring(0, 4))
                    .map((value, key) => ({
                        headerName: key,
                        headerClass: () => {
                            return 'column-header-design';
                        },
                        tempChildren: [...value],
                    }));
                // for ['2018-Q1', '2018-Q2', '2018-Q3', '2018-Q4'],['2019-Q1', '2019-Q2', '2019-Q3']
                var newObj = {};
                result.forEach((item) => {
                    if (this.time_toggle == "Q") {
                        var child = item.tempChildren.map((child, index) => {
                            return {
                                headerName: child.valueOf().substring(5, 7),
                                headerClass: () => {
                                    return index === 4 ? 'sub-column-design' : 'white-background';
                                },
                                field: "p" + columnIndex++,
                                maxWidth: 130,
                            };
                        });
                        newObj = Object.assign({}, item, { children: child });
                    } else {
                        newObj = Object.assign({}, item, { field: "p" + columnIndex++ });
                    }
                    columnDefs.push(newObj);
                    delete item.tempChildren; // remove the simple arrays that are not needed
                });
                // console.log("columnDef", columnDefs);

                return columnDefs;
                //   return getColumnDefs(this.periodDataForHeaders);
            },
        },
        methods: {

            setTimeToggle(val) {
                this.time_toggle = val;
            },
            
            clean(pivoted) {
                let period_tmp_val = '';
                let period_arr = pivoted['period'];
                for (let itr_num = 0; itr_num < period_arr.length; itr_num++) {
                    if (period_tmp_val != period_arr[itr_num]) {
                        period_tmp_val = period_arr[itr_num];
                    } else {
                        for (let key in pivoted) {
                            pivoted[key].splice(itr_num, 1);
                        }
                        itr_num--;
                    }
                }
                return pivoted;
            },
            quatarView() {
                ApiService.fetchFinancialsQuarterly(this.company_id).then((response) => {
                    console.log('------ quarterly ---------', response)
                    const pivoted = this.clean(window.pivot(response.data));
                    const keys = Object.keys(pivoted);
                    // keys = ["period","sales","gp","eps","profit","ebitda"]
                    this.periodDataForHeaders = pivoted['period'];
                    this.finData = [];
                    // const y = [];
                    for (let i = 1; i <= 26; i++) {
                        if (i == 1) {
                            const title = this.$t('Income_Statement');
                            this.finData.push({ metric: title, fullWidth: true }); // add additional formatting row
                        }
                        if (i == 8) {
                            const title = this.$t('Balance_Assets');
                            this.finData.push({ metric: title, fullWidth: true }); // add additional formatting row
                        }
                        if (i == 16) {
                            const title = this.$t('Balance_Debts_Cash');
                            this.finData.push({metric: title, fullWidth: true }); // add additional formatting row
                        }

                        // DESTRUCTURE into variables from the pivoted array

                        let data = pivoted[keys[i]];

                        if (this.$t(keys[i] !== 'ibl') && this.$t(keys[i] !== 'pdf_link') && this.$t(keys[i] !== 'pdf_language')) {
                            let rowOfData = {
                                metric: this.$t(keys[i]),
                            }
                        
                            for (let itr_num in data) {
                                rowOfData['p' + itr_num] = numberWithSpaces( (data[itr_num]/1000000).toString());
                            }
                            // TODO: i18n  ... metric ... $t('gp')    ... use gp as the test case ( it is already defined in i18n.js).
                            this.finData.push(rowOfData);
                        }
                    }
                    console.log(this.finData);
                });
            },
            anualView() {
                ApiService.fetchFinancialsAnnual(this.company_id)
                    .then((response) => {
                    /*      {period: '2018-Q1', sales: '11111', gp: '22222', eps: '33333', profit: '44444,', ebitda: '55555'},
                                {period: '2018-Q2', sales: '11111', gp: '22222', eps: '33333', profit: '44444,', ebitda: '55555'},
                                {period: '2018-Q3', sales: '11111', gp: '22222', eps: '33333', profit: '44444,', ebitda: '55555'},
                            ... */
                    const pivoted = this.clean(window.pivot(response.data));

                    /*      {"period":  ["2018-Q1","2018-Q2","2018-Q3","2018-Q4","2019-Q1","2019-Q2"],
                                 "sales":   ["11111","11111","11111","11111","11111","11111"],
                                 "gp":      ["22222","22222","22222","22222","22222","22222"],
                                 "eps":     ["33333","33333","33333","33333","33333","33333"],
                                 "profit":  ["44444,","44444,","44444,","44444,","44444,","44444,"],
                                 "ebitda":  ["55555","55555","55555","55555","55555","55555"] }*
                             ...
                             */
                    const keys = Object.keys(pivoted);
                    this.periodDataForHeaders = pivoted['period'];
                    // keys = ["period","sales","gp","eps","profit","ebitda"]
                    this.finData = [];
                    // const y = [];
                    for (let i = 1; i <= 26; i++) {
                        if (i == 1) {
                            const title = this.$t('Income_Statement');
                            this.finData.push({ metric: title, fullWidth: true }); // add additional formatting row
                        }
                        if (i == 8) {
                            const title = this.$t('Balance_Assets');
                            this.finData.push({ metric: title, fullWidth: true }); // add additional formatting row
                        }
                        if (i == 16) {
                            const title = this.$t('Balance_Debts_Cash');
                            this.finData.push({metric: title, fullWidth: true }); // add additional formatting row
                        }

                        // DESTRUCTURE into variables from the pivoted array
                        let data = pivoted[keys[i]];
                        let rowOfData = {
                            metric: this.$t(keys[i]),
                        }
                        for (let itr_num in data) {
                            rowOfData['p' + itr_num] = numberWithSpaces( (data[itr_num]/1000000).toString())
                        }
                        // TODO: i18n  ... metric ... $t('gp')    ... use gp as the test case ( it is already defined in i18n.js).
                        this.finData.push(rowOfData)
                    }
                });
            },
        },
        watch: {
            company_id() {
                this.quatarView();
            },
            time_toggle(val) {
                if (val == "Q") {
                    this.quatarView();
                } else if (val == "Y") {
                    this.anualView();
                }
            },
        },
        created: function () {
            this.quatarView();
        },
        beforeMount() {
            this.gridOptions = {};
            this.gridOptions1 = {};
            this.gridOptions2 = {};

            this.defaultColDef = {
                flex: 1,
                minWidth: 120,
                suppressMovable: true,
            };
            this.isFullWidthCell = (rowNode) => {
                return rowNode.data.fullWidth;
            };
            this.fullWidthCellRenderer = (params) => {
                return (
                    '<div style="font-size:1.8rem; margin-left:20px; ">' +
                    params.data.metric +
                    "</div>"
                );
            };
        },
        data() {
            return {
                chartLoaded: false,
                chartOptions: {
                    responsive: true,
                    maintainAspectRatio: true,
                },
                gridOptions: null,
                gridOptions1: null,
                gridOptions2: null,
                gridApi: null,
                columnApi: null,
                defaultColDef: null,
                autoGroupColumnDef: null,
                rowData: null,
                time_toggle: "Q",
                finData: [],
                periodDataForHeaders: null,
            };
        },
    };

</script>

<style scoped>
    .quarterly-button-design {
        width: 100px;
        color: #4077AB;
        background-color: #ffffff;
        border: 2px solid #4077AB;
        border-top-left-radius: 3px;
        border-bottom-left-radius: 3px;
    }

    .annualy-button-design {
        width: 100px;
        color: #4077AB;
        background-color: #ffffff;
        border: 2px solid #4077AB;
        border-top-right-radius: 3px;
        border-bottom-right-radius: 3px;
    }

    .active-button-design {
        color: #ffffff;
        background-color: #4077AB;
    }

    .button-hover-design:hover {
        color: #ffffff;
        background-color: #335b80;
        border: 2px solid #335b80;
    }

    >>> .column-header-design {
        font-size: 1.4em !important;
        background-color: #E0E6EB !important;
        border-right: 1px solid #A3B3C2 !important;
    }

    >>> .sub-column-design {
        font-size: 1.4em !important;
        font-weight: 500 !important;
        border-right: 1px solid #A3B3C2 !important;
        background-color: #ffffff !important;
    }

    >>> .white-background {
        font-size: 1.4em !important;
        font-weight: 500 !important;
        background-color: #ffffff !important;
    }

    >>> .column-background {
        background-color: #E0E6EB !important;
    }
</style>
