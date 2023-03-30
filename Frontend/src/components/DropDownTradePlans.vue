<template lang="pug">
    div(class="pt-2" @click="showDropDown=true, delayShowPriceChart()")
        div(v-if="models.length == 0" class="emptyNote")
            span [{{ $t('no_plan_defined') }}]

        div(v-if="tradePlans.length > 0" @click="getElement()")
            div(class="d-flex" v-if="fromChart")
                span(v-if="today <= tradePlanLatestExpires.entry_date && bellActive"  style="width: 90px;")
                    v-icon $bellActive
                    span(class="green1--text ml-4") {{ riskRatio }}

                span(v-else-if="today > tradePlanLatestExpires.entry_date" style="position: relative;")
                    v-tooltip(bottom)
                        template(v-slot:activator="{ on, attrs }")
                            div(v-bind="attrs" v-on="on" style="padding-bottom: 14px;")
                                span(style="position: absolute;width: 90px;")
                                    v-icon $bellExpired
                                    span(class="green1--text ml-4") {{ riskRatio }}
                        span {{ $t('date_expired') }}

                span(v-else-if="targetPriceFired || entryPriceFired || stoplossPriceFired"  style="width: 90px;")
                    v-icon $bellAlarm
                    span(class="green1--text ml-4") {{ riskRatio }}

                span(v-else-if="bellInactive"  style="width: 90px;")
                    v-icon $bellExpired
                    span(class="ml-4") {{ riskRatio }}

        div(v-else @click="getElement()")
            div(class="d-flex" style="position: relative;")
                v-tooltip(bottom)
                    template(v-slot:activator="{ on, attrs }")
                        div(v-bind="attrs" v-on="on" style="padding-bottom: 14px;")
                            span(style="position: absolute;width: 60px;")
                                v-icon $bellNotAdded
                    span {{ $t('create_new_trade_plan') }}

        div(v-if="showDropDown" :style="`top:${$parent.posY}px; left:${$parent.posX}px;`" ref="tradePlanPopupContainer" class="dropDown ma-0 table" style="width:auto;")
            div(class="d-flex ml-2 mt-2 mb-5" style="font-weight: 900; justify-content: space-between;")
                div(@mousedown="dragging=true, setPosition($event)" @mouseup="dragging=false" @mousemove="popupPositioning($event)" ref="tradePlanDrag" class="ml-2" style="width:100%; cursor:pointer;") {{ $t('trade_plan') }}
                    span(class="ml-4" style="color:#6EC8A0;") {{ stock.ticker }}
                    v-icon(v-if="today <= tradePlanLatestExpires.entry_date && bellActive" class="ml-5") $bellActive
                    v-icon(v-else-if="today > tradePlanLatestExpires.entry_date" class="ml-5") $bellExpired
                    v-icon(v-else-if="targetPriceFired || entryPriceFired || stoplossPriceFired" class="ml-5") $bellAlarm
                    v-icon(v-else-if="bellInactive" class="ml-5") $bellExpired
                v-icon(class="cursor-pointer" style="margin-right:20px; margin-top:-10px;" @click="temporarilyHideTradePlanChart") mdi-close

            div(class="my-0 mx-5 pr-0 drop-down-chart" v-if="page !== 'main'")
                ChartPrice(v-if="showPriceChart" :stock_id='stock.stock_id' :company_id='stock.company_id' :width="500" :height="380" :toolbar="false" :legendView="false" :single="true" ref="chartPrice" page="dropdown")

            div(class="grid-container")
                label
                    span(class="p-1")
                
                label
                    span {{ $t('trade_plan_target_price') }}
                input(type="text" v-model="targetPrice" @keyup="checkEqualValue")

                label
                    span {{ $t('trade_plan_entry_price') }}
                input(type="text" v-model="entryPrice" @keyup="checkEqualValue")

                label
                    span {{ $t('trade_plan_stoploss_price') }}
                input(type="text" v-model="stoplossPrice" @keyup="checkEqualValue")

                label
                    span {{ $t('active_between') }}
                div(class="wider")
                    input(type="date" v-model="exitDate" @keyup="checkEqualValue" style="width:150px;")
                    span(class="mx-2") -
                    input(type="date" v-model="entryDate" @keyup="checkEqualValue" style="width:150px;")
                span(v-if="today > tradePlanLatestExpires.entry_date && !targetPriceFired && !entryPriceFired && !stoplossPriceFired" class="py-0 warning-message" style="font-size:0.95em; position:absolute; top:203px;") {{ $t('plan_has_expired') }}

                div(class="grid-subsection")
                    div(v-if="!targetPriceFired && !entryPriceFired && !stoplossPriceFired")
                        div(class="risk-return-label blue3--text mb-2") {{ $t('risk_return_ratio') }}
                        div(class="risk-return-value" )
                            span(class="blue3--text mr-4") 1/{{ riskRatio }}

                    div(v-else class="post-it-alert")
                        div(v-if="targetPriceFired") {{ $t('target_price_met') }}.
                        div(v-if="entryPriceFired") {{ $t('entry_price_met') }}.
                        div(v-if="stoplossPriceFired") {{ $t('stoploss_price_met') }}.
                        div {{ $t('email_alerts_silenced') }}.
                        v-btn(@click="reEnableEmail(true)" small color="second") {{ $t('enable_email_alerts') }}

                label
                    span(class="mr-4" style="float:left;") {{ $t('emails') }}
                    v-switch(v-model="isEmail" color="green")

            div(class="footer-button-group d-flex pt-5")
                v-btn(v-if="tradePlans.length > 0" outlined large class="grey lighten-3" style="width:130px; border:1px solid !important;" @click="tradePlans.length > 0 ? deleteChart() : ''")
                    span {{ $t('Delete') }}

                v-btn(v-else outlined large disabled class="grey lighten-3" style="width:130px; border:1px solid !important;")
                    span {{ $t('Delete') }}

                v-btn(depressed small large class="blue2 white--text" style="width:130px;" @click="click_chartView_btn")
                    span {{ $t('chart_view') }}

                v-btn(depressed small large class="blue2 white--text" style="width:130px;" :disabled="tradePlans.length > 0 ? !checkEqual : false" @click="saveTradePlan()")
                    span {{ $t('Save') }}
