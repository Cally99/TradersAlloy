<template lang="pug">
    div(class="pt-2" v-if = "!dense")
        // render blacks and reds, inline
        span
            v-icon(v-for="i in 5-this.blacks" @event="" @click="setValue_black(6 - i)" class="off_black" small) mdi-heart
            v-icon(v-for="i in this.blacks" @click="setValue_black(blacks - i + 1)" class="black--text text--lighten-1" small) mdi-heart

            v-icon(v-if="this.neutral" class="black--text") mdi-help-circle-outline
            v-icon(v-if="!this.neutral" class="grey--text text--lighten-1" ) mdi-help-circle-outline

            v-icon(v-for="j in reds" @click="setValue_red(j)" class="red1--text text--lighten-1" small) mdi-heart
            v-icon(v-for="k in 5-this.reds" @click="setValue_red(k + reds)" class="off_red" small) mdi-heart
    div(class="pt-2" v-else @mouseenter="showDropDown = true" @mouseleave="showDropDown = false" class="width-container")
        // render only the blacks
        span(v-if="valueCopy < 0")
            v-icon(v-for="i in 5-this.blacks" @click="setValue_black(6 - i)" class="off_black" small) mdi-heart
            v-icon(v-for="i in this.blacks" @click="setValue_black(blacks - i + 1)" class="black--text text--lighten-1" small) mdi-heart

        // render only the reds
        span(v-if="valueCopy >= 0")
            v-icon(v-for="j in reds" @click="setValue_red(j)" class="red1--text text--lighten-1" small) mdi-heart
            v-icon(v-for="k in 5-this.reds" @click="setValue_red(k + reds)" class="off_red" small) mdi-heart

        // render blacks and reds, in a dropdown
        div(v-show="showDropDown" class="dropDown")
            v-icon(v-for="i in 5-this.blacks" @click="setValue_black(6 - i)" class="off_black" small) mdi-heart
            v-icon(v-for="i in this.blacks" @click="setValue_black(blacks - i + 1)" class="black--text text--lighten-1" small) mdi-heart

            v-icon(v-if="this.neutral" class="black--text") mdi-help-circle-outline
            v-icon(v-if="!this.neutral" class="grey--text text--lighten-1" ) mdi-help-circle-outline

            v-icon(v-for="j in reds" @click="setValue_red(j)" class="red1--text text--lighten-1" small) mdi-heart
            v-icon(v-for="k in 5-this.reds" @click="setValue_red(k + reds)" class="off_red" small) mdi-heart



</template>

<script>
import ApiService from '@/Services/ApiService.js';
import Vue from 'vue';


export default Vue.extend({
    name: "WatchlistConviction",
    props: {
        // value: Number,
        // stock: Object,
        // dense: Boolean
    },
    data() {
        return {
            stock_id: null,
            dense: true,
            showDropDown: false,
            valueCopy: 0,
            value: 0
        }
    },
    computed: {
        reds: function() {
            return (this.valueCopy > 0 ? parseInt(this.valueCopy) : 0 )
        },
        blacks: function() {
            return  (this.valueCopy < 0 ? Math.abs(this.valueCopy) : 0 )
        },
        neutral: function() {
            return (this.valueCopy==0 ? true : false)
        }
    },
    created: function() {
    },
    mounted() {
        if (this.params) {
            this.valueCopy = this.params.value;
            this.stock_id = this.params.data.stock_id;
        }
    },
    methods: {
        async setValue_black (v) {
            this.valueCopy = 0 - v;

            try {
                const response = await ApiService.updateConviction({
                    user_id: JSON.parse(localStorage.user).user_id,
                    stock_id: this.stock_id,
                    conviction: -v
                });

                console.log('updated conviction', response);
                let item = response.data;
                item.conviction = this.valueCopy;
                this.$store.commit("updateWatchlistItemConviction", item);

            } catch(error) {
                console.log(error);
            }
        },
        async setValue_red (v) {
            this.valueCopy = v;

            try {

                const response = await ApiService.updateConviction({
                    user_id: JSON.parse(localStorage.user).user_id,
                    stock_id: this.stock_id,
                    conviction: v
                });

                console.log('updated conviction', response);
                let item = response.data;
                item.conviction = this.valueCopy;
                this.$store.commit("updateWatchlistItemConviction", item);

            } catch(error) {
                console.log(error);
            }
        }
    },
})
</script>

<style scoped>
    .off_black {
        color: silver;
    }
    .off_black:hover {
        color: black;
        cursor: pointer;
    }
    .off_red {
        color: silver;
    }
    .off_red:hover {
        color: indianred;
        cursor: pointer;
    }

    .dropDown {
        z-index: 10;
        position: fixed;
        background: white;
        border: 1px solid rgba(0, 0, 0, 0.1);
        padding: 20px 20px ;
        margin: -8px 0 0 0 ;

        box-shadow: 10px 13px 48px -4px rgba(0,0,0,0.49);
        overflow-y: visible;
        -webkit-overflow-scrolling: touch;  /* what is this ? */
    }

    .width-container {
        width: 90px;
    }

</style>
