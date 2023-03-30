<template lang="pug">

div(v-if="this.value")
    template()
        
        div(v-if="view==='introduction' && this.value" )
            div(class="popup")
                div(style="margin:0 300px;")
                    span(style="font-size:1.1em;") {{$t('pay_annually')}}
                    v-switch(v-model="bill_per_year" large
                        color="#325D85"
                        value="#325D85"
                        style="display:inline-block; margin:0 20px;")
                div( class="container" )
                    div(class="contained")
                        div(class="header")
                            div {{$t('freemium')}}
                            div {{$t('per_year_0') }}
                            div {{ ( bill_per_year ? this.$t('annual') : this.$t('monthly' ))  }}
                        div(class="body")
                            div(style="font-weight:bold;") {{$t('motivation_freemium_sub')}}
                            ul
                                li {{$t('motivation_1')}}
                                li {{$t('motivation_2')}}
                                li {{$t('motivation_3')}}
                                li {{$t('motivation_4')}}
                                li {{$t('motivation_5')}}

                            v-btn(disabled ) {{$t('current')}}
                    div(class="contained2")
                        div(class="header")
                            div {{$t('premium')}}
                            div {{ ( bill_per_year ? this.$t('per_year') : this.$t('per_month' )) }}
                            div {{ ( bill_per_year ? this.$t('annual') : this.$t('monthly' ))  }}
                        div(class="body")
                            div(style="font-weight:bold;") {{$t('motivation_premium_sub')}}
                            ul
                                li {{$t('motivation_p1')}}
                                li {{$t('motivation_p2')}}
                                li {{$t('motivation_p3')}}
                                li {{$t('motivation_p4')}}
                                li {{$t('motivation_p5')}}

                            v-btn(@click="purchase") {{$t('buy_now')}}

        div(v-if="view==='stripe' && this.dialog" style="background:white;height:700px;")
            div(class="blue3" style="font:Helvetica;font-size:3rem;color: white; padding: 1% 3%;") {{$t('payment_details')}}
            div(style="padding:50px;")
                div(style="font-size:18px;") Pay TradersAlloy
                div(style="font-size:18px;") Recurring on the {{today_date}}
                div(style="width:500px;")
                    span(style="font-size:18px;") Premium Monthly
                    span(style="float: right; font-size:18px;") {{amount}} SEK
                div(v-if="is_valid_promo" style="width:500px;")
                    span(class="col-sm-4" style="padding-left:0px; font-size:18px;" ) Discount Code
                    span(class="col-sm-4" style="font-size:18px;") {{this.promo}}
                    span(style="float: right; font-size:18px;") -{{this.percentOff}}%
                div(v-if="is_valid_promo" style="width:500px;") 
                    span(style="float:right; font-size:18px; font-weight: bold;") Total To Pay: {{amount*(100-this.percentOff)/100}} SEK
            form(class="ma-10")
                div( style="border-radius: 5px;")
                    div()
                        label( class="col-md-2"  style="color: black; margin-bottom: 0.5rem; font-size:18px;" for="example1-name" data-tid="elements_examples.form.name_label") {{$t('name')}}
                        
                        input( class="col-md-6"  v-model='name' type="text" placeholder="" required="" autocomplete="name" style="border: 1px solid #aaa; width:500px; outline:none !important; padding: 5px")
                    div()
                        label( class="col-md-2" style="color: black; font-size:18px; " for="example1-email" data-tid="elements_examples.form.email_label") {{$t('Email')}}
                        
                        input( class="col-md-6"  style='border: 1px solid #aaa; padding: 5px' disabled v-model='email' type="email" placeholder="janedoe@gmail.com" required="" autocomplete="email")

                    div()
                        label( class="col-md-2"  style="color: black; margin-bottom: 0.5rem; font-size:18px; " for="example1-name" data-tid="elements_examples.form.name_label") Discount Code
                        
                        input( class="col-md-2"  v-model='promo' type="text" placeholder="" required="" autocomplete="promo" style="border: 1px solid #aaa; width:500px; outline:none !important; padding: 5px" @focusout="checkValidpromo" @keyup.enter="checkValidpromo" @keyup="checkValidpromo" )
                        span(v-if="promo != '' && !is_checked" style="margin-left:15px; color:red") checking... wait a moment.
                        span(v-else :style="[is_valid_promo? {'color':'blue' }: {'color':'red'}]" style="margin-left:15px;") {{errMsg}}
                    
                    div(style="display: flex")
                        label( class="col-md-2" style="color: black; margin-bottom: 0px; font-size:18px;") {{$t('Card_Number')}}
                        div( class="col-md-6" style="border: 1px solid #aaa; height:37px; background:white;" )
                            div(id="card-number")
                        //- label( style="color: black; margin-top: 2rem;" for="example1-email" data-tid="elements_examples.form.email_label") {{$t('Card_Expiry')}}
                        div( class="col-md-2" style="border: 1px solid #aaa; height:37px; margin-left: 30px; background:white;" )
                            div(id="card-expiry")
                        //- label( style="color: black; margin-top: 2rem;" for="example1-email" data-tid="elements_examples.form.email_label") {{$t('Card_CVC')}}
                        div( class="col-md-1" style="border: 1px solid #aaa; height:37px; margin-left: 30px; background:white;" )
                            div(id="card-cvc")
                    div(id="card-error" style="color: red; margin-left: 152px")

                v-btn( class="blue-grey darken-3 white--text" large style="width: 30%; float:right; text-align: center; margin-top:50px;" type="button" @click="submit" ) {{$t('Pay')}}

        template(v-if="view==='success' && this.dialog")
            div( style="background-color:#f0f0f0; background-size:1000px 260px; background-image:url(https://app.tradersalloy.com/images/BlueGradientBox.png); background-position:center top; margin:auto;")
                div(style="float:right; margin:12px;")
                    v-icon(@click="close()" class="white--text") mdi-close
                div( style="padding-top:40px; border:0px solid;")
                    table( style="width:100%; border:0px solid;")
                        tr
                            td( style="border:0px solid;")
                                div( style="width:64px; margin:auto; border:0px solid;")
                                    img( src="https://app.tradersalloy.com/images/traders-alloy-logo_icon-white-transparent.png" alt="icon" style="width:55px;")
                        tr
                            td( style="height:35px; vertical-align:top; font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif; line-height:27px; color:#ffffff; font-size:18px; text-align:center; border:0px solid;")
                                div(style="font-weight:300; font-size: 1.7rem;") {{$t('welcome_to')}}
                                    div(style="font-weight:700; font-size: 2.2rem; margin:10px;") {{$t('premium')}}
                                div(style="background:#fcfcfc; color:#111111; padding:20px; margin:40px auto 0 auto; width:600px; border: 1px solid #e0e0e0;border-radius:5px;")
                                    div
                                        div(style="font-weight:700; font-size: 1.2rem; margin-bottom:30px;") {{$t('success_message_0')}}
                                        ul(style="text-align:left;")
                                            span
                                                p(style="font-size:1em;") {{$t('success_message_1')}}
                                                p(style="font-size:1em;") {{$t('success_message_2')}} &nbsp;
                                                    a(href="email:Petter@TradersAlloy.com") Petter@TradersAlloy.com
                                                p(style="font-size:1em;") {{$t('success_message_3')}}
                                v-btn( class="white--text"
                                        large
                                        style="background:#3B5D82; width: 20%; text-align: center; margin:60px auto 30px auto;"
                                        type="button"
                                        @click="close" ) {{$t('Close')}}
