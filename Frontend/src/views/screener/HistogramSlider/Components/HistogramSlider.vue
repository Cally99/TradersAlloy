<template lang="pug">
    div(:style="style" class="vue-histogram-slider-wrapper")
        svg(:id="id" class="vue-histogram-view")
            defs
                clipPath(:id="clipId")
                    rect(:width="width" :height="barHeight" x="0" y="0")
        div(class="slider-wrapper")
            input(type="text" :id="histogramId" :name="histogramId" value="")
        div(style="width: 100%;display:flex; justify-content: space-between")
            div(style="display:flex;")
                p(v-if="this.isMoney" class="label") €
                p(style="font-family: var(--font-family); font-weight:600;") {{ rangeFrom }}
            div(style="display:flex;")
                p(v-if="this.isMoney" class="label") €
                p(style="font-family: var(--font-family); font-weight:600;") {{ rangeTo }}
</template>

<script>
var $ = require('jquery');
import './range-slider';
import props from './props';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Select from 'd3-selection';
import * as d3Trans from 'd3-transition';
import * as d3Brush from 'd3-brush';


export default {
    name: 'HistogramSlider',

    props,

    data() {
        return {
            rangeFrom: 0,
            rangeTo: 0,
            id: `vue-histogram-${this._uid}`,
            histogramId: `histogram-slider-${this._uid}`,
            clipId: `clip-${this._uid}`
        }
    },

    computed: {
        style() {
            return `
                width: ${this.width}px;
                --primary-color: #4177AB;
                --label-color: ${this.labelColor};
                --holder-color: ${this.holderColor};
                --handle-color: #335D85;
                --grid-text-color: ${this.gridTextColor};
                --line-height: ${this.lineHeight}px;
                --font-family: ${this.fontFamily};
                --font-size: ${this.fontSize};
                --hist-slider-gap: ${-36 + this.histSliderGap}px;
                --handle-size: ${this.handleSize}px;
            `
        }
    },

    methods: {
        update({ from, to }) {
            if (this.ionRangeSlider) {
                this.ionRangeSlider.update({ from, to });
                this.updateBarColor({ from, to });
            }
        }
    },

    mounted() {
        const width = this.width;
        const min = this.min || d3Array.min(this.data);
        const max = this.max || d3Array.max(this.data);
        const isTypeSingle = this.type == 'single';
        var svg, x, y, hist, bins, colors, brush;

        this.updateBarColor = val => {
            var transition = d3Trans.transition().duration(this.transitionDuration);

            d3Trans
                .transition(transition)
                .selectAll(`.vue-histogram-slider-bar-${this.id}`)
                .attr('fill', (d, i) => {
                return i <= val.to && i >= val.from ? '#4177AB' : '#C2CCD6';
                });
        }
        // x scale
        x = d3Scale
            .scaleLinear()
            .domain([min, max])
            .range([0, width])
            .clamp(true);

        // y scale for histogram
        y = d3Scale.scaleLinear().range([this.barHeight, 0]);

        svg = d3Select
            .select(`#${this.id}`)
            .attr('width', width)
            .attr('height', this.barHeight)
            .on('dblclick', () => {
                if (this.clip) {
                    x.domain([min, max]);
                    updateHistogram([min, max]);
                    const pos = { from: min, to: max };
                    this.update(pos);
                    this.$emit('finish', pos);
                    this.$emit('change', pos);
                }
            });

        hist = svg.append('g').attr('class', 'histogram');

        if (this.clip) {
            hist.attr('clip-path', `url(#${this.clipId})`)
        }

        if (this.colors) {
        colors = d3Scale
            .scaleLinear()
            .domain([min, max])
            .range(this.colors);
        } else {
            colors = () => this.primaryColor;
        }

        const updateHistogram = () => {
            let transition = d3Trans.transition().duration(this.transitionDuration);

            hist.selectAll(`.vue-histogram-slider-bar-${this.id}`).remove();

            // GROUP DATA
            bins = this.data;

            y.domain([0, d3Array.max(bins, d => d.frequency)]);

            hist
                .selectAll(`.vue-histogram-slider-bar-${this.id}`)
                .data(bins)
                .enter()
                .insert('rect', 'rect.overlay')
                .attr('class', `vue-histogram-slider-bar-${this.id}`)
                .attr('x', (d, i) => i * this.width / this.data.length)
                .attr('y', d => y(d.frequency))
                .attr('rx', 2)
                .attr('width', this.barWidth)
                .transition(transition)
                .attr('height', 900)
                .attr('fill', d => this.primaryColor);

            if (this.ionRangeSlider) {
                this.ionRangeSlider.destroy();
            }

            //Slider Parameters
            this.histSlider = $(`#${this.histogramId}`).ionRangeSlider({
                skin: 'round',
                min: 0,
                max: this.data.length - 1,
                from: 0,
                to: this.data.length - 1,
                from_max: this.data.length - 2,
                to_min: 0,
                type: this.type,
                grid: this.grid,
                step: 1,
                from_fixed: this.fromFixed,
                to_fixed: this.toFixed,
                hide_min_max: this.hideMinMax,
                hide_from_to: this.hideFromTo,
                force_edges: this.forceEdges,
                drag_interval: this.dragInterval,
                grid_num: this.gridNum,
                block: this.block,
                keyboard: this.keyboard,
                prettify: this.prettify,
                onStart: val => {
                    this.rangeFrom = bins[val.from].display;
                    this.rangeTo = bins[val.to].display;
                    this.$emit('start', { from: bins[val.from].x0, to: bins[val.to].x0 });
                },
                onUpdate: val => {
                    this.rangeFrom = bins[val.from].display;
                    this.rangeTo = bins[val.to].display;
                    this.$emit('update', { from: bins[val.from].x0, to: bins[val.to].x0 });
                },
                onFinish: val => {
                    if (!this.updateColorOnChange) {
                        this.updateBarColor(val);
                    }
                    this.rangeFrom = bins[val.from].display;
                    this.rangeTo = bins[val.to].display;
                    this.$emit('finish', { from: bins[val.from].x0, to: bins[val.to].x0 });
                },
                onChange: val => {
                    if (this.updateColorOnChange) {
                        this.updateBarColor(val);
                    }
                    this.rangeFrom = bins[val.from].display;
                    this.rangeTo = bins[val.to].display;
                    this.$emit('change', { from: bins[val.from].x0, to: bins[val.to].x0 });
                }
            })
            this.ionRangeSlider = this.histSlider.data('ionRangeSlider');
            setTimeout(
                () => this.updateBarColor(this.ionRangeSlider.result),
                this.transitionDuration + 100
            );
        }

        if (this.clip) {
            brush = d3Brush.brushX().on('end', () => {
                var extent = d3Select.event.selection
                if (extent) {
                    var domain = [x.invert(extent[0]), x.invert(extent[1])];
                    x.domain(domain);
                    const pos = {
                        from: Math.max(domain[0], this.ionRangeSlider.result.from),
                        to: Math.min(domain[1], this.ionRangeSlider.result.to)
                    };
                    this.$emit('finish', pos);
                    this.$emit('change', pos);

                    updateHistogram(domain);
                    hist.call(brush.clear);
                }
            })
            hist.call(brush);
        }
        updateHistogram([min, max]);
    },

    destroyed() {
        this.ionRangeSlider.destroy();
    }
}
</script>

