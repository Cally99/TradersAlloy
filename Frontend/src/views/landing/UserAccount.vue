<template lang="pug">
    div
        v-dialog(v-model="show" max-width="1000px")
            //- v-overlay(:value="overlay")
            //-     v-progress-circular(indeterminate size="64")
            v-card(v-if="userPremium")
                v-card-title(style="display:flex;")
                    h4 {{ $t('User_account') }}
                    h4(style="margin-left: 200px;") {{ $t('Current_Plan_Premium') }}
                v-divider(class="mt-0")
                v-card-text
                    div(class="accountContainer")

                        //-Subscription buttons
                        //- div(class="subscriptionBoxButtons")
                        //-     v-btn(v-if="this.userPremium" color="amber" @click="upgradeSubscription()") {{ $t('Upgrade_to_annual_plan') }}
                        //-     v-btn(style="margin-left:30px;" v-if="this.userPremium" color="blue-grey lighten-2" @click="changeCard()") {{ $t('Change_card') }}

                        //-Transactions
                        div(class="boxContainer" v-if="this.userPremium") 
                            div(class="accountBoxTittle") {{ $t('Transactions') }}
                            div(class="accountBoxContent")
                                v-data-table(
                                    class="table"
                                    :headers="headers"
                                    :items="items"
                                    hide-default-footer=true
                                )
                                    template(v-slot:item.Transaction="{ item }")
                                        span {{ item.Transaction }}
                                    template(v-slot:item.Product="{ item }")
                                        span {{ item.Product }}
                                    template( v-slot:item.Card="{ item }")
                                        span {{ item.Card }}
                                    template(v-slot:item.Price="{ item }")
                                        span {{ item.Price }}
                                    template(v-slot:item.Receipt="{ item }")
                                        v-icon( @click="gotoReceipt(item.Receipt)" style="margin-right:18px;") receipt

                        //- Cancel premium and close buttons
                        div(class="cancelPremiumBox")
                            v-btn(v-if="this.userPremium" color="blue-grey lighten-2" @click="cancelPremium") {{ $t('Cancel_premium') }}
                            v-btn(style="color:white;" small color="#325D85" @click.prevent="close") {{ $t('Close') }}


            v-card(v-if="!this.userPremium")
                PaymentView(:value="show")


                        //- Subscription
                        //- div(class="boxContainer") 
                        //-     div(class="accountBoxTittle") Subscription
                        //-     div(class="accountBoxContent")
                        //-         div(class="subscriptionBox")
                        //-             h4 Current Plan: {{ this.userPremium ? "Premium" : "Freemium" }}
                        //-             div(class="subscriptionBoxButtons")
                        //-                 v-btn(v-if="this.userPremium" color="blue-grey lighten-2" @click="" small) CHANGE CARD
                        //-                 v-btn(v-if="this.userPremium" color="amber" @click="" small) UPGRADE TO ANNUAL PLAN
                        //-                 v-btn(v-if="this.userPremium" color="blue-grey lighten-2" @click="cancelPremium" small) CANCEL PREMIUM

                        //-                 v-btn(v-if="!this.userPremium" color="amber" @click="" small) UPGRADE
</template>

<script>
    import ApiService from "../../Services/ApiService";
    import PaymentView from "../../components/PaymentView.vue";
    import {mapActions, mapGetters} from "vuex";
    import moment from 'moment';


    export default {
        name: "UserAccount",
        props: {
            value: Boolean
        },
        components: {
            PaymentView,
        },
        data () {
            return {
                view: "success",
                dialog: true,
                overlay: false,
                user: {email:'pending'},
                loading: false,
                headers: [
                    { text: this.$t('Transaction_Date'), value: 'Transaction'},
                    { text: this.$t('Product'), value: 'Product'},
                    { text: this.$t('Card'), value: 'Card' },
                    { text: this.$t('Price'), value: 'Price' },
                    { text: this.$t('Receipt'), value: 'Receipt' }
                ],
                items: [
                ],
                rules: {
                    required: value => !!value || "Required.",
                    min: v => v.length >= 8 || "Min 8 characters",
                    emailMatch: () => "The email and password you entered don't match"
                },
                password: "",
                is_show: false,
                // userPremium: false
            }
        },
        computed: {
            userPremium() {
                return this.$store.getters.getUserSubscribed
            },
            show: {
                get () {
                    return this.value;
                },
                set (value) {
                    this.$emit('input', value);
                }
            },
            is_showCancel: {
                get() {
                    return this.$store.getters.getCancelSubscription;
                },
                set() {}
            },
        },
        watch: {
            is_showCancel(val) {
                this.is_show = !val;
            },
        },
        async mounted() {            
            const history = await this.getTransactionHistoryStripe({customer_id: JSON.parse(localStorage.user).customer_id});
            let histories = []; 
            history.data.forEach(element => {
                let obj = {};
                let created_date = moment(new Date(element.created * 1000)).format('YYYY-MM-DD');
                obj.Transaction = created_date;
                obj.Product = "Premium";
                obj.Card = element.source.brand;
                obj.Price = element.amount/100 + ' SEK';
                obj.Receipt = element.receipt_url;
                histories.push(obj);
            });
            this.items = histories;
            
/*          let temp_user_data = JSON.parse(localStorage.user);
            if (JSON.parse(localStorage.user).subscription_id != null) {
                temp_user_data.type = 'premium';
            }
            this.user = temp_user_data;
*/
        },
        beforeDestroy () {
        },
        created: async function() {
            const user = await ApiService.findUser(JSON.parse(localStorage.user).user_id);
            if (user.subscription_id != null) {
                user.type = 'premium';
            }
            this.user = user;
        },
        methods: {
            ...mapActions([
                "upgradeSubscriptionAction",
                "getTransactionHistoryStripe",
            ]),

            upgradeSubscription() {
            },
            changeCard() {
            },
            gotoReceipt(url) {
                // window.location.href = url;
                window.open(url, "_blank");
            },

            async cancelPremium() {
                this.overlay = true;
                const response = await ApiService.cancelStripe({
                    id: JSON.parse(localStorage.user).user_id
                });
                
                if (response.data.status === "canceled") {
                    this.overlay = false;
                    this.show = false;
                    this.$store.commit("setUserSubscribed", false);
                    this.$store.commit("setUserCancelSubscribed", true);

                    let temp_user_data = JSON.parse(localStorage.user);
                    temp_user_data.type = 'freemium';
                    temp_user_data.subscription_id = null;
                    localStorage.user = JSON.stringify(temp_user_data);
                    this.user = temp_user_data;
                }
            },

        }
    }
</script>

<style scoped>
.accountContainer{
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    max-height: 680px;
}
.boxContainer{
    display: flex;
    flex-direction: column;
    background-color:#F8FAFC;
    min-height: 500px;
    border-radius: 5px;
    padding: 15px;
    box-shadow: 2px 3px 8px 0px rgba(0,0,0,0.2);
}
.accountBoxTittle{
    width: 150px;
    font-weight: bold;
    font-size: 20px;
    margin-bottom: 20px;
    margin-left: 10px;
}
.accountBoxContent{
    width: 100%;
}
.passwordBoxContent{
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px;
    width: 100%;
    height: 350px;
}
.subscriptionBox{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
}
.subscriptionBoxButtons{
    display: flex;
    padding: 15px;
    width: 100%;
}
.cancelPremiumBox{
    display:flex;
    align-items: end;
    justify-content: space-between;
}
.my-header-style {
  color: #6f8fb9;
}



</style>
