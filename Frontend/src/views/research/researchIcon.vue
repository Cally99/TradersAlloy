<template lang='pug'>
    v-icon(@click="gotoResearch(stock_id)") $researchNew
</template>

<script>

import Vue from 'vue';

export default Vue.extend({
    mounted() {
        this.stock_id = this.getValue();
    },
    data: function() {
        return {
            stock_id: ''
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