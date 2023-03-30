<template lang="pug">
    div
        PortfolioHeader(:competition="competition" :title="$t('competition_portfolio')" )

        v-container
            v-row
                v-col(cols="12")
                    AccountCard(:competitionId="competition_id")

            v-row
                v-col(cols="6")
                    CompetitionBrokerCard( class="minHeight" :competition="competition")

                v-col(cols="6")
                    StandingsCard(class="minHeight" :competition="competition")

</template>

<script>
import {mapActions, mapGetters} from "vuex";
import AccountCard from "./overview-parts/AccountCard";
import CompetitionBrokerCard from "./overview-parts/CompetitionBrokerCard";
import StandingsCard from "./overview-parts/StandingsCard";
import PortfolioHeader from "./../portfolio/PortfolioHeader";

export default {
    name: "OverviewView",
    components: {
        PortfolioHeader,
        AccountCard,
        CompetitionBrokerCard,
        StandingsCard,
    },
    data() {
        return {
            competitionId: Number(this.$route.params.competition_id),
        };
    },
    computed: {
        ...mapGetters(["getUserCompetitions", "getUserTrades"]),
        competition() {
            const competition = this.getUserCompetitions.find((c) => c.competition_id === this.competition_id);

            return competition;
        },
        competition_id() {
            return (this.$route.params.competition_id !== undefined) ? Number(this.$route.params.competition_id) : -1;
        }
    },
    methods: {
        ...mapActions(["loadTrades"]),
    },
    async created() {
        await this.loadTrades(this.competition.user_id);
    },
};
</script>

<style>
.minHeight {
    min-height: 440px;
}
</style>
