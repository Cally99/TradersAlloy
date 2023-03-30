<template lang="pug">
    div(class="grey7 pa-6")
        v-container(class="ma-0 pa-0" style="width:350px;")
            h3 {{ $t('Gross_margin_growth_percent') }}

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

            FilterViewRadioGroup(filterGroup="grossMarginGrowthGroup" defaultSelected="q_latest")
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
            {x0:-10,frequency:11, display:'< -10%'},
            {x0:-5,frequency:5, display:'-5%'},
            {x0:-4,frequency:1, display:'-4%'},
            {x0:-3,frequency:6, display:'-3%'},
            {x0:-2,frequency:11, display:'-2%'},
            {x0:-1,frequency:60, display:'-1%'},
            {x0:-0.001,frequency:864, display:'0%'},
            {x0:1,frequency:346, display:'1%'},
            {x0:2,frequency:20, display:'2%'},
            {x0:3,frequency:8, display:'3%'},
            {x0:4,frequency:12, display:'4%'},
            {x0:5,frequency:1, display:'5%'},
            {x0:10,frequency:9, display:'10%'},
            {x0:20,frequency:7, display:'20%'},
            {x0:30,frequency:1, display:'> 30%'},
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
            this.params.context.componentParent.setFilterGrossMarginGrowth(category, type === 'chart' ? 'array' : type);
        },

        onHistogramSliderMounted() {
            this.histogramMounted = true;            
        },
        onFinish(event) {
            this.range.grossMarginGrowth_min = event.from;
            this.range.grossMarginGrowth_max = event.to;
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
            if (this.range.grossMarginGrowth_min == this.data[0].x0 && this.range.grossMarginGrowth_max == this.data[this.data.length-1].x0) {
                return true;
            }

            if (this.q_latest) {
                if (params.data.grossMarginGrowth_q_latest) {
                    const q_latest = parseInt(params.data.grossMarginGrowth_q_latest);
                    return q_latest >= this.range.grossMarginGrowth_min && q_latest <= this.range.grossMarginGrowth_max;
                }
            } else if (this.q_chart) {
                if (params.data.grossMarginGrowth_q_array) {
                    const q_array = params.data.grossMarginGrowth_q_array;
                    const index = q_array.length==0? 0 : q_array.length-1;
                    return q_array[index] >= this.range.grossMarginGrowth_min && q_array[index] <= this.range.grossMarginGrowth_max;
                }
            } else if (this.y_latest) {
                if (params.data.grossMarginGrowth_y_latest) {
                    const y_latest = parseInt(params.data.grossMarginGrowth_y_latest);
                    return y_latest >= this.range.grossMarginGrowth_min && y_latest <= this.range.grossMarginGrowth_max;
                }
            } else if (this.y_chart) {
                if (params.data.grossMarginGrowth_y_array) {
                    const y_array = params.data.grossMarginGrowth_y_array;
                    const index = y_array.length==0? 0 : y_array.length-1;
                    return y_array[index] >= this.range.grossMarginGrowth_min && y_array[index] <= this.range.grossMarginGrowth_max;
                }
            } else if (this.t_latest) {
                if (params.data.grossMarginGrowth_t_latest) {
                    const t_latest = parseInt(params.data.grossMarginGrowth_t_latest);
                    return t_latest >= this.range.grossMarginGrowth_min && t_latest <= this.range.grossMarginGrowth_max;
                }
            } else {
                if (params.data.grossMarginGrowth_t_array) {
                    const t_array = params.data.grossMarginGrowth_t_array;
                    const index = t_array.length==0? 0 : t_array.length-1;
                    return t_array[index] >= this.range.grossMarginGrowth_min && t_array[index] <= this.range.grossMarginGrowth_max;
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

                    this.range.grossMarginGrowth_min = filter['grossMarginGrowth_q_latest'] && filter['grossMarginGrowth_q_latest'].min ? filter['grossMarginGrowth_q_latest'].min : this.data[0].x0;
                    this.range.grossMarginGrowth_max = filter['grossMarginGrowth_q_latest'] && filter['grossMarginGrowth_q_latest'].max ? filter['grossMarginGrowth_q_latest'].max : this.data[this.data.length-1].x0;
                } else {
                    this.range.grossMarginGrowth_min = this.data[0].x0;
                    this.range.grossMarginGrowth_max = this.data[this.data.length-1].x0;
                }

                const minInx = this.data.findIndex(itr => itr.x0 == this.range.grossMarginGrowth_min);
                const maxInx = this.data.findIndex(itr => itr.x0 == this.range.grossMarginGrowth_max);
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