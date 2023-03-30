<template lang="pug">
    div
        h3(style="margin-left: 10px") Delisted Companies

        //-v-text-field(
                v-model="search"
                append-icon="mdi-magnify"
                label="Search"
                single-line
                hide-details
                width="300px")
                //:search="search"


        v-data-table(
            dense
            fixed-header=true
            hide-default-footer=true
            items-per-page=-1
            style="width:1200px"
            :headers="headers"
            :items="companiesDelisted"
            )

</template>

<script>
    import ApiService from "@/Services/ApiService";

export default {
    name: 'TabCompanyDelisted',
    props: {
        companiesDelisted: Array,
    },

    data() {
        return {
            counter: 0,
            calendars: null,
            input: '',
            search: '',
            headers: [
                {text: "name", value:"name"},
                {text: "company_id", value:"company_id"},
                {text: "stock_id", value:"stock_id"},
                {text: "status_flag", value:"status_flag"},
            ]
        }
    },
    mounted() {


    },
    methods:{
    }
}
</script>
