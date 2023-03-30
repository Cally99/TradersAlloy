<template lang="pug">
    div(class="small")
        LineChart(v-if="loaded", :chart-data="datacollection")
</template>

<script>
    import LineChart from "./ChartJSLine.js";
    import BarChart from "./ChartJSBar.js";
    import ApiService from "@/Services/ApiService.js";

    export default {
        name: "ChartFinancials",
        components: {
            LineChart,
            BarChart,
        },
        props: {
            company_id: {
                type: Number,
                default: "",
            },
            time: {
                type: String,
                default: "Q",
            },
        },
        data() {
            return {
                loaded: true,
                datacollection: {},
            };
        },
        watch: {
            company_id() {
                if (this.time === "Q") {
                    this.quarterView();
                } else if (this.time === "Y") {
                    this.yearView()
                }
            },
            time(val) {
                if (val == "Q") {
                    this.quarterView();
                } else if (val == "Y") {
                    this.yearView();
                }
            },
        },
        methods: {
            yearView() {
                ApiService.fetchFinancialsAnnual(this.company_id).then((res) => {
                    var labels = [];
                    var sales = [];
                    var profit = [];
                    var ltliabilities = [];
                    res.data.map((item) => {
                        var period = item.period.replace("-", " ");
                        if (labels.indexOf(period) > -1) return;
                        labels.push(period);
                        sales.push(item.sales);
                        profit.push(item.profit);
                        ltliabilities.push(item.ltliabilities);
                    });

                    this.datacollection = {
                        labels: labels,
                        datasets: [
                            {
                                label: "Sales",
                                borderColor: "#70aef8",
                                backgroundColor: "#f8797900",
                                type: "line",
                                data: sales,
                            },
                            {
                                label: "Profit",
                                borderColor: "#00aef8",
                                backgroundColor: "#f8797900",
                                type: "line",
                                data: profit,
                            },
                            {
                                label: "Long Term Liabilities",
                                borderColor: "#000cbc",
                                backgroundColor: "#f8797900",
                                type: "line",
                                data: ltliabilities,
                            },
                        ],
                    };

                    console.log(JSON.parse(JSON.stringify(this.datacollection)));
                });
            },
            quarterView() {
                ApiService.fetchFinancialsQuarterly(this.company_id).then((res) => {
                    var labels = [];
                    var sales = [];
                    var profit = [];
                    var ltliabilities = [];
                    res.data.map((item) => {
                        var period = item.period.replace("-", " ");
                        if (labels.indexOf(period) > -1) {
                            return;
                        }
                        labels.push(period);
                        sales.push(item.sales);
                        profit.push(item.profit);
                        ltliabilities.push(item.ltliabilities);
                    });

                    this.datacollection = {
                        labels: labels,
                        datasets: [
                            {
                                label: "Sales",
                                borderColor: "#70aef8",
                                backgroundColor: "#f8797900",
                                type: "line",
                                data: sales,
                            },
                            {
                                label: "Profit",
                                borderColor: "#00aef8",
                                backgroundColor: "#f8797900",
                                type: "line",
                                data: profit,
                            },
                            {
                                label: "Long Term Liabilities",
                                borderColor: "#000cbc",
                                backgroundColor: "#000cbc00",
                                type: "line",
                                data: ltliabilities,
                            },
                        ],
                    };

                    console.log(JSON.parse(JSON.stringify(this.datacollection)));
                });
            },
        },
        mounted() {
            this.quarterView();
        },
    };
</script>
<style>
    .small {
        margin: 20px;
        max-width: 900px;
    }
</style>
