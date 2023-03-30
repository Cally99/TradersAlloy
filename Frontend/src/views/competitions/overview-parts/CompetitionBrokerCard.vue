<template lang="pug">
    v-card(v-if="competition.status !== 'Live'" outlined rounded)
        v-row(noGutters)
            v-col(cols="12")
                v-card-title
                    h3 {{$t('competition_broker')}}
                v-card-text(class="d-flex justify-content-center")
                    p {{competition.status}}
    v-card(v-else outlined rounded)
        v-row(noGutters)
            v-col(cols="6")
                v-card-title
                    h3 {{$t('competition_broker')}}
            v-col(cols="6" class="d-flex justify-content-end")
                v-card-title
                    v-btn-toggle(mandatory=true v-model="action" color="blue3" small)
                        v-btn(value="BUY" width="100" small) {{$t('buy')}}
                        v-btn(value="SELL" width="100" small) {{$t('sell')}}
        v-row(noGutters)
            v-col(cols="6")
                v-card-text(v-if="action === 'BUY'" class="pt-0")
                    BrokerActionBox(:action="action" :user_account_id="competition.user_account_id" :user_id="competition.user_id")
            v-col(cols="6")
                v-card-text(v-if="action === 'SELL'" class="pt-0")
                    BrokerActionBox(:action="action" :user_account_id="competition.user_account_id" :user_id="competition.user_id")
</template>

<script>
    import BrokerActionBox from "./BrokerActionBox.vue";

    export default {
        name: "CompetitionBrokerCard",
        components: {
            BrokerActionBox,
        },
        props: ["competition"],
        data() {
            return {
                action: "BUY",
            };
        },
    };
</script>

<style scoped></style>
