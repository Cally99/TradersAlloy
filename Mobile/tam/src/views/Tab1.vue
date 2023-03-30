<template lang="pug">
ion-page
    ion-content( :fullscreen="true")
        ion-header( collapse="condense")
            ion-toolbar
                ion-title( size="small" ) Dashboard

        ion-card
            div(style="padding:4px;")
                span(style="float:left; ") Search:
                ion-input( style="border:1px solid #dddddd; " value="ERIC" placeholder="Enter Input" onIonChange="{e => setText(e.detail.value!)}")

        ion-card
            ion-title Recents
            Slider

        ion-card
            ion-title Alerts

            ion-list
                ion-item
                    ion-label
                        Ticker( ticker="AAA" :stockId="33223")
                        span Reports today
                        span
                            ion-icon( :icon="flag")
                ion-item
                    ion-label
                        Ticker( ticker="BBB" :stockId="33223")
                        span Reported
                        span
                            ion-icon( :icon="chatbubbleEllipses")
                ion-item
                    ion-label
                        Ticker( ticker="CCC" :stockId="33223")
                        span Trade Plan Alert
                        span
                            ion-icon( :icon="heart")
                ion-item
                    ion-label
                        span(class="ticker") EYOD
                        span
                            ion-icon( :icon="alertCircle")

        ion-card
            ion-title House Keeping

            ion-list
                ion-item
                    ion-label
                        span(class="ticker") TEL A
                        span Review research
                        span
                            ion-icon( :icon="documentText")
                ion-item
                    ion-label
                        span(class="ticker") TEL A
                        span Review research
                        span
                            ion-icon( :icon="documentText")
                ion-item
                    ion-label
                        span(class="ticker") TEL A
                        span Review research
                        span
                            ion-icon( :icon="documentText")
                ion-item
                    ion-label
                        span(class="ticker") TEL A
                        span Review research
                        span
                            ion-icon( :icon="documentText")


</template>

<script lang="ts">
    import {
        IonPage,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonCard,
        IonItem,
        IonLabel,
        IonIcon, IonList, IonInput
    } from '@ionic/vue';
    //import ExploreContainer from '@/components/ExploreContainer.vue';
    import { heart, documentText, homeOutline , notifications, chatbubbleEllipses, alertCircle, flag} from 'ionicons/icons';
    import Ticker from "@/components/Ticker.vue";
    import Slider from "@/components/Slider.vue";

export default  {
  name: 'Tab1',

  components: {Slider, IonInput, IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonCard, IonItem, IonLabel, IonIcon, IonList, Ticker },
  setup() {
    return {
      homeOutline, heart, notifications,documentText, chatbubbleEllipses, alertCircle, flag
    }
  }

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

</style>
