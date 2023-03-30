<template lang="pug">
    <div>
        <button @click="setUserTradePlans" class="set-utp">Click Me</button>
        <button @click="addUserTradePlans" class="add-utp">Click Me</button>
        <button @click="removeUserTradePlans" class="rm-utp">Click Me</button>

        <button @click="setScreenerFilters" class="set-scf">Click Me</button>
        <button @click="addScreenerFilters" class="add-scf">Click Me</button>
        <button @click="updateScreenerFilters" class="udt-scf">Click Me</button>
        <button @click="renameScreenerFilters" class="rnm-scf">Click Me</button>
        <button @click="removeScreenerFilters" class="rm-scf">Click Me</button>

        <button @click="setCompareDatas" class="set-compd">Click Me</button>
        <button @click="addCompareDatas" class="add-compd">Click Me</button>
        <button @click="removeCompareDatas" class="rm-compd">Click Me</button>
        <button @click="clearCompareDatas" class="cls-compd">Click Me</button>

        <button @click="setTradeHistory" class="set-th">Click Me</button>
        <button @click="addTradeHistory" class="add-th">Click Me</button>
        <button @click="removeTradeHistory" class="rm-th">Click Me</button>

        <button @click="setUserSettings" class="set-us">Click Me</button>
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
            setUserTradePlans(){
               this.$store.commit('setUserTradePlans',[{trade_plan_id: 1},{trade_plan_id: 2},{trade_plan_id: 3}]);
            },
            addUserTradePlans(){
               this.$store.commit('addUserTradePlans',{trade_plan_id: 4});
            },
            removeUserTradePlans(){
                this.$store.commit('removeUserTradePlans',2);
            },
            setScreenerFilters(){
                this.$store.commit('setScreenerFilters',[{name: "john", screen_id: 12, filter: "flt1"}, {name: "bob", screen_id: 14, filter: "flt2"}]);
            },
            addScreenerFilters(){
                this.$store.commit('addScreenerFilters',{name: "Aley", screen_id: 16, filter: "flt3"});
            },
            updateScreenerFilters(){
                this.$store.commit('updateScreenerFilters',{screen_id: 16, filter: "flt4"});
            },
            removeScreenerFilters(){
                this.$store.commit('removeScreenerFilters',2);
            },
            renameScreenerFilters() {
                this.$store.commit('renameScreenerFilters', {index: 1, name: "max"});
            },
            setCompareDatas(){
                this.$store.commit('setCompareDatas',[{isin: 'number1'}, {isin: 'number2'}]);
            },
            addCompareDatas(){
                this.$store.commit('addCompareDatas',{isin: 'number3'});
            },
            removeCompareDatas(){
                this.$store.commit('removeCompareDatas', {isin: 'number2'});
            },
            clearCompareDatas(){
               this.$store.commit('clearCompareDatas');
            },
            setTradeHistory(){
                this.$store.commit('setTradeHistory',[{trade_id: 't1'}, {trade_id: 't2'}, {trade_id: 't3'}]);
            },
            addTradeHistory(){
                this.$store.commit('addTradeHistor',{trade_id: 't4'});
            },
            removeTradeHistory(){
                this.$store.commit('removeTradeHistory', 't2');
            },
            setUserSettings(){
                this.$store.commit('setUserSettings',[1,2,3])
            }
        }
    }
</script>

<style scoped>

</style>