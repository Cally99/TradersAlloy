<template lang="pug">
        v-range-slider(
            style="padding: 55px 7px 0 7px;"
            v-model="value"
            @change="valueChanged($event)"
            track-color="#dddddd"
            :thumb-size="30"
            max="20"
            min="-20"
            thumb-label="always")
            template( v-slot:thumb-label="{ value }") {{( value==20? '>': '')}}{{ value }}%

</template>

<script>
import Vue from 'vue';

export default Vue.extend({

    data: function() {
        return {
            value: [0, 20],
            currentValue: 0,
        };
    },
    beforeMount() {
        this.maxValue = this.params.maxValue;
    },
    mounted() {},
        methods: {
        valueChanged(event) {
            this.value = event
            // this.currentValue = event.target.value;
            // var valueToUse = this.currentValue === '0' ? null : this.currentValue;
            // this.params.parentFilterInstance(function(instance) {
            // instance.onFloatingFilterChanged('greaterThan', valueToUse);
            // });
        },
        onParentModelChanged(parentModel) {
            // note that the filter could be anything here, but our purposes we're assuming a greater than filter only,
            // so just read off the value and use that
            this.currentValue = !parentModel ? 0 : parentModel.filter;
        },
    },
});
</script>
