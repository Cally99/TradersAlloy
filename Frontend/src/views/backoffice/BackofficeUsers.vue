<template lang="pug">
    div(class="watchlist-section p-2")
        h1(class="subheading grey--text") Back office: Users


        v-row
            v-col
                v-card(class="mt-4 mx-auto" max-width="500")
                    v-card-text
                        div( class="display-1 font-weight-thin  grey--text") Users:
                            span( class="display-2 font-weight-light") {{this.data_dump.users.length}}
                        div( class="display-1 font-weight-thin  grey--text") Premium Users:
                            span( class="display-2 font-weight-light") {{this.data_dump.usersPremiumCount}}
                    v-icon(class="mr-2" small) mdi-clock
                    span(class="caption grey--text font-weight-light") note here...

            v-col
                v-card(class="mt-4 mx-auto" max-width="500")
                    v-sheet(class="v-sheet--offset" color="blue lighten-2"  elevation="12" max-width="calc(100% - 32px)")
                        v-sparkline(
                            :labels="labels"
                            :value="value"
                            color="white"
                            line-width="2"
                            padding="16"
                            stroke-linecap="round"
                            smooth)

        v-row
            v-col
                v-data-table(dense=true
                    disable-pagination=true
                    fixed-header=true
                    hide-default-footer=true
                    :headers="headers"
                    :items="this.data_dump.users"
                    :items-per-page="20"
                    class="elevation-1")





</template>

<script>
import ApiService from "@/Services/ApiService";

export default {
    components: {
    },
    mounted: async function() {
        this.$intercom.hide();
        let vm = this;
        setTimeout(function () {
            vm.$intercom.update({utm_content: 'aaa', utm_campaign: 'watchlist'})
        }, 2000);

        this.data_dump = (await ApiService.getBackofficeUserData()).data;
    },
    data() {
        return {
            headers: [
                {text: 'id', value: 'id'},
                {text: 'email', value: 'email'},
                {text: 'type', value: 'type'},
                {text: 'Date Created', value: 'created_date'},
                {text: 'Last Active', value: 'last_login_date'},
                {text: 'Watchlists', value: 'watchlists'},
                {text: 'Screeners', value: 'screeners'},
                {text: 'Watchlist Items', value: 'watchlist_items'},
                {text: 'Researches', value: 'researches'},
                {text: 'Trade Plans', value: 'trade_plans'},
            ],
            labels: [
                '-',
                '-',
                '-',
                '-',
                '-',
                '-',
                '-',
                '-',
            ],
            value: [
                30,
                35,
                40,
                50,
                58,
                67,
                72,
                87,
            ],
            data_dump: null
        }
    },
    watch: {
    },
    computed: {
    },
    methods: {
    }
}
</script>

<style scoped>
    .v-sheet--offset {
        top: 12px;
        left: 12px;
        position: relative;
    }
</style>
