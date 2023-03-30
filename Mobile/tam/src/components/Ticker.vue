<template lang="pug">
a(href="/tabs/stock" class="ticker") TAAB
</template>

<script>
    export default {
        name: "Ticker",
        props: {stockId: Number, ticker:String},
    }
</script>

<style scoped>
    .ticker {
        min-width: 90px;
        background:#1A4D5E;
        color:white;
        border-radius: 3px;
        padding: 3px;
        margin: 2px;
    }

</style>
