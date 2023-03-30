<template lang="pug">
    div(class="warning-body p-2")
        <v-icon class="cursor-pointer close-warning-icon" @click="hideWarning()">mdi-close</v-icon>

        div(class="mt-3 text-center" style="font-size: 1.1rem;")
            div {{$t("FreePlanNotSaved")}}
            div(class="mb-5") {{$t("FreePlanLimit")}}
            div(class="mb-2") {{$t("SignupPremium")}}

            div(class="my-2 mb-5 position-relative")
                PremiumButton(:value="true")
                v-img(max-width="40" src="/images/warning-on.png" class="position-absolute warning-lamp" v-if="tradePlans.length === 10")
            div {{$t("And")}} 
                strong {{$t("SendUsMessage")}}
            div {{$t("TellUs")}}
                strong {{$t("BetterServeYou")}}

</template>

<script>
/* eslint-disable no-console */
    import PremiumButton from "@/components/PremiumButton.vue";
    export default {
        name: "TradePlanWarning",
        props: {
        },
        components: {
            PremiumButton,
        },
        computed: {
            tradePlans() {
                return this.$store.getters["userTradePlans"].filter((item) =>item.user_id === JSON.parse(localStorage.getItem('user')).user_id);
            },
        },
        created: function() {
            // console.log(this.tradePlans)
        },
        methods: {
            hideWarning() {
                this.$emit('close-warning')
            }
        },
    }
</script>

<style scoped>
    .red-warning-icon{
        position: absolute;
    }
    .warning-body {
        width: 500px;
        height: 300px;
        background-color: #FDF5CA;
        border: 1px solid black;
    }
    .close-warning-icon {
        position: absolute;
        right: 5px;
        top: 5px
    }
    .warning-lamp{
        top: -10px;
        right: 20px;
    }
</style>
