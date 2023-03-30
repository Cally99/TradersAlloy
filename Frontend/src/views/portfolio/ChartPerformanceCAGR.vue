<template lang="pug">
    div
        svg( id="chart-performance-cagr" )
</template>

<script>
    import * as d3 from 'd3';

    export default {
        data() {
            return {
                data2: null,
            }
        },
        mounted() {

            let margin = {top: 20, right: 20, bottom: 70, left: 40},
                width = 600 - 20 - 20,
                height = 300 - 20 - 70;

            // Parse the Data
            const data = [
                {date: '2021-12', value: 220},
                {date: '2021-12', value: 120},
                {date: '2021-12', value: 240},
                {date: '2021-12', value: 280},
                {date: '2021-12', value: 290},
            ];

            let svg = d3.select("#chart-performance-cagr")
                .append("svg")
                .attr("width", 450)
                .attr("height", 400)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


            const yScale = d3.scaleLinear()
                .range([height, 0])
                .domain([0, 100]);
            svg.append('g')
                .call(d3.axisLeft(yScale));

            const xScale = d3.scaleBand()
                .range([0, width])
                .domain(data.map((s) => s.language))
                .padding(0.2)

            svg.append('g')
                .attr('transform', `translate(0, ${height})`)
                .call(d3.axisBottom(xScale));


            // Parse the date / time
            let	parseDate = d3.time.format("%Y-%m").parse;

            let x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

            let y = d3.scale.linear().range([height, 0]);

            /*let xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .tickFormat(d3.time.format("%Y-%m"));

            let yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(10);




            x.domain(data.map(function(d) { return d.date; }));
            y.domain([0, d3.max(data, function(d) { return d.value; })]);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", "-.55em")
                .attr("transform", "rotate(-90)" );

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Value ($)");

            svg.selectAll("bar")
                .data(data)
                .enter().append("rect")
                .style("fill", "#226a14")
                .attr("x", function(d) { return x(d.date); })
                .attr("y", function(d) { return y(d.value); })
                .attr("width", x.rangeBand())
                .attr("height", function(d) { return height - y(d.value); });
*/


        }
    }

</script>
<style scoped>
    #chart-performance-cagr {
        width: 420px;
        height: 400px;
    }
    .svgimg { fill: red; }

    .axis {
        fill: red;
        stroke: blue;
        stroke-width: 2;
        shape-rendering: crispEdges;
        font-size: 30px;
    }
</style>
