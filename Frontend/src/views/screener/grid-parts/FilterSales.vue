<template lang="pug">
    div(class="grey7 pa-6")
        v-container(class="ma-0 pa-0 chart1" style="width:350px; padding-left:500px;")
            h3 {{ $t('Sales') }}

            v-divider

            span(style="font-size:20px;")
                b {{ $t('filter') }}

            div(style="margin-left: 50px; margin-bottom:30px;")
                HistogramSlider(
                    style="margin: 20px auto"
                    ref="hist"
                    v-if="data.length > 0"
                    type="double"
                    :width="220"
                    :bar-height="150"         
                    primary-color="#003495"
                    handle-color="#ffbc1e"
                    :lineHeight="1"
                    :fontSize="16"
                    :grid="false"
                    :drag-interval="true"
                    :updateColorOnChange="true"
                    :forceEdges="true"
                    :data="data"
                    :clip="false"
                    :hideFromTo="true"
                    :colors="['#4facfe', '#4facfe']"
                    @finish="onFinish"
                    @hook:mounted = "onHistogramSliderMounted"
                )

            FilterViewRadioGroup(filterGroup="salesGroup" defaultSelected="q_chart")
</template>

<script>
import Vue from 'vue';
import HistogramSlider from "../HistogramSlider/Components/HistogramSlider.vue";

import 'vue-histogram-slider/dist/histogram-slider.css';

import FilterViewRadioGroup from "./FilterViewRadioGroup.vue";

Vue.component(HistogramSlider.name, HistogramSlider);

