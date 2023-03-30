<template lang="pug">
    div( style="overflow-y:scroll; position:absolute; top:180px; bottom:0; right:10px; left:280px;")
        div( class="chart-container")
            div( v-for="(item,index) in watchlists" :key="index" class="chart-item blue9 pb-4")
                div( class="d-flex justify-content-start" )
                    Ticker( :stock="item" class="d-flex justify-content-center ml-4 mt-4 pl-2 pr-2" style="padding-top:3px;")
                    div( class="format-name ml-4 mt-4") {{ item.Name }}

                div( class="ml-4 mr-4" style="overflow:hidden;")
                    ChartPrice(:stock_id="item.stock_id" :company_id="item.company_id" :toolbar="false" single page="none")
</template>

<script>
import ChartPrice from "../../components/ChartPrice";
import Ticker from "../../components/Ticker";
import moment from 'moment';

export default {
    name: "ViewModeGrid",
    props: {
        watchlists: Array
    },
    components: {
        ChartPrice,
        Ticker
    },
    data() {
        return {
            user: JSON.parse(localStorage.getItem('user')),
            windowHeight: window.innerHeight
        };
    },
    mounted() {
        this.windowHeight = window.innerHeight;

        window.addEventListener('resize', this.setWindowHeight);
    },
    destroyed() {
        window.removeEventListener('resize', this.setWindowHeight);
    },
    computed: {
        chartWidth() {
            if(this.$refs.mainSection) {
                return Math.round((this.$refs.mainSection.clientWidth-100)/3);
            }

            return 490;
        }
    },
    methods: {
        setWindowHeight() {
            this.windowHeight = window.innerHeight;
        }
    }
}
</script>

<style scoped>
.chart-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 40px;
}

.chart-item {
    display: block;
    box-shadow: 1px 1px 6px 1px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    border: 1px #dddddd solid;
    overflow-x: hidden;
}

.format-name {
    font-size: 20px;
    font-weight: 600;
    opacity: 0.8;
}
</style>
