<template lang="pug">
    div(class="ml-4 mr-4 pt-2")
        div( class="headline-text blue3--text") Portfolio: Plan
        h3 Personal Investment Mandate
        //- v-divider
        v-row
            v-col
                //- h3 Money Management
                //- div(class="grid-container")

                //-     label
                //-         span Lump Sum
                //-     input(type="text" v-model="plan.account_value")

                //-     label
                //-         span Monthly Contribution
                //-     input(type="text" v-model="plan.monthly_add")

                //-     label
                //-         span Nominal Position Size
                //-     input(type="text" v-model="plan.position_size")

                //- v-btn(@click="save" color="primary") Save

                //- h3 My Personal Investment Mandate
                div(style="text-align: end; margin-right:30px;")
                    v-icon(left) mdi-open-in-new
                    u(class="cursor-pointer" style="color:#3D8AFF" @click="clickHelp()") Help, inspiration and guidance
                div(:style="`width:800px; height:${windowHeight-300}px;`")
                    froala( :tag="'textarea'" :config="froalaConfig" v-model="plan.note" id="edit" style="width:30px;")
            v-col
                div(style="display: flex; justify-content: space-between; border-radius: 10px;")
                    div(style="display: flex; align-items: self-start;")
                        h3 Investment Accounts
                        button( class="blue3 ml-1" style="width:180px;color:#ffffff;padding:5px;border-radius:3px;" @click="clickConnect()")
                            span Create Account

                    v-menu(@input="onMenuToggle" offset-y bottom left origin="top right" :close-on-content-click="false")
                        template(v-slot:activator="{ on, attrs }")
                            v-icon(style="cursor: pointer;" v-on="on" v-bind="attrs") mdi-settings
                        v-list(dense style="width:650px;")
                            v-list-item(class="blue3" style="margin-top:-9px")
                                v-list-item-title(style="color:white; font-size:15px;") Configure Accounts
                            v-list-item()
                                v-list-item-title(style="font-weight: bold; font-size:14px;") Account name
                                v-list-item-title(style="font-weight: bold; font-size:14px; text-align:end;") id
                                v-list-item-title(style="font-weight: bold; font-size:14px; text-align:end") ignore
                                v-list-item-title(style="font-weight: bold; font-size:14px; text-align:center") Currency
                            v-list-item(
                                class="cursor-pointer v-list-item--link v-list-sub-item"
                                v-for="(item, index) in userAccounts"
                                :key="index"
                                style="justfy-conent: space-between; height:10px"
                            )
                                v-list-item-title {{ item.account_name }}
                                v-list-item-title(style="text-align:end;margin-right:70px;") {{ item.user_account_id }}
                                v-checkbox(v-model="!!item.is_ignored" :disabled="filteredAccounts.length === 1 && item.is_ignored === false" @change="clickCheckBtn(item)" color="#244360")
                                v-list-item-title(style="text-align:center") {{ item.currency }}

                div(:style="`height:${windowHeight-215}px; overflow-y: auto;`")
                    div(v-for="account in accountsToShow" style="background-color: #f8f8f8;")
                        div(class="grid-container view-container")
                            h3 {{account.account_name}}
                            span {{account.user_account_id}}
                        div(class="grid-container")
                            label
                                span Broker
                            span {{account.broker}}

                            label
                                span Balance
                            div(style="display:flex; align-items: center;")
                                input(type="text" style="text-align:right;" v-model="account.balance")
                                span(style="margin-left: 10px;") SEK

                            label
                                span Nominal Position Size
                            div(style="display:flex; align-items: center;")
                                input(type="text" style="text-align:right;" v-model="account.nominal_position_size")
                                span(style="margin-left: 10px;") SEK

                        div(v-if="account.account_type == 'PAPER'" style="text-align: right")
                            h3(style="color:#bbb; padding:22px;") Paper Account

                        div(v-if="account.account_type != 'PAPER'")
                            span(class="importText") Import New transactions
                            div(class="accountContainer")
                                //- div(style="text-align: end; padding-bottom:10px;")
                                //-     span(class="blue1 btnStyle" style="" @click="clickBankID()") Bank ID
                                div(style="text-align: end; padding-bottom:10px;")
                                    span(class="blue1 btnStyle" style="" @click="clickCSVBtn()") CSV File
                                div(style="text-align: right; margin-top:-4%; margin-right: -64%;")
                                    span(style="color:#bbb; padding:22px; padding:0px;") Last connection {{account.last_import_date}}

        v-dialog(v-model='show' width="500")
            div( style="background-color:white; height:800px;")
                div(style="background-color:#f9f9f9; height:40px;")
                    v-icon(class="cursor-pointer" large style="margin-left:20px; margin-top:5px;" @click="clickRemoveBtnChooseYourBank()") mdi-close
                h3(style="padding:20px;") Choose your bank
                div(v-for="item in banks" style="margin-left:50px; margin-bottom:25px;")
                    img(:src="item.img" style="height:40px; width:40px")
                    span(style="margin-left:20px; font-size:18px; font-weight:bold") {{item.title}}
                    div(v-for="content in item.content" style="margin-left:80px;")
                        span(class="cursor-pointer contentHover" @click="clickBank(content)") {{content.subtitle}}

                div(class="bottomTextClass")
                    span(style="color:#8e8e8e; font-size:15px;") By using this service you acknowlegde our
                        u(class="cursor-pointer" @click="clickPrivacyBtn()") Privacy Policy.
                        span Traders Alloy will obtain some of your financial information.
                        u(class="cursor-pointer") Read more
        v-dialog(v-model="show_importTransaction" max-width="500px")
            ImportTransaction(@my-event="myButtonEventHandler")

        v-dialog(v-model="show_refreshDialog" width="25%")
            div(style="background-color:#325D85; height:40px;")
                span(style="color:white; font-size:18px; margin:30px; vertical-align: text-top;") Refresh
            div(style="padding:20px; background-color:white")
                span(style="color:#8e8e8e; font-size:15px;") By using this service you acknowlegde our
                    u(class="cursor-pointer" @click="clickPrivacyBtn()") Privacy Policy.
                    span Traders Alloy will obtain some of your financial information.
                    u(class="cursor-pointer") Read more
            div(class="p-3" style="background-color:white;")
                div(style="display:flex; justify-content:space-between;")
                    label( for="email" style="color:black") Avanza username
                    input(v-model="avanza_username" placeholder="username" required type="text" style="width:60%; text-align:start")
                div(style="display:flex; justify-content:space-between;")
                    label( for="email" style="color:black") Password
                    input(v-model="avanza_password" placeholder="password" required type="text" style="width:60%; text-align:start")
            div(style="text-align: end; padding-bottom:20px; background-color:white;")
                span(class="blue1 btnStyle" style="" @click="clickImportTransactionBtn()") Import Transactions

        v-dialog(v-model="show_authenticateDialog" width="35%")
            div(style="background-color:#325D85; height:40px;")
                span(style="color:white; font-size:18px; margin:30px; vertical-align: text-top;") Access my data on Avanza
            div(style="padding:20px; background-color:white; display: grid;")
                span(style="") 1. Login to
                    u(class="cursor-pointer") Avanza
                span(style="") 2. Activate (or re-activate) Tvåfakorsinloggning (2FA)
                span() and paste the SECRET_KEY below.
            div(style="background-color:white;")
                img(src="/images/portfolio_import.png" style="margin-left:100px;")
            div(class="p-3" style="background-color:white;")
                div(style="display:flex; justify-content:space-around; align-items: baseline;")
                    label( for="email" style="color:black") SECRET_KEY
                    v-btn(style="background-color:#6AE199; height: 26px;" @click="clickPasteBtn()") Paste
                    input(id="secretInput" v-model="secret_key" placeholder="" required type="text" style="width:30%; text-align: start;")
                    span(v-if="secret_key!= '' && !show_ID" class="blue1 cursor-pointer" style="color:white; border-radius: 5px; padding: 2px 20px;" @click="clickGenerateBtn()") Generate Response
                    span(v-else class="" style="color:white; border-radius: 5px; padding: 2px 20px; background-color:rgba(0,0,0,0.3)") Generate Response
            div(v-if="show_ID" style="background-color:white")
                div(style="display: flex; justify-content: center; align-items: center;")
                    span(id="generatedID" style="font-size: 35px;") {{generated_bankID}}
                    v-btn(style="background-color:#6AE199; height: 26px; margin-left:20px;" @click="clickCopyBtn()") Copy
                div(style="display:grid; justify-content: center")
                    span(style="text-align: center;") use this code on Avanza
                    span(class="blue1 cursor-pointer" style="color:white; border-radius: 5px; padding: 10px 20px; margin:30px;" @click="clickDoneBtn()") I have pasted {{generated_bankID}} on Avanza

        v-dialog(v-model="show_createAccountDialog" width="25%")
            div(style="background-color:#325D85; height:40px;")
                span(style="color:white; font-size:18px; margin:30px; vertical-align: text-top;") Create Account
            div(class="p-3" style="background-color:white;")
                div(style="display:flex; justify-content:space-between;")
                    label( for="email" style="color:black") Name
                    input(v-model="accountName" placeholder="account name" required type="text" style="width:60%; text-align:start")
                div(style="display:flex;")
                    label( for="email" style="color:black") Broker or Bank
                    label( for="email" style="color:black; margin-left:100px;") {{broker}}
                div(v-if="!is_paper" style="display:flex; justify-content:space-between;")
                    label( for="email" style="color:black") Account Number
                    input(v-model="manual_accountNumber" placeholder="account number" required type="text" style="width:60%; text-align:start")
                div(v-else style="display:flex;")
                    label( for="email" style="color:black") Account Number
                    label( for="email" style="color:black; margin-left:90px;") {{accountNumber}}
                div(style="display:flex; justify-content:space-between;")
                    label( for="email" style="color:black") Type
                    input(v-model="accountType" placeholder="account type" required type="text" style="width:60%; text-align:start")
            div(style="text-align: end; padding-bottom:20px; background-color:white;")
                span(class="blue1 btnStyle" style="" @click="clickCreateAccountBtn()") Create Account


