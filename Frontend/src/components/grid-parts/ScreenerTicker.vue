
<template lang='pug'>
    span(class="ticker" style="line-height: 17px" @click="clickTicker(ticker_name)") {{ticker_name}}
</template>

<script>

import Vue from 'vue';

export default Vue.extend({
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
