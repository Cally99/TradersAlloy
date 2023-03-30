<template lang="pug">

v-dialog( v-model="dialog"  width="52%" overflow-y="initial" overflow-x="initial")
    v-overlay(:value="overlay")
        v-progress-circular(indeterminate size="64")

    template( v-if="showPremiumButton" v-slot:activator="{ on}")
        v-btn(color="amber" v-on="on") Premium Plans

    template()
        PaymentView(:value="dialog")

</template>


<script>

import PaymentView from "./PaymentView.vue"


export default {
    name: "UserPricePlans",
    components: {
        PaymentView
    },
    props: {
        value: Boolean,
        from: String,
    },
    data () {
        return {
            showPremiumButton: true,
            dialog: false,
            overlay: false,
        }
    },
    methods: {
    }

}
</script>


<style scoped>


</style>
