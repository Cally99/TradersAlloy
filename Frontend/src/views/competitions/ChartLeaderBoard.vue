<template lang="pug">
    div(id="chart-leaderboard")
</template>

<script>
import * as d3 from "d3";
import _ from "lodash";
import moment from "moment";

/* This is the structure of the test data
┌─────────┬──────────────┬────────┬─────────┬────────────┐
│ (index) │     date     │ leader │ average │ my_balance │
├─────────┼──────────────┼────────┼─────────┼────────────┤
│    0    │ '2022-02-02' │   0    │ 103070  │   100100   │
│    1    │ '2022-02-03' │   0    │ 102870  │   100300   │
│    2    │ '2022-02-04' │   0    │ 103070  │   100500   │
│    3    │ '2022-02-05' │ 103270 │ 103270  │   100700   │
│    4    │ '2022-02-06' │ 103470 │ 103470  │   100950   │
│    5    │ '2022-02-07' │ 103870 │ 103870  │   101150   │
│    6    │ '2022-02-08' │ 104670 │ 104670  │   100850   │
│    7    │ '2022-02-09' │ 104970 │ 104970  │   100900   │
│    8    │ '2022-02-10' │ 105070 │ 105070  │   101900   │
│    9    │ '2022-02-11' │   0    │    0    │   103400   │
│   10    │ '2022-02-12' │   0    │    0    │   103500   │
│   11    │ '2022-02-13' │   0    │    0    │   103500   │
│   12    │ '2022-02-14' │   0    │    0    │   103400   │
│   13    │ '2022-02-15' │   0    │    0    │   103000   │
└─────────┴──────────────┴────────┴─────────┴────────────┘
* */

export default {
    props: {
        competition: Object,
    },
    watch: {
        competition() {
            this.loadChart();
        }
    },
    mounted() {
        this.loadChart();
    },
    computed: {
        getMinDate() {
            return _.minBy(this.competition.chartData, (o) => o.date).date;
        },
        getMaxDate() {
            return _.maxBy(this.competition.chartData, (o) => o.date).date;
        },
        getMinCompetition() {
            return _.minBy(this.competition.chartData, (o) => o.date);
        },
        getMaxCompetition() {
            return _.maxBy(this.competition.chartData, (o) => o.date);
        },
        getMaxMoney() {
            const money1 =  _.maxBy(this.competition.chartData, (o) => o.average).average;
            const money2 =  _.maxBy(this.competition.chartData, (o) => o.my_balance).my_balance;
            const money3 =  _.maxBy(this.competition.chartData, (o) => o.leader).leader;
            return Math.max(money1, money2, money3)+2000;
        },
        getMinMoney() {
            const money1 =  _.minBy(this.competition.chartData, (o) => o.average).average;
            const money2 =  _.minBy(this.competition.chartData, (o) => o.my_balance).my_balance;
            const money3 =  _.minBy(this.competition.chartData, (o) => o.leader).leader;
            return Math.min(money1, money2, money3)-2000;
        },
        labelArray() {
            const difference = this.getMaxCompetition.leader -this.getMaxCompetition.average;

            return [
                {
                    label: 'label_leader',
                    balance: this.getMaxCompetition.leader,
                    maxDate: this.getMaxDate
                },
                {
                    label: 'label_my_balance',
                    balance: this.getMaxCompetition.my_balance,
                    maxDate: this.getMaxDate
                },
                {
                    label: 'label_average',
                    balance: (difference) > 1000 ? this.getMaxCompetition.average : this.getMaxCompetition.average - 1000,
                    maxDate: this.getMaxDate
                }
            ];
        }
    },
    methods: {
        loadChart() {
            document.getElementById('chart-leaderboard').innerHTML = '';

            let svg = d3
                .selectAll("#chart-leaderboard")
                .append("svg")
                .attr("viewBox", `0 0 1000 600`);

            let width = 1000;
            let height = 500;

            let xScale = d3
                .scaleTime()
                .domain([new Date(`${this.competition.date_from}`), new Date(`${moment(this.getMaxDate).add(7,'days').format('YYYY-MM-DD')}`)])
                .range([70, width - 70]);

            let yScale = d3
                .scaleLinear()
                .domain([this.getMinMoney, this.getMaxMoney])
                .range([height - 40, 0]);

            svg
                .append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(xScale));

            svg
                .append("g")
                .attr("transform", "translate(930, 40)")
                .call(d3.axisRight(yScale));

            svg.append("path")
                .data([this.competition.chartData])
                .attr("d", d3.line()
                    .x( d => xScale(new Date(d.date)))
                    .y( d => yScale(d.average)))
                .style("fill", "none")
                .style("stroke", "#a3a2a8");

            svg.append("path")
                .data([this.competition.chartData])
                .attr("class", "area")
                .attr("d", d3.area()
                    .x( d => xScale(new Date(d.date)))
                    .y0(500)
                    .y1( d => yScale(d.average))
                ).style("fill", "#f0edee")
                .style("stroke", "#adacb2");

            svg.append("path")
                .data([this.competition.chartData])
                .attr("class", "line")
                .attr("d", d3.line()
                                .x((d) => xScale(new Date(d.date)))
                                .y((d) => yScale(d.my_balance))
                            )
                .style("fill", "none")
                .style("stroke", "#5f0755")
                .style("stroke-width", "2");

            svg.append("path")
                .data([this.competition.chartData])
                .attr("class", "line")
                .attr("d", d3.line()
                                .x((d) => xScale(new Date(d.date)))
                                .y((d) => yScale(d.leader))
                            )
                .attr("transform", "translate(0,0)")
                .style("fill", "none")
                .style("stroke", "#cc2a1d")
                .style("stroke-width", "2");

            svg.selectAll("mylabels")
                .data(this.labelArray)
                .enter()
                .append("text")
                .attr("x", d => { return xScale(new Date(d.maxDate))+10; })
                .attr("y", d => { return  yScale(d.balance)+((d.label==='label_leader') ? -25: 0); })
                .style("fill", d => { return 'green'; })
                .style("font-size", d => { return '20'; })
                .text( d => { return this.$t(d.label); } )
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle");
        }
    }
};
</script>

<style scoped>
.line {
    fill: none;
    stroke: steelblue;
    stroke-width: 2px;
}
.area {
    fill: #ef4939;
}
</style>
