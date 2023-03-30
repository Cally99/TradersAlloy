<template lang="pug">
    div(class="grey7 pa-6")
        v-container(class="ma-0 pa-0" style="width:250px;")
            h3 {{ $t('Market_cap') }}
            v-divider
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
                :isMoney="true"
                :grid="false"
                :dragInterval="true"
                :updateColorOnChange="true"
                :forceEdges="true"
                :data="data"
                :clip="false"
                :hideFromTo="true"
                :colors="['#4facfe', '#4facfe']"
                @finish="onFinish"
                @hook:mounted = "onHistogramSliderMounted"
            )
</template>


<script>
import Vue from 'vue';
import HistogramSlider from "../HistogramSlider/Components/HistogramSlider.vue"
import 'vue-histogram-slider/dist/histogram-slider.css';

Vue.component(HistogramSlider.name, HistogramSlider);

export default Vue.extend({
    components: {
        HistogramSlider,
    },
    data : function() {
        return {
            data: [],
            range: {},
            active: false,
            is_filter: false,
            histogramMounted: false
        };
    },
    created: function () {
    },

    beforeMount() {
    },
    mounted() {
        this.is_filter = true
        this.data = [
                {x0:-0.001,frequency:263, display:'0'},
                {x0:16,frequency:205, display:'16 M'},
                {x0:46,frequency:174, display:'46 M'},
                {x0:110,frequency:137, display:'110 M'},
                {x0:230,frequency:117, display:'230 M'},
                {x0:500,frequency:90, display:'500 M'},
                {x0:920,frequency:77, display:'1 B'},
                {x0:1800,frequency:64, display:'2 B'},
                {x0:3900,frequency:49, display:'4 B'},
                {x0:9000,frequency:31, display:'9 B'},
                {x0:20000,frequency:21, display:'20 B'},
                {x0:50000,frequency:10, display:'> 50 B'},
            ];

    },
    unmounted() {
    },
    methods: {
        onHistogramSliderMounted() {
            this.histogramMounted = true;
        },
        onFinish(event) {
            this.range.min = event.from;
            this.range.max = event.to;

            const minInx = this.data.findIndex(itr => itr.x0 == event.from);
            const maxInx = this.data.findIndex(itr => itr.x0 == event.to);
            this.range.displayFrom = this.data[minInx].display;
            this.range.displayTo = this.data[maxInx].display;
            this.range.init_from = this.data[0].x0;
            this.range.init_to = this.data[this.data.length-1].x0;


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
            // no filter when add/remove columns
            if (this.range.min == this.data[0].x0 && this.range.max == this.data[this.data.length-1].x0) {
                return true;
            }

            const marketCap = parseInt(params.data.market_cap);
            return marketCap >= this.range.min && marketCap <= this.range.max;
        },
        isFilterActive() {
            this.active = true;
            return true;
        },
        getModel() {
            },
        setModel(model) {
            this.is_filter = true;
        },
    },
    computed: {
        canFilter() {
            return this.histogramMounted && this.is_filter;
        },
    },
    watch: {
        canFilter(val) {
            if (val) {
                if (this.params.context.componentParent.filters.filter) {
                    let filter = this.params.context.componentParent.filters.filter;
                    filter = typeof filter === "object" ? filter : JSON.parse(filter);
                    this.range.min = filter['market_cap'] && filter['market_cap'].min ? filter['market_cap'].min : this.data[0].x0;
                    this.range.max = filter['market_cap'] && filter['market_cap'].max ? filter['market_cap'].max : this.data[this.data.length-1].x0;
                } else {
                    this.range.min = this.data[0].x0;
                    this.range.max = this.data[this.data.length-1].x0;
                }

                const minInx = this.data.findIndex(itr => itr.x0 == this.range.min);
                const maxInx = this.data.findIndex(itr => itr.x0 == this.range.max);
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
    .custom-menu-button.reset-button{
        right:10px;
        border: 1px solid #ABA5A5;
        background-color: #DADADA;
        color: black;
    }
</style>