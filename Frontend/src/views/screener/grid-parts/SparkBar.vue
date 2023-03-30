
<template lang="pug">
    div
        span(style="width:70%;display:inline-block;")
            v-sparkline( :value="values" color="#BB666A" type="bar" auto-line-width padding="3")
        //- span(style="display:inline-block;float:right;vertical-align:top; font-size:0.8rem;") {{last_value}}%

</template>

<script>

import Vue from 'vue';

export default Vue.extend({
  mounted() {
    this.values = this.getArray();
    this.last_value = this.getLastValue();
  },
  data: function() {
    return {
        // values: [10,20, 30,32,36, 40, 30, 25],
        values: [],
        last_value: 0
    };
  },
  methods: {
    getArray() {
      return this.params.value;
    },
    getLastValue() {
      if (this.params.value && this.params.value.length > 0) {
        return ~~this.params.value[this.params.value.length-1] ; // float to int using ~~
      } else
        return 0;
    }
  },
});

</script>
