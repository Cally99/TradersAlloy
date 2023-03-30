let stripe = require('stripe')('sk_live_EHNOnj3oN4IrDyKMDPHNeFKD00aJ1trHK2');
// var stripe = require('stripe')('sk_test_nrCtotXrFHtxXSxug6iJrFWD00ntUro1ga');
const User = require('../models').User;
// test product key : plan_G0BfVcZTvFST6z
// `source` is obtained with Stripe.js; see https://stripe.com/docs/payments/accept-a-payment-charges#web-create-token
// test key_monthly : price_1JVYebHT2DJes20m4oEyuXUA
// test key_annual : price_1JVYevHT2DJes20mU9we9C00

const userService = require("../services/UserService");

let user_id;
let source;
let description;
let customerId;
let response;
let cardId;
let promoCode;

const subscriptionCreateOptions = async(error, subscription) => {
    if (!subscription) {
        response.status(400).send(error);
    }

    const user = await userService.findUser(user_id);
    if (!user) { // this should throw an exception for our error handler to communicate with the user.
        return response.status(404).send({ message: 'user Not Found' });
    }

    await userService.updateUser_stripe(
        subscription.id,
        customerId,
        cardId,
        new Date().toISOString().slice(0, 10),
        user_id,
        'premium');

    return response.status(200).send(subscription);
};

const sourceCreateOptions = (err, card) => {
    if (!card) {
        return;
    }

    let pricePlanId;
    if (description === 'monthly') {
        pricePlanId = process.env.PRICE_MONTH;
    } else if (description === 'annually') {
        pricePlanId = process.env.PRICE_YEAR;
    } else {
        throw new Error('Stripe Price Plans not configured correctly ');
    }

    if (promoCode) {
        stripe.subscriptions.create({
                customer: customerId,
                items: [{ plan: pricePlanId }],
                promotion_code: promoCode
            },
            subscriptionCreateOptions
        );
    } else {
        stripe.subscriptions.create({
                customer: customerId,
                items: [{ plan: pricePlanId }],
            },
            subscriptionCreateOptions
        );
    }
};

const customerCreateOptions = (err, customer) => {
    if (!customer) {
        response.status(400).send(err);
    }

    customerId = customer.id; // this is global so other methods can access it // AB
    cardId = customer.default_source;
    stripe.customers.createSource(
        customer.id, { source: source },
        sourceCreateOptions
    );
};

const deleteSubscription = async(err, confirmation) => {
    if (!confirmation) {
        response.status(400).send(err);
    }

    await userService.updateUser_stripe(null, null, user_id, 'Freemium');
    return response.status(200).send(confirmation);
};


module.exports = {
    payment_stripe(req, res) {
        user_id = req.body.id;
        source = req.body.source;
        description = req.body.description;
        promoCode = req.body.promo;
        response = res;

        stripe.customers.create({
                name: req.body.name,
                email: req.body.email,
                description: req.body.description,
            },
            customerCreateOptions
        );
    },

    async cancelStripe(req, res) {
        user_id = req.body.id;
        response = res;

        const user = await userService.findUser(user_id);
        if (!user) {
            return response.status(404).send({ message: 'user Not Found' });
        }

        stripe.subscriptions.del(
            user.subscription_id,
            deleteSubscription
        );
    },

    async upgradeSubscription(req, res) {
        const subscriptions = await stripe.charges.list({
            limit: 3,
            customer: 'cus_KQsPRySBX1u0lK'
        });
        res.status(200).send(subscriptions);
    },

    async getTransactionHistoryStripe(req, res) {
        const subscriptions = await stripe.charges.list({
            limit: 100,
            customer: req.body.customer_id
        });

        res.status(200).send(subscriptions);
    },

    async getPromoCodes(req, res) {
        // try {
        //     const coupon = await stripe.coupons.retrieve(
        //         req.body.coupon
        //     );
        //     res.status(200).send(coupon);
        // } catch (err) {
        //     console.log('error ===', err);
        //     res.status(200).send('Invalid coupon');
        // }

        try {
            const promotionCodes = await stripe.promotionCodes.list({
                limit: 100,
            });
            res.status(200).send(promotionCodes);
        } catch (err) {
            res.status(200).send('cannot get the promo codes');
        }
    }

    // cancelStripeLeaner(req, res) { // expects req.body = {user_id: 99, subscription_id: 99}
    //     stripe.subscriptions.del(req.body.subscription_id,
    //         function(err, confirmation) {
    //             if (confirmation) {
    //                 return User.update({ subscription_id: null, membership_date: null }, { where: { user_id: req.body.user_id } })
    //                     .then(updateResult => {
    //                         if (updateResult[0] == 0) { // number of records affected
    //                             res.status(404).send({ message: 'user Not Found' });
    //                         } else {
    //                             return res.status(200).send(confirmation);
    //                         }
    //                     })
    //                     .catch((error) => res.status(400).send(error));
    //             } else {
    //                 res.status(400).send(err)
    //             }
    //         }
    //     );
    // }
}