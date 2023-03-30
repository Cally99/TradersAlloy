<template lang="pug">
    v-container(class="ma-6 pa-0" style="width:290px;")
        v-radio-group(value="Y" class="mt-0 pt-0")
            v-radio(label="Show only zero debt companies" value="N" v-on:change="toggleFilter(true)")
            v-radio(label="Exclude indebted companies" value="Y" v-on:change="toggleFilter(false)")

</template>

<script>
import Vue from 'vue';


export default Vue.extend({
    name: "FilterDebt",
    methods: {
        toggleFilter(isFilterActive) {
            this.isActive = isFilterActive;
            this.params.filterChangedCallback();
        },
        doesFilterPass(params) {
            if (params.data.netDebt_array) {
                return params.data.netDebt_array[params.data.netDebt_array.length-1] == 0
            }
        },
        getModel() {
            return this.isFilterActive() || null;
        },
        setModel(value) {
            this.toggleFilter(value);
        },
        onFloatingFilterChanged(value) {
            this.setModel(value);
        },
    },

    data: function() {
        return {
        };
    },
    beforeMount() {
    },
    mounted() {
    },
});
</script>






