</template>


<script>
import dotenv from 'dotenv';
dotenv.config();

import ApiService from "../Services/ApiService";

import Vue from 'vue';
import { StripePlugin } from '@vue-stripe/vue-stripe';
import moment from 'moment';
import {mapActions, mapGetters} from "vuex";

const options = {
  pk: process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY_LIVE,
  apiVersion: '2020-08-27',
  locale: 'sv',
};

Vue.use(StripePlugin, options);

    export default {
        name: "UserPricePlans",
        components: {
        },
        props: {
            value: Boolean,
            page: String
        },
        data () {
            return {
                showPremiumButton: true,
                view: 'success',
                dialog: true,
                stripeShow: false,
                overlay: false,
                promoCodes : [],
                promoID: '',

                cardNumber: null,
                cardExpiry: null,
                cardCvc: null,
                bill_per_year: false,
                user: {email:'pending'},
                loading: false,
                amount: 120,
                token: null,
                charge: null,
                name: '',
                email: '',
                promo: '',
                is_valid_promo: false,
                percentOff: 0,
                errMsg: '',
                is_checked: false,
                // eslint-disable-next-line no-useless-escape
                reg: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/
            }
        },
        async mounted () {
            this.view = "introduction";
            this.stripeShow = false;
            if (localStorage.user) {
                this.user = JSON.parse(localStorage.user);
                this.email = this.user.email;
            }

            const promotionCodes = await this.getPromoCodes();
            this.promoCodes = promotionCodes.data;
        },
        beforeDestroy () {
            // console.log('destroy');
            // this.cardNumber.destroy();
            // this.cardExpiry.destroy();
            // this.cardCvc.destroy();
        },
        computed: {
            show: {
                get () {
                    this.view = 'introduction';
                    return this.value;
                },
                set (value) {
                    this.$emit('input', value);
                }
            },
            stripeElements () {
                return this.$stripe.elements();
            },
            today_date() {
                let date = new Date().getDate();
                if (date == 1) {
                    return date + 'st';
                } else if (date == 2) {
                    return date + 'nd';
                } else if (date == 3) {
                    return date + 'rd'
                } else {
                    return date + 'th';
                }
            }
        },
        watch: {
            dialog: function(){
                if(!this.dialog) this.view = 'introduction';
            },
            view: function() {
                if(this.view === 'stripe'){
                    const style = {
                        base: {
                            color: 'black',
                            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                            fontSmoothing: 'antialiased',
                            fontSize: '14px',
                            '::placeholder': {
                                color: '#aab7c4',
                            },
                        },
                        invalid: {
                            color: '#fa755a',
                            iconColor: '#fa755a',
                        },
                    };

                    setTimeout(() => {
                        this.cardNumber = this.stripeElements.create('cardNumber', { style });
                        this.cardNumber.mount('#card-number');
                        this.cardExpiry = this.stripeElements.create('cardExpiry', { style });
                        this.cardExpiry.mount('#card-expiry');
                        this.cardCvc = this.stripeElements.create('cardCvc', { style });
                        this.cardCvc.mount('#card-cvc');
                    }, 100);
                } else {
                    this.cardNumber && this.cardNumber.destroy();
                    this.cardExpiry && this.cardExpiry.destroy();
                    this.cardCvc && this.cardCvc.destroy();
                }
            },
            show: function(val) {
                if(!val) {
                    this.stripeShow = false;
                }
            },
            bill_per_year: function(val) {
                if (val) {
                    this.amount = 1152;
                } else {
                    this.amount = 120;
                }
            },
        },
        methods: {
            ...mapActions([
                "getPromoCodes"
            ]),
            checkValidpromo() {
                this.is_checked = false;
                if (this.promo == '') {
                    this.errMsg = ''
                } else {
                    let is_valid_promo = this.promoCodes.find(item => item.code == this.promo)
                     
                    if (is_valid_promo) {
                        this.is_valid_promo = true;
                        this.percentOff = is_valid_promo.coupon.percent_off;
                        this.promoID = is_valid_promo.id;
                        this.errMsg = 'Valid code';
                        this.is_checked = true;
                    } else {
                        this.is_valid_promo = false;
                        this.errMsg = "Invalid code"
                        this.is_checked = true;
                    }
                }
            },
            changepromo() {
                this.is_valid_promo = false;
                if (this.promo == '') {
                    this.errMsg = '';
                } else {
                    this.is_checked = false;
                }
            },

            openPremiumDialog() {
                this.showPremiumButton = false;
                this.dialog = true;
            },
            hidePremiumButton() {
                this.showPremiumButton = false;
            },
            close() {
                this.stripeShow = false;
                this.view = 'introduction';
                // this.dialog = false;
                this.overlay = false;
                this.show = false;
            },
            purchase () {
                this.stripeShow = true;
                this.view = 'stripe';
            },
            async submit () {
                if (this.name == '') {
                    alert('Enter your name');
                } else {
                    const { token, error } = await this.$stripe.createToken(this.cardNumber);
                    if (error) {
                        document.getElementById('card-error').innerHTML = error.message;
                        return;
                    }
                    this.token = token;
                    this.charge = {
                        source: token.id,
                        description: (this.bill_per_year ? 'annually' : 'monthly'),
                    };
                    this.sendTokenToServer(this.charge);
                }
            },
            async sendTokenToServer (charge) {
                this.overlay = true;
                let payload = {
                    id: JSON.parse(localStorage.user).user_id,
                    source: charge.source,
                    name: this.name,
                    email: this.email,
                    description : charge.description,
                    promo: this.is_valid_promo? this.promoID : null
                };
                const response = await ApiService.stripe(payload);
                if (response.data.status == "active") {
                    this.$store.commit("setUserSubscribed", true);
                    this.$store.commit("setUserCancelSubscribed", false);

                    // this should be done in VUEX
                    let temp_user_data = JSON.parse(localStorage.user);
                    temp_user_data.type = 'premium';
                    temp_user_data.subscription_id = response.data.id;
                    temp_user_data.customer_id = response.data.customer;
                    localStorage.setItem('user', JSON.stringify(temp_user_data));

                    this.view = 'success';

                } else {
                    alert('Something wrong. Please try later again.');
                }
                this.overlay = false;
            },
        }

    }
