<template lang="pug">
  div(class="pt-2" style="position: relative;height: 35px;width: 100px;")
    v-tooltip(bottom)
      template(v-slot:activator="{ on, attrs }")
        div(v-bind="attrs" v-on="on" style="padding-bottom: 12px;")
          span(style="position: absolute;left: 0px;border: 0px solid;")
            v-icon(@click="reset" class="set-reset-design") mdi-refresh

      span reset

    div(class="pt-2" @click="showDropDown = true" style="position: absolute;width: 75px;top: 0;left: 35px;border: 0px solid;")
      span(class="font-italic font-sm") {{ this.value }}
</template>

<script>
import ApiService from "@/Services/ApiService.js";
import Vue from 'vue';

export default Vue.extend({
  name: "WatchedSinceDropDown",
  props: {
    // value: String,
    // wli_id: Number
  },
  mounted() {
    if (this.params) {
      this.value = this.params.value;
      this.wli_id = this.params.data.wli_id;
    }
  },
  data: function () {
    return {
      showDropDown: false,
      value : '',
      wli_id : 0,
    };
  },
  methods: {
    close(e) {
      if (!this.$el.contains(e.target)) {
        this.showDropDown = false;
      }
    },
    reset() {
        // this.showDropDown = false;
        let wlis = this.$store.getters.getWatchlistItems;
        let stocks = this.$store.getters.getAllStocks;
        let self = wlis.find(item => item.watchlist_item_id == this.wli_id);
        let stock = stocks.find(item => item.stock_id == self.stock_id);
        self.watched_since = new Date().toISOString().substring(0, 10);
        self.watched_since_price = stock.price_today;
        ApiService.WLIUpdate(self)
            .then(response => {
                this.$store.commit("updateWatchlistItem", self);
            })
            .catch(error => console.log(error))
    }
  },
  computed: {},

  created() {
    window.addEventListener("click", this.close);
  },

  beforeDestroy() {
    window.removeEventListener("click", this.close);
  },
});
</script>
<style >
</style>
<style scoped>
* {
  margin: 0;
  box-sizing: border-box;
}

body {
  font-family: "Helvetica Neue";
  background: #fafafa;
  padding: 10rem;
}

@media (max-width: 480px) {
  body {
    padding: 0;
  }
}

.dropDown {
  z-index: 10;
  position: absolute;
  background: #c4c4c4;
  color: #747474;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 5px 15px;
  margin: -5px 0 0 100px;
  border-radius: 10px;
  box-shadow: 10px 13px 48px -4px rgba(0, 0, 0, 0.49);
  overflow-y: visible;
  cursor: default;
  -webkit-overflow-scrolling: touch; /* what is this ? */
}
.emptyNote {
  opacity: 0;
}
.emptyNote:hover {
  color: #117a8;
  opacity: 1;
}
.set-reset-design {
  font-size: 25px;
  color: black;
  opacity: 0.35;
}
.set-reset-design:hover {
  color: green;
}
</style>
