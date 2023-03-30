<template lang="pug">
    div
        svg( class="bar-chart" )

</template>
<script>
    import * as d3 from 'd3'

    export default {
        data() {
            return {}
        },
        props: {
            loadedVsExpectedReports: Array
        },
        mounted() {

            /*
            date_report: "2021-06-29"
            events: "3"
            reports: "5"
            */
            let margin = { top: 10, bottom: 60, left: 10, right: 60 };
            let dataDates = this.loadedVsExpectedReports.map( x => x.date_report); //[80, 121, 56, 130, 29, 38, 12];
            let dataset = this.loadedVsExpectedReports.map( x => x.reports); //[80, 121, 56, 130, 29, 38, 12];
            let dataset2 = this.loadedVsExpectedReports.map( x => x.events);
            let svgWidth = 500;
            let svgHeight = 300;
            let barPadding = 5;
            let barWidth = (svgWidth / dataset.length)

            let scaleLinear = d3
                .scaleLinear()
                .domain([0, d3.max(dataset)])
                .range([0, 250]);

            let svg = d3.select('svg')
                .attr("height", svgHeight)
                .attr("width", svgWidth);

            let yScale = d3.scaleLinear()
                .domain([0, d3.max(dataset)])
                .range([0, svgHeight]);

            let barChart = svg.selectAll('rect')
                .data(dataset)
                .enter()
                .append('rect')
                .attr('y', function (d) {
                    return svgHeight - yScale(d);
                })
                .attr('height', function (d) {
                    return yScale(d);
                })
                .style("fill", function(d){ return (d< 50?"#c00":"#ca3")} )
                .style("outline","thin solid brown")
                .attr('width', barWidth - barPadding)
                .attr('transform', function(d, i) {
                        let translate = [barWidth*i, 0];
                        return "translate("+ translate +")";
                    })
                ;


            //            'translate(' + 20 + ',' + dataset.length * rectHeight + ')')
      //              .call(xAxis);


/*            let xScale = d3
                .scaleLinear()
                .domain([0, d3.max(dataset)])
                .range([0, 250]);
            let xAxis = d3.axisBottom(xScale).ticks(7);
  */
//            g.append('g')
        }
    }
</script>
<style scoped>
    .bar-chart{
        width: 550px;
        height: 350px;
        background: #f5ffdb;
    }
</style>
