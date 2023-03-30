<template lang="pug">
    div
        div(style="background-color:#325D85; height:40px;")
            span(style="color:white; font-size:18px; margin:30px; vertical-align: text-top;") Access my data on Avanza
        div(style="padding:20px; background-color:white; display: grid;")
            span(style="") Step 1. Login to Avanza
            span(style="") Step 2. Export transactions from 2020-01-01 to present
            span() Step 3. Import
        div(style="border: 0px solid black; background-color:white; display:grid")
            div(class="place-block-beside mr-1" style="text-align:right; padding-right:30px;")
                input(type="file" @change="onFileChange" size="10" id="csv-upload" class="mt-2" accept=".csv" style="width:80%")
            div
                span(class="blue1 cursor-pointer" style="color:white; border-radius: 5px; padding: 10px 20px; margin:30px; float: right;" @click="clickUploadBtn") Import Transactions


    //- div(style="max-width:1200px")
        v-row(justify="center" style="background-color: white;")
            v-container( style="width:800px;")
                v-row
                    v-col(style="border: 0px solid black;")
                        div(style="border: 0px solid black;")
                            div(class="place-block-beside mr-7")
                                img(src="/images/avanza_upload.png")
                            div(class="place-block-beside mr-1")
                                input(type="file" @change="onFileChange" size="10" id="csv-upload" class="mt-2" accept=".csv")
                            div
                                v-btn(@click="clickUploadBtn" color="#408df2" class="white--text mt-1") Upload

        v-row(justify="center" style="background-color: white;")
            v-sheet(
                class="mt-2"
            )
                v-container(class="pl-5 pt-2")
                    v-row(class="pb-5")
                        v-col(:style="!check_if_uploaded ? 'color: lightgray;' : ''" md="12") From your upload were found {{ totalNumberOfTransactionsUploaded }} transactions.
                        v-col(:style="!check_if_uploaded ? 'color: lightgray;' : ''" md="12") Number of transactions already inserted {{ number_of_ignored_transactions }}.
                        v-col(:style="!check_if_uploaded ? 'color: lightgray;' : ''" md="12") Number of new transactions found {{ number_of_transactions_not_inserted_yet }}.
                    v-row
                        v-col(:style="!check_if_uploaded ? 'color: lightgray;' : ''" md="9") Infer from the transactions all the completed BUY and SELL pairs?
                        v-col(md="3" class="text-right")
                            v-btn(@click="clickedCompletedBuyAndSellPairsBtn" :style="!buy_and_sell_pairs_yes && check_if_uploaded ? 'height: 30px;width: 100px;background-color: #ffc107;color: red;border: 1px solid red;' : 'height: 30px;width: 100px;background: #C0C3C5;color: white;'" :disabled="buy_and_sell_pairs_yes || !check_if_uploaded") Yes
                    v-row(class="pb-5")
                        v-col(md="9" class="blue-text")
                            span(v-if="buy_and_sell_pairs_edit" :style="!check_if_uploaded ? 'color: lightgray;' : ''") {{ transactionsCompletedBuyAndSellPairsAmount }} completed trades and {{ dividendAmount }} dividend payments
                        v-col(md="3" class="text-right")
                            v-btn(@click="updateAllCompletedBuyAndSellPairs" :style="buy_and_sell_pairs_edit ? 'height: 30px;background: #408df2;color: white;' : 'height: 30px;background: #C0C3C5;color: white;'" :disabled="!buy_and_sell_pairs_edit") Edit
                    v-row
                        v-col(:style="!check_if_uploaded ? 'color: lightgray;' : ''" md="9") Sum all the Deposits and Withdrawals?
                        v-col(md="3" class="text-right")
                            v-btn(@click="clickedSumDepositsAndWithdrawalsBtn" :style="deposits_and_withdrawals_yes ? 'height: 30px;width: 100px;background-color: #ffc107;color: red;border: 1px solid red;' : 'height: 30px;width: 100px;background: #C0C3C5;color: white;'" :disabled="!deposits_and_withdrawals_yes") Yes
                    v-row(class="pb-5")
                        v-col(md="9" class="blue-text")
                            span(v-if="deposits_and_withdrawals_edit" :style="!check_if_uploaded ? 'color: lightgray;' : ''") {{ sumDeposit }} SEK of Deposits and {{ sumWithdraw }} SEK of Withdrawals
                        v-col(md="3" class="text-right")
                            v-btn(@click="updateHeaderNameInWithdrawalsAndDeposites" :style="deposits_and_withdrawals_edit ? 'height: 30px;background: #408df2;color: white;' : 'height: 30px;background: #C0C3C5;color: white;'" :disabled="!deposits_and_withdrawals_edit") Edit
                    v-row
                        v-col(:style="!check_if_uploaded ? 'color: lightgray;' : ''" md="9") Identify all the open positions that are current?
                        v-col(md="3" class="text-right")
                            v-btn(@click="clickedIdentifyAllTheOpenPositionsThatAreCurrentBtn" :style="positions_that_are_current_yes ? 'height: 30px;width: 100px;background-color: #ffc107;color: red;border: 1px solid red;' : 'height: 30px;width: 100px;background: #C0C3C5;color: white;'" :disabled="!positions_that_are_current_yes") Yes
                    v-row(class="pb-5")
                        v-col(md="9" class="blue-text")
                            span(v-if="positions_that_are_current_edit" :style="!check_if_uploaded ? 'color: lightgray;' : ''") {{ buyWithNoSellAmount }} BUY transactions had no corresponding SELL
                        v-col(md="3" class="text-right")
                            v-btn(@click="updateDetectBuyHadNoSellPairs" :style="positions_that_are_current_edit ? 'height: 30px;background: #408df2;color: white;' : 'height: 30px;background: #C0C3C5;color: white;'" :disabled="!positions_that_are_current_edit") Edit
                    v-row
                        v-col(:style="!check_if_uploaded ? 'color: lightgray;' : ''" md="9") Detect Accounts used at Avanza
                        v-col(md="3" class="text-right")
                            v-btn(@click="clickedDetectAccountsUsedAtAvanzaBtn" :style="detect_accounts_used_at_avanza_yes ? 'height: 30px;width: 100px;background-color: #ffc107;color: red;border: 1px solid red;' : 'height: 30px;width: 100px;background: #C0C3C5;color: white;'" :disabled="!detect_accounts_used_at_avanza_yes") Yes
                    v-row(class="pb-5")
                        v-col(md="9" class="blue-text")
                            span(v-if="detect_accounts_used_at_avanza_edit" v-for="account in accounts" :key="account") {{account}}<br />
                        v-col(md="3" class="text-right")
                            v-btn(@click="updateDetectAccountsUsedAtAvanza" :style="detect_accounts_used_at_avanza_edit ? 'height: 30px;background: #408df2;color: white;' : 'height: 30px;background: #C0C3C5;color: white;'" :disabled="!detect_accounts_used_at_avanza_edit") Edit

        v-container(style="background-color: white;")
            v-row(class="mt-10")
                v-progress-linear(color="light-green darken-4" height="10" v-model="progress_checker" striped)
            v-row
                v-col(class="text-right pr-0")
                    v-btn(@click="clickedCompletedBtn" :style="error_handling_and_complete ? 'height: 30px;background: #408df2;color: white;' : 'height: 30px;background: #C0C3C5;color: white;'" :disabled="!error_handling_and_complete") Completed

        template(style="background-color: white;")
            div
                v-dialog(v-model="dialog" :max-width="modalLoadComponent !== 3 ? '1200px' : '800px'")
                    template(v-slot:activator="{ on, attrs }")

                    v-card
                        v-card-text(class="pr-1" style="height: 35px;border: 0px solid black;position: absolute;")
                            h3(class="text-right" style="border: 0px solid black;")
                                span(@click="dialog = false" class="closeDialog") X

                        v-card-text
                            AllCompletedBuyAndSellPairs(v-if="modalLoadComponent === 1" :arrAvanza="transactionsCompletedBuyAndSellPairs" :numberOfCompletedTrades="transactionsCompletedBuyAndSellPairsAmount", :numberOfDividendPayments="dividendAmount")
                            WithdrawalsAndDeposites(v-if="modalLoadComponent === 2" :arrAvanza="array_avanza_withdrawal_deposite" :netCashBalance="net_cash_balance")
                            DetectAccountsUsedAtAvanza(v-if="modalLoadComponent === 3" :numberOfAccounts="accounts")
                            BuyHadNoCorrespondingSell(v-if="modalLoadComponent === 4" :arrAvanza="buyWithNoSell" :numberOfNoBuyAndSellPairs="buyWithNoSellAmount")

