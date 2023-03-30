<template lang="pug">
    div
        svg( id="chart-conviction-vs-exposure" )
</template>

<script>
import * as d3 from 'd3';
import {mapGetters} from "vuex";
export default {
    data() {
        return {
        }
    },
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
            'getAllSectors',
            'getWatchlistItems'
        ]),
        sumOfCashOnSelectedAccounts() {
            let cashAmount = 0;

            if(this.competition_id === -1) {
                for(const account of this.getUserAccountsSelected) {
                    cashAmount += account.cash;
                }
            } else {
                for(const account of this.getUserAccountOnCompetition) {
                    cashAmount += account.cash;
                }
            }

            return cashAmount;
        },
        getUserAccountsSelected() {
            return this.getUserAccounts( x => x.is_selected || x.competition_id !== null);
        },
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
        getCompetitionAccountCash() {
            return this.getCompetitionAccount[0].cash;
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

            return finalArray;
        },
        convictionData() {
            const watchlistItems = this.getWatchlistItems.filter((wi) => wi.conviction !== null);

            for(const item of watchlistItems) {
                const parent_sector_id = this.getAllSectors.find((s) => s.sector_id === item.sector_id).parent_sector_id;
                const parent_sector_name = this.getAllSectors.find((s) => s.sector_id === parent_sector_id).sector_name;

                item.parent_sector_name = parent_sector_name;
            }

            const groupedOnName = _.groupBy(watchlistItems, 'parent_sector_name');

            const finalArray = [];

            for(const g of Object.keys(groupedOnName)) {
                const parent_sector_name = g;
                const conviction = Math.round(_.meanBy(groupedOnName[g], (o) => o.conviction));

                const tempObject = {
                    parent_sector_name,
                    conviction
                };

                finalArray.push(tempObject);
            }

            return finalArray;
        }
    },
    methods: {
        contentD3() {
            document.getElementById('chart-conviction-vs-exposure').innerHTML = '';

            // set the dimensions and margins of the graph
            const margin = {top: 20, right: 30, bottom: 40, left: 10},
                width = 700 - margin.left - margin.right,
                height = 300 - margin.top - margin.bottom;

            // append the svg object to the body of the page
            const svg = d3.select("#chart-conviction-vs-exposure")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

                // Parse the Data
                const data = [
                    {sector: 'sector_basic_materials', conviction: 0, exposure: 0, color: '#0A2F51'},
                    {sector: 'sector_consumer_discretionary', conviction: 0, exposure: 0, color: '#0E4D64'},
                    {sector: 'sector_consumer_staples', conviction: 0, exposure: 0, color: '#137177'},
                    {sector: 'sector_health_care', conviction: 0, exposure: 0, color: '#188977'},
                    {sector: 'sector_financials', conviction: 0, exposure: 0, color: '#1D9A6C'},
                    {sector: 'sector_industrials', conviction: 0, exposure: 0, color: '#39A96B'},
                    {sector: 'sector_oil_and_gas', conviction: 0, exposure: 0, color: '#56B870'},
                    {sector: 'sector_technology', conviction: 0, exposure: 0, color: '#74C67A'},
                    {sector: 'sector_telecom', conviction: 0, exposure: 0, color: '#99D492'},
                    {sector: 'sector_utilities', conviction: 0, exposure: 0, color: '#BFE1B0'},
                    {sector: 'CASH', exposure: this.getCompetitionAccountCash, color: '#DEEDCF'}
                ];

                for(const d of data) {
                    for(const c of this.chartData) {
                        if(d.sector === c.parent_sector_name) {
                            d.exposure = c.exposure;
                        }
                    }
                }

                for(const d of data) {
                    for(const c of this.convictionData) {
                        if(d.sector === c.parent_sector_name) {
                            console.log('d.sector = ' + d.sector + ' : c.parent_sector_name = ' + c.parent_sector_name);
                            d.conviction = c.conviction;
                        }
                    }
                }

                // We add CASH also to the exposure so we can scale the diagram
                // correctly, so CASH isn't actually the exposure, but the
                // acctual cash that the user has left on his/her account
                const maxExposure = _.maxBy(data, (o) => o.exposure).exposure;

                // Add X axis
                const x = d3.scaleLinear()
                    .domain([0, maxExposure])
                    .range([ 0, 370]);

                svg.append("g")
                    .attr("transform", `translate(300, ${height})`)
                    //.style('transform', 'rotate(20deg)')
                    .call(d3.axisBottom(x).tickSize(0))
                    .selectAll('text')
                    // .style('text-anchor', 'end')
                    .attr('dx', '1em')
                    // .attr('dy', '-1em')
                    .attr('transform', 'rotate(35)')
                    .select(".domain").remove();


                // Y axis
                const y = d3.scaleBand()
                    .range([ 0, height ])
                    .domain(data.map(d => {
                        const convertedName = d.sector !== 'CASH' ? this.$t(d.sector) : 'CASH';
                        return convertedName;
                    }))
                    .padding(.1);

                svg.append("g")
                    .call(d3.axisLeft(y)
                    .tickSize(0))
                    .attr("transform", `translate(300, 0)`);

                // Money committed to a sector
                svg.selectAll("myRect")
                    .data(data)
                    .join("rect")
                    .attr("x", x(0) +300)
                    .attr("y", d => {
                        const convertedName = d.sector !== 'CASH' ? this.$t(d.sector) : 'CASH';
                        return y(convertedName);
                    })
                    .attr("width", d => x(d.exposure))
                    .attr("height", y.bandwidth())
                    .attr("fill", d => d.color);

                svg.selectAll("conviction")
                    .data(data)
                    .enter()
                    .append('image')
                    .attr('xlink:href', d => '/images/icons/hearts'+d.conviction+'.svg')
                    .attr('x', 40)
                    .attr('y', d => {
                        const convertedName = d.sector !== 'CASH' ? this.$t(d.sector) : 'CASH';
                        return y(convertedName);
                    });
            
        }
    },
    mounted() {
        this.contentD3();
    }
}
</script>

<style scoped>
#chart-conviction-vs-exposure {
    height: 300px;
    width: 700px;
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