</script>


<style scoped>

    .popup {
        background:#ECEFF1;
        height:670px;
        width:1000px;
        padding: 40px;
    }
    .container {
        display:flex;
        justify-content: space-around;
        padding: 0 40px;
    }
    .contained {
        flex: 1;
        border-radius: 6px;
        background: #ffffff;
        margin:0 30px;
    }

    .contained2 {
        flex: 1;
        border-radius: 6px;
        border: 3px solid #325D85;
        background: #ffffff;
        margin:0 30px;
        font-size: 1.1em;
    }

    div.header {
        text-align: center;
        padding:20px;
    }
    .contained div.header {
        color: black;
    }
    .contained2 div.header {
        color: white;
        background: #325D85;
    }

    .header div:nth-child(1) {
        font-size: 1.2rem;
        font-weight: bold;
    }
    .header div:nth-child(2) {
        font-size: 3rem;
        margin:-10px;
        font-weight: normal;
    }
    .header div:nth-child(3) {
        font-size: 0.9rem;
        font-weight: normal;
    }

    .contained .body {
        display: block;
        margin: 20px 40px;
    }
    .contained2 .body {
        display: block;
        margin: 20px;
    }

    .container .body button {
        display: block;
        margin: 30px auto 50px auto;
        background: #325D85;
        color: #ffffff;
    }

    ul {
        list-style: none;
        padding:0;
    }
    ul li:before {
        content: '✓ ';
    }
    ul li {
        padding:10px 0;
    }

    tr {
        height:35px;
        margin: 15px;
        padding: 15px;
    }

    .left{
        text-align:left;
    }
    .v-input--is-focused .v-input__slot {
        border: 0px solid white !important;
    }


</style>
