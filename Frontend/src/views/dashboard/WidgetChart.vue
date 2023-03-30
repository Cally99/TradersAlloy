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
                            v-autocomplete(label="Search for a Stock"
                                :items="getAllStocks"
                                item-text="name"
                                item-value="ticker"
                                return-object
                                dense  solo
                                loader-height="12"
                                @input="onChange"
                                class="pa-8"
                                style="width:300px;")
                                template( v-slot:selection="data")
                                    span
                                template( v-slot:item="data")
                                    div(style="height:60px;")
                                        div(style="display:inline-block; width:60px; vertical-align:top;" class="ticker") {{data.item.ticker}}
                                        div(style="display:inline-block; width:200px; vertical-align:top; margin:0 0 0 40px; height:60px;") {{data.item.name}}
                                        div(style="display:inline-block; width:200px; margin:0px; vertical-align:top; height:60px;" class="ml-2") {{data.item.sector_name}}
                            div(style="height:200px;") ...

            span(style="" class="white--text px-3") Chart
            v-icon(style="float:right; cursor:pointer;" class="white--text" @click="closeWidget(1)") close

        ////// BODY
        //- ChartPrice(:isin="SE0000108656" :insref="772" :toolbar="false" single )
        ChartPrice( :stock_id="772" :company_id="32391" :toolbar="false" single page="dashboard")

        //- v-img(src="/images/chart.png" style="height:90%;" )
</template>

<script>
    import ChartPrice from "@/components/ChartPrice.vue";
    export default {
        name: "WidgetChart",
        components: {ChartPrice},
        props: {properties: String},
        computed: {
            /*
            insref: function () {
                return JSON.parse(this.properties.insref);
            }
            */
        },
        methods: {
            onchange() {
                this.insref = 42953; // change the chart to FNOX ( should come from the autoComplete )
            },
            closeWidget() {
                //emit( ??? )
            }
        },
        data() {
            return {
                insref: 772,
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

</style>
