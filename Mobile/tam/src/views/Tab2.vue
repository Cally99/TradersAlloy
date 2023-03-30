<template lang="pug">
ion-page
    ion-content( :fullscreen="true")
        ion-header( collapse="condense")
            ion-toolbar
                ion-title( size="small" ) Watchlist
        div( class="title") Example List
        table
            tr
                td
                    span(class="ticker") TEL A
                td *****
                td
                    span "Bullish"
                td 999
                td 999
                td 999
            tr
                td
                    span(class="ticker") TEL A
                td *****
                td
                    span "Bullish"
                td 999
                td 999
                td 999


</template>

<script lang="ts">
    import {IonCard, IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/vue';
    import ExploreContainer from '@/components/ExploreContainer.vue';

    export default {
        name: 'Tab3',
        components: {ExploreContainer, IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonCard}
    }
</script>

<style scoped>
    .ticker {
        min-width: 90px;
        background: #1A4D5E;
        color: white;
        border-radius: 3px;
        padding: 3px;
        margin: 2px;
    }

    .title {
        border-radius: 3px;
        background: #4a78cc;
        color: white;
        padding: 2px;
        margin-top: 5px;
    }
</style>
