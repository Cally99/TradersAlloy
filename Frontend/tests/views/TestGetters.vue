<template lang="pug">
    <div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    export default {
        name: "TestGetters",
        props: {
            
        },
        data () {
            return {
            }
        },
        computed: {
            ...mapGetters({
                screenerFilters: 'screenerFilters',
                userTradePlans: 'userTradePlans',
                tradeHistory: 'tradeHistory',
                compareDatas: 'compareDatas',
                chartInsider: 'getChartInsider',
                userSettings: 'getUserSettings',
                stocks: 'getStocks',
                mapUserDiary: 'getMapUserDiary',
                navigationTabs: 'getNavigationTabs'
            })
        },
        watch: {

        },
        mounted() {

        },
        created: function() {
            
        },
        methods: {

        }
    }
</script>

<style scoped>

</style>