</template>

<script>
    import { AgGridVue } from "ag-grid-vue";
    import 'ag-grid-enterprise';
    import "ag-grid-community/dist/styles/ag-grid.css";
    import "ag-grid-community/dist/styles/ag-theme-dark.css";
    import "ag-grid-community/dist/styles/ag-theme-balham.css";
    import "ag-grid-community/dist/styles/ag-theme-alpine.css";
    import ApiService from "@/Services/ApiService.js";
    import { mapActions } from "vuex";
    import _ from 'lodash';

    import WithdrawalsAndDeposites from '@/views/portfolio/WithdrawalsAndDeposites.vue';
    import DetectAccountsUsedAtAvanza from '@/views/portfolio/DetectAccountsUsedAtAvanza.vue';
    import BuyHadNoCorrespondingSell from '@/views/portfolio/BuyHadNoCorrespondingSell.vue';
    import AllCompletedBuyAndSellPairs from '@/views/portfolio/AllCompletedBuyAndSellPairs.vue';

    export default {
        name: "PortfolioImportTransaction",
        props: {
            show: Boolean
        },
        components: {
            AgGridVue,
            WithdrawalsAndDeposites,
            DetectAccountsUsedAtAvanza,
            BuyHadNoCorrespondingSell,
            AllCompletedBuyAndSellPairs
        },
        beforeMount() {
            this.frameworkComponents =
                {
                }
        },
        async mounted() {          
            await this.loadTx(this.user.user_id);
            await this.loadTrade(this.user.user_id);

            this.gridApi = this.gridOptions.api;
            this.gridColumnApi = this.gridOptions.columnApi;
        },
        computed: {
            getAllStocks() {
                return this.$store.getters.getAllStocks;
            },
        },
        watch: {
            show: function(){
                
            }
        },
        data() {
            return {
                showDialog: true,
                user: JSON.parse(localStorage.getItem('user')),
                stock_ids_to_remove: null,
                dividendAmount: null,
                transactionsCompletedBuyAndSellPairsAmount : null,
                transactionsCompletedBuyAndSellPairs : [],
                buyWithNoSell: [],
                buyWithNoSellAmount: null,
                transactionsNotInsertedYet: [],
                transactionsToUserTrade: [],
                number_of_transactions_not_inserted_yet: null,
                totalNumberOfTransactionsUploaded: null,
                sumDeposit: null,
                sumWithdraw: null,
                accounts: null,
                modalLoadComponent: 0,
                dialog: false,
                fileInputLabel: "File input",
                check_if_uploaded: false,
                buy_and_sell_pairs_yes: false,
                buy_and_sell_pairs_edit: false,
                deposits_and_withdrawals_yes: false,
                deposits_and_withdrawals_edit: false,
                positions_that_are_current_yes: false,
                positions_that_are_current_edit: false,
                detect_accounts_used_at_avanza_yes: false,
                detect_accounts_used_at_avanza_edit: false,
                error_handling_and_complete: false,
                progress_checker: 0,
                load_flag: false,
                array_avanza: [],
                array_avanza_withdrawal_deposite: [],
                net_cash_balance: 0,
                array_avanza_ignored_transactions: [],
                number_of_ignored_transactions: 0,
                defaultColDef: {
                    resizable: true,
                    sortable: true,
                    floatingFilter: true,
                },
                gridOptions: {
                    rowHeight: 40,
                    headerHeight: 40,
                    floatingFiltersHeight: 0,
                    statusBar: {
                        statusPanels: [
                            { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
                            { statusPanel: 'agAggregationComponent' },
                        ],
                    },
                },
                columnDefs: [
                    {headerName: "Avanza", headerClass: "ma-2 grey lighten-2",
                        children: [
                            {headerName: "Ticker",
                                field: "isin",
                                cellRenderer: function(params) {
                                    return '<span class="ticker" style="line-height: 17px">' + params.value + '</span>';
                                },
                                // filter: 'filterExchanges',
                                // floatingFilter: true,
                                // floatingFilterComponent: FilterMarginPct,
                                // suppressMenu: true,
                                maxWidth: 120
                            },
                            {headerName: "Date",
                                field: "tx_date",
                                filter: 'filterExchanges',
                                floatingFilter: true,
                                // floatingFilterComponent: FilterMarginPct,
                                suppressMenu: true,
                                maxWidth: 100
                            },
                            {headerName: "Acount",
                                field: "account",
                                // filter: 'filterExchanges',
                                // floatingFilter: true,
                                // floatingFilterComponent: FilterMarginPct,
                                // suppressMenu: true,
                                maxWidth: 90
                            },
                            {headerName: "Price",
                                field: "qty",
                                // filter: 'filterExchanges',
                                // floatingFilter: true,
                                // floatingFilterComponent: FilterMarginPct,
                                // suppressMenu: true,
                                maxWidth: 120
                            },
                            {headerName: "Transaction Type",
                                field: "tx_type",
                                // filter: 'filterExchanges',
                                // floatingFilter: true,
                                // floatingFilterComponent: FilterMarginPct,
                                // suppressMenu: true,
                                maxWidth: 170
                            },
                            {headerName: "Description",
                                field: "description",
                                // filter: 'filterExchanges',
                                // floatingFilter: true,
                                // floatingFilterComponent: FilterMarginPct,
                                // suppressMenu: true,
                                maxWidth: 200
                            },
                            {headerName: "QTY",
                                field: "qty",
                                // filter: 'filterExchanges',
                                // floatingFilter: true,
                                // floatingFilterComponent: FilterMarginPct,
                                // suppressMenu: true,
                                maxWidth: 100
                            },
                            {headerName: "Exchange_rate",
                                field: "exchange_rate",
                                // filter: 'filterExchanges',
                                // floatingFilter: true,
                                // floatingFilterComponent: FilterMarginPct,
                                // suppressMenu: true,
                                maxWidth: 120
                            },
                            {headerName: "Amount",
                                field: "amount",
                                // filter: 'filterExchanges',
                                // floatingFilter: true,
                                // floatingFilterComponent: FilterMarginPct,
                                // suppressMenu: true,
                                maxWidth: 100
                            },
                            {headerName: "Commission",
                                field: "commission",
                                // filter: 'filterExchanges',
                                // floatingFilter: true,
                                // floatingFilterComponent: FilterMarginPct,
                                // suppressMenu: true,
                                maxWidth: 120
                            },
                            {headerName: "Currency",
                                field: "currency",
                                // filter: 'filterExchanges',
                                // floatingFilter: true,
                                // floatingFilterComponent: FilterMarginPct,
                                // suppressMenu: true,
                                maxWidth: 90
                            },
                            {headerName: "Notes",
                                field: "notes",
                                editable: true,
                                onCellValueChanged: "greet",
                                cellEditor: 'agLargeTextCellEditor',
                                minWidth: 600
                            },
                        ]
                    },
                ],

            }
        },
        methods: {
            ...mapActions(["loadTx", "saveTx", "loadTrade", "insertUserAccount"]),
            setAllCompletedBuyAndSellPairs(response) {
                // console.log('******');
                // console.log(response);
                // console.log('******');

                const buySellDividend = response.filter((item) => {
                    if(item.tx_type === "BUY" || item.tx_type === "SELL" || item.tx_type === "DIVIDEND") {
                        return item;
                    }
                });

                // console.log('******');
                // console.log(buySellDividend);
                // console.log('******');

                const buys = buySellDividend.filter((item) => {
                    if(item.tx_type === "BUY") {
                        return item;
                    }
                });

                // console.log('******');
                // console.log(JSON.parse(JSON.stringify(buys)));
                // console.log('******');

                const sells = buySellDividend.filter((item) => {
                    if(item.tx_type === "SELL") {
                        return item;
                    }
                });

                // console.log('******');
                // console.log(JSON.parse(JSON.stringify(sells)));
                // console.log('******');

                const dividends = buySellDividend.filter((item) => {
                    if(item.tx_type === "DIVIDEND") {
                        return item;
                    }
                });

                // console.log('******');
                // console.log(JSON.parse(JSON.stringify(dividends)));
                // console.log('******');

                const buySell = buySellDividend.filter((item) => {
                    if(item.tx_type === "BUY" || item.tx_type === "SELL") {
                        return item;
                    }
                });

                // console.log('******');
                // console.log(JSON.parse(JSON.stringify(buySell)));
                // console.log('******');

                const buyAndSellPairsBoth = buySell.filter((bs) => {
                    return sells.find((sell) => {
                        return (bs.description === sell.description);
                    });
                });

                // console.log('******');
                // console.log(JSON.parse(JSON.stringify(buyAndSellPairsBoth)));
                // console.log('******');

                const buyAndSellPairs = buys.filter((buy) => {
                    return sells.find((sell) => {
                        return (buy.description === sell.description);
                    });
                });

                // console.log('******');
                // console.log(JSON.parse(JSON.stringify(buyAndSellPairs)));
                // console.log('******');

                this.dividendAmount = dividends.length;
                this.transactionsCompletedBuyAndSellPairs = buyAndSellPairsBoth.concat(dividends);
                this.transactionsCompletedBuyAndSellPairsAmount = buyAndSellPairs.length;
            },
            setWithdrawalsAndDeposites(response) {
                const arrAvanzaTemp = response.filter((item) => {
                    return (item.tx_type === 'WITHDRAW' || item.tx_type === 'DEPOSIT');
                });

                const deposits = arrAvanzaTemp.filter((item) => {
                    return (item.tx_type === 'DEPOSIT');
                });

                const withdraws = arrAvanzaTemp.filter((item) => {
                    return (item.tx_type === 'WITHDRAW');
                });

                const sumDeposit = _.sumBy(deposits, 'amount');
                const sumWithdraw = _.sumBy(withdraws, 'amount');

                this.sumDeposit = sumDeposit;
                this.sumWithdraw = sumWithdraw;

                const netCashBalance = sumDeposit + sumWithdraw;

                this.array_avanza_withdrawal_deposite = arrAvanzaTemp;
                this.net_cash_balance = netCashBalance;
            },
            async setIgnoredTransactions(response) {
                await this.loadTx(this.user.user_id);
                await this.loadTrade(this.user.user_id);

                const arrAvanzaTemp = response;

                // console.log(JSON.parse(JSON.stringify(arrAvanzaTemp)));

                for(const item of arrAvanzaTemp) {
                    item.commission = (typeof item.commission === "string") ? parseFloat(item.commission) : parseFloat(item.commission.toFixed(2));
                    item.stock_id = (item.stock_id !== undefined) ? item.stock_id : null;
                }

                // console.log(JSON.parse(JSON.stringify(arrAvanzaTemp)));

                const userTxResponse = this.$store.getters.getTx;

                // console.log(JSON.parse(JSON.stringify(userTxResponse)));

                for(const item of userTxResponse) {
                    item.commission = (typeof item.commission === "string") ? parseFloat(item.commission) : parseFloat(item.commission.toFixed(2));
                    delete item['tx_id'];

                    if (this.getAllStocks.find((s) => s.stock_id === item.stock_id)) {
                        const ticker = this.getAllStocks.find((s) => s.stock_id === item.stock_id).ticker;
                        item.ticker = ticker;
                    }
                }

                // console.log(arrAvanzaTemp);
                // console.log(userTxResponse);

                const ignoredTransactions = arrAvanzaTemp.filter((avanza) => {
                    return userTxResponse.find((userTx) => {
                        if(this.haveSameData(avanza, userTx)) {
                            return avanza;
                        }
                    });
                });

                // console.log(JSON.stringify(arrAvanzaTemp));
                // console.log(JSON.stringify(userTxResponse));

                // console.log(ignoredTransactions);

                const save = arrAvanzaTemp.filter((avanza) => {
                    return !userTxResponse.find((userTx) => {
                        if(this.haveSameData(avanza, userTx)) {
                            return avanza;
                        }
                    });
                });

                // console.log(save);

                const ownSave = JSON.parse(JSON.stringify(save));

                // console.log(ownSave);

                const savesBuys = save.filter((item) => {
                    if((item.tx_type === "BUY" || item.tx_type === "SELL" & item.stock_id !== null) && this.getAllStocks.find((s) => s.stock_id === item.stock_id)) {
                        const stockId = this.getAllStocks.find((s) => s.stock_id === item.stock_id).stock_id;
                        item.stock_id = stockId;
                        return item;
                    }
                });

                // console.log(this.$store.getters.getTx);
                const savesBuysStored = this.$store.getters.getTx.filter((item) => {
                    if((item.tx_type === "BUY" || item.tx_type === "SELL") && item.stock_id !== null) {
                        return item;
                    }
                });
                // console.log(savesBuys);
                // console.log(savesBuysStored);

                const savesBuysCombined = savesBuys.concat(savesBuysStored);

                // console.log(savesBuysCombined);

                const filteredSavesBuysCombined = savesBuysCombined.filter((outer) => {
                    return savesBuys.find((inner) => {
                        if(outer.stock_id === inner.stock_id) {
                            return outer;
                        }
                    });
                });

                // console.log(JSON.parse(JSON.stringify(filteredSavesBuysCombined)));
                // console.log(JSON.parse(JSON.stringify(savesBuys)));

                const groupOnStockId = _.groupBy(filteredSavesBuysCombined, 'stock_id');
                const groupSavesBuys = _.groupBy(savesBuys, 'stock_id');

                // console.log(groupOnStockId);
                // console.log(groupSavesBuys);

                const objectKeysOnGroupOnStockId = Object.keys(groupOnStockId);
                const objectKeysOnGroupOnSavesBuys = Object.keys(groupSavesBuys);

                // console.log(objectKeysOnGroupOnStockId);
                // console.log(objectKeysOnGroupOnSavesBuys);
                // console.log(filteredObjectKeysOnGroupOnStockId);

                const insertToUserTradeTable = [];

                for(const stockId of objectKeysOnGroupOnStockId) {
                    let updatedStocksBuy = groupOnStockId[stockId].filter((item) => {
                        if(item.tx_type === 'BUY') {
                            item.qty_check = item.qty;
                            return item;
                        }
                    });

                    let updatedStocksSell = groupOnStockId[stockId].filter((item) => {
                        if(item.tx_type === 'SELL') {
                            item.qty_check = item.qty;
                            return item;
                        }
                    });

                    updatedStocksBuy = _.orderBy(updatedStocksBuy, ["tx_date"], ["asc"]);
                    updatedStocksSell = _.orderBy(updatedStocksSell, ["tx_date"], ["asc"]);

                    // console.log(updatedStocksBuy);
                    // console.log(updatedStocksSell);

                    let sumBuyQuantity = 0;
                    let sumSellQuantity = 0;

                    for(const buy of updatedStocksBuy) {
                        sumBuyQuantity += buy.qty;
                    }

                    for(const sell of updatedStocksSell) {
                        sumSellQuantity += sell.qty;
                    }

                    let leftOfBuy = undefined;

                    if(sumBuyQuantity >= -sumSellQuantity) {
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
                                            commission: sell.commission,
                                            pnl: 0,
                                            notes: ''
                                        });
                                        buy.qty += sell.qty;
                                        sell.qty = 0;

                                        if(buy.qty > 0 && sumBuyQuantity !== -sumSellQuantity) {
                                            leftOfBuy = {
                                                user_id: buy.user_id,
                                                stock_id: buy.stock_id,
                                                ticker: buy.ticker,
                                                instrument_type: 'stock',
                                                entry_price: buy.price,
                                                entry_date: buy.tx_date,
                                                entry_qty: buy.qty,
                                                exit_price: null,
                                                exit_date: null,
                                                exit_qty: null,
                                                commission: buy.commission,
                                                pnl: 0,
                                                notes: ''
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
                                            commission: sell.commission,
                                            pnl: 0,
                                            notes: ''
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
                                exit_price: null,
                                exit_date: null,
                                exit_qty: null,
                                commission: buy.commission,
                                pnl: 0,
                                notes: ''
                            });
                        }
                    }
                }

                // const storedTrades = this.$store.getters.getTrade;

                // console.log(insertToUserTradeTable);
                // console.log(storedTrades);

                this.stock_ids_to_remove = objectKeysOnGroupOnSavesBuys;
                this.number_of_ignored_transactions = ignoredTransactions.length;
                this.array_avanza_ignored_transactions = ignoredTransactions;
                this.transactionsNotInsertedYet = ownSave;
                this.transactionsToUserTrade = insertToUserTradeTable;
                this.number_of_transactions_not_inserted_yet = ownSave.length;

                this.setAllCompletedBuyAndSellPairs(ownSave);
                this.setWithdrawalsAndDeposites(ownSave);
                this.getAllTheOpenPositionsThatAreCurrent(ownSave);
                this.getAccountsUsedAtAvanza(ownSave);
            },
            getAllTheOpenPositionsThatAreCurrent(response) {
                // console.log(response);

                const buyAndSells = response.filter((item) => {
                    return (item.tx_type === 'BUY' || item.tx_type === 'SELL');
                });

                // console.log(buyAndSells);

                const buys = buyAndSells.filter((item) => {
                    return (item.tx_type === 'BUY');
                });

                // console.log(JSON.parse(JSON.stringify(buys)));

                const sells = buyAndSells.filter((item) => {
                    return (item.tx_type === 'SELL');
                });

                // console.log(JSON.parse(JSON.stringify(sells)));

                const checkBuyWithNoSell = buys.filter((buy) => {
                    return !sells.find((sell) => {
                        if(buy.description === sell.description && buy.account === sell.account) {
                            return sell;
                        }
                    });
                });

                // console.log(JSON.parse(JSON.stringify(checkBuyWithNoSell)));

                this.buyWithNoSell = checkBuyWithNoSell;
                this.buyWithNoSellAmount = checkBuyWithNoSell.length;
            },
            getAccountsUsedAtAvanza(response) {
                // console.log(response);

                const groupedOnAccount = _.groupBy(response, (item) => {
                    return item.account;
                });

                this.accounts = Object.keys(groupedOnAccount);

                // console.log(this.accounts);
            },
            // eslint-disable-next-line no-unused-vars
            onFileChange(e) {

            },
            async clickUploadBtn() {
                try {
                    const csv = document.getElementById("csv-upload").files[0];

                    if(!csv) {
                        alert("Please choose upload file");
                        return;
                    }

                    const formData = new FormData();

                    formData.append("file", csv);
                    formData.append("user_id", JSON.parse(localStorage.user).user_id);

                    const response = await ApiService.uploadAvanza(formData);

                    for(const item of response) {
                        if(this.getAllStocks.find((s) => s.isin === item.isin && s.currency_trade === item.currency)) {
                            const ticker = this.getAllStocks.find((s) => s.isin === item.isin && s.currency_trade === item.currency).ticker;
                            const stockId = this.getAllStocks.find((s) => s.isin === item.isin && s.currency_trade === item.currency).stock_id;

                            item.ticker = ticker;
                            item.stock_id = stockId;
                        }
                    }

                    this.check_if_uploaded = true;
                    this.totalNumberOfTransactionsUploaded = response.length;
                    this.array_avanza = response;
                    this.load_flag = false;

                    this.setIgnoredTransactions(response);

                    this.clickedCompletedBtn();
                } catch(error) {
                    console.log(error.message);
                }
            },
            async clickedCompletedBtn() {
                const user_id = this.user.user_id;

                let countNullAccountsArray = this.$store.getters.getUserAccounts.filter(item => item.broker == 'none' || item.broker == null);
                const self = this;
                const recall = function(number) {
                    let temp_user_account_id = self.user.user_id + '-' + number;
                    let inx = self.$store.getters.getUserAccounts.findIndex(item => item.user_account_id == temp_user_account_id)
                    if (inx < 0) {
                        return temp_user_account_id;
                    } else {
                        return recall(parseInt(number) + 1)
                    }        
                }
                const final_account_number = recall(countNullAccountsArray.length);
                
                let account_data = {
                    user_id: user_id,
                    user_account_id: final_account_number,
                    account_name : 'Avanza',
                    account_type : 'Avanza',
                    balance: 0,
                    scale: 0,
                    currency: 'SEK',
                    hide: false,
                    broker: 'Avanza',
                    order_preference: 0,
                    nominal_position_size: 0,
                    secret_key: null,
                    last_import_date: new Date().toISOString().slice(0,10)
                }
                await this.insertUserAccount(account_data);

                const stock_ids = this.stock_ids_to_remove;
                let txs = this.transactionsNotInsertedYet;
                const uts = this.transactionsToUserTrade;
                txs.map(item => {
                    item.user_account_id = final_account_number;
                })

                const userTxAndTradeObject = {
                    user_id,
                    stock_ids,
                    txs,
                    uts,
                };

                await this.saveTx(userTxAndTradeObject);

                this.setToOriginalState();
                this.closePopupWindow();

                await this.loadTransactionBuySell();
                await this.loadTransactionHistory();
                
            },
            async loadTransactionBuySell() {
                await this.$parent.$parent.$parent.$parent.$parent.$refs.transactionBuySell[0].loadRowData();
            },
            async loadTransactionHistory() {
                await this.$parent.$parent.$parent.$parent.$parent.$refs.transactionHistory[1].loadRowData();
            },
            closePopupWindow() {
                this.$emit('my-event')
                // this.$parent.$parent.$parent.$parent.dialog = false;
                
            },
            clickedCompletedBuyAndSellPairsBtn() {
                this.buy_and_sell_pairs_yes = true;
                this.buy_and_sell_pairs_edit = true;
                this.deposits_and_withdrawals_yes = true;
                this.progress_checker = 25;
            },
            clickedSumDepositsAndWithdrawalsBtn() {
                this.deposits_and_withdrawals_yes = false;
                this.deposits_and_withdrawals_edit = true;
                this.positions_that_are_current_yes = true;
                this.progress_checker = 50;
            },
            clickedIdentifyAllTheOpenPositionsThatAreCurrentBtn() {
                this.positions_that_are_current_yes = false;
                this.positions_that_are_current_edit = true;
                this.detect_accounts_used_at_avanza_yes = true;
                this.progress_checker = 75;
            },
            clickedDetectAccountsUsedAtAvanzaBtn() {
                this.detect_accounts_used_at_avanza_yes = false;
                this.detect_accounts_used_at_avanza_edit = true;
                this.error_handling_and_complete = true;
                this.progress_checker = 100;
            },
            haveSameData(obj1, obj2) {
                const obj1Length = Object.keys(obj1).length;
                const obj2Length = Object.keys(obj2).length;

                if (obj1Length === obj2Length) {
                    return Object.keys(obj1).every((key) => obj2.hasOwnProperty(key) && obj2[key] === obj1[key]);
                }
                return false;
            },
            updateAllCompletedBuyAndSellPairs() {
                this.modalLoadComponent = 1;
                this.dialog = true;
            },
            updateHeaderNameInWithdrawalsAndDeposites() {
                this.modalLoadComponent = 2;
                this.dialog = true;
            },
            updateDetectAccountsUsedAtAvanza() {
                this.modalLoadComponent = 3;
                this.dialog = true;
            },
            updateDetectBuyHadNoSellPairs() {
                this.modalLoadComponent = 4;
                this.dialog = true;
            },
            setToOriginalState() {
                this.check_if_uploaded = false;
                this.buy_and_sell_pairs_yes = false;
                this.buy_and_sell_pairs_edit = false;
                this.deposits_and_withdrawals_yes = false;
                this.deposits_and_withdrawals_edit = false;
                this.positions_that_are_current_yes = false;
                this.positions_that_are_current_edit = false;
                this.detect_accounts_used_at_avanza_yes = false;
                this.detect_accounts_used_at_avanza_edit = false;
                this.error_handling_and_complete = false;
                this.progress_checker = 0;
            }
        }
    }
</script>

<style scoped>
    input {
        border: 1px solid gray;
        width: 300px;
        overflow: hidden;
    }

    .file-upload-container-with-image {
        height: 90px;
        width: 800px;
    }

    .file-upload-container-without-image {
        height: 90px;
        width: 435px;
    }

    .file-upload-container-without-image-mobile {
        height: 90px;
        width: 355px;
    }

    .place-block-beside {
        float: left;
    }

    .file-input {
        width: 300px;
    }

    .file-input-mobile {
        width: 220px;
    }

    .width-bigger-screen {
        width: 800px;
    }

    .width-smaller-screen {
        width: 435px;
    }

    .blue-text {
        color: #607AD7;
    }

    .closeDialog:hover {
        cursor: pointer;
        color: gray;
    }
</style>
