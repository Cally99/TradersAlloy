<template lang="pug">
    span(style="background-color: #2196f3; padding: 5px 15px; border-radius: 5px; color: white;" @click="clickBtn") Add Columns
</template>

<script>
import Vue from 'vue';

export default Vue.extend({

    data: function() {
        return {
        };
    },
    beforeMount() {
    },
    mounted() {},
    methods: {
        clickBtn(evt) {
            this.params.api.showColumnMenuAfterButtonClick('addColumn', evt.target)
        } ,
    },
});
</script>
