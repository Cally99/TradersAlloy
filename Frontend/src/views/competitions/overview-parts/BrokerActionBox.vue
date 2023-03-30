<template lang="pug">
    div
        h4 Stock
        StockSelector(@setStock="setStock" :parentStock="selectedStock")
        div(v-if="selectedStock")
            v-row(noGutters)
                v-col(cols="12")
                    span(class="title mb-1") {{$t('price')}}:
                    span(v-if="selectedStock.currency_trade === 'SEK'" class="text") {{selectedStock.price_today.toFixed(2)}} {{selectedStock.currency_trade}}
                    span(v-else class="text") {{selectedStock.price_today.toFixed(2)}} {{selectedStock.currency_trade}} = {{getConvertedPrice.toFixed(2)}} SEK

                v-col(v-if="action === 'SELL'" cols="12")
                    span(class="title mb-1") {{$t('in_my_positions')}}:
                    span(class="text") {{getNumberOfOwnedStock(user_account_id, selectedStock.stock_id)}}

                v-col(cols="12")
                    div
                        p(class="title") {{$t('quantity')}}
                        v-text-field(label="Quantity" type="number" dense solo v-model="quantity")

                v-col(cols="12")
                    div
                        p(class="title") {{action === 'SELL' ? $t('total_sell_price') : $t('total_buy_price')}}
                        v-text-field(
                            :value="(getConvertedPrice * quantity).toFixed(2)"
                            suffix="SEK"
                            type="number"
                            dense
                            solo
                            disabled
                        )
                        // p(v-show="selectedStock.currency_trade !== 'SEK'") {{rate }}
                v-col(cols="12")
                    v-btn(
                        color="blue3"
                        class="white--text"
                        @click="submitOrder()"
                        :disabled="disabledOrderBtn(action)"
                    ) {{action === 'SELL' ? $t('submit_sell_order') : $t('submit_buy_order')}}

</template>

<script>
import StockSelector from "./StockSelector";
import {mapActions, mapGetters} from "vuex";
import _ from "lodash";

