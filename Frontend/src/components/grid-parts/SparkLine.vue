<template>
    <span>
        <v-sparkline :value="values" color="#66BB6A" type="line" auto-line-width padding="3" />
    </span>
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