export default Vue.extend({

    components: {
        HistogramSlider,
        FilterViewRadioGroup
    },
    data : function() {
        return {
            data: [],
            range: {},
            q_latest: false,
            q_chart: true,
            y_latest: false,
            y_chart: false,
            t_latest: false,
            t_chart: false,
            is_filter: false,
            histogramMounted: false
        };
    },
    mounted() {
        this.is_filter = true;
        this.data = [
            {x0:-10000000,frequency:200, display:'< 0'},
            {x0:-0.001,frequency:226, display:'0'},
            {x0:10000000,frequency:133, display:'10 M'},
            {x0:30000000,frequency:99, display:'30 M'},
            {x0:60000000,frequency:83, display:'60 M'},
            {x0:100000000,frequency:91, display:'100 M'},
            {x0:200000000,frequency:89, display:'200 M'},
            {x0:400000000,frequency:56, display:'400 M'},
            {x0:600000000,frequency:47, display:'600 M'},
            {x0:800000000,frequency:46, display:'800 M'},
            {x0:1200000000,frequency:48, display:'1200 M'},
            {x0:1900000000,frequency:36, display:'1900 M'},
            {x0:2800000000,frequency:35, display:'2800 M'},
            {x0:3800000000,frequency:39, display:'3800 M'},
            {x0:7000000000,frequency:33, display:'7000 M'},
            {x0:15000000000,frequency:31, display:'> 15000 M'},
        ]
    },
    beforeMount() {
    
    },
    computed: {
        canFilter() {
            return this.histogramMounted && this.is_filter;
        },
    },
    methods: {
        clear() {
            this.q_latest = false;
            this.q_chart = false;
            this.y_latest = false;
            this.y_chart = false;
            this.t_latest = false;
            this.t_chart = false;
        },
        click_btn(category, type) {
            this.clear();
            this[category + '_' + type] = true;
            this.params.context.componentParent.setFilterSales(category, type === 'chart' ? 'array' : type);
        },

        onHistogramSliderMounted() {
            this.histogramMounted = true;      
        },
        onFinish(event) {
            this.range.sales_min = event.from;
            this.range.sales_max = event.to;
            const minInx = this.data.findIndex(itr => itr.x0 == event.from);
            const maxInx = this.data.findIndex(itr => itr.x0 == event.to);
            this.range.displayFrom = this.data[minInx].display;
            this.range.displayTo = this.data[maxInx].display;
            this.range.init_from = this.data[0].x0;
            this.range.init_to = this.data[this.data.length-1].x0;

            this.params.filterChangedCallback(this.range);
        },
        init (params) {            
            },
        getGui() {
            return this.eGui;
        },
        doesFilterPass(params) {
            // no filter when add/remove columns
            if (this.range.sales_min == this.data[0].x0 && this.range.sales_max == this.data[this.data.length-1].x0) {
                return true;
            }

            if (this.q_latest) {
                if (params.data.sales_q_latest) {
                    const q_latest = parseInt(params.data.sales_q_latest);
                    return q_latest >= this.range.sales_min && q_latest <= this.range.sales_max;
                }
            } else if (this.q_chart) {
                if (params.data.sales_q_array) {
                    const q_array = params.data.sales_q_array;
                    const index = q_array.length==0? 0 : q_array.length-1;
                    return q_array[index] >= this.range.sales_min && q_array[index] <= this.range.sales_max;
                }
            } else if (this.y_latest) {
                if (params.data.sales_y_latest) {
                    const y_latest = parseInt(params.data.sales_y_latest);
                    return y_latest >= this.range.sales_min && y_latest <= this.range.sales_max;
                }
            } else if (this.y_chart) {
                if (params.data.sales_y_array) {
                    const y_array = params.data.sales_y_array;
                    const index = y_array.length==0? 0 : y_array.length-1;
                    return y_array[index] >= this.range.sales_min && y_array[index] <= this.range.sales_max;
                }
            } else if (this.t_latest) {
                if (params.data.sales_t_latest) {
                    const t_latest = parseInt(params.data.sales_t_latest);
                    return t_latest >= this.range.sales_min && t_latest <= this.range.sales_max;
                }
            } else {
                if (params.data.sales_t_array) {
                    const t_array = params.data.sales_t_array;
                    const index = t_array.length==0? 0 : t_array.length-1;
                    return t_array[index] >= this.range.sales_min && t_array[index] <= this.range.sales_max;
                }
            }
        },
        isFilterActive() {
            return true;
        },
        getModel() {
        },
        setModel(model) {
            this.is_filter = true;
        },
    },
    watch: {
        canFilter(val) {
            if (val) {
                if (this.params.context.componentParent.filters.filter) {
                    let filter = this.params.context.componentParent.filters.filter;
                    filter = typeof filter === "object" ? filter : JSON.parse(filter);

                    this.range.sales_min = filter['sales_q_array'] && filter['sales_q_array'].min ? filter['sales_q_array'].min : this.data[0].x0;
                    this.range.sales_max = filter['sales_q_array'] && filter['sales_q_array'].max ? filter['sales_q_array'].max : this.data[this.data.length-1].x0;
                } else {
                    this.range.sales_min = this.data[0].x0;
                    this.range.sales_max = this.data[this.data.length-1].x0;
                }

                const minInx = this.data.findIndex(itr => itr.x0 == this.range.sales_min);
                const maxInx = this.data.findIndex(itr => itr.x0 == this.range.sales_max);
                this.range.displayFrom = this.data[minInx].display;
                this.range.displayTo = this.data[maxInx].display;
                this.range.init_from = this.data[0].x0;
                this.range.init_to = this.data[this.data.length-1].x0;

                this.$refs.hist.update({from: minInx, to: maxInx});

                this.params.filterChangedCallback(this.range);


                this.is_filter = false;
            }
        }
    }
});
</script>
<style>
    .hoverClass :hover{
        background-color: #2196f3;
    }
    .v-slider__ticks-container--always-show .v-slider__tick{
        opacity: 0;
    }
    .v-input__control:hover .v-slider__ticks-container--always-show .v-slider__tick{
        opacity: 1;
    }
    .chart1 {
        margin-left: 500px;
    }
</style>