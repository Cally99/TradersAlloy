<template lang="pug">
Swiper(:slides-per-view="4" :loop="true" )
    SwiperSlide(v-for="i in 8")
        span(class="slide") AAA
            br
            span 11.22

</template>

<script>
    import { defineComponent } from 'vue';
    import { Swiper, SwiperSlide } from 'swiper/vue';
    import { IonContent, IonPage } from '@ionic/vue';

    import 'swiper/swiper-bundle.min.css';
    import '@ionic/vue/css/ionic-swiper.css';

    export default defineComponent({
        name: "Slider",
        components: {
            Swiper,
            SwiperSlide,
            IonContent,
            IonPage,
        },
    });
</script>

<style scoped>
    .slide {
        display: inline-block;
        width:75px;
        height:70px;
        background:#32A7B6;
        color: white;
        border-radius: 8px;
        margin-bottom: 3px;
    }
    .slide span{
        background: #94b6b1;

    }


</style>
