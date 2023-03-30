<template lang="pug">
    v-chip(
      @click="onClick()"
       small
       color="blue1"
       textColor="white"
       label class="ticker" 
       :class="calculateFontSize(tickerLabel) ? 'small-font' : ''"
       ) {{tickerLabel}}
</template>

<script>
import router from "../router"
export default {
  name: "TickerComponent",
  props: ["stockId", "tickerLabel","isClickable"],
  methods: {
    onClick() {
      if(this.isClickable) {
        router.push("/rapportkollen/stock/" + this.stockId)
      }
    },
    calculateFontSize(tickerLabel){
      if(tickerLabel.length > 8) {
        return true
      } else {
        return false
      }
    }
  }

}
</script>

<style scoped>
.ticker {
  width: 75px;
  justify-content: center;
  padding: 0;
  font-weight: 500 !important;
}
.small-font {
  font-size: 10px !important;
}
</style>