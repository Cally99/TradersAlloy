<template lang="pug">
ion-page
    ion-tabs
      ion-router-outlet
      ion-tab-bar( slot="bottom")

        ion-tab-button( tab="tab1" href="/tabs/tab1")
          ion-icon( :icon="homeOutline")
          ion-label Home

        ion-tab-button( tab="tab2" href="/tabs/tab2")
          ion-icon( :icon="eyeOutline")
          ion-label Watched

        ion-tab-button( tab="tab3" href="/tabs/portfolio")
          ion-icon( :icon="analyticsOutline")
          ion-label Portfolio

        ion-tab-button( tab="tab4" href="/tabs/tab3")
          ion-icon( :icon="chatbubbleEllipsesOutline")
          ion-label News

</template>

<script lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { chatbubbleEllipsesOutline, eyeOutline, homeOutline,analyticsOutline } from 'ionicons/icons';

export default {
  name: 'Tabs',
  components: { IonLabel, IonTabs, IonTabBar, IonTabButton, IonIcon, IonPage, IonRouterOutlet },
  setup() {
    return {
        chatbubbleEllipsesOutline,analyticsOutline,
      eyeOutline,
      homeOutline,
    }
  }
}
</script>