</template>

<script>
import apiService from '@/Services/ApiService.js';
import moment from 'moment';
import _ from 'lodash';

export default {
    name: 'DropDownTradePlans',
    components: {
        ChartPrice: () => import("@/components/ChartPrice"),
    },
    props: {
        // stock: Object,
        // ticker: {
        //     type: String,
        //     default: ""
        // },
        // page: String,
    },
    data: function() {
        return {
            stock_id: null,
            stock: null,
            targetPrice: "",
            entryPrice: "",
            stoplossPrice: "",
            entryDate: "",
            exitDate: "",
            newNote: "",
            showDropDown: false,
            fromChart: true,
            dragging: false,
            relativeX: 0,
            saved_flag: false,
            showPriceChart: true,
            checkEqual: false
        }
    },
    mounted() {
        if (this.params) {
            this.stock_id = this.params.data.stock_id;
            this.stock = this.params.data;
        }
        window.addEventListener('mouseup', this.stopDragging);

        this.getTradePlanIfExistsOtherwiseOwnValues();
    },

    methods: {
        updatePriceChart() {
            if(this.tradePlans.length === 0) {
                const user_id = this.user.user_id;
                const stock_id = this.stock_id;
                const target_price = (this.stock.price_today * 1.1).toFixed(2);
                const entry_price = (this.stock.price_today * 1).toFixed(2);
                const stoploss_price = (this.stock.price_today * 0.9).toFixed(2);
                const entry_date = moment(new Date().toISOString().slice(0,10)).valueOf();
                const exit_date = moment(entry_date).add(30, 'day').valueOf();
                const target_alert_status = 'on';
                const entry_alert_status = 'on';
                const stoploss_alert_status = 'on';
                const long = true;

                const tradePlanObject = [{
                    stock_id,
                    user_id,
                    entry_date,
                    exit_date,
                    target_price,
                    entry_price,
                    stoploss_price,
                    target_alert_status,
                    entry_alert_status,
                    stoploss_alert_status,
                    long
                }];

                console.log(tradePlanObject);

                this.$refs.chartPrice.updateChart(tradePlanObject);
            }
        },
        async checkEqualValue() {
            const tradePlans = (await apiService.getTradePlans(this.user.user_id)).filter((item) => item.stock_id === this.stock.stock_id);

            if(tradePlans.length > 0) {
                const targetPriceFromDatabase = tradePlans[0].target_price.toFixed(2);
                const entryPriceFromDatabase = tradePlans[0].entry_price.toFixed(2);
                const stoplossPriceFromDatabase = tradePlans[0].stoploss_price.toFixed(2);
                const entryDateFromDatabase = moment(parseInt(tradePlans[0].entry_date)).format('YYYY-MM-DD');
                const exitDateFromDatabase = moment(parseInt(tradePlans[0].exit_date)).format('YYYY-MM-DD');

                if(
                    targetPriceFromDatabase === this.targetPrice &&
                    entryPriceFromDatabase === this.entryPrice &&
                    stoplossPriceFromDatabase === this.stoplossPrice &&
                    entryDateFromDatabase === this.entryDate &&
                    exitDateFromDatabase === this.exitDate
                ) {
                    this.checkEqual = false;
                } else {
                    this.checkEqual = true;
                }
            } else {
                this.checkEqual = true;
            }
        },
        async updateTradePlans() {
            let tradePlans = await apiService.getTradePlans(this.user.user_id);

            tradePlans.forEach((item) => {
                item.target_price = item.target_price === null ? 0 : item.target_price.toFixed(2);
                item.entry_price = item.entry_price === null ? 0 : item.entry_price.toFixed(2);
                item.stoploss_price = item.stoploss_price === null ? 0 : item.stoploss_price.toFixed(2);
            });

            this.$store.commit("setUserTradePlans", tradePlans);

            this.getTradePlanIfExistsOtherwiseOwnValues();
        },
        getTradePlanIfExistsOtherwiseOwnValues() {
            if(this.tradePlans.length > 0) {
                this.targetPrice = (this.tradePlanLatestExpires) ? Number(this.tradePlanLatestExpires.target_price).toFixed(2): 0;
                this.entryPrice = (this.tradePlanLatestExpires) ? Number(this.tradePlanLatestExpires.entry_price).toFixed(2): 0;
                this.stoplossPrice = (this.tradePlanLatestExpires) ? Number(this.tradePlanLatestExpires.stoploss_price).toFixed(2): 0;
                this.entryDate = (this.tradePlanLatestExpires) ? this.convertEpochEntryDateToRegularDate: 0;
                this.exitDate = (this.tradePlanLatestExpires) ? this.convertEpochExitDateToRegularDate: 0;
            } else {
                const dateNow = new Date().toISOString().slice(0,10);
                const dateTwoWeeksLater = moment(dateNow).add(30, 'day').format('YYYY-MM-DD');

                const targetPrice = (this.stock.price_today * 1.1).toFixed(2);
                const entryPrice = (this.stock.price_today * 1).toFixed(2);
                const stoplossPrice = (this.stock.price_today * 0.9).toFixed(2);
                const exitDate = dateNow;
                const entryDate = dateTwoWeeksLater;

                this.targetPrice = targetPrice;
                this.entryPrice = entryPrice;
                this.stoplossPrice = stoplossPrice;
                this.entryDate = entryDate;
                this.exitDate = exitDate;
            }
        },
        delayShowPriceChart() {
            setTimeout(() => {
                this.showPriceChart = true;

                this.updatePriceChart();
            }, 50);
        },
        temporarilyHideTradePlanChart() {
            this.showPriceChart = false;
            this.showDropDown = false;
        },
        async upsertTradePlans() {
            let userTradePlanObject = {
                user_id: this.user.user_id,
                stock_id: this.stock_id,
                entry_price: parseFloat(this.entryPrice),
                stoploss_price: parseFloat(this.stoplossPrice),
                target_price: parseFloat(this.targetPrice),
                entry_date: new Date(this.entryDate).getTime(),
                exit_date: new Date(this.exitDate).getTime(),
                long: true,
                stoploss_alert_status: this.tradePlanLatestExpires.stoploss_alert_status,
                target_alert_status: this.tradePlanLatestExpires.target_alert_status,
                entry_alert_status: this.tradePlanLatestExpires.entry_alert_status
            };

            if(this.tradePlans.length === 0) {
                await apiService.insertUserTradePlan(userTradePlanObject);
            } else {
                userTradePlanObject.trade_plan_id = this.tradePlanLatestExpires.trade_plan_id;
                delete userTradePlanObject.user_id;
                delete userTradePlanObject.stock_id;
                delete userTradePlanObject.long;

                await apiService.updateTradePlan(userTradePlanObject);
            }

            let tradePlans = await apiService.getTradePlans(this.user.user_id);

            tradePlans.forEach((item) => {
                item.target_price = item.target_price === null ? 0 : item.target_price.toFixed(2);
                item.entry_price = item.entry_price === null ? 0 : item.entry_price.toFixed(2);
                item.stoploss_price = item.stoploss_price === null ? 0 : item.stoploss_price.toFixed(2);
            });

            this.$store.commit("setUserTradePlans", tradePlans);

            this.entryPrice = parseFloat(this.entryPrice).toFixed(2);
            this.stoplossPrice = parseFloat(this.stoplossPrice).toFixed(2);
            this.targetPrice = parseFloat(this.targetPrice).toFixed(2);

            await this.checkEqualValue();

            this.checkEqual = false;
        },
        async saveTradePlan() {
            await this.upsertTradePlans();
            this.$refs.chartPrice.updateChart();
        },
        stopDragging() {
            this.dragging = false;
        },
        setPosition(event) {
            const tradePlanDragElement = this.$refs.tradePlanDrag;
            const tradePlanRect = tradePlanDragElement.getBoundingClientRect();
            this.relativeX = event.clientX - tradePlanRect.left;
        },
        popupPositioning(event) {
            if(this.dragging) {
                const tradePlanPopupContainerElement = this.$refs.tradePlanPopupContainer;

                tradePlanPopupContainerElement.style.top = (event.clientY - 30) + 'px';
                tradePlanPopupContainerElement.style.left = (event.clientX - (this.relativeX + 13)) + 'px';

                this.$parent.posY = event.clientY - 30;
                this.$parent.posX = event.clientX - (this.relativeX + 13);
            }
        },
        getElement() {
            const parentElement = this.$parent.$el;
            const parentRect = parentElement.getBoundingClientRect();
            const parentLeft = parentRect.left;
            const parentRight = parentRect.right;
            const parentTop = parentRect.top;
            const parentCenter = (parentRight - parentLeft) / 2;

            if(this.$parent.posX === 0 && this.$parent.posY === 0) {
                this.$parent.posX = parentCenter;
                this.$parent.posY = parentTop;
            }
        },
        async deleteChart() {
            await apiService.deleteUserTradePlan({
                trade_plan_id: this.tradePlanLatestExpires.trade_plan_id
            });

            await this.updateTradePlans();

            this.updatePriceChart();
        },
        async close(e) {
            if (!this.$el.contains(e.target)) {
                this.showDropDown = false;
            }
        },
        async click_chartView_btn() {
            await this.upsertTradePlans();

            this.$router.push({name: 'landing-page.stock-detail', params: {stock_id: this.stock_id}, query: {tab: 2}});
        },
        async reEnableEmail(value) {
            const status = value ? 'on' : 'off';

            const tradePlan = this.tradePlanLatestExpires;

            if(tradePlan.trade_plan_id) {
                const trade_plan_id = tradePlan.trade_plan_id;
                const oldData = this.$store.getters["userTradePlans"];
                const index = oldData.findIndex((item) => item.trade_plan_id === trade_plan_id);

                oldData[index].target_alert_status = status;
                oldData[index].entry_alert_status = status;
                oldData[index].stoploss_alert_status = status;

                this.$store.commit("setUserTradePlans", oldData);
                await apiService.updateTradePlan({trade_plan_id, target_alert_status: status});
                await apiService.updateTradePlan({trade_plan_id, entry_alert_status: status});
                await apiService.updateTradePlan({trade_plan_id, stoploss_alert_status: status});
            } else {
                tradePlan.target_alert_status = status;
                tradePlan.entry_alert_status = status;
                tradePlan.stoploss_alert_status = status;
            }
        }
    },

    computed: {
        convertEpochEntryDateToRegularDate() {
            const date = new Date(parseInt(this.tradePlanLatestExpires.entry_date));
            return date.toISOString().substring(0,10);
        },
        convertEpochExitDateToRegularDate() {
            const date = new Date(parseInt(this.tradePlanLatestExpires.exit_date));
            return date.toISOString().substring(0,10);
        },
        riskRatio() {
            return Math.round((this.tradePlanLatestExpires.target_price - this.tradePlanLatestExpires.entry_price) * 10 / (this.tradePlanLatestExpires.entry_price - this.tradePlanLatestExpires.stoploss_price)) / 10;
        },
        /*riskRatioText() {  // switched off for now.
            const lookup = [
                {low: 0,  text: 'more risk than return'},
                {low: 0.90, text: '50 / 50 bet'},
                {low: 1.20, text: 'better than a coin flip'},
                {low: 1.30, text: 'poor'},
                {low: 1.50, text: 'wait for a better entry?'},
                {low: 2.00, text: 'not a great setup'},
                {low: 2.40, text: 'not a strong plan'},
                {low: 2.60, text: 'fair '},
                {low: 2.80, text: 'looking good'},
                {low: 3.40, text: 'excellent 3:1 ratio '},
                {low: 3.80, text: 'very strong'},
                {low: 4.20, text: '4 bagger ! '},
            ] ;

            return lookup.reduce( (final, x) => {
                    if (x.low <= this.riskRatio) {
                        final =  x.text;
                    }
                    return final;
                }, '-'
            );
        },
            */

        tradePlanLatestExpires() {
            // Do this if getting values from the trade plan
            // that has the latest entry_date
            const tradePlans = _.orderBy(this.tradePlans, ['entry_date'], ['desc']);

            const dateNow = new Date().toISOString().slice(0,10);
            const dateTwoWeeksLater = moment(dateNow).add(14, 'day').format('YYYY-MM-DD');

            const targetPrice = (this.stock.price_today * 1.1).toFixed(2);
            const entryPrice = (this.stock.price_today * 1).toFixed(2);
            const stoplossPrice = (this.stock.price_today * 0.9).toFixed(2);
            const exitDate = dateNow;
            const entryDate = dateTwoWeeksLater;

            const tradePlanObject = {
                user_id: this.user.user_id,
                stock_id: this.stock.stock_id,
                entry_date: entryDate,
                exit_date: exitDate,
                long: true,
                target_price: targetPrice,
                entry_price: entryPrice,
                stoploss_price: stoplossPrice,
                stoploss_alert_status: 'on',
                entry_alert_status: 'on',
                target_alert_status: 'on'
            };

            return  (tradePlans.length > 0) ? tradePlans[0] : tradePlanObject;
        },
        tradePlans() {
            return this.$store.getters["userTradePlans"].filter((item) => item.stock_id === this.stock_id && item.user_id === this.user.user_id);
        },
        targetPriceFired() {
            return this.tradePlanLatestExpires.target_alert_status === 'fired';
        },
        entryPriceFired() {
            return this.tradePlanLatestExpires.entry_alert_status === 'fired';
        },
        stoplossPriceFired() {
            return this.tradePlanLatestExpires.stoploss_alert_status === 'fired';
        },
        user() {
            return JSON.parse(localStorage.getItem('user'));
        },
        isEmail: {
            get() {
                return this.tradePlanLatestExpires.target_alert_status === 'on' && this.tradePlanLatestExpires.entry_alert_status === 'on' && this.tradePlanLatestExpires.stoploss_alert_status === 'on';
            },
            set(value) {
                this.reEnableEmail(value);
            }
        },
        today() {
            return new Date().getTime();
        },
        isEmpty: function () {
            return this.models === null;
        },
        bellInactive() {
            return this.tradePlanLatestExpires.target_alert_status === 'off' && this.tradePlanLatestExpires.entry_alert_status === 'off' && this.tradePlanLatestExpires.stoploss_alert_status === 'off';
        },
        bellActive() {
            return this.tradePlanLatestExpires.target_alert_status === 'on' && this.tradePlanLatestExpires.entry_alert_status === 'on' && this.tradePlanLatestExpires.stoploss_alert_status === 'on';
        },
        models:   {
            get() {
                // TODO: get from  VUEX
                return [{
                    trade_plan_id: 1,
                    user_id: this.user.user_id,
                    stock_id: this.stock_id,
                    entry_price: 10,
                    entry_alert: 'on',
                    target_price: 11,
                    target_alert: 'on',
                    stoploss_price: 14,
                    stoploss_alert: 'on',
                },
                    {
                        trade_plan_id: 2,
                        user_id: this.user.user_id,
                        stock_id: this.stock_id,
                        entry_price: 10,
                        entry_alert: 'on',
                        target_price: 11,
                        target_alert: 'on',
                        stoploss_price: 14,
                        stoploss_alert: 'on',
                    }]
            },
            set() {
            }
        }
    },
    created() {
        window.addEventListener('click', this.close);
    },
    beforeDestroy() {
        window.removeEventListener('click', this.close);
        window.removeEventListener('mouseup', this.stopDragging);
    },
}
</script>

