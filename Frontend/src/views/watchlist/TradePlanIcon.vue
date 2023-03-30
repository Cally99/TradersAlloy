<template lang='pug'>
    v-icon(@click="showTradePlan(stock_id)") $bellActive
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
        showTradePlan(ticker) {
            this.params.action(ticker);
        },
    },
});

</script>

<style scoped>

>>> .set-bell-not-added-color {
    fill: #081016;
}

>>> .set-bell-active-color {
    fill: #009973;
}

>>> .set-bell-expired-color {
    fill: #8b9daf;
}

>>> .set-bell-alarm-color {
    fill: #E83068;
}

>>> .set-bell-not-added-color {
    fill: #d1d0d0;
}
</style>