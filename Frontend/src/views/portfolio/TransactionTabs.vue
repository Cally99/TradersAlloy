<template lang="pug">
    div(class="px-0")
        PortfolioHeader(:competition="competition" :title="$t('transactions')" )

        v-container(fluid)
            div(class="d-flex justify-space-between pt-4")
                v-tabs( v-model="active_tab" background-color="#ffffff" align-with-title hide-slider)
                    v-tab( v-for="tab in tabs"
                        class="menu-section m-0"
                        style="margin:5px;"
                        :key="tab.id") {{tab.name}}

            v-tabs-items( v-model="active_tab")
                v-tab-item( v-for="tab in tabs" :key="tab.id" transition="none" class="pt-8")


                    TransactionBuySell( v-show="active_tab === 0 && $route.params.competition_id === undefined || firstTimeCheck" ref="transactionBuySell")
                    TransactionCompetitionBuySell( v-if="active_tab === 0 && $route.params.competition_id !== undefined")

                    TransactionHistory( v-if="active_tab === 1" ref="transactionHistory")
</template>

<script>
    import PortfolioHeader from "./PortfolioHeader";
    import TransactionBuySell from "./TransactionBuySell";
    import TransactionCompetitionBuySell from "./TransactionCompetitionBuySell.vue";
    import TransactionHistory from "./TransactionHistory";
    import TransactionsImportButton from "./TransactionsImportButton";
    import UserAccountDropdownMenu from "../../components/UserAccountDropdownMenu";
    import {mapGetters} from "vuex";

    export default {
        name: "TransactionTabs",
        components: {
            PortfolioHeader,
            UserAccountDropdownMenu,
            TransactionBuySell,
            TransactionCompetitionBuySell,
            TransactionHistory,
            TransactionsImportButton
        },
        data() {
            return {
                firstTimeCheck: true,
                height: 0,
                scrollAmount: 0,
                active_tab: 0,
                tabs: [
                    {
                        id: 0,
                        name: this.$t('buy_sell_transactions')
                    },
                    {
                        id: 1,
                        name: this.$t('paired_transactions')
                    }
                ]
            };
        },
        computed: {
            ...mapGetters(['getAllUserAccounts', 'getCompetitions']),

            competition() {
                this.competition_id = Number(this.$route.params.competition_id);
                if (this.competition_id) {
                    return this.$store.getters.getCompetitions.find( x => x.competition_id === this.competition_id);
                } else {
                    return null;
                }
            },
        },
        mounted() {
            this.firstTimeCheck = false;

            this.$store.commit('setShowUserAccountMenu', true);

            this.setWindowHeight();
            this.setScrollAmount();

            window.addEventListener('resize', this.setWindowHeight);
            window.addEventListener('scroll', this.setScrollAmount);
        },
        beforeDestroy() {
            window.removeEventListener("resize", this.setWindowHeight);
            window.removeEventListener("resize", this.setScrollAmount);
        },
        methods: {
            setWindowHeight() {
                this.height = window.innerHeight - 115;
            },
            setScrollAmount() {
                this.scrollAmount = window.scrollY;
            }
        }
    }
</script>

<style scoped>
    .menu-section.v-tab {
        background: #ffffff;
        color: #668099 !important;
        border-bottom: 1px solid #94A6B8;
    }

    .menu-section.v-tab.v-tab--active {
        font-size: 1em;
        color: #244360 !important;
        background-color: #DEE6ED;
        border-bottom: 3px solid #244360;
    }

    .headline-text {
        font-size: 36px;
        font-weight: bold;
    }
</style>
