<template lang="pug">
    div
        v-dialog(v-model="dialog" max-width="1200px")
            template(v-slot:activator="{ on, attrs }")
                v-btn(depressed v-bind="attrs" v-on="on" class="rounded-lg" style="font-size:15px; width:240px; background:#FED43E; color:#7E3A3A; border:1px solid #AD3434;") Import Transactions
            
            v-card( class="pl-2 pr-2 pb-3" style="overflow-x:hidden;")
                v-card-title( class="headline-text") Import Transactions
                
                hr( class="p-0 m-0" style="background-color:black;")
                
                v-card-text
                    div( style="font-size:16px;") Export from Avanza
                
                ImportTransaction
</template>

<script>
import ImportTransaction from "./ImportTransaction";

export default {
    name: "ImportTransactionsBtn",
    components: {
        ImportTransaction
    },
    data() {
        return {
            dialog: false
        };
    },
    mounted() {
    }
}
</script>

<style scoped>
.v-btn {
    text-transform: none;
}

.headline-text {
    font-size: 36px !important;
    font-weight: 700 !important;
    color: #6A6969 !important;
}
</style>
