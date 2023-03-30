<template lang="pug">
        v-range-slider(
            style="padding: 55px 7px 0 7px;"
            v-model="value"
            track-color="#dddddd"
            @change="valueChanged($event)"
            :thumb-size="30"
            max="50"
            min="0"
            thumb-label="always")
            template( v-slot:thumb-label="{ value }") {{( value==50? '>': '')}}{{ value }}

</template>

<script>
import Vue from 'vue';

export default Vue.extend({

    data: function() {
        return {
            value: [0,50],
            currentValue: 0,
            currentValue1: 0,
            currentValue2: 7,
            eventValue1: 0,
            eventValue2: 7,
            sliderColor: "#dddddd00"
        };
    },
    beforeMount() {
        this.maxValue = this.params.maxValue;
    },
    mounted() {},
    methods: {
        valueChanged(event) {
            this.currentValue = event.target.value;
            let valueToUse = this.currentValue === '0' ? null : this.currentValue;
            this.params.parentFilterInstance(function(instance) {
            instance.onFloatingFilterChanged('greaterThan', valueToUse);
            });
        },
        onParentModelChanged(parentModel) {
            // note that the filter could be anything here, but our purposes we're assuming a greater than filter only,
            // so just read off the value and use that
            this.currentValue = !parentModel ? 0 : parentModel.filter;
        },
    },
});
</script>
<style>
    .ag-header-cell .v-slider__thumb-label.primary {
        opacity: 0;
    }
    .ag-header-cell:hover .v-slider__thumb-label.primary {
        opacity: 1;
    }
</style>