<template lang="pug">
ion-page
        ion-content( :fullscreen="true")
            ion-header( collapse="condense")
                ion-toolbar
                    ion-title( size="large" position="center") Portfolio

            div( class="title") Accounts
            div( class="title") Transactions
            div( class="title") Positions
            div( class="title") Performance


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
