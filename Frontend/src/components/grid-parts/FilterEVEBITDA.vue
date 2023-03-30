<template lang="pug">
    v-container(class="ma-6 pa-0" style="width:280px;")
        //- span(class="custom-menu-button reset-button") Reset
        h3 EV/EBITDA
        v-divider
        span(style="font-size:20px;") Filter
        div(style="margin-left: 50px; margin-bottom:30px;")
            HistogramSlider(
                ref="hist"
                v-if="data.length > 0"
                :width="220"
                :bar-radius="0"
                :bar-width="6"
                :handle-size="18"
                :bar-height="100"         
                primary-color="#003495"
                handle-color="#ffbc1e"
                holder-color="#c1e0ed"
                :lineHeight="1"
                :fontSize="16"
                :grid="true"
                :updateColorOnChange="true"
                :data="data"
                :clip="false"
                @finish="onFinish"
                @hook:mounted = "onHistogramSliderMounted"
            )
        span(style="font-size:20px;") Display
        div(class="d-flex justify-space-between mt-4 px-4" style="align-items: center;")
            span(style="font-size:15px;") Quarterly
            div(class="d-flex")
                v-btn( @click="click_q_latest()") Latest
                v-btn(style="margin-left:10px;" @click="click_q_chart()")
                    img(src="/images/sparkline.png" style="height:16px; width:40px")
        div(class="d-flex justify-space-between mt-4 px-4" style="align-items: center;")
            span(style="font-size:15px;") Full Year
            div(class="d-flex")
                v-btn( @click="click_y_latest()") Latest
                v-btn(style="margin-left:10px;" @click="click_y_chart()")
                    img(src="/images/sparkline.png" style="height:16px; width:40px")
        div(class="d-flex justify-space-between mt-4 px-4" style="align-items: center;")
            span(style="font-size:15px;") TTM
            div(class="d-flex")
                v-btn( @click="click_t_latest()") Latest
                v-btn(style="margin-left:10px;" @click="click_t_chart()")
                    img(src="/images/sparkline.png" style="height:16px; width:40px")
</template>

<script>
import Vue from 'vue';
import HistogramSlider from 'vue-histogram-slider';
import 'vue-histogram-slider/dist/histogram-slider.css';

Vue.component(HistogramSlider.name, HistogramSlider);

export default Vue.extend({

    components: {
        HistogramSlider,
    },
    data : function() {
        return {
            data: [],
            range: {ev_ebitda_min:-500, ev_ebitda_max: 300},
            min_value: -500,
            max_value: 300,
            setRange: false,
            q_latest: false,
            q_chart: true,
            y_latest: false,
            y_chart: false,
            t_latest: false,
            t_chart: false
        };
    },
    mounted() {
        this.data = [-500,-30,-30,-20,-20,-20,-10,-10,-5,0,0,0,5,10,20,20,20,20,30,40,300];

        // if (!this.setRange)
        //     this.params.context.componentParent.setFilter();
        },
    beforeMount() {
    
    },
    methods: {
        click_q_latest() {
            this.q_latest = true
            this.q_chart = false
            this.y_latest = false
            this.y_chart = false
            this.t_latest = false
            this.t_chart = false
            this.params.context.componentParent.setFilterev_ebitda_q_latest();
        },
        click_q_chart() {
            this.q_latest = false
            this.q_chart = true
            this.y_latest = false
            this.y_chart = false
            this.t_latest = false
            this.t_chart = false
            this.params.context.componentParent.setFilterev_ebitda_q_chart();
        },
        click_y_latest() {
            this.q_latest = false
            this.q_chart = false
            this.y_latest = true
            this.y_chart = false
            this.t_latest = false
            this.t_chart = false
            this.params.context.componentParent.setFilterev_ebitda_y_latest();
        },
        click_y_chart() {
            this.q_latest = false
            this.q_chart = false
            this.y_latest = false
            this.y_chart = true
            this.t_latest = false
            this.t_chart = false
            this.params.context.componentParent.setFilterev_ebitda_y_chart();
        },
        click_t_latest() {
            this.q_latest = false
            this.q_chart = false
            this.y_latest = false
            this.y_chart = false
            this.t_latest = true
            this.t_chart = false
            this.params.context.componentParent.setFilterev_ebitda_t_latest();
        },
        click_t_chart() {
            this.q_latest = false
            this.q_chart = false
            this.y_latest = false
            this.y_chart = false
            this.t_latest = false
            this.t_chart = true
            this.params.context.componentParent.setFilterev_ebitda_t_chart();
        },
        onHistogramSliderMounted() {
            if (this.params.context.componentParent.filters.filter) {
                const filter = JSON.parse(this.params.context.componentParent.filters.filter);
                this.range.ev_ebitda_min = this.min_value = filter['evebitda'] ? filter['evebitda'].min : -500;
                this.range.ev_ebitda_max = this.max_value = filter['evebitda'] ? filter['evebitda'].max : 300;
                this.$refs.hist.update({from: this.min_value, to: this.max_value});
                
                this.setRange = true;
                this.params.filterChangedCallback(this.range);
            }
        },
        onFinish(event) {
            this.range.ev_ebitda_min = event.from;
            this.range.ev_ebitda_max = event.to;
            if(this.setRange) this.$refs.hist.update({from: this.min_value, to: this.max_value});
            this.setRange = false;            
            this.params.filterChangedCallback(this.range);
        },
        init (params) {            
        },
        getGui() {
            return this.eGui;
        },
        doesFilterPass(params) {
            if (this.q_latest) {
                if (params.data.ev_ebitda_q_latest) {
                    const q_latest = parseInt(params.data.ev_ebitda_q_latest);
                    return q_latest >= this.range.ev_ebitda_min && q_latest <= this.range.ev_ebitda_max
                }
            } else if (this.q_chart) {
                if (params.data.ev_ebitda_q_array) {
                    const q_array = params.data.ev_ebitda_q_array;
                    const index = q_array.length==0? 0 : q_array.length-1
                    return q_array[index] >= this.range.ev_ebitda_min && q_array[index] <= this.range.ev_ebitda_max
                }
            } else if (this.y_latest) {
                if (params.data.ev_ebitda_y_latest) {
                    const y_latest = parseInt(params.data.ev_ebitda_y_latest);
                    return y_latest >= this.range.ev_ebitda_min && y_latest <= this.range.ev_ebitda_max
                }
            } else if (this.y_chart) {
                if (params.data.ev_ebitda_y_array) {
                    const y_array = params.data.ev_ebitda_y_array;
                    const index = y_array.length==0? 0 : y_array.length-1
                    return y_array[index] >= this.range.ev_ebitda_min && y_array[index] <= this.range.ev_ebitda_max
                }
            } else if (this.t_latest) {
                if (params.data.ev_ebitda_t_latest) {
                    const t_latest = parseInt(params.data.ev_ebitda_t_latest);
                    return t_latest >= this.range.ev_ebitda_min && t_latest <= this.range.ev_ebitda_max
                }
            } else {
                if (params.data.ev_ebitda_t_array) {
                    const t_array = params.data.ev_ebitda_t_array;
                    const index = t_array.length==0? 0 : t_array.length-1
                    return t_array[index] >= this.range.ev_ebitda_min && t_array[index] <= this.range.ev_ebitda_max
                }
            }
        },
        isFilterActive() {
            return true;
        },
        getModel() {
        },
        setModel(model) {
            this.onHistogramSliderMounted()
        },
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