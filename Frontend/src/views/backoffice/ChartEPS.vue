<template lang="pug">
    div {{company_id}}
        svg( id="chart-eps" )
        v-divider
        div --{{data2}}
        div --{{label_array}}

</template>

<script>
    import * as d3 from 'd3';

    export default {
        props: {
            company_id: Number
        },
        data() {
            return {
                data2: null,
            }
        },
        mounted() {
            let svgWidth = 500;
            let svgHeight = 100;
            let barPadding = 5;
            let barWidth = 30;

            let financials = this.$store.getters.getFinancials;
            this.label_array = [];
            this.data2 = [];
            financials.forEach(element => {
                if (element.company_id[0] === this.company_id) {
                    for (let i=0; i<element.company_id.length; i++) {
                        if (i===0) {
                            this.label_array.push(element.period[i]);
                            this.data2.push(element.eps[i]);
                        } else {
                            if (element.period[i] != element.period[i-1]) {
                                this.label_array.push(element.period[i]);
                                this.data2.push(element.eps[i]);
                            }
                        }
                    }
                }
            });

            let margin = { top: 10, bottom: 60, left: 10, right: 60 };
            //let dataDates = this.loadedVsExpectedReports.map( x => x.date_report); //[80, 121, 56, 130, 29, 38, 12];
            //let dataset = this.loadedVsExpectedReports.map( x => x.reports); //[80, 121, 56, 130, 29, 38, 12];


            let svg = d3.select('#chart-eps')
                .attr("height", svgHeight)
                .attr("width", svgWidth);

            let scaleLinear = d3.scaleLinear()
                .domain([0, d3.max(this.data2)])
                .range([0, 250]);

            let yScale = d3.scaleLinear()
                .domain([-1.20, d3.max(this.data2)])
                .range([-1.20, svgHeight]);

            // Add X axis
            let x = d3.scaleBand()
                .domain(["Q1","Q2","Q3","Q4","'Q1","'Q2","'Q3", "'Q4",".Q1",".Q2",".Q3",".Q4",",Q1",])
                .range([0, 400]);

            let x2 = d3.scaleBand()
                .domain(["2018","2019","2020","2021"])
                .range([0, 400])
                .padding([0.2]);

            svg.append("g")
                .style("color", "#555555")
                .style("padding-top", "6px")
                .style("font-size", "15px")
                .attr("class","axis")
                .attr("transform", "translate(50,270 )")
                .call(d3.axisBottom(x).tickSizeOuter(0).tickSize(0));
//                .call(d3.axisBottom(x2).tickSizeOuter(0).tickSize(0));

            let chartEps = svg.selectAll('rect')
                .data(this.data2)
                .enter()
                .append('rect')
                .attr('y', function (d) {
                    return ( d > 0 ? svgHeight-80 - yScale(d): 20);
                })
                .attr('height', function (d) {
                    return yScale(d);
                })
                .style("fill", d => d>0 ? "rgb(192,241,255)" : "rgb(255,184,169)" )
                .style("outline","1px solid #9999bb")
                .attr('width', barWidth - barPadding)
                .attr('transform', function(d, i) {
                    let translate = [(barWidth*i)+57, 160];
                    return "translate("+ translate +")";
                })
            ;

            svg.append("rect")
                .attr("x", "50")
                .attr("y", "272")
                .attr("width", "124")
                .attr("height", "47")
                .style("fill", "rgba(57,210,237,0.10)" );

            svg.append("rect")
                .attr("x", "298")
                .attr("y", "272")
                .attr("width", "124")
                .attr("height", "47")
                .style("fill", "rgba(57,210,237,0.10)" );

            svg.append("text")
                .attr("transform", "translate(56,304)")
                .text("2018");
            svg.append("text")
                .attr("transform", "translate(180,304)")
                .text("2019");
            svg.append("text")
                .attr("transform", "translate(304,304)")
                .text("2020");

        }

    }

</script>
<style scoped>
    #chart-eps {
        height: 450px;
        width: 500px;
        background: #edf3ee;
    }
    .axis {
        fill: red;
        stroke: blue;
        stroke-width: 2;
        shape-rendering: crispEdges;
        font-size: 30px;
    }
</style>
