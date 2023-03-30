<template lang="pug">
    div(style="overflow-y:scroll;" :style="`height:${windowHeight - 210}px;`")
        NewsInformation(:company_id="company_id" :stock_id="stock_id")
</template>

<script>
import NewsInformation from "./NewsInformation.vue";

export default {
    name: 'CompanyNews',
    components: {
        NewsInformation
    },
    props: {
        company_id: {
            type: Number
        },
        stock_id: {
            type: Number
        }
    },
    data() {
        return {
            windowHeight: 0,
        };
    },
    mounted() {
        this.setWindowHeight();
        window.addEventListener('resize', this.setWindowHeight);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.setWindowHeight);
    },
    computed: {
        windowHeight() {
            return window.innerHeight;
        },
    },
    methods: {
        setWindowHeight() {
            this.windowHeight = window.innerHeight;
        },
    }
}
</script>

<style scoped>

</style>
