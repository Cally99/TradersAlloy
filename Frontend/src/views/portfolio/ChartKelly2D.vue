<template lang="pug">
    div(style="padding:15px;")
        svg(id="chart-kelly-2d" )


</template>

<script>
    import * as d3 from 'd3';
    import { mapGetters } from "vuex";

    export default {
        data() {
            return {
            /* TEST DATA
            kelly_stats: [
                {win_loss_ratio :  0, win_loss_size:  0},
                {win_loss_ratio : 10, win_loss_size: 10},
                {win_loss_ratio : 20, win_loss_size: 20},
                {win_loss_ratio : 30, win_loss_size: 30},
                {win_loss_ratio : 40, win_loss_size: 40},
                {win_loss_ratio : 50, win_loss_size: 50},
                {win_loss_ratio : 90, win_loss_size: 90},
                {win_loss_ratio : 100, win_loss_size: 100},
                ]
            */
            }

        },
        computed: {
            ...mapGetters(['kelly2d']),

            kelly_stats() {
                const x = this.$store.getters.kelly2d;
                return x;
            }
        },
        mounted() {
            const margin = {top: 15, right: 0, bottom: 40, left: 0};
            const width = 310;
            const height = 310;

            // append the svg object to the body of the page
            const svg = d3.select("#chart-kelly-2d")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

            const xScale = d3.scaleLinear()
                .domain([-100, 100 ])
                .rangeRound([0, 270]);
            /* scales to calibrate over image
            svg.append("g")
                .attr("class", "axis axis-x")
                .attr("transform", "translate(40, 160)")
                .call(d3.axisBottom(xScale));
            */

            const yScale = d3.scaleLinear()
                .domain([100, -100 ])
                .rangeRound([0, 270]);
            /* scales to calibrate over image
            svg.append("g")
                .attr("class", "axis axis-y")
                .attr("transform", "translate(180, 20)")
                .call(d3.axisLeft(yScale));
            */

            svg.selectAll("background")
                .data(this.kelly_stats)
                .enter()
                .append('circle')
                .attr("class", "doc")
                .attr('cx', d => xScale(d.win_loss_ratio)+40)
                .attr('cy', d => yScale(d.win_loss_size)+25)
                .attr('r', 9)
                ;


            /* keep this as an example
            svg.selectAll("debug text")
                .data(data)
                .enter()
                .append("text")
                .attr('x', (d, i) => {return i*100} )
                .attr('y', 140)
                .text( d => { return xScale( new Date(d.publish_date)) });
            */
        }
    }
</script>

<style>
    #chart-kelly-2d {
        height: 350px;
        width: 400px;
        background: url("../../../public/images/kelly2d.png")  no-repeat;
        background-size: 350px 350px;
    }
    .doc {
        fill: #282827;

    }
    .axis {
        fill: rgba(255, 0, 0, 0.36);
        shape-rendering: crispEdges;
        font-size: 13px;
    }

</style>
