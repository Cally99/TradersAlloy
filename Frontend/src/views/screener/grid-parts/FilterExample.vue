<template lang="pug">
    v-container(class="ma-6 pa-0" style="width:250px;")
        h3 grid-parts Example
        v-divider
        HistogramSlider( :width="220"
            :bar-radius="0"
            :bar-width="6"
            :handle-size="18"
            primary-color="#003495"
            handle-color="#ffbc1e"
            holder-color="#c1e0ed"
            :lineHeight="1"
            :fontSize="16"
            :grid="true"
            :updateColorOnChange="true"
            :data=[1,2,3,3,4,4,4,5,5,5,5,6,6,6,6,7,7,7,7,8,8,8,8,8,8,9,9,9,9,9,9,10,10,10,10,11,11,11,12,12,13,13,14, 15, 16, 17, 18])

    //-
        We need to hack the source code , now it expects raw data, and it calculates the frequency.
        Our need is different; let us give the values for each bar and also the label to display:
            [
                {range: 1000,frequency:1, label: "1K"},
                {range: 2000,frequency:3, label: "2K"},
                {range: 3000,frequency:5, label: "3K"},
                {range: 4000,frequency:7, label: "4K"},
                {range: 5000,frequency:2, label: "5K"},
            ]

</template>

<script>
import Vue from 'vue';
import HistogramSlider from 'vue-histogram-slider';
import 'vue-histogram-slider/dist/histogram-slider.css';

export default Vue.extend({

    components: {
        HistogramSlider
    },
    beforeMount() {

    },
    mounted() {

    },
    data: function() {
        return {
        };
    },
    methods: {
    },
});
</script>
