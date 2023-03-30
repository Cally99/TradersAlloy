<template lang="pug">

    stripe-checkout(
        ref="checkoutRef"
        :pk="publishableKey"
        :items="items"
        :successUrl="successUrl"
        :cancelUrl="cancelUrl")

        template( slot="checkout-button")
            button( @click="checkout") Shutup and take my money!


</template>

<script>
    import {StripeCheckout} from 'vue-stripe-checkout';

    export default {
        components: {
            StripeCheckout
        },
        data: () => ({
            loading: false,
            publishableKey: process.env.PUBLISHABLE_KEY,
            items: [
                {
                    sku: 'sku_FdQKocNoVzznpJ',
                    quantity: 1
                }
            ],
            successUrl: 'your-success-url',
            cancelUrl: 'your-cancel-url',
        }),
        methods: {
            checkout() {
                this.$refs.checkoutRef.redirectToCheckout();
            }
        }
    }
</script>
