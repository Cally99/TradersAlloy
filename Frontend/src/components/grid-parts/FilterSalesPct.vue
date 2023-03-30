<template lang="pug">
        v-range-slider(
            :thumb-color="sliderColor"
            :track-color="sliderColor"
            :color="sliderColor"
            style="padding: 55px 7px 0 7px;"
            v-model="value"
            track-color="#dddddd"
            @change="valueChanged($event)"
            @mouseover.native="onHover()"
            @mouseout.native="onHoverOut()"
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
            value: [-20, 20],
            currentValue1: 0,
            currentValue2: 0,
            eventValue1: 0,
            eventValue2: 7,
            sliderColor: "#dddddd"
        };
    },
    beforeMount() {
        this.maxValue = this.params.maxValue;
    },
    mounted() {},
    methods: {
        onHover () {
            if (this.eventValue1 == -20 && this.eventValue2 == 20)
                this.sliderColor = "#2196f3"
        },
        onHoverOut() {
            if (this.eventValue1 == -20 && this.eventValue2 == 20)
                this.sliderColor = "#dddddd"
        },
        valueChanged(event) {
            if (event[0] == -20 && event[1] == 20) {
                this.sliderColor = "#dddddd"
            } else {
                this.sliderColor = "#3f51b5"
            }

            this.eventValue1 = event[0];
            this.eventValue2 = event[1];
            this.currentValue1 = event[0];
            this.currentValue2 = event[1];
            if (event[0] == -20) {
                this.currentValue1 = -1000000000000000000000000000
            }
            if (event[1] == 20) {
                this.currentValue2 = 1000000000000000000000000000
            }
            let valueToUse1 = this.currentValue1 === '-20' ? null : this.currentValue1;
            let valueToUse2 = this.currentValue2 === '20' ? null : this.currentValue2;
            this.params.parentFilterInstance(function(instance) {
                // instance.onFloatingFilterChanged('greaterThan', valueToUse1);
                const filter ={
                    condition1: {
                        filter: valueToUse1,
                        filterType: "number",
                        type: "greaterThanWithNulls",
                    },
                    condition2: {
                        filter: valueToUse2,
                        filterType: "number",
                        type: "lessThanWithNulls",
                    },
                    filterType: "number",
                    operator: "AND",
                }
                instance.setModel(filter);
            });
                this.params.api.onFilterChanged();
        },

        onParentModelChanged(parentModel) {
            this.value = [parentModel.condition1.filter, parentModel.condition2.filter]
        },
    },
});
</script>