<style>
.vue-histogram-view {
    z-index: 9;
}

.slider-wrapper {
    width: 100%;
    margin-top: var(--hist-slider-gap);
}

.vue-histogram-slider-wrapper {
    display: flex;
    align-items: center;
    flex-direction: column;
}

.vue-histogram-slider-bar {
    pointer-events: none;
}

.irs {
    font-family: var(--font-family);
    font-size: var(--font-size);
    position: relative;
    display: block;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.irs-line {
    position: relative;
    display: block;
    overflow: hidden;
    outline: none !important;
    cursor: pointer;
}

.irs-bar {
    cursor: pointer;
    position: absolute;
    display: block;
    left: 0;
    width: 0;
}

.irs-shadow {
    position: absolute;
    display: none;
    left: 0;
    width: 0;
}

.irs-handle {
    position: absolute;
    display: block;
    box-sizing: border-box;
    cursor: default;
    z-index: 1;
}

.irs-handle.type_last {
    z-index: 2;
}

.irs-min,
.irs-max {
    position: absolute;
    display: block;
    cursor: default;
}

.irs-min {
    left: 0;
}

.irs-max {
    right: 0;
}

.irs-from,
.irs-to,
.irs-single {
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    cursor: default;
    white-space: nowrap;
    z-index: 99;
}

.irs-grid {
    position: absolute;
    display: none;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 20px;
}

.irs-with-grid .irs-grid {
    display: block;
}

.irs-grid-pol {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 8px;
    background: #000;
}

.irs-grid-pol.small {
    height: var(--line-height);
}

.irs-grid-text {
    position: absolute;
    bottom: 0;
    left: 0;
    white-space: nowrap;
    text-align: center;
    font-size: 9px;
    line-height: 9px;
    padding: 0 3px;
    color: #000;
}

.irs-disable-mask {
    position: absolute;
    display: block;
    top: 0;
    left: -1%;
    width: 102%;
    height: 100%;
    cursor: default;
    background: rgba(0, 0, 0, 0);
    z-index: 2;
}

.lt-ie9 .irs-disable-mask {
    background: #000;
    filter: alpha(opacity=0);
    cursor: not-allowed;
}

.irs-disabled {
    opacity: 0.4;
}

.irs-hidden-input {
    position: absolute !important;
    display: block !important;
    top: 0 !important;
    left: 0 !important;
    width: 0 !important;
    height: 0 !important;
    font-size: 0 !important;
    line-height: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: hidden;
    outline: none !important;
    z-index: -9999 !important;
    background: none !important;
    border-style: solid !important;
    border-color: transparent !important;
}

.irs--round {
    height: 50px;
}

.irs--round.irs-with-grid {
    height: 65px;
}

.irs--round .irs-line {
    top: 36px;
    height: var(--line-height);
    background-color: var(--holder-color);
    border-radius: var(--line-height);
}

.irs--round .irs-bar {
    top: 36px;
    height: var(--line-height);
    background-color: var(--primary-color);
}

.irs--round .irs-bar--single {
    border-radius: 4px 0 0 4px;
}

.irs--round .irs-shadow {
    height: var(--line-height);
    bottom: 21px;
    background-color: rgba(222, 228, 236, 0.5);
}

.irs--round .irs-handle {
    cursor: pointer;
    top: calc(50% - var(--handle-size) / 2 + 12px);
    width: var(--handle-size);
    height: var(--handle-size);
    background-color: var(--handle-color);
    z-index: 9;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 255, 0.3);
}
.irs--round .irs-handle:hover {
    transform: scale(1.1);
    transition: 0.2s;
}

.irs--round .irs-min,
.irs--round .irs-max {
    color: #333;
    font-size: 14px;
    line-height: 1;
    top: 0;
    padding: 3px 5px;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
}

.irs--round .irs-from,
.irs--round .irs-to,
.irs--round .irs-single {
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    text-shadow: none;
    padding: 3px 5px;
    background-color: var(--label-color);
    color: white;
    border-radius: 4px;
}

.irs--round .irs-from:before,
.irs--round .irs-to:before,
.irs--round .irs-single:before {
    position: absolute;
    display: block;
    content: '';
    bottom: -6px;
    left: 50%;
    width: 0;
    height: 0;
    margin-left: -3px;
    overflow: hidden;
    border: 3px solid transparent;
    border-top-color: var(--primary-color);
}

.irs--round .irs-grid {
    height: 25px;
}

.irs--round .irs-grid-pol {
    background-color: #dedede;
}

.irs--round .irs-grid-text {
    color: var(--grid-text-color);
    font-size: 13px;
}
.label {
    font-family: var(--font-family);
    color: grey;
    margin-right: 5px;
    font-weight: 600;
}
</style>
