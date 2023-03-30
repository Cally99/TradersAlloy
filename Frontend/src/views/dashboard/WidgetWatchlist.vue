<template lang="pug">
    div
        ////// HEADER
        div(class="card__title")
            v-dialog(v-model="dialog" width="500")
                template( v-slot:activator="{ on }")
                    v-icon(
                        v-on="on"
                        class="white--text"
                        style="float:left; cursor:pointer;") settings
                ////// CONFIGURE
                v-container
                    v-card
                        v-card-title(class="headline grey lighten-2" primary-title) Configure
                        v-card-text
                            ul
                                li Industrials
                                li Technology -
                                li Technology - Internet
                                li SAAS Theme

            span(style="" class="white--text px-3") Watchlist
            v-icon(style="float:right; cursor:pointer;" class="white--text" @click="closeWidget(1)") close

        ////// BODY
        //-span(class="title") {{properties.watchlistId}}
        table(style="width:100%;")
            tr
                td ERIC
                td 33
                td 2020-01-22
            tr
                td ERIC
                td 33
                td 2020-01-22
            tr
                td ERIC
                td 33
                td 2020-01-22
</template>

<script>
    export default {
        name: "WidgetChart",
        props: {properties: String},
        computed: {
            insref: function () {
                return JSON.parse(this.properties.watchlistId);
            }
        }

    }
</script>

<style scoped>

</style>