export default {
    name: "BrokerActionBox",
    components: {
        StockSelector,
    },
    props: ["action", "user_id", "user_account_id"],
    data() {
        return {
            selectedStock: null,
            quantity: null,
            exchangeRate: [],
        };
    },
    computed: {
        ...mapGetters([
            "getUserTrades",
            "getTx",
            "getNumberOfOwnedStock",
            "getAllStocks",
            "getExchangeRates",
            "getUserAccounts",
            "getExchangeRates"
        ]),
        getConvertedPrice() {
            if(this.selectedStock.currency_trade !== 'SEK') {
                const currency = this.selectedStock.currency_trade;
                const exchange = this.getExchangeRates.find((e) => e.symbol === currency);
                const rate = exchange.rate;
                const convertedPrice = this.selectedStock.price_today / rate;

                return convertedPrice;
            } else {
                return this.selectedStock.price_today;
            }
        },
        competition_id() {
            return (this.$route.params.competition_id !== undefined) ? Number(this.$route.params.competition_id) : -1;
        },
        competition_user_account_id() {
            return this.competition_id !== -1 ? this.getUserAccounts.find((a) => a.competition_id === this.competition_id).user_account_id : -1;
        },
        exchangeRates() {
            return this.getExchangeRates;
        },
        rate() {
            console.table(this.exchangeRates);
            return 0.9; //this.exchangeRates.find( x => x.symbol === this.selectedStock.currency_trade).rate;
        },
        getCompetitionAccount() {
            return this.getUserAccounts.find((a) => a.user_account_id === this.competition_user_account_id);
        },
        disabledOrderBtn: (state) => (action) => {
            if (action === "SELL") {
                if (
                    !state.selectedStock.price_today ||
                    !state.quantity ||
                    state.quantity <= 0 ||
                    state.getNumberOfOwnedStock(
                        state.user_account_id,
                        state.selectedStock.stock_id
                    ) < state.quantity
                ) {
                    return true;
                } else {
                    return false;
                }
            }
            if (action === "BUY") {
                if (
                    !state.selectedStock.price_today ||
                    !state.quantity ||
                    state.quantity <= 0
                ) {
                    return true;
                } else {
                    return false;
                }
            }
        },
    },
    methods: {
        ...mapActions(["saveOneTx", "saveTx", "loadTrades", "updateUserAccountOnUserObject"]),
        setStock(stock) {
            this.selectedStock = stock;
            this.quantity = null;
        },
        async submitOrder() {
            const amount = this.getConvertedPrice * this.quantity;
            const qty = this.quantity;

            const finalAmmount = (this.action === "BUY") ? -amount : amount;
            const finalQty = (this.action === "BUY") ? qty : -qty;

            const payMoreThanHaveCheck = this.getCompetitionAccount.cash + finalAmmount;

            if(payMoreThanHaveCheck < 0) {
                this.$store.commit("setMessage", {
                    text: "To much money",
                    type: "error"
                });

                return null;
            }

            const transaction = {
                user_id: this.user_id,
                stock_id: this.selectedStock.stock_id,
                isin: this.selectedStock.isin,
                price: this.selectedStock.price_today,
                tx_type: this.action,
                tx_date: new Date().toISOString().substring(0, 10),
                qty: finalQty,
                amount: finalAmmount,
                user_account_id: this.user_account_id,
                currency: this.selectedStock.currency_trade,
                exchange_rate: 1,
                commission: 0,
            };

            await this.saveOneTx(transaction);

            let account = this.getCompetitionAccount;

            if(this.action === "SELL") {
                account.cash += amount;
            } else {
                account.cash -= amount;
            }

            await this.updateUserAccountOnUserObject(account);

            const ticker = this.getAllStocks.find((s) => s.stock_id === transaction.stock_id).ticker;

            const reconstructedTrades = this.getTx.filter((t) => {
                if(t.stock_id === transaction.stock_id) {
                    t.ticker = ticker;

                    return t;
                }
            });

            const updateData = this.reconstructUserTrades(reconstructedTrades);

            const user_id = this.user_id;
            const stock_ids = [transaction.stock_id];
            const txs = [];
            const uts = updateData;

            const userTxAndTradeObject = {
                user_id,
                stock_ids,
                txs,
                uts
            };

            await this.saveTx(userTxAndTradeObject);
            await this.loadTrades(user_id);

            this.selectedStock = null;
            this.quantity = null;
        },
        reconstructUserTrades(stocks) {
            let updatedStocks = JSON.parse(JSON.stringify(stocks));

            // console.log(updatedStocks);

            let updatedStocksBuy = updatedStocks.filter((item) => {
                if(item.tx_type === 'BUY') {
                    item.qty_check = item.qty;
                    return item;
                }
            });

            // console.log(updatedStocksBuy);

            let updatedStocksSell = updatedStocks.filter((item) => {
                if(item.tx_type === 'SELL') {
                    item.qty_check = item.qty;
                    return item;
                }
            });

            // console.log(updatedStocksSell);

            updatedStocksBuy = _.orderBy(updatedStocksBuy, ["tx_date"], ["asc"]);
            updatedStocksSell = _.orderBy(updatedStocksSell, ["tx_date"], ["asc"]);

            // console.log(updatedStocksBuy);
            // console.log(updatedStocksSell);

            let insertToUserTradeTable = [];
            let leftOfBuy = undefined;

            for(const buy of updatedStocksBuy) {
                for(const sell of updatedStocksSell) {
                    if(buy.tx_date <= sell.tx_date) {
                        if(buy.qty >= -sell.qty && -sell.qty > 0) {
                            insertToUserTradeTable.push({
                                user_id: buy.user_id,
                                stock_id: buy.stock_id,
                                ticker: buy.ticker,
                                instrument_type: 'stock',
                                entry_price: buy.price,
                                entry_date: buy.tx_date,
                                entry_qty: -sell.qty,
                                exit_price: sell.price,
                                exit_date: sell.tx_date,
                                exit_qty: -sell.qty,
                                entry_commission: buy.commission,
                                exit_commission: sell.commission,
                                pnl: 0,
                                notes: '',
                                user_account_id: sell.user_account_id
                            });

                            buy.qty += sell.qty;
                            sell.qty = 0;

                            if(buy.qty > 0) {
                                leftOfBuy = {
                                    user_id: buy.user_id,
                                    stock_id: buy.stock_id,
                                    ticker: buy.ticker,
                                    instrument_type: 'stock',
                                    entry_price: buy.price,
                                    entry_date: buy.tx_date,
                                    entry_qty: buy.qty,
                                    exit_price: buy.price,
                                    exit_date: null,
                                    exit_qty: null,
                                    entry_commission: buy.commission,
                                    exit_commission: null,
                                    pnl: 0,
                                    notes: '',
                                    user_account_id: buy.user_account_id
                                };
                            }
                        } else if(buy.qty < -sell.qty && buy.qty > 0) {
                            sell.qty += buy.qty;
                            insertToUserTradeTable.push({
                                user_id: buy.user_id,
                                stock_id: buy.stock_id,
                                ticker: buy.ticker,
                                instrument_type: 'stock',
                                entry_price: buy.price,
                                entry_date: buy.tx_date,
                                entry_qty: buy.qty,
                                exit_price: sell.price,
                                exit_date: sell.tx_date,
                                exit_qty: buy.qty,
                                entry_commission: buy.commission,
                                exit_commission: sell.commission,
                                pnl: 0,
                                notes: '',
                                user_account_id: sell.user_account_id
                            });
                            leftOfBuy = undefined;
                            buy.qty = 0;
                        }
                    }
                }
            }

            if(leftOfBuy !== undefined) {
                insertToUserTradeTable.push(leftOfBuy);
            }

            const buyWithNoSellDateAbove = updatedStocksBuy.filter((buy) => buy.qty === buy.qty_check);

            for(const buy of buyWithNoSellDateAbove) {
                insertToUserTradeTable.push({
                    user_id: buy.user_id,
                    stock_id: buy.stock_id,
                    ticker: buy.ticker,
                    instrument_type: 'stock',
                    entry_price: buy.price,
                    entry_date: buy.tx_date,
                    entry_qty: buy.qty,
                    exit_price: buy.price,
                    exit_date: null,
                    exit_qty: null,
                    entry_commission: buy.commission,
                    exit_commission: null,
                    pnl: 0,
                    notes: '',
                    user_account_id: buy.user_account_id
                });
            }

            // console.log(leftOfBuy);

            const checkQuantity = _.sumBy(updatedStocks, (x) => x.qty);

            insertToUserTradeTable = insertToUserTradeTable.filter((item) => {
                if(!(checkQuantity === 0 && item.exit_qty === null)) {
                    return item;
                }
            });

            // console.log(insertToUserTradeTable);

            return insertToUserTradeTable;
        }
    }
};
</script>

<style scoped>
.title {
    font-weight: 700 !important;
    margin: 0;
}

.text {
    font-size: 1.2rem !important;
}
</style>
