<template lang="pug">
    v-autocomplete(
        @change="onChange()"
        :label="$t('Search_by_company_name')"
        :placeholder="$t('Search_by_company_name')"
        data-v-step='0'
        :items="getAllStocks"
        item-text="name"
        item-value="ticker"
        v-model="selectedStock"
        return-object
        dense
        solo
    )
        template(v-slot:selection="data")
            TickerComponent(:tickerLabel="data.item.ticker" :clickable="false")
        template(v-slot:item="data")
            div(class="d-flex flex-column justify-content-center")
                TickerComponent(:tickerLabel="data.item.ticker" :clickable="false")
                p {{data.item.name}}

</template>

<script>
    import {mapActions, mapGetters} from "vuex";
    import TickerComponent from "../../../components/TickerComponent"

    export default {
        name: "stockSelector",
        props: ['parentStock'],
        components: {
            TickerComponent
        },
        data() {
            return {
                selectedStock: null,
            };
        },
        computed: {
            ...mapGetters(["getAllStocks", "getStock"]),
        },
        methods: {
            ...mapActions(["setPushToStocksAction"]),
            async onChange() {
                await this.setPushToStocksAction(this.selectedStock);
                const expandedStock = await this.getStock(this.selectedStock.company_id);
                this.$emit("setStock", expandedStock);
            },
        },
        watch: {
            parentStock(newStock) {
                if (!newStock) {
                    this.selectedStock = null
                }
            }
        }
    };
</script>

<style scoped>
    .selectOption {
        width: 100%;
        display: flex;
        justify-content: space-around;
    }
</style>
