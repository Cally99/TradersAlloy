<template lang="pug">
    div(class="grey7 pa-6")
        v-container(class="ma-0 pa-0" style="width:350px;")
            h3 {{ $t('Number_of_stocks_growth_percent') }}

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
                    :force-edges="false"
                    :data="data"
                    :clip="false"
                    :hideFromTo="true"
                    :colors="['#4facfe', '#4facfe']"
                    @finish="onFinish"
                    @hook:mounted = "onHistogramSliderMounted"
                )

            FilterViewRadioGroup(filterGroup="numberOfStocksGrowthGroup" defaultSelected="q_latest")
</template>

<script>
import Vue from 'vue';
import HistogramSlider from "../HistogramSlider/Components/HistogramSlider.vue"
// import HistogramSlider from "vue-histogram-slider"
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
            q_latest: true,
            q_chart: false,
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
            // {x0:-500000000000,frequency:19, display:'< 0'},
            // {x0:0,frequency:236, display:'100 M'},
            // {x0:100000000,frequency:207, display:'300 M  '},
            // {x0:300000000,frequency:137, display:'600 M'},
            // {x0:600000000,frequency:130, display:'1200 M'},
            // {x0:1200000000,frequency:85, display:'2 B'},
            // {x0:2000000000,frequency:82, display:'3.5 B'},
            // {x0:3500000000,frequency:56, display:'5 B'},
            // {x0:5000000000,frequency:42, display:'7 B'},
            // {x0:7000000000,frequency:51, display:'10 B'},
            // {x0:10000000000,frequency:55, display:'15 B'},
            // {x0:15000000000,frequency:37, display:'20 B'},
            // {x0:20000000000,frequency:38, display:'30 B'},
            // {x0:30000000000,frequency:43, display:'50 B'},
            // {x0:50000000000,frequency:31, display:'80 B'},
            // {x0:80000000000,frequency:23, display:'120 B'},
            // {x0:120000000000,frequency:22, display:'300 B'},
            // {x0:300000000000,frequency:15, display:'1 000 B'},
            // {x0:1000000000000,frequency:3, display:'> 1 Trillion'}
        ];
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
            this.params.context.componentParent.setFilterNOSG(category, type === 'chart' ? 'array' : type);
        },

        onHistogramSliderMounted() {
            this.histogramMounted = true;            
        },
        onFinish(event) {
            this.range.nosg_min = event.from;
            this.range.nosg_max = event.to;
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
            if (this.range.nosg_min == this.data[0].x0 && this.range.nosg_max == this.data[this.data.length-1].x0) {
                return true;
            }

            if (this.q_latest) {
                if (params.data.nosg_q_latest) {
                    const q_latest = parseInt(params.data.nosg_q_latest);
                    return q_latest >= this.range.nosg_min && q_latest <= this.range.nosg_max;
                }
            } else if (this.q_chart) {
                if (params.data.nosg_q_array) {
                    const q_array = params.data.nosg_q_array;
                    const index = q_array.length==0? 0 : q_array.length-1;
                    return q_array[index] >= this.range.nosg_min && q_array[index] <= this.range.nosg_max;
                }
            } else if (this.y_latest) {
                if (params.data.nosg_y_latest) {
                    const y_latest = parseInt(params.data.nosg_y_latest);
                    return y_latest >= this.range.nosg_min && y_latest <= this.range.nosg_max;
                }
            } else if (this.y_chart) {
                if (params.data.nosg_y_array) {
                    const y_array = params.data.nosg_y_array;
                    const index = y_array.length==0? 0 : y_array.length-1;
                    return y_array[index] >= this.range.nosg_min && y_array[index] <= this.range.nosg_max;
                }
            } else if (this.t_latest) {
                if (params.data.nosg_t_latest) {
                    const t_latest = parseInt(params.data.nosg_t_latest);
                    return t_latest >= this.range.nosg_min && t_latest <= this.range.nosg_max;
                }
            } else {
                if (params.data.nosg_t_array) {
                    const t_array = params.data.nosg_t_array;
                    const index = t_array.length==0? 0 : t_array.length-1;
                    return t_array[index] >= this.range.nosg_min && t_array[index] <= this.range.nosg_max;
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

                    this.range.nosg_min = filter['nosg_q_latest'] && filter['nosg_q_latest'].min ? filter['nosg_q_latest'].min : this.data[0].x0;
                    this.range.nosg_max = filter['nosg_q_latest'] && filter['nosg_q_latest'].max ? filter['nosg_q_latest'].max : this.data[this.data.length-1].x0;
                } else {
                    this.range.nosg_min = this.data[0].x0;
                    this.range.nosg_max = this.data[this.data.length-1].x0;
                }

                const minInx = this.data.findIndex(itr => itr.x0 == this.range.nosg_min);
                const maxInx = this.data.findIndex(itr => itr.x0 == this.range.nosg_max);
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
</style>