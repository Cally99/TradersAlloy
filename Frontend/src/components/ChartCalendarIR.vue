<template lang="pug">
    div
        svg( id="chart-calendar-ir" )
</template>

<script>
    import * as d3 from 'd3';
    import moment  from 'moment';


    export default {
        props: {
            pdf_array: Array,
            media_array: Array
        },
        methods: {
            showThisPDF(pdf_link) {
                console.log(pdf_link);
                this.$emit("clickPDF", pdf_link)
                //this.data[3].active = true;
                //console.log(this.data[3].active , this.data[3].pdf_link);
                //let source = event.target || event.srcElement;
            },
            playThisMedia(media_link) {
                this.$emit("clickMedia", media_link);
            },
            init() {
                const margin = {top: 20, right: 30, bottom: 50, left: 40};
                const width = 800 - margin.left - margin.right;
                const height = 130;
                var minPublishDate = d3.min(this.reports, d => { return d['date_report']; });
                var maxPublishDate = d3.max(this.reports, d => { return d['date_report']; });
                // var minMediaDate = d3.min(this.media, d => { return d['render_date']; });
                var maxMediaDate = d3.max(this.media, d => { return d['render_date']; });
                // minPublishDate = d3.min([minPublishDate, minMediaDate])
                maxPublishDate = d3.max([maxPublishDate, maxMediaDate])

                // canvas
                const svg = d3.select('#chart-calendar-ir');
                svg.selectAll('*').remove();
                svg.attr('width', 1300)
                    .attr('height', height)
                    .append('g')
                    .attr("transform", "translate(40,20)");
                


                // x-axis
                const xScale = d3.scaleTime()
                    .domain([new Date(minPublishDate), new Date(maxPublishDate) ])
                    .rangeRound([0, 1200])
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
                    .attr("dx", "1em")
                    .attr("dy", "-1em")
                    .attr("transform", "rotate(-25)");

                svg.selectAll("labels")
                    .data(this.reports)
                    .enter()
                    .append("text")
                    .style("font-size", "12px")
                    .attr('x', (d, i) =>  xScale( new Date(d.render_date))+5)
                    .attr('y', 45)
                    .text( d => { return  ( d.period.length === 4) ?  d.period  :d.period.substr(d.period.length -2) });


                svg.selectAll("documents")
                    .data(this.reports)
                    .enter()
                    .append('image')
                    .attr("id", (d, i) => {return "pdf"+i})
                    .attr("class", "doc")
                    .attr('xlink:href', d => (d.active ?'/images/icons/pdf_file_ir_active.svg' : '/images/icons/pdf_file_ir.svg') )
                    .attr('width', 36)
                    .attr('height', 36)
                    .attr('x', (d, i) =>  xScale( new Date(d.render_date)))
                    .attr('y', 50)
                    .on('click' , (event, d, i) => {handleClick(event, i); this.showThisPDF(d.pdf_link)} );

                svg.selectAll("media")
                    .data(this.media)
                    .enter()
                    .append('image')
                    .attr("class", "media")
                    .attr('xlink:href', d => (d.active ?'/images/icons/media_active.svg' : '/images/icons/media.svg') )
                    .attr('width', 36)
                    .attr('height', 36)
                    .attr('x', (d, i) => xScale( new Date(d.render_date)))
                    .attr('y', 90)
                    .on('click' , (event, d, i) => {handleClickMedia(event, i); this.playThisMedia(d.media_link)} )
                    .append("title")
                    .text(d => d.media_link);

                function handleClick(event, i) {
                    svg.selectAll(".doc")
                        .attr('xlink:href', d => ( false ?'/images/icons/pdf_file_ir_active.svg' : '/images/icons/pdf_file_ir.svg') );
                    svg.selectAll(".media")
                        .attr('xlink:href', d => (  '/images/icons/media.svg') );

                    const el = event.srcElement;
                    el.setAttribute('href', '/images/icons/pdf_file_ir_active.svg');
                }

                function handleClickMedia(event, i) {
                    svg.selectAll(".doc")
                        .attr('xlink:href', d => ( false ?'/images/icons/pdf_file_ir_active.svg' : '/images/icons/pdf_file_ir.svg') );
                    svg.selectAll(".media")
                        .attr('xlink:href', d => (  '/images/icons/media.svg') );

                    const el = event.srcElement;
                    el.setAttribute('href', '/images/icons/media_active.svg');
                }

                /* keep this as an example
                svg.selectAll("debug text")
                    .data(data)
                    .enter()
                    .append("text")
                    .attr('x', (d, i) => {return i*100} )
                    .attr('y', 140)
                    .text( d => { return xScale( new Date(d.render_date)) });
                */

            }
        },
        computed: {
            reports() {
                let final_array = this.pdf_array;
                final_array.map( (item, i, array) => {
                    if (i===0) {
                        item.render_date = item.date_report;
                    } else {
                        item.render_date = Math.max(...[new Date( item.date_report ), moment( array[i-1].date_report ).add(30, 'days') ]);
                    }
                });
                return final_array;
            },
            media() {
                let final_array = this.media_array;
                final_array.map( (item, i, array) => {
                    console.log(item);
                    if (i===0) {
                        item.render_date = item.publish_date;
                    } else {
                        item.render_date = Math.max(...[new Date( item.publish_date ), moment( array[i-1].publish_date ).add(40, 'days') ]);
                    }
                });
                return final_array;
            }
        },
        watch: {
            pdf_array(val) {
                this.init()
            }
        },
        mounted() {
            this.init();
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