</template>

<script>
import VueFroala from "vue-froala-wysiwyg";
import HistogramSlider from 'vue-histogram-slider';
import {mapGetters, mapActions} from "vuex";
import ImportTransaction from "./ImportTransaction";

import ApiService from "@/Services/ApiService";

export default {
    name: "Plan",
    components: {
        VueFroala,
        ImportTransaction
    },
    data() {
        return {
            checkIfMenuOpen: 0,
            secret_key: '',
            show: false,
            is_paper: true,
            broker: 'none',
            accountNumber: null,
            show_importTransaction: false,
            show_refreshDialog: false,
            show_authenticateDialog: false,
            show_importDialog: false,
            show_createAccountDialog: false,
            show_ID: false,
            accountName: '',
            accountType: '',
            generated_bankID: '',
            manual_accountNumber: '',
            avanza_username: '',
            avanza_password: '',
            user_id: JSON.parse(localStorage.user).user_id,
            froalaConfig: {
                width:'100%',
                placeholderText: "PlaceholderText: works, Attribution: works",
                immediateVueModelUpdate: true,
                charCounterCount: false,
                documentReady: true,
                attribution: true,
                key: process.env.VUE_APP_FROALA_KEY,
                pluginsEnabled: [
                    "fontSize",
                    "colors",
                    "fontFamily",
                    "paragraphFormat",
                    "getPDF",
                    "align",
                    "lists",
                    "image",
                    "table",
                    "codeView",
                    "fullscreen",
                    "print",
                ],
                language: "sv",
                toolbarButtons: [
                    [
                        "H1",
                        "H2",
                    ],
                    [
                        "bold",
                        "italic",
                        "underline",
                        "highlight",
                    ],
                    [
                        "formatUL",
                        "formatOL",
                        "alignLeft",
                        "alignCenter",
                        "hr",
                        "insertImage",
                    ],
                    [
                        "undo",
                        "redo",
                        "fullscreen",
                    ],
                ],
                toolbarVisibleWithoutSelection: true,
                imageUpload: true,
                imageDefaultAlign: "center",
                imageDefaultDisplay: "inline-block",
                imageMaxSize: 5 * 1024 * 1024,
                imageAllowedTypes: ["jpeg", "jpg", "png"],
                imageUploadParam: "imageFile",
                imageUploadURL: `${process.env.VUE_APP_BACKEND_URL}/froala/image`,
                imageUploadMethod: "POST",
                events: {
                    // eslint-disable-next-line no-unused-vars
                    initialized: function (e, editor) {
                    },
                },
                windowHeight: 0
            },
            banks: [
                {
                    img: '/images/bank_paper.png',
                    title: 'Fantasy Finance',
                    content: [
                        {
                           subtitle: 'Paper Trade your way to financial success',
                           key: 0
                        }
                    ]
                },
                {
                    img: '/images/bank_avanza.png',
                    title: 'Avanza',
                    content: [
                        {
                            subtitle: 'Manual logging of trasactions',
                            key:1
                        },
                        // {
                        //     subtitle: 'Authenticate with Bank ID',
                        //     key:2
                        // },
                        {
                            subtitle: 'Export /Import .csv file',
                            key:3
                        },
                    ]
                },
                // {
                //     img: '/images/bank_nordnet.png',
                //     title: 'Nordnet',
                //     content: [
                //         {
                //            subtitle: 'Export /Import .csv file',
                //            key: 4
                //         }
                //     ]
                // },
                // {
                //     img: '/images/bank_nordea.png',
                //     title: 'Nordea',
                //     content: [
                //         {
                //            subtitle: 'Export /Import .csv file',
                //            key: 5
                //         }
                //     ]
                // },
                // {
                //     img: '/images/bank_erik.png',
                //     title: 'Erik Penser Bank',
                //     content: [
                //         {
                //            subtitle: 'Export /Import .csv file',
                //            key: 6
                //         }
                //     ]
                // }
            ],
            accounts: [
                // { title: 'Avanza Investeringsparko', id: '5511222', hide: true, currency: 'SEK' },
                // { title: 'old Avanza', id: '5511222', hide: false, currency: 'SEK' },
                // { title: 'Example paper-trading', id: '1841', hide: false, currency: 'SEK' },
                // { title: 'YOLO high risk', id: '911', hide: true, currency: 'SEK' },
            ],
            accountsToShow: [],
        };
    },
    computed: {
        ...mapGetters(['getAllUserAccounts']),
        plan() {
            const plan = this.$store.getters["getUserPortfolioPlan"];
            if (plan.length === 1) {
                return plan[0];
            } else {
                return {
                    user_id: this.user_id,
                    note: 'My commitment to self... my plan...',
                    account_size: 0,
                    monthly_add: 0,
                    position_size: 0,

                };
            }

        },
        userAccounts() {
            return this.$store.getters.getUserAccounts.filter((a) => a.competition_id === null);
        },
        filteredAccounts() {
            return this.accounts.filter(acc => !acc.is_ignored);
        }
    },
    mounted() {
        this.windowHeight = window.innerHeight;
        this.froalaConfig.height = (window.innerHeight - 294) + 'px';
        this.accounts = [...this.$store.getters.getUserAccounts];
        this.accountsToShow = this.filteredAccounts;

        //            const plan = this.$store.getters["getUserPortfolioPlan"];

        /*            this.froalaContent = plan.note;
            this.account_size = plan.account_size;
            this.monthly_add = plan.monthly_add;
            this.position_size = plan.position_size;
*/

    },
    methods: {
        ...mapActions([
            'updateUserAccount',
            'insertUserAccount',
            'avanzaGenerate2FA',
            'avanzaGetTransactions',
            'saveOneTx',
        ]),
        clickPrivacyBtn() {
            window.open('https://tradersalloy.com/en/privacypolicy', "_blank");
        },
        clickHelp() {
            const settings = JSON.parse(JSON.parse(localStorage.user).settings);
            if (settings.language && settings.language == 'en') {
                window.open('https://intercom.help/tradersalloy/', "_blank");
            } else {
                window.open('https://intercom.help/tradersalloy/sv/', "_blank");
            }
        },
        myButtonEventHandler() {
            this.show_importTransaction = false;
        },
        async save() {
            await this.$store.dispatch('upsertUserPortfolioPlan', this.plan);
        },
        clickConnect() {
            this.show = true;
        },
        clickBank(content) {
            this.show = false;
            let countNullAccountsArray = this.$store.getters.getUserAccounts.filter(item => item.broker == 'none' || item.broker == null);
            const self = this;
            const recall = function(number) {
                let temp_user_account_id = self.user_id + '-' + number;
                let inx = self.$store.getters.getUserAccounts.findIndex(item => item.user_account_id == temp_user_account_id)
                if (inx < 0) {
                    return temp_user_account_id;
                } else {
                    return recall(parseInt(number) + 1)
                }
            }
            const final_account_number = recall(countNullAccountsArray.length);
            this.accountNumber = final_account_number;


            if (content.key == 0) {
                this.show_createAccountDialog = true;
                this.is_paper = true;
                this.broker = 'none'
            }
            if (content.key == 1) {
                this.show_createAccountDialog = true;
                this.is_paper = false;
                this.broker = 'Avanza'
            }
            if (content.key == 3) {
                this.show_importTransaction = true;
            }
            if (content.key == 2) {
                this.show_authenticateDialog = true;
            }
        },
        clickBankID() {
            this.show_authenticateDialog = true;
        },
        clickRefresh() {
            this.show_refreshDialog = true;
        },
        clickCSVBtn() {
            this.show_importTransaction = true;
        },
        async clickImportTransactionBtn() {
            if (this.avanza_username == '' || this.avanza_password == '') {
                this.$store.commit('setMessage', { text: 'Please enter all fields.', type: 'error' });
            } else {
                let user = {
                    username: this.avanza_username,
                    password: this.avanza_password,
                    secret_key: this.secret_key
                }
                this.show_refreshDialog = false;
                const res = await this.avanzaGetTransactions(user);

                let countNullAccountsArray = this.$store.getters.getUserAccounts.filter(item => item.broker == 'none' || item.broker == null);
                const self = this;
                const recall = function(number) {
                    let temp_user_account_id = self.user_id + '-' + number;
                    let inx = self.$store.getters.getUserAccounts.findIndex(item => item.user_account_id == temp_user_account_id)
                    if (inx < 0) {
                        return temp_user_account_id;
                    } else {
                        return recall(parseInt(number) + 1)
                    }
                }
                const final_account_number = recall(countNullAccountsArray.length);

                let account_data = {
                    user_id: this.user_id,
                    user_account_id: final_account_number,
                    account_name : 'Avanza',
                    account_type : 'Avanza',
                    balance: 0,
                    scale: 0,
                    currency: 'SEK',
                    is_ignored: false,
                    broker: 'Avanza',
                    order_preference: 0,
                    nominal_position_size: 0,
                    secret_key: this.secret_key,
                    last_import_date: new Date().toISOString().slice(0,10)
                }
                await this.insertUserAccount(account_data);

                const insertObject = {
                    user_id: this.user_id,
                    account: '',
                    stock_id: null,
                    user_account_id: final_account_number,
                    tx_date: res[0].verificationDate,
                    tx_type: res[0].transactionType,
                    isin: res[0].orderbook.isin,
                    description: res[0].description,
                    qty: res[0].volume,
                    price: res[0].price,
                    amount: res[0].sum,
                    commission: 0,
                    currency: res[0].currency,
                    exchange_rate: 0,
                };
                await this.saveOneTx(insertObject);
            }
        },
        clickPasteBtn() {
            navigator.clipboard.readText().then(clipText =>{
                this.secret_key = clipText;
            });

        },
        clickCopyBtn() {
            var copyText = document.getElementById("generatedID");
            navigator.clipboard.writeText(copyText.innerText);
        },
        async clickGenerateBtn() {
            this.show_ID = true;
            let bankID = await this.avanzaGenerate2FA(this.secret_key);
            this.generated_bankID = bankID;
        },
        async clickCheckBtn(item) {
            const inx = this.accounts.findIndex(acc => acc.user_account_id == item.user_account_id);

            if (inx < 0) return;

            this.accounts[inx].is_ignored = !this.accounts[inx].is_ignored;

            await ApiService.updateUserAccount(this.accounts[inx]);
        },
        onMenuToggle() {
            this.checkIfMenuOpen += 1;

            if(this.checkIfMenuOpen === 4) {
                this.checkIfMenuOpen = 0;

                this.accountsToShow = this.filteredAccounts;
            }
        },
        clickDoneBtn() {
            this.show_refreshDialog = true;
            this.show_authenticateDialog = false;
        },
        async clickCreateAccountBtn() {
            if (this.accountName == '' || this.accountType == '') {
                this.$store.commit('setMessage', { text: 'Please enter all fields.', type: 'error' });
            } else {


                if (!this.is_paper) {
                    if (this.manual_accountNumber == '') {
                        this.$store.commit('setMessage', { text: 'Please enter all fields.', type: 'error' });
                        return;
                    } else {
                        let is_existingAccountNumber = this.getAllUserAccounts.findIndex(item => item.user_account_id == this.manual_accountNumber && item.user_id == this.user_id);
                        if (is_existingAccountNumber < 0) {
                            let account_data = {
                                user_id: this.user_id,
                                user_account_id: this.manual_accountNumber,
                                account_name : this.accountName,
                                account_type : this.accountType,
                                balance: 0,
                                scale: 0,
                                currency: 'SEK',
                                is_ignored: false,
                                broker: this.broker=='none' ? null : this.broker,
                                order_preference: 0,
                                nominal_position_size: 0,
                                secret_key: null,
                                last_import_date: new Date().toISOString().slice(0,10)
                            }
                            // console.log('!!!   !!!!', account_data);
                            await this.insertUserAccount(account_data);
                            this.show_createAccountDialog = false;
                            this.accounts.push(account_data);
                            this.$store.commit("setUserAccountsModiy", this.accounts);
                            // this.$router.push({name: 'landing-page.transactionTabs'});
                        } else {
                            this.$store.commit('setMessage', { text: 'Account Numbe is already exist.', type: 'error' });
                        }
                    }
                } else {
                    let account_data = {
                        user_id: this.user_id,
                        user_account_id: this.accountNumber,
                        account_name : this.accountName,
                        account_type : this.accountType,
                        balance: 0,
                        scale: 0,
                        currency: 'SEK',
                        is_ignored: false,
                        broker: this.broker=='none' ? null : this.broker,
                        order_preference: 0,
                        nominal_position_size: 0,
                        secret_key: null,
                        last_import_date: new Date().toISOString().slice(0,10)
                    }
                    // console.log('!!!!!!!', account_data);
                    await this.insertUserAccount(account_data);
                    this.show_createAccountDialog = false;
                    this.accounts.push(account_data);
                    this.$store.commit("setUserAccountsModiy", this.accounts);
                    // this.$router.push({name: 'landing-page.transactionTabs'});
                }

            }
        },
        clickRemoveBtnChooseYourBank() {
            this.show = false;
        }
    }
};
</script>


