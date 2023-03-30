<template lang='pug'>
    //- v-icon(@click="gotoResearch(ticker)") $researchNew
    div(class="pt-2" style="float:right;")
        div( v-if="item.research_state === 'EXISTS'")
            v-icon( @click="gotoResearch(ticker)" style="margin-right:18px;") $researchNew

        div( v-else)
            div( v-if="item.Research.numberOfMonths > 3" @click="gotoResearch(ticker)" style="position:relative;")
                v-tooltip( bottom)
                    template( v-slot:activator="{ on, attrs }")
                        div( v-bind="attrs" v-on="on" style="padding-bottom:18px;")
                            div( style="position:absolute; z-index:1; left:-40px;")
                                v-icon $researchNew
                            div( style="position:absolute; z-index:2; top:10px; left:-31px;")
                                v-icon $circle

                    span Not updated in {{ Math.floor(item.Research.numberOfMonths) }} months

            div( v-else style="position: relative;")
                v-tooltip( bottom)
                    template( v-slot:activator="{ on, attrs }")
                        div( v-bind="attrs" v-on="on" style="padding-bottom:17px;")
                            div( style="position: absolute;left: -40px;")
                                v-icon( @click="gotoResearch(ticker)") $researchNoNew

                    span Write Research
</template>

<script>

import Vue from 'vue';

export default Vue.extend({
    created() {
        if (this.params) {
            this.item = this.params.data;
        }
    },
    mounted() {
        this.ticker = this.getValue();
    },
    data: function() {
        return {
            ticker: '',
            item: null
        };
    },
    methods: {
        getValue() {
            return this.params.value;
        },
        gotoResearch(ticker) {
            this.params.action(ticker);
        },
    },
});

</script>