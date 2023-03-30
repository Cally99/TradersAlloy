<template lang='pug'>
    v-icon(@click="deleteResearch(stock_id)" class="" style="") $trashCan
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
        deleteResearch(ticker) {
            this.params.action(ticker);
        },
    },
});

</script>