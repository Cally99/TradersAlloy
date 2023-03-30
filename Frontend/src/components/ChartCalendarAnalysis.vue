<template lang="pug">
    div
        svg( id="chart-calendar-analysis" )
</template>

<script>
    import * as d3 from 'd3';
    import moment  from 'moment';


    export default {
        props: {
            pdf_array: Array,
        },
        data() {
            return {
                // data: this.pdf_array,
                // data : [
                //     {publish_date: '2019-09-01', pdf_link: '/companyanalysis/adderacare_2021_0000.pdf'},
                //     {publish_date: '2019-12-01', pdf_link: '/companyanalysis/adderacare_2021_0001.pdf'},
                //     {publish_date: '2020-05-20', pdf_link: '/companyanalysis/adderacare_2021_0002.pdf'},
                //     {publish_date: '2020-06-01', pdf_link: '/companyanalysis/adderacare_2021_0003.pdf'},
                //     {publish_date: '2020-09-01', pdf_link: '/companyanalysis/adderacare_2021_0004.pdf'},
                //     {publish_date: '2020-12-20', pdf_link: '/companyanalysis/adderacare_2021_0005.pdf'},
                //     {publish_date: '2021-03-01', pdf_link: '/companyanalysis/adderacare_2021_0006.pdf'},
                //     {publish_date: '2021-11-11', pdf_link: '/companyanalysis/adderacare_2021_0007.pdf'},
                //     {publish_date: '2021-12-01', pdf_link: '/companyanalysis/adderacare_2021_0008.pdf', active: true},
                // ]
            }
        },
        methods: {
            showThisPDF(pdf_link) {
                console.log(pdf_link);
                this.$emit("clickPDF", pdf_link)
                //this.data[3].active = true;
                //console.log(this.data[3].active , this.data[3].pdf_link);
                //let source = event.target || event.srcElement;

            }
        },
        computed: {
            data() {
                let final_array = this.pdf_array;
                console.log('$$$$$$$$$$$$$$$$  ####################', final_array);
                final_array.map( (item, i, array) => {
                    if (i===0) {
                        item.render_date = item.publish_date
                    } else {
                        item.render_date = Math.max(...[new Date( item.publish_date ), moment( array[i-1].publish_date ).add(30, 'days') ]);
                    }
                });
                return final_array;
            },
        },
        mounted() {
            const margin = {top: 20, right: 30, bottom: 50, left: 40};
            const width = 800 - margin.left - margin.right;
            const height = 200;
            const minPublishDate = d3.min(this.data, d => { return d['publish_date']; });
            const maxPublishDate = d3.max(this.data, d => { return d['publish_date']; });

/** ToDo ...
 1. Connect Data

 3. DONE - on click active
 3. DONE - on click emit an event
 5. DONE - overlap detection and nudge right. - solution add attribute "render_date" =  (if-close-to-previous ? previous +30 days : publish_date )
 4. DONE - Format the X-Scale , year only
 2. DONE - tooltip
 6. DONE - ACTIVE documeny
* */

            // canvas
            const svg = d3.select('#chart-calendar-analysis')
                .attr('width', 890)
                .attr('height', height)
                .append('g')
                .attr("transform", "translate(40,20)");


            // x-axis
            const xScale = d3.scaleTime()
                .domain([new Date(minPublishDate), new Date(maxPublishDate) ])
                .rangeRound([0, 790])
                .nice();

            svg.append("g")
                 .attr("class", "axis axis-x")
                 .attr("transform", "translate(0, 30)")
                 .call(d3.axisBottom(xScale));

            // x-labels
            svg.select('.axis-x')
                 .attr("transform", "translate(10,30)")
                .style("font-size", "18px")
                .style("font-weight", "550")
                 .style("color", "#6A8595")
                 .call(d3.axisBottom(xScale)
                     .tickFormat(d3.timeFormat("%Y"))
                     .ticks(d3.timeYear)//should display 1 year intervals
                 )
                 .selectAll("text")
                 .style("text-anchor", "end")
                 .attr("dx", "2.5em")
                 .attr("dy", "-0.5em")
                 .attr("transform", "rotate(-55)");


            svg.selectAll("documents")
                .data(this.data)
                .enter()
                .append('image')
                .attr("id", (d, i) => {return "pdf"+i})
                .attr("class", "doc")
                .attr('xlink:href', d => (d.active ?'/images/icons/pdf_file_active.svg' : '/images/icons/pdf_file.svg') )
                .attr('width', 36)
                .attr('height', 36)
                .attr('x', (d, i) =>  xScale( new Date(d.render_date)))
                .attr('y', 45)
                .on('click' , (event, d, i) => {handleClick(event, i); this.showThisPDF(d.pdf_link)} )
                .append("title")
                .text(d => d.pdf_link);

            function handleClick(event, i) {
                svg.selectAll(".doc")
                    .attr('xlink:href', d => ( false ?'/images/icons/pdf_file_active.svg' : '/images/icons/pdf_file.svg') );

                const el = event.srcElement;
                el.setAttribute('href', '/images/icons/pdf_file_active.svg');
            }

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

<style scoped>
    .doc {
        background: yellow;
        cursor: pointer;
    }
    #chart-years {
        height: 160px;
        width: 900px;
        background: #fff;
    }
    .axis {
        fill: red;
        stroke: blue;
        stroke-width: 2;
        shape-rendering: crispEdges;
        font-size: 30px;
    }
    .axis-x {
        fill: red;
        stroke: blue;
        stroke-width: 2;
        shape-rendering: crispEdges;
        font-size: 30px;
    }
</style>
