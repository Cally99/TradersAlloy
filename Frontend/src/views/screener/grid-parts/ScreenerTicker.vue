<template lang='pug'>
    div(class="pt-2")
      span(class="ticker blue1" style="line-height:17px; padding-top:4.3px;" @click="clickTicker(ticker_name)") {{ticker_name}}
</template>

<script>

import Vue from 'vue';

export default Vue.extend({
  components: {
  },
  mounted() {
    this.ticker_name = this.getValue();
  },
  data: function() {
    return {
        ticker_name: ''
    };
  },
  methods: {
    getValue() {
      return this.params.value;
    },
    clickTicker(ticker) {
        this.params.action(ticker);
    },
  },
});

</script>
