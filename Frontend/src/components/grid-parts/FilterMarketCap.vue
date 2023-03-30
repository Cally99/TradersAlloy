<template lang="pug">
    v-container(class="ma-6 pa-0" style="width:250px;")
        //- span(class="custom-menu-button reset-button") Reset
        h3 Market Cap
        v-divider
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
</template>


<script>
import Vue from 'vue';
import HistogramSlider from 'vue-histogram-slider';
import 'vue-histogram-slider/dist/histogram-slider.css';
import { mapGetters } from "vuex";

Vue.component(HistogramSlider.name, HistogramSlider);

export default Vue.extend({
    components: {
        HistogramSlider,
    },
    data : function() {
        return {
            data: [],
            range: {min:0, max: 150000},
            min_value: 0,
            max_value: 150000,
            setRange: false,
            active: false,
        };
    },
    created: function () {
    },

    beforeMount() {
    },
    mounted() {
        console.log('histogram mounted')
        this.data = [0,0,0,0,0,0,0,0,0,0,0,0,0,0, 
                    100, 100, 100,100,100,100,100, 
                    1000,1000,1000,1000,1000,1000,
                    10000,10000,10000,10000, 
                    12500, 12500,12500,12500,12500,
                    37500, 37500,37500, 37500, 37500,37500,
                    50000,50000,50000,50000,
                    75000,75000,75000,75000,
                    100000,100000,100000,
                    120000,120000,120000,
                    125000,125000,125000,
                    150000,150000
                ];

        // if (!this.setRange)
        //     this.params.context.componentParent.setFilter();
        
        // var range_array = [ "36", "100", "400", "1800", "900", "8000", "4000", "900", "2000", "5000", "1000", "1500"]
        // var frequency_array = [1, 2, 3, 4, 5, 1, 1, 1, 1, 1, 1, 1]
        // var final_array = []
        // for (var i=0; i<frequency_array.length; i++) {
        //     for (var j=0; j<frequency_array[i]; j++) {
        //         final_array.push(range_array[i])
        //     }
        // }
        // this.data = final_array
    },
    unmounted() {
    },
    methods: {
        onHistogramSliderMounted() {
            console.log('histogram method===========', this.params.context.componentParent.filters)
            if (this.params.context.componentParent.filters.filter) {
                const filter = JSON.parse(this.params.context.componentParent.filters.filter);
                this.range.min = this.min_value = filter['market_cap'] ? filter['market_cap'].min : 0;
                this.range.max = this.max_value = filter['market_cap'] ? filter['market_cap'].max : 150000;
                this.$refs.hist.update({from: this.min_value, to: this.max_value});
                
                this.setRange = true;
                this.params.filterChangedCallback(this.range);
            } else {
                this.range.min = this.min_value =  0;
                this.range.max = this.max_value = 150000;
                this.$refs.hist.update({from: this.min_value, to: this.max_value});
                
                this.setRange = true;
                this.params.filterChangedCallback(this.range);
            }
        },
        onFinish(event) {
            this.range.min = event.from;
            this.range.max = event.to;
            if(this.setRange) this.$refs.hist.update({from: this.min_value, to: this.max_value});
            this.setRange = false;            
            this.params.filterChangedCallback(this.range);
        },
        init (params) {            
            this.eGui = document.createElement('div');
            this.eGui.innerHTML =
                '<div>' +
                '  <v-range-slider /> Profit Margin LAST Q' +
                '</div>';
        },
        getGui() {
            return this.eGui;
        },
        doesFilterPass(params) {
            const marketCap = parseInt(params.data.market_cap);
            return marketCap >= this.range.min && marketCap <= this.range.max
        },
        isFilterActive() {
            this.active = true;
            return true;
        },
        getModel() {
        },
        setModel(model) {
            console.log('histogram set model', model)
            this.onHistogramSliderMounted()
        },
    },
});
</script>

<style>
    .custom-menu-button.reset-button{
        right:10px;
        border: 1px solid #ABA5A5;
        background-color: #DADADA;
        color: black;
    }
</style>