<style>
.contentHover {
    font-size: 16px;
    color: black;
    /* width: 60px; */
    display: inline-block;
    min-width: 60px;
    height: 24px;
    /* max-width: 80px; */
    text-align: center;
    align-items: center;
    border-radius: 3px;
    cursor: pointer;
}
.contentHover:hover {
    color: #58dddd;
    text-shadow: 0 0 15px #a0f8ff;
}
.fr-box.fr-document.fr-basic.fr-top {
    height: inherit;
}
.fr-box.fr-document .fr-wrapper {
    height: inherit;
    min-height: initial!important;
}
.fr-box.fr-document .fr-wrapper .fr-element {
    min-height: initial!important;
    height: 100%;
}
html, body {
    overflow-y: hidden;
}
</style>


<style scoped>
.grid-container {
    padding:0 30px;
    display: grid;
    gap:10px;
    grid-template-columns: 300px 200px;
    /* grid-template-rows: repeat(6, 15% ); */
}

label {
    grid-column: 1/2;
}
input {
    grid-column: 2/3;
    width: 100px;
    height: 1.7rem;
    border: 1px solid #bbbbbb;
    border-radius: 3px;
    text-align: right;
}
.connectStyle {
    line-height:17px;
    padding:4.3px;
    padding-left:20px;
    padding-right:20px;
    margin-left: 20px;
}
.view-container {
    display: flex;
    justify-content: space-between;
    padding-top:20px;
    margin-top:20px;
}
.btnStyle {
    font-size: 18px;
    margin: 20px;
    padding: 5px 20px 5px 20px;
    color: white;
    border-radius: 5px;
    cursor: pointer;
}
.accountContainer{
    display: flex;
    width:95%;
    margin-left: 2.5%;
    flex-direction: column;
    height: 40%;
    padding: 10px;
    border: 1px solid #cacaca;
    margin-top:-10px;
    align-items: center;
}
.importText {
    background-color: #f8f8f8;
    padding: 10px;
    margin: 60px;
}

.headline-text {
    font-size: 36px;
    font-weight: bold;
}

.bottomTextClass {
    padding: 30px;
    position: absolute;
    bottom: 103px;
    width: 500px;
}
</style>