<style >
.drop-down-chart #trading-vue-js{
    margin: auto;
}
</style>

<style scoped>
* {
    margin: 0;
    box-sizing: border-box;
}

.overlay {
    background: rgba(0,0,0,0.4);
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 10;
}

.setIgnore {
    position: absolute; 
    top: 50%; 
    left: 50%; 
    transform: translate(-50%, -50%);
    z-index:20;
    background-color: #fff4cc;
    border: 2px solid #edc18d;
    border-radius: 5px;
    padding: 50px;
    width: 480px;
    box-shadow: 5px 10px 6px #888888;
}

.setIgnore .btn-list { 
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 30px;
}

.setIgnore .btn-list .set-ignore-btn {
    border: 1px solid black;
}

body {
    font-family: "Helvetica Neue";
    background: #fafafa;
    padding: 10rem;
}

@media (max-width: 480px) {
    body {
        padding: 0;
    }
}

.dropDown {
    z-index: 10;
    position: fixed;
    background: #F9FAFB;
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 5px 0 0 0 ;
    margin: 20px 0 0 40px;
    min-width: 440px;
    box-shadow: 10px 13px 48px -4px rgba(0,0,0,0.49);
    overflow-y: visible;
    cursor: default;
    top:158px;
    left: 733px;
    -webkit-overflow-scrolling: touch;  /* what is this ? */
}

