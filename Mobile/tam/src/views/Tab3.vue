<template lang="pug">
ion-page
    ion-content( :fullscreen="true")
        ion-header( collapse="condense")
            ion-toolbar
                ion-title( position="center") News

        table
            tbody(v-for="i in 5")
                tr
                    td 2021-11-01
                    td Norlands Guld
                    td FinWire
                tr
                    td(colspan="3") Tjänsten riktar sig till både den individuella användaren och större etablerade aktörer inom diverse branschsegment. E-handlare och Influencers kan använda Streamify för att genom Live Video Shopping exponera oc
                tr
                    td
                        Ticker(stockId="1111" ticker="VVV")


</template>

<script lang="ts">
    import {IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard} from '@ionic/vue';
    import ExploreContainer from '@/components/ExploreContainer.vue';
    import Ticker from "@/components/Ticker.vue";

export default  {
  name: 'Tab3',
  components: { ExploreContainer, IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonCard, Ticker }
}
</script>

<style scoped>
</style>
