<template lang="pug">
    div
        svg( id="chart-performance-trades-by-month" )
</template>

<script>
    import * as d3 from 'd3';
    import { mapGetters } from "vuex";

    export default {
        data() {
            return {
                data2: null,
                dataBands: [
                    {month: "2021-06", monthName: 'June', monthNumber: 6, count:0},
                    {month: "2021-07", monthName: 'July', monthNumber: 7, count:0},
                    {month: "2021-08", monthName: 'Aug.', monthNumber: 8, count:0},
                    {month: "2021-09", monthName: 'Sept', monthNumber: 9, count:0},
                    {month: "2021-10", monthName: 'Oct.', monthNumber:10, count:0},
                    {month: "2021-11", monthName: 'Nov.', monthNumber:11, count:0},
                    {month: "2021-12", monthName: 'Dec.', monthNumber:12, count:0},
                ],
            }
        },

        mounted() {
            // Pre-process some data... this should be moved to VUEX
            this.dataBands.forEach ( band => {
                band.count = Math.max(
                    this.data.filter( d => { return d.month === band.month;}).length,
                    2);
            });

            // set the dimensions and margins of the graph
            const margin = {top: 20, right: 30, bottom: 40, left: 10};
            const width = 860 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            // append the svg object to the body of the page
            const svg = d3.select("#chart-performance-trades-by-month")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);


            // X axis
            const x = d3.scaleLinear()
                .domain([0, 600])
                .range([ 0, width]);

            // Y axis
            const y = d3.scaleLinear()
                .range([ 0, height ])
                .domain([0, 2000]);

            // each month band
            svg.selectAll("myRect")
                .data(this.dataBands)
                .join("rect")
                .attr("y", d => 200-y(900) )
                .attr("height", d => y(1400))
                .attr("x", (d,i,x) => {
                    let cumsum = 0;
                    for (let j=0; j<i ; j++) {
                        cumsum = cumsum + x[j].__data__.count;
                    }
                    return cumsum * 20
                })
                .attr("width", d =>  d.count *20)
                .attr("fill", d => (d.monthNumber%2===1 ? "#ccdfda" : "#d9efe9") );

            // Add month names
            svg.selectAll("monthNames")
                .data(this.dataBands)
                .enter()
                .append("text")
                .attr("x", (d,i,x) => {
                    let cumsum = 0;
                    for (let j=0; j<i ; j++) {
                        cumsum = cumsum + x[j].__data__.count;
                    }
                    return cumsum * 20
                })
                .attr("y", 60)
                .style("fill", "#333333")
                .text( d => {return d.monthName} );


            // each trade
            /*svg.selectAll("myRect")
                .data(this.data)
                .join("rect")
                .attr("x", (d,i) => i*20)
                .attr("width", 18)

                .attr("y",      d => (d.pnl>0 ?      200-y(d.pnl)     : 200 ))
                .attr("height", d => (d.pnl>0 ?      y(d.pnl)         : y(d.pnl *-1) ) )

                .attr("fill", d => (d.open_position ?  "#a6a09f" : (d.pnl>0 ? "#257f24" : "#7b100d" )) );
*/
        },
        computed: {
            ...mapGetters(['getCompetitions', 'tradeHistory']),

            data() {
                const trades =  this.$store.getters.tradeHistory;
                const thisMonth = new Date().toISOString().substr(0,7);
                let data = trades.map( t => {
                    return {
                        date:  (t.exit_date !== null ? t.exit_date : thisMonth+'-30'),
                        month: (t.exit_date !== null ? t.exit_date.substr(0, 7) : thisMonth),
                        pnl: t.pnl,
                        open_position : (t.exit_date === null ?  true : false ),
                    }
                });
                this.dataBands.forEach ( band => {
                    const count = data.filter( d => { return d.date.substr(0,7) === band.month}).length;
                    if (count < 2) {
                        for (let i=0; i< (2-count); i++) {  // add 1 or 2 padding rows so the month name is shown.
                            data.push({
                                date: band.month+'-01',
                                month: band.month,
                                pnl: 0,
                            })
                        }
                    }
                });
                let final = _.orderBy(data, ['date'])
                console.log(final);

                return final;
            }
        }
    }

</script>
<style scoped>
    #chart-performance-trades-by-month {
        width: 450px;
        height: 380px;
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
