<template lang="pug">
v-container(style="background:white;")
    v-row
        v-col
            h2 Notifications
    v-row
        v-col
            h4 New
            v-row(v-for="n of notifications" dense class="mx-5")
                v-col(cols="2")
                    TickerComponent(:stockId="n.stock_id" :tickerLabel="n.ticker" :isClickable="true")
                v-col
                    div(v-html="renderNotification(n.type,n.json)")

            h4(class="mt-6") Recent
            v-row(v-for="m of recentNotifications" dense class="mx-5")
                v-col(cols="2")
                    TickerComponent(:stockId="m.stock_id" :tickerLabel="m.ticker" :isClickable="true")
                v-col
                    div(v-html="renderNotification(m.type, m.json)")

</template>

<script>
    import {mapGetters} from "vuex";
    import moment from 'moment';
    import TickerComponent from './TickerComponent';

    export default {
        name: "DialogNotifications",
        components: {TickerComponent},
        props: {
            value: Boolean
        },
        data () {
            return {
                // notifications: [],
                user_id: JSON.parse(localStorage.user).user_id,
            }
        },
        computed: {
            notifications() {
                return this.$store.getters.getNotifications;
            },
            recentNotifications() {
                return this.$store.getters.getRecentNotifications;
            },
        },
        methods: {
          renderNotification(type, json) {
              if (type==='NEWS') {
                  return `${json.title} `;
              } else if (type==='REPORT') {
                  return `Report, ${json.period} <span style="color:red">Today</span>`;
              } else if (type==='REPORTED') {
                  return `Report, ${json.period} <span style="color:#6677ff">Read report</span>`;
              } else if (type==='STOPLOSS') {
                  return `Stop loss, ${json.stoploss_price}`;
              } else if (type==='TARGET') {
                  return `Target Price, ${json.target_price} `;
              }
          }
        },
    }
</script>

<style scoped>

</style>
