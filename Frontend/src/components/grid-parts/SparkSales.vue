<template lang="pug">
    div
        v-sparkline( :value="values"
                 color="#4466bb"
                 type="trend" line-width="6" smooth="12" padding="3")


</template>

<script>

import Vue from 'vue';

export default Vue.extend({
  mounted() {
    this.values = this.valueSquared();
  },
  data: function() {
    return {
        // values: [10,20, 30,32,36, 40, 30, 25],
        values: []
    };
  },
  methods: {
    valueSquared() {
      return this.params.value;
    },
  },
});

</script>
