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
                            span alerts !

            span(style="" class="white--text px-3") Chart
            v-icon(style="float:right; cursor:pointer;" class="white--text" @click="closeWidget(1)") close

        ////// BODY
        //-span(class="title") {{properties.insref}}
        span(class="title") "Stay alert"

</template>

<script>
    export default {
        name: "WidgetAlert",
        props: {properties: String},
        computed: {
        },
        methods: {
            closeWidget() {
                //emit( ??? )
            }
        },
        data() {
            return {
            }
        }

    }
</script>

<style scoped>

</style>
