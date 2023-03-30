<template lang="pug">
  ion-page
    ion-header
      ion-toolbar
        ion-title Tab 1

    ion-content( :fullscreen="true")
      ion-header( collapse="condense")
        ion-toolbar
          ion-title( size="large") Tab 1

</template>

<script lang="ts">

    import {IonButton, IonIcon} from "@ionic/vue";

    export default {
        name: 'ExploreContainer',
        components: {IonButton, IonIcon},
        props: {
            name: String
        }
    }
</script>

<style scoped>
    ion-icon {
        color: blue;
        font-size: 64px;
    }

    #container {
        text-align: center;
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
    }

    #container strong {
        font-size: 20px;
        line-height: 26px;
    }

    #container p {
        font-size: 16px;
        line-height: 22px;
        color: #8c8c8c;
        margin: 0;
    }

    #container a {
        text-decoration: none;
    }
</style>
