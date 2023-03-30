<template lang="pug">
    div
        div( id="my_dataviz" )

</template>

<script>
    import * as d3 from 'd3';

    export default {
        props: {
            loadedVsExpectedReports: Array
        },
        mounted() {


            // set the dimensions and margins of the graph
            let margin = {top: 10, right: 30, bottom: 20, left: 50},
                width = 800 - margin.left - margin.right,
                height = 450 - margin.top - margin.bottom;

            // append the svg object to the body of the page
            let svg = d3.select("#my_dataviz")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

            // Parse the Data
            let data1 = `group,Nitrogen,normal,stress
banana,12,1,13
poacee,6,6,33
sorgho,11,28,12
triticum,19,6,1`;

            let data2 = this.loadedVsExpectedReports;
                /*[
                {group:"2021-07-21",reports: 10,events: 2},
                {group:"2021-07-22",reports: 2,events: 1},
                {group:"2021-07-23",reports: 4,events: 4},
                {group:"2021-07-24",reports: 20,events: 6},
                ];
*/
                // List of subgroups = header of the csv files = soil condition here
                let subgroups = [ "reports", "events"]; //data.columns.slice(1);

                // List of groups = species here = value of the first column called group -> I show them on the X axis
                let groups = d3.map(data2, function(d){return(d.group)}).keys();

                // Add X axis
                let x = d3.scaleBand()
                    .domain(groups)
                    .range([0, width])
                    .padding([0.2]);
                svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x).tickSizeOuter(0));

                // Add Y axis
                let y = d3.scaleLinear()
                    .domain([0, 60])
                    .range([ height, 0 ]);
                svg.append("g")
                    .call(d3.axisLeft(y));

                let color = d3.scaleOrdinal()
                    .domain(subgroups)
                    .range(['#61976b','#ddd']);

                //stack the data? --> stack per subgroup
                let stackedData = d3.stack()
                    .keys(["reports", "events"])(data2);

                // Show the bars
            svg.append("g")
                .selectAll("g")
                // Enter in the stack data = loop key per key = group per group
                .data(stackedData)
                .join("g")
                    .style("fill", d => {return color(d.key)} )
                    .selectAll("rect")
                    // enter a second time = loop subgroup per subgroup to add all rectangles
                    .data( d => {return d})
                    .join("rect")
                        .attr("x", (d, i) => {return i * 20 })
                        .attr("y", d => {return y(d[1]) })
                        .attr("height", d => {return y(d[0]) - y(d[1])} )
                        .attr("width", 18)

        }

    }

</script>
<style scoped>
    .bar-chart{
        height: 500px;
        width: 900px;
        background: #f5ffdb;
    }
</style>
