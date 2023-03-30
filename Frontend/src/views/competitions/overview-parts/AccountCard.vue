<template lang="pug">
    v-card(outlined rounded)
        v-row(noGutters)
            v-col
                v-card-title
                    h3 {{$t('account')}}
                v-card-text(class="text")
                    v-row(noGutters)
                        v-col(cols="4")
                            p {{$t('user')}} :
                        v-col(cols="4" class="d-flex justify-content-end")
                            p {{userCompetitionAccount.account_name}}
                    v-row(noGutters)
                        v-col(cols="4")
                            p {{$t('cash')}} :
                        v-col(cols="4" class="d-flex justify-content-end")
                            p {{(userCompetitionAccount.cash).toFixed(2)}} {{unit}}
                    v-row(noGutters)
                        v-col(cols="4")
                            p {{$t('balance')}} :
                        v-col(cols="4" class="d-flex justify-content-end")
                            p {{(userCompetitionAccount.cash + exposure).toFixed(2)}} {{unit}}
                    v-row(noGutters)
                        v-col(cols="4")
                            p {{$t('exposure')}} :
                        v-col(cols="4" class="d-flex justify-content-end")
                            p {{exposure.toFixed(2)}} {{unit}}

                v-card-actions
                    v-btn(small class="blue3 white--text" @click="toTransactions()") {{$t('my_transactions')}}
                    v-btn(small class="blue3 white--text" @click="toPositions()") {{$t('my_positions')}}
            v-col
                // - PortfolioTable Here
</template>

<script>
import CompetitionTable from "./CompetitionTable";
import router from "../../../router";
import { mapGetters } from "vuex";

export default {
    name: "AccountCard",
    props: ["competitionId"],
    components: {
        CompetitionTable,
    },
    data() {
        return {
            unit: "SEK",
        };
    },
    computed: {
        ...mapGetters(['getUserTrades', 'getAllStocks', 'getExchangeRates']),
        userCompetitionAccount() {
            const uca = this.$store.getters.getUserAccounts.find(
                (a) => a.competition_id === this.competitionId
            );
            if (uca === undefined) {
                this.$store.commit("setMessage", {
                    text: "Error: User Competition Account not Found",
                    type: "error",
                });
                return null;
            }
            return uca;
        },
        userCompetitionTrades() {
            const accounts = [this.userCompetitionAccount];

            const trades = this.getUserTrades.filter( t => {
                return accounts.find((a) => {
                    if(t.user_account_id === a.user_account_id && t.exit_date === null) {
                        return a;
                    }
                });
            });

            return trades;
        },
        exposure() {
            let summary = 0;

            for(const trade of this.userCompetitionTrades) {
                const currency = this.getAllStocks.find((s) => s.stock_id === trade.stock_id).currency_trade;

                 if(currency !== 'SEK') {
                    const exchange = this.getExchangeRates.find((e) => e.symbol === currency);
                    const rate = exchange.rate;
                    const convertedPrice = trade.exit_price / rate;

                    summary += (trade.entry_qty * convertedPrice);
                } else {
                    summary += (trade.entry_qty * trade.exit_price);
                }
            }

            return summary;
        }
    },
    methods: {
        toTransactions() {
            const transactionElement = document.getElementById(`competitionTransactions${this.competitionId}`);

            transactionElement.click();

            router.push("/rapportkollen/competition/transactions/" + this.competitionId);
        },
        toPositions() {
            const positionsElement = document.getElementById(`competitionPositions${this.competitionId}`);

            positionsElement.click();

            router.push("/rapportkollen/competition/positions/" + this.competitionId);
        },
    },
};
</script>

<style scoped>
.text p {
    margin: 0
}
</style>
