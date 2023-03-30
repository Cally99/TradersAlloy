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
                            v-layout( column )
                                v-btn-toggle(outline vertical)
                                    div
                                        v-btn( v-ripple="{ class: 'primary--text' }" value="list" @click="viewMode = 'mode-1'")
                                            v-icon( x-large) mdi-format-list-bulleted
                                            span( class="hidden-sm-and-down") 6 month Retrospective

                                    div
                                        v-btn( v-ripple="{ class: 'primary--text' }" value="list" @click="viewMode = 'mode-2'")
                                            v-icon( x-large ) mdi-view-grid
                                            span( class="hidden-sm-and-down") 12 month Retrospective

                                    div
                                        v-btn( v-ripple="{ class: 'primary--text' }" value="list" @click="viewMode = 'kelly2d'")
                                            v-icon( x-large) mdi-file-document
                                            span(class="mx-12")
                                                div Win : Ratios
                                                div  6 months


            span(style="" class="white--text px-3") Performance
            v-icon(style="float:right; cursor:pointer;" class="white--text" @click="closeWidget(1)") close

        ////// BODY
        //-span(class="title") {{properties.alternative}}
        template(v-if="viewMode==='mode-1'")
            div last 12 months
            div
                span(class="red--text title") -20%
        template(v-else-if="viewMode==='kelly2d'")
            v-img(src="/images/kelly2d.png")

        template(v-else)
            div last 12 months
            div top 3 draw downs
            div
                span(class="red--text") -20%
                span(class="red--text") -20%
                span(class="red--text") -20%
            div Primary winners
                span(class="green--text") 40%
                span(class="green--text") 30%
            div TTM performance

</template>

<script>
    export default {
        name: "WidgetPerformance",
        props: {properties: String},
        data () {return {
            viewMode: 'kelly2d',
            }
        }
        ,
        computed: {
            alternative: function () {
                return JSON.parse(this.properties.alternative)+"";
            }
        }

    }
</script>

<style scoped>
    .v-btn {
        margin: 18px 0;
    }
    .v-btn-toggle {
        flex-direction: column;
    }
    .v-btn::before {
        background-color: transparent;
    }

    .v-btn i:hover{
        transform: scale(1.15);
    }
</style>
