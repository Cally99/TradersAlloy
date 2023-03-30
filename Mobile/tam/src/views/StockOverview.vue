<template lang="pug">
ion-page
        ion-content( :fullscreen="true")
            ion-header( collapse="condense")
                ion-toolbar
                    span(class="ticker" style="float:right") ZZ B
                    ion-title( size="large" position="center") Zinzino

            div [ chart ]
            div( class="title") Company Information
            table
                tr
                    td Market Cap
                    td 999
                tr
                    td P/E
                    td 384
                tr
                    td last_earnings
                    td 2021-09-01
                tr
                    td next_earnings
                    td 2021-12-12
                tr
                    td EPS
                    td 2.22
                tr
                    td profit
                    td 761 811
                tr
                    td Price EoD
                    td 291 SEK
                tr
                    td Exchange
                    td Nasdaq SE
                tr
                    td Sector
                    td Oil & Gas Exploration
            div(style="margin-top: 5px; ") Zinzino is a global D2C company from Scandinavia specializing in biomarker-based, personalized nutrition and health tech. Founded in 2005, it is a public limited company with its shares listed on Nasdaq First North Premier Growth Market. Their test-based, scientifically proven nutritional supplements are currently available on 97 markets across the world.
            div( class="title") Peers in {company_sector}
            table(style="margin-top:5px;")
                tr
                    td
                        span(class="ticker") TEL A
                    td € 221 M
                    td 2021-10-01 (-0.11   +22%)
                tr
                    td
                        span(class="ticker") PYP
                    td € 21 M
                    td 2021-12-01
                tr
                    td
                        span(class="ticker") RR
                    td € 41 M
                    td 2021-10-01 (1.11   +5%)
                tr
                    td
                        span(class="ticker") OLE
                    td € 221 M
                    td 2021-12-01 (-0.11   +22%)

            div( class="title") Quarterly Reports
            div( class="title") My Research
            div( class="title") Trade Journal


</template>

<script lang="ts">
    import {IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard} from '@ionic/vue';
    import ExploreContainer from '@/components/ExploreContainer.vue';

    export default  {
        name: 'Tab3',
        components: { ExploreContainer, IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonCard }
    }
</script>

<style scoped>
    .ticker {
        min-width: 90px;
        background:#1A4D5E;
        color:white;
        border-radius: 3px;
        padding: 3px;
        margin: 2px;
    }

    .title {
        border-radius:3px;
        background: #4a78cc;
        color: white;
        padding:2px;
        margin-top:5px;
    }
</style>