.emptyNote{
    opacity: 0;
}

.emptyNote:hover{
    color: #117a8b;
    opacity: 1;
}

.v-btn--round:hover {
    background-color: #E5F0F6 !important;
}

>>> .set-bell-not-added-color {
    fill: #081016;
}

>>> .set-bell-active-color {
    fill: #009973;
}

>>> .set-bell-expired-color {
    fill: #8b9daf;
}

>>> .set-bell-alarm-color {
    fill: #E83068;
}

>>> .set-bell-not-added-color {
    fill: #d1d0d0;
}

.grid-container {
    padding:0 30px;
    display: grid;
    gap:10px;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: repeat(6, 15% );
}

.grid-subsection {
    grid-row: 2/5;
    grid-column: 3/5;
    text-align: center;
}

label {
    grid-column: 1/2;
}

v-switch,input {
    grid-column: 2/3;
    width: 100px;
    height: 1.7rem;
    border: 1px solid #bbbbbb;
    border-radius: 3px;
    text-align: center;
}

.wider {
    grid-column: 2/5;
}

span.warning-message {
    grid-column: 1/3;
    color: red;
}

label span {
    font-weight: 900;
}

.post-it-alert {
    background-color:#FFF4CC;
    border: 1px solid #EDC18D;
    box-shadow: grey 2px 2px 10px;
}

.post-it-alert button{
    text-transform: capitalize;
    margin-left: 50px;
}

.risk-return-label {
    width: 180px;
    text-align: right;
    font-size: 16px;
    font-weight: 900;
}

.risk-return-value {
    font-size: 32px;
    font-weight: 900;
    text-align: center;
}

.footer-button-group {
    margin:20px !important;
    justify-content: space-between;
}
</style>
