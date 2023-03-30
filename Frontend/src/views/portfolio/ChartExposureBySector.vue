<template lang="pug">
    div
        svg( id="chart-exposure-by-sector" )
</template>

<script>
import * as d3 from 'd3';
import { mapGetters } from 'vuex';
import _ from 'lodash';

export default {
    watch : {
        chartData() {
            this.contentD3();
        }
    },
    computed: {
        ...mapGetters([
            'getUserAccounts',
            'getUserTrades',
            'getAllStocks',
            'getMapSectors',
            'getAllSectors'
        ]),
        competition_id() {
            return (this.$route.params.competition_id !== undefined) ? Number(this.$route.params.competition_id) : -1;
        },
        competition_user_account_id() {
            return this.competition_id !== -1 ? this.getUserAccounts.find((a) => a.competition_id === this.competition_id).user_account_id : -1;
        },
        getCompetitionAccount() {
            return this.getUserAccounts.filter((a) => a.user_account_id === this.competition_user_account_id);
        },
        getUserAccountOnCompetition() {
            return this.getUserAccounts.filter((a) => a.competition_id === this.competition_id);
        },
        getUserAccountsSelected() {
            return this.getUserAccounts.filter((a) => a.is_selected === true);
        },
        getAllUserTradesOnSelectedAccounts() {
            let userTradesOnSelectedAccounts = [];

            if(this.competition_user_account_id === -1) {
                const accounts = this.getUserAccountsSelected;

                userTradesOnSelectedAccounts = this.getUserTrades.filter((t) => {
                    return accounts.find((a) => {
                        if(t.user_account_id === a.user_account_id && t.exit_date === null) {
                            return a;
                        }
                    });
                });
            } else {
                const accounts = this.getUserAccountOnCompetition;

                userTradesOnSelectedAccounts = this.getUserTrades.filter((t) => {
                    return accounts.find((a) => {
                        if(t.user_account_id === a.user_account_id && t.exit_date === null) {
                            return a;
                        }
                    });
                });
            }

            return userTradesOnSelectedAccounts;
        },
        chartData() {
            const trades = this.getAllUserTradesOnSelectedAccounts.map((t) => {
                const sector_id = this.getAllStocks.find((s) => s.stock_id === t.stock_id).sector_id;
                const parent_sector_id = this.getMapSectors.get(sector_id).parentid;
                const parentId = this.getMapSectors.get(sector_id).parentid;
                const name = this.getAllSectors.find((s) => s.sector_id === parentId).sector_name;

                t.sector_id = sector_id;
                t.parent_sector_id = parent_sector_id;
                t.name = name;

                return t;
            });

            const groupedOnName = _.groupBy(trades, 'name');

            const finalArray = [];

            for(const g of Object.keys(groupedOnName)) {
                const exposure = _.sumBy(groupedOnName[g], (o) => o.entry_qty * o.exit_price);
                const parent_sector_name = g;

                const tempObject = {
                    parent_sector_name,
                    exposure
                };

                finalArray.push(tempObject);
            }

            if(Object.keys(groupedOnName).length === 0) {
                const tempObject1 = {
                    parent_sector_name: '',
                    exposure: 2.5
                };

                const tempObject2 = {
                    parent_sector_name: '',
                    exposure: 3.5
                };

                const tempObject3 = {
                    parent_sector_name: '',
                    exposure: 1.5
                };

                const tempObject4 = {
                    parent_sector_name: '',
                    exposure: 4
                };

                finalArray.push(tempObject1);
                finalArray.push(tempObject2);
                finalArray.push(tempObject3);
                finalArray.push(tempObject4);
            }

            return finalArray;
        }
    },
    methods: {
        contentD3() {
            // const data = [10,8,5,4];
            // var keys = ["Basic Materials", "Consumer Discretionary", "Health Care", "Financials", "Industrials"]

            document.getElementById('chart-exposure-by-sector').innerHTML = '';

            const svg = d3.select("#chart-exposure-by-sector");
            // const width = svg.attr("width");
            // const height = svg.attr("height");
            const radius = 130; //Math.min(width, height) / 2;
            const g = svg.append("g").attr("transform", "translate(180,150)");

            let color = null;

            if(this.chartData[0].parent_sector_name !== '') {
                color = d3.scaleOrdinal([
                    '#0A2F51',
                    '#0E4D64',
                    '#137177',
                    '#188977',
                    '#1D9A6C',
                    '#39A96B',
                    '#56B870',
                    '#74C67A',
                    '#99D492',
                    '#BFE1B0',
                    '#DEEDCF'
                ]);
            } else {
                color = d3.scaleOrdinal([
                    
                    '#585858',
                    
                    '#838383',
                    '#474747',
                    '#ababab',
                ]);
            }

            // Generate the pie
            const pie = d3.pie();

            // Generate the arcs
            const arc = d3.arc()
                .innerRadius(0)
                .outerRadius(radius);

            //Generate groups
            const arcs = g.selectAll("arc")
                .data(pie(this.chartData.map( x =>  x.exposure )))
                .enter()
                .append("g")
                .attr("class", "arc");

            //Draw arc paths
            arcs.append("path")
                .attr("fill", function(d, i) {
                    return color(i);
                })
                .attr("d", arc);


            //Legend
            // select the svg area

            // create a list of keys

            if(this.chartData[0].parent_sector_name !== '') {
                // Add one dot in the legend for each name.
                svg.selectAll("mydots")
                    .data(this.chartData)
                    .enter()
                    .append("circle")
                    .attr("cx", 400)
                    .attr("cy", function(d,i){ return 20 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
                    .attr("r", 7)
                    .style("fill", function(d,i){ return color(i)})

                // Add names.
                svg.selectAll("mylabels")
                    .data(this.chartData)
                    .enter()
                    .append("text")
                    .attr("x", 420)
                    .attr("y", (d,i) => { return 20 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
                    .style("fill", function(d){ return color(d)})
                    .text( d => {return this.$t(d.parent_sector_name) } )
                    .attr("text-anchor", "left")
                    .style("alignment-baseline", "middle")
            }
        }
    },
    async mounted() {
        this.contentD3();
    }
}
</script>

<style scoped>
#chart-exposure-by-sector {
    height: 300px;
    width: 600px;
    background: #edf3ee;
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
