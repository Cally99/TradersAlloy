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
                            v-checkbox( v-model="allowSpaces" label="Allow spaces")
                            v-checkbox( v-model="allowSpaces" label="Allow spaces")
                            v-checkbox( v-model="allowSpaces" label="Allow spaces")

            span(style="" class="white--text px-3") News
            v-icon(style="float:right; cursor:pointer;" class="white--text" @click="closeWidget(1)") close

        ////// BODY
        //-span(class="title") {{properties.insref}}
        table
            tr
                td(class="datum") 2021-04-29
                td(class="subject") FinWire
                td(class="newsbody") While Spotlight is not legally required to establish a disciplinary
            tr
                td(class="datum") 2021-04-29
                td(class="subject") FinWire
                td(class="newsbody") Spotlight and its listed companies. With a disciplinary committee, Spotlight’s companies and members will have their cases reviewed before any

</template>

<script>
    export default {
        name: "WidgetChart",
        props: {properties: String},
        computed: {
            insref: function () {
                return JSON.parse(this.properties.alt);
            }
        },
        data() {
            return {
                getAllStocks: [
                    {name: 'csdf', ticker: 'CSS', sector: 'Medical'},
                    {name: 'csdsfsdfsdf', ticker: 'ABB', sector: 'Industrials'},
                    {name: 'csdsfb sdfdf', ticker: 'SAAA', sector: 'Consumer discretionary'},
                    {name: 'csdf', ticker: 'CSS', sector: 'Medical'},
                    {name: 'csdsfsdfsdf', ticker: 'ABB', sector: 'Industrials'},
                    {name: 'csdsfb sdfdf', ticker: 'SAAA', sector: 'Consumer discretionary'},
                    {name: 'csdf', ticker: 'CSS', sector: 'Medical'},
                    {name: 'csdsfsdfsdf', ticker: 'ABB', sector: 'Industrials'},
                    {name: 'csdsfb sdfdf', ticker: 'SAAA', sector: 'Consumer discretionary'},
                ]
            }
        }

    }
</script>

<style scoped>
    table {
        table-layout:fixed;
        width:100%;
    }
    .datum {
        width: 13%;
        vertical-align: top;
    }
    .subject {
        width: 13%;
        vertical-align: top;
    }
    .newsbody {
        overflow:hidden;
        font-weight:800;

    }

</style>
