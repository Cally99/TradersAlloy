<template lang="pug">
        v-range-slider(
            style="padding: 50px 0 0 0;margin:0 20px 0 20px;"
            :thumb-color="sliderColor"
            :track-color="sliderColor"
            :color="sliderColor"
            tick-size="3"
            @change="valueChanged($event)"
            @mouseover.native="onHover()"
            @mouseout.native="onHoverOut()"
            ticks="always"
            :value="values"
            thumb-size="40"
            thumb-label="always"
            max="7"
            min="0")
            template( v-slot:thumb-label="props")
                span {{companySizes(props.value)}}
</template>

<script>
import Vue from 'vue';

export default Vue.extend({

    data: function() {
        return {
            values: [0,7],
            size: ['< -20', '-10', '0', '10', '20', '30', '40', '> 50'],
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
        onHover () {
            if (this.eventValue1 == 0 && this.eventValue2 == 7)
                this.sliderColor = "#2196f3"
        },
        onHoverOut() {
            if (this.eventValue1 == 0 && this.eventValue2 == 7)
                this.sliderColor = "#dddddd00"
        },
        companySizes (val) {
            return this.size[val]
        },
        valueChanged(event) {     
            if (event[0] == 0 && event[1] == 7) {
                this.sliderColor = "#dddddd00"
            } else {
                this.sliderColor = "#3f51b5"
            }
            
            this.values = event;

            this.eventValue1 = event[0];
            this.eventValue2 = event[1];
            this.currentValue1 = event[0];
            this.currentValue2 = event[1];
            if (this.values[0] === 0) {
                this.currentValue1 = -100000000000000000000000000000000000;
            }
            if (this.values[0] === 1) {
                this.currentValue1 = -this.values[0]*10;
            }
            if (this.values[0] === 2) {
                this.currentValue1 = 0;
            }
            if (this.values[0] === 3) {
                this.currentValue1 = this.values[0] / 3 * 10;
            }
            if (this.values[0] === 4) {
                this.currentValue1 = this.values[0] / 4 * 20;
            }
            if (this.values[0] === 5) {
                this.currentValue1 = this.values[0] / 5 * 30;
            }
            if (this.values[0] === 6) {
                this.currentValue1 = this.values[0] / 6 * 40;
            }
            if (this.values[0] === 7) {
                this.currentValue1 = 100000000000000000000000000000000000
            }
            if (this.values[1] === 0) {
                this.currentValue2 = -100000000000000000000000000000000000;
            }
            if (this.values[1] === 1) {
                this.currentValue2 = -this.values[1]*10;
            }
            if (this.values[1] === 2) {
                this.currentValue2 = 0;
            }
            if (this.values[1] === 3) {
                this.currentValue2 = this.values[1] / 3 * 10;
            }
            if (this.values[1] === 4) {
                this.currentValue2 = this.values[1] / 4 * 20;
            }
            if (this.values[1] === 5) {
                this.currentValue2 = this.values[1] / 5 * 30;
            }
            if (this.values[1] === 6) {
                this.currentValue2 = this.values[1] / 6 * 40;
            }
            if (this.values[1] === 7) {
                this.currentValue2 = 100000000000000000000000000000000000
            }
            let valueToUse1 = this.currentValue1
            let valueToUse2 = this.currentValue2
            this.params.parentFilterInstance(function(instance) {
                const filter ={
                    condition1: {
                        filter: valueToUse1,
                        filterType: "number",
                        type: "greaterThan",
                    },
                    condition2: {
                        filter: valueToUse2,
                        filterType: "number",
                        type: "lessThan",
                    },
                    filterType: "number",
                    operator: "AND",
                }
                instance.setModel(filter);
            });
                this.params.api.onFilterChanged();            
        },

        onParentModelChanged(parentModel) {
            
            // let value1 = parentModel.condition1.filter
            // let value2 = parentModel.condition2.filter
            // let final_value1 = 0
            // let final_value2 = 0
            // if (value1 === -20) {
            //     final_value1 = 0
            // }
            // if (value1 === -10) {
            //     final_value1 = 1
            // }
            // if (value1 === 0) {
            //     final_value1 = 2
            // }
            // if (value1 === 10) {
            //     final_value1 = 3
            // }
            // if (value1 === 20) {
            //     final_value1 = 4
            // }
            // if (value1 === 30) {
            //     final_value1 = 5
            // }
            // if (value1 === 40) {
            //     final_value1 = 6
            // }
            // if (value1 === 50) {
            //     final_value1 = 7
            // }
            // if (value2 === -20) {
            //     final_value2 = 0
            // }
            // if (value2 === -10) {
            //     final_value2 = 1
            // }
            // if (value2 === 0) {
            //     final_value2 = 2
            // }
            // if (value2 === 10) {
            //     final_value2 = 3
            // }
            // if (value2 === 20) {
            //     final_value2 = 4
            // }
            // if (value2 === 30) {
            //     final_value2 = 5
            // }
            // if (value2 === 40) {
            //     final_value2 = 6
            // }
            // if (value2 === 50) {
            //     final_value2 = 7
            // }
            // this.values = [final_value1, final_value2]
        },
    },
});
</script>
