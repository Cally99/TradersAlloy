<template lang="pug">

    v-container(fluid class="pl-12 grey darken-3 green--text" style="font-family:courier; width:100%; overflow:scroll; position:absolute; bottom:0; top:80px;" )
        h1 Today's Status
        div read from /Backend/healthcheck.log
        table(class="simpleTable")
            tr(v-for="log in logs")
                td {{log}}

</template>

<script>
    import ApiService from "@/Services/ApiService";

    export default {
        name: "LogViewer",

        data() {
            return {
                logs: [],

            }
        },

        computed: {
        },

        methods: {

        },

        mounted: async function () {
            const user_id = JSON.parse(localStorage.getItem('user')).user_id;
            this.logs = await ApiService.getHealthCheck();
        }
    }
</script>

<style scoped>
    h1 {
        font-family:courier;
        color: yellow;
    }

    .simpleTable tr td {
        font-size: 0.7em;
        border: 1px solid #1a6774;
        text-align: left;
        padding:2px 12px;
    }

</style>
