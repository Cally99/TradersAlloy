<template lang="pug">
    span(class="ticker blue1" @click="clickTicker(stock)") {{stock.ticker}}
</template>


<script>
    export default {
        name: "Ticker",
        props: {
            stock: Object
        },
        methods: {
            clickTicker(stock) {
                this.$router.push({name: 'landing-page.stock-detail', params: {stock_id: stock.stock_id}});
            },
        }
    }
</script>

<style scoped>

</style>
