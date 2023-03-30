<template lang="pug">
    div
        div( class="pt-3 pl-3")
            v-row
                div( style="min-width:100%;")
                    div( id="containerOfAgGrid" style="overflow:auto; margin-top:47px;" :style="`height:${windowHeight - 314}px;`")
                        AgGridVue(
                            ref="agGridVueContainer"
                            style="margin:0; padding:0 overflow:auto;"
                            :frameworkComponents="frameworkComponents"
                            :class="{'ag-theme-dark':$vuetify.theme.isDark,'ag-theme-balham':!$vuetify.theme.isDark}"
                            id="transaction"
                            gridApi=null
                            gridColumnApi=null
                            :gridOptions="gridOptions"
                            :defaultColDef="defaultColDef"
                            cellValueChanged="onCellValueChanged"
                            :animateRows="true"
                            :columnDefs="columnDefs"
                            :rowData="transaction_array"
                        )

        div( id="displayStocks" class="p-1 m-0" style="display:none; position:absolute; width:110px; max-height:200px; overflow-y:auto; background-color:white; top:0; left:0; border:1px solid;")
            div( v-for="filterResult in tickerFilterResults" @click="getTickerText(filterResult.ticker)" class="option-design p-0 m-0" style="height:18px;") {{ filterResult.ticker }}
</template>

<script>
    import { AgGridVue } from "ag-grid-vue";
    import "ag-grid-enterprise";
    import "ag-grid-community/dist/styles/ag-grid.css";
    import "ag-grid-community/dist/styles/ag-theme-dark.css";
    import "ag-grid-community/dist/styles/ag-theme-alpine.css";
    import {mapGetters, mapActions} from "vuex";
    import moment from "moment";
    import _ from "lodash";

    import TransactionsImportButton from "./TransactionsImportButton";

    const helper = require("../../util/helper.js");

    export default {
        name: "TransactionBuySell",
        components: {
            AgGridVue,
            TransactionsImportButton
        },
        watch : {
            async getUserAccountsShownAmount() {
                await this.loadRowData();

                const accountItemsElement = document.getElementById('accountItems');

                if(accountItemsElement !== null) {
                    accountItemsElement.innerHTML = '';

                    for(const account of this.getUserAccountsShown) {
                        accountItemsElement.innerHTML += `<option value="${account.user_account_id}">${account.account_name}</option>`;
                    }
                }
            }
        },
        computed: {
            ...mapGetters(["getTx"]),
            getAllStocks() {
                // const addBtn = document.querySelector('[col-id="tx_id"]');;
                // addBtn.click();
                return this.$store.getters.getAllStocks;
            },
            getAllTickers() {
                return this.getAllStocks.map((item) => item.ticker);
            },
            getUserAccountsShownAmount() {
                return this.$store.getters.getUserAccounts.filter((a) => a.hide === true).length;
            },
            getUserAccountsShown() {
                return this.$store.getters.getUserAccounts.filter((a) => a.hide === true);
            }
        },
        beforeMount() {
            this.frameworkComponents =
                {
                }
        },
        async created() {
            await this.loadRowData();
        },
        mounted() {
            this.gridOptions.api.setDomLayout("autoHeight");
            this.gridOptions.api.sizeColumnsToFit();

            const txIdElement = document.querySelector('[col-id="tx_id"]');

            txIdElement.innerHTML = `
                <button class="mr-10 green3 white--text v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--small" style="text-transform:none;">
                    <span style="font-size:20px;">+</span>
                    <span class="pl-2" style="margin-top:2px;">Add</span>
                </button>
            `;

            txIdElement.addEventListener('click', this.addRow);

            this.windowWidth = window.innerWidth;
            this.windowHeight = window.innerHeight;

            const agHeaderFirstTime = document.getElementsByClassName('ag-header')[0];
            agHeaderFirstTime.style.width = `${this.windowWidth - 300}px`;

            const agStatusBarFirstTime = document.getElementsByClassName('ag-status-bar')[0];
            agStatusBarFirstTime.style.width = `${this.windowWidth - 300}px`;

            window.addEventListener('resize', () => {
                this.windowWidth = window.innerWidth;
                this.windowHeight = window.innerHeight;

                const agHeader = document.getElementsByClassName('ag-header')[0];
                agHeader.style.width = `${this.windowWidth - 300}px`;

                const agStatusBar = document.getElementsByClassName('ag-status-bar')[0];
                agStatusBar.style.width = `${this.windowWidth - 300}px`;

                if(this.windowWidth > 1550) {
                    console.log(this.windowWidth);
                    this.gridOptions.api.sizeColumnsToFit();
                }
            });

            document.body.addEventListener('click', this.openSearchTickersWindow);

            const containerOfAgGrid = document.getElementById('containerOfAgGrid');
            containerOfAgGrid.addEventListener("scroll", this.hideTickerSelectorAndBlurTextField);

            this.$refs.agGridVueContainer.$el.addEventListener('dblclick', () => {
                const editInputField = document.getElementsByClassName('ag-text-field-input')[0];

                if(editInputField !== undefined) {
                    if(moment(editInputField.value, 'YYYY-MM-DD', true).isValid()) {
                        editInputField.setAttribute('type', 'date');
                        editInputField.style.fontSize = '10px';
                    }
                }
            });

            const agStatusBarCenterElement = document.getElementsByClassName('ag-status-bar-left')[0];

            const node = document.createElement('span');
            const resultNode = document.createElement('span');

            node.style.marginTop = '7px';
            node.style.marginRight = '5px';
            node.style.marginLeft = '300px';

            resultNode.id = 'sumCommissionsTotal';
            resultNode.style.color = '#000000';
            resultNode.style.marginTop = '7px';

            const textNode = document.createTextNode('Commissions Total:');
            const textResultNode = document.createTextNode('');

            node.appendChild(textNode);
            resultNode.appendChild(textResultNode);

            agStatusBarCenterElement.appendChild(node);
            agStatusBarCenterElement.appendChild(resultNode);
        },
        destroyed() {
            document.body.removeEventListener('click', this.openSearchTickersWindow);
            txIdElement.removeEventListener('click', this.addRow);
        },
        methods: {
            ...mapActions(["loadTx", "saveTx", "updateTx", "deleteTx", "saveOneTx", "loadUserAccounts"]),
            trashCanIcon() {
                return `
                    <svg class="set-trash-can-container" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path class="set-trash-can-color" stroke="#000000" d="M3.33203 5H16.6654L15.3487 16.85C15.3036 17.2578 15.1096 17.6346 14.8039 17.9083C14.4982 18.182 14.1023 18.3334 13.692 18.3333H6.30536C5.89506 18.3334 5.49917 18.182 5.19349 17.9083C4.88781 17.6346 4.69383 17.2578 4.6487 16.85L3.33203 5Z" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
                        <path class="set-trash-can-color" stroke="#000000" d="M6.12083 2.62251C6.25563 2.33664 6.46892 2.095 6.73584 1.92576C7.00275 1.75653 7.31229 1.66667 7.62833 1.66667H12.3717C12.6879 1.66651 12.9976 1.75629 13.2646 1.92554C13.5317 2.09479 13.7451 2.33652 13.88 2.62251L15 5.00001H5L6.12083 2.62251Z" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
                        <path class="set-trash-can-color" stroke="#000000" d="M1.66602 5H18.3327" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
                        <path class="set-trash-can-color" stroke="#000000" d="M8.33203 9.16667V13.3333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
                        <path class="set-trash-can-color" stroke="#000000" d="M11.666 9.16667V13.3333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                `;
            },
            commissinsTotal(array) {
                const sumCommissionsTotal = document.getElementById('sumCommissionsTotal');

                const sumCommissinsText = _.sumBy(array, 'commission');

                sumCommissionsTotal.innerHTML = sumCommissinsText;
            },
            hideTickerSelectorAndBlurTextField() {
                const displayStocks = document.getElementById('displayStocks');
                displayStocks.style.display = 'none';

                if(document.getElementById('addTicker') !== null) {
                    const addTicker = document.getElementById('addTicker');
                    addTicker.blur();
                }
            },
            openSearchTickersWindow(event) {
                if(event.target.id !== 'displayStocks' && event.target.id !== 'addTicker') {
                    const displayStocks = document.getElementById('displayStocks');

                    displayStocks.style.display = 'none';
                }
            },
            getTickerText(tickerName) {
                const addTickerElement = document.getElementById('addTicker');
                const displayStocks = document.getElementById('displayStocks');

                addTickerElement.value = tickerName;

                displayStocks.style.display = 'none';

                const addCurrencyElement = document.getElementById('addCurrency');
                const currency = (this.getAllStocks.find((s) => s.ticker === addTickerElement.value)).currency_trade;

                addCurrencyElement.value = currency;
            },
            addRow() {
                if(this.toggler) {
                    this.toggler = false;

                    const containerOfAgGrid = document.getElementById("containerOfAgGrid");

                    containerOfAgGrid.scrollTo(0, 0);

                    containerOfAgGrid.style.marginTop = '84px';

                    const agGridHeight = parseInt(containerOfAgGrid.style.height) - 38;

                    containerOfAgGrid.style.height = `${agGridHeight}px`;

                    const testElement = document.getElementsByClassName('ag-header-container')[0];
                    const testElement2 = document.getElementsByClassName('ag-header')[0];

                    const newDiv = document.createElement("div");

                    newDiv.setAttribute('id', 'insertNewTransactionContainer');

                    newDiv.innerHTML = `
                        <div class="pl-2" style="padding-top:5px; border-top:1px solid #BDC3C7;">
                            <select id="accountItems" style="appearance:searchfield; width:140px; height:25px; background-color:#ffffff color:black; margin-right:6px; border:1px solid;></select>
                            <input id="addDateTest" type="date" style="width:110px; height:25px; background-color:#ffffff; margin-right:6px; border:1px solid;" />
                            <input id="addDate" type="date" style="width:110px; height:25px; background-color:#ffffff; margin-right:6px; border:1px solid;" />
                            <input id="addTicker" type="text" style="width:110px; height:25px; background-color:#ffffff; margin-right:6px; border:1px solid;" />
                            <input id="addQuantity" type="text" style="width:95px; height:25px; background-color:#ffffff; margin-right:6px; border:1px solid;" />
                            <input id="addPrice" type="text" style="width:90px; height:25px; background-color:#ffffff; margin-right:6px; border:1px solid;" />
                            <input id="addCommission" type="text" style="width:110px; height:25px; background-color:#ffffff; margin-right:8px; border:1px solid;" />
                            <span><label style="font-size:14px; width:32px;"><b>Buy</b></label><input type="radio" name="yesOrNo" value="BUY" style="margin-right:10px;" checked /></span>
                            <span><label style="font-size:14px; width:32px;"><b>Sell</b></label><input type="radio" name="yesOrNo" value="SELL" style="margin-right:40px;" /></span>
                            <input id="addAmount" readonly type="text" style="width:85px; height:25px; margin-right:6px; border:1px solid;" />
                            <input id="addCurrency" readonly type="text" style="width:85px; height:25px; border:1px solid;" />
                            <button id="addTransactionButton" style="background-color:#6F95F5; color:white; width:75px; padding-left:10px; padding-right:10px; padding-top:5px; padding-bottom:5px; margin-left:17px; border-radius:3px;">Save</button>
                        </div>
                    `;

                    newDiv.style.width = '102%';
                    newDiv.style.height = '35px';
                    newDiv.style.position = 'absolute';
                    newDiv.style.top = '40px';
                    newDiv.style.backgroundColor = 'white';

                    testElement2.style.height = '80px';

                    testElement.appendChild(newDiv);

                    const accountItemsElement = document.getElementById('accountItems');

                    // console.log(accountItemsElement);
                    // console.log(this.getUserAccountsShown);

                    for(const account of this.getUserAccountsShown) {
                        accountItemsElement.innerHTML += `<option value="${account.user_account_id}">${account.account_name}</option>`;
                    }

                    const addDateElement = document.getElementById('addDate');

                    // console.log(addDateElement);

                    addDateElement.value = moment().format('YYYY-MM-DD');

                    const addTransactionButton = document.getElementById('addTransactionButton');
                    const addTickerElement = document.getElementById('addTicker');

                    // console.log(addTransactionButton);
                    // console.log(addTickerElement);

                    addTransactionButton.addEventListener('click', this.clickedInsertNewTransaction);

                    addTickerElement.addEventListener('focus', () => {
                        const displayStocks = document.getElementById('displayStocks');

                        let elemRect = addTickerElement.getBoundingClientRect();
                        let top = elemRect.top - 185;
                        let left =  elemRect.left - 281;

                        displayStocks.style.display = 'block';
                        displayStocks.style.top = `${top}px`;
                        displayStocks.style.left = `${left}px`;

                        let testString = addTickerElement.value;
                        let regx = new RegExp(testString, 'i');
                        let nameArray = this.getAllStocks.filter((k) => k.name.match(regx));
                        let tickerArray = this.getAllStocks.filter((k) => k.ticker.match(regx));
                        let mergedArray = nameArray.concat(tickerArray);

                        mergedArray = _.uniqBy(mergedArray);

                        this.tickerFilterResults = mergedArray;

                        if(this.tickerFilterResults.length > 0) {
                            displayStocks.style.display = 'block';
                        } else {
                            displayStocks.style.display = 'none';
                        }
                    });

                    addTickerElement.addEventListener('keyup', () => {
                        const displayStocks = document.getElementById('displayStocks');

                        let testString = addTickerElement.value;
                        let regx = new RegExp(testString, 'i');
                        let nameArray = this.getAllStocks.filter((k) => k.name.match(regx));
                        let tickerArray = this.getAllStocks.filter((k) => k.ticker.match(regx));
                        let mergedArray = nameArray.concat(tickerArray);

                        mergedArray = _.uniqBy(mergedArray);

                        this.tickerFilterResults = mergedArray;

                        if(this.tickerFilterResults.length > 0) {
                            displayStocks.style.display = 'block';
                        } else {
                            displayStocks.style.display = 'none';
                        }

                        const addCurrencyElement = document.getElementById('addCurrency');

                        if(this.getAllStocks.find((s) => (s.ticker).toUpperCase() === (addTickerElement.value).toUpperCase()) !== undefined) {
                            const currency = ((this.getAllStocks.find((s) => (s.ticker).toUpperCase() === (addTickerElement.value).toUpperCase())).currency_trade).toUpperCase();

                            addCurrencyElement.value = currency;
                        } else {
                            addCurrencyElement.value = '';
                        }
                    });

                    const addAmountElement = document.getElementById('addAmount');
                    const addQuantityElement = document.getElementById('addQuantity');
                    const addPriceElement = document.getElementById('addPrice');

                    // console.log(addAmountElement);
                    // console.log(addQuantityElement);
                    // console.log(addPriceElement);

                    addQuantityElement.addEventListener('keyup', () => {
                        const addQuantityValue = (addQuantityElement.value !== '') ? addQuantityElement.value : 0;
                        const addPriceValue = (addPriceElement.value !== '') ? addPriceElement.value : 0;

                        const transactionTypeSelection = document.querySelector('input[name="yesOrNo"]:checked').value;

                        if(transactionTypeSelection === 'SELL') {
                            addAmountElement.value = addQuantityValue * addPriceValue;
                        } else {
                            addAmountElement.value = -(addQuantityValue * addPriceValue);
                        }
                    });

                    addPriceElement.addEventListener('keyup', () => {
                        const addQuantityValue = (addQuantityElement.value !== '') ? addQuantityElement.value : 0;
                        const addPriceValue = (addPriceElement.value !== '') ? addPriceElement.value : 0;

                        const transactionTypeSelection = document.querySelector('input[name="yesOrNo"]:checked').value;

                        if(transactionTypeSelection === 'SELL') {
                            addAmountElement.value = addQuantityValue * addPriceValue;
                        } else {
                            addAmountElement.value = -(addQuantityValue * addPriceValue);
                        }
                    });

                    const transactionTypes = document.getElementsByName('yesOrNo');

                    for(const type of transactionTypes) {
                        type.addEventListener('click', (e) => {
                            if(e.target.value === 'SELL') {
                                const amount = ((addAmountElement.value).substring(0, 1) === '-') ? (addAmountElement.value).substring(1, (addAmountElement.value).length) : addAmountElement.value;
                                addAmountElement.value = amount;
                            } else {
                                const amount = ((addAmountElement.value).substring(0, 1) !== '-') ? '-' + addAmountElement.value : addAmountElement.value;
                                addAmountElement.value = amount;
                            }
                        });
                    }
                } else {
                    this.toggler = true;

                    const containerOfAgGrid = document.getElementById("containerOfAgGrid");

                    containerOfAgGrid.scrollTo(0, 0);

                    containerOfAgGrid.style.marginTop = '47px';

                    const agGridHeight = parseInt(containerOfAgGrid.style.height) + 36;

                    containerOfAgGrid.style.height = `${agGridHeight}px`;

                    const testElement2 = document.getElementsByClassName('ag-header')[0];
                    const newDiv = document.getElementById('insertNewTransactionContainer');

                    newDiv.parentNode.removeChild(newDiv);

                    testElement2.style.height = '41px';
                }
            },
            insertAfter(referenceNode, newNode) {
                referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
            },
            getAllRows() {
                let rowData = [];
                this.gridOptions.api.forEachNode((node) => rowData.push(node.data));
                return rowData;
            },
            lockAndUnlockSaveButton(row) {
                let tempObject = this.transaction_array_copy.find((t) => t.tx_id === row.data.tx_id);
                let tempObject2 = this.transaction_array.find((t) => t.tx_id === row.data.tx_id);

                // console.log(tempObject);
                // console.log(tempObject2);

                let element = document.getElementById(`save${row.data.tx_id}`);
                let element2 = document.getElementById(`block${row.data.tx_id}`);

                for (const key of Object.keys(tempObject)) {
                    tempObject[key] = tempObject[key].toString();
                }

                for (const key of Object.keys(tempObject2)) {
                    tempObject2[key] = tempObject2[key].toString();
                }

                if(JSON.stringify(tempObject) !== JSON.stringify(tempObject2)) {
                    element.removeAttribute('class');
                    element.classList.add('save-button-design');

                    element2.removeAttribute('class');
                    element2.classList.add('unblock-save-button');

                    row.data.edited = 'true';
                    tempObject.edited = 'true';
                    tempObject2.edited = 'true';
                } else {
                    if(row.data.edited === 'true') {
                        element.removeAttribute('class');
                        element.classList.add('save-button-design-blocked');

                        element2.removeAttribute('class');
                        element2.classList.add('block-save-button');

                        row.data.edited = 'false';
                        tempObject.edited = 'false';
                        tempObject2.edited = 'false';
                    }
                }
            },
            lockButtonAfterSave(row) {
                let tempObject = this.transaction_array_copy.find((t) => t.tx_id === row.data.tx_id);
                let tempObject2 = this.transaction_array.find((t) => t.tx_id === row.data.tx_id);

                let element = document.getElementById(`save${row.data.tx_id}`);
                let element2 = document.getElementById(`block${row.data.tx_id}`);

                element.removeAttribute('class');
                element.classList.add('save-button-design-blocked');

                element2.removeAttribute('class');
                element2.classList.add('block-save-button');

                row.data.edited = 'false';
                tempObject.edited = 'false';
                tempObject2.edited = 'false';

                this.transaction_array_copy = JSON.parse(JSON.stringify(this.transaction_array));
            },
            insertAndSortAgGrid(insertAgGridNode) {
                const transactions = { add: [insertAgGridNode] };

                this.gridOptions.api.updateRowData(transactions);

                const sort = [
                    {
                        colId: 'tx_date',
                        sort: 'desc',
                    }
                ];

                this.gridOptions.api.setSortModel(sort);
            },
            sortAgGrid() {
                const sort = [
                    {
                        colId: 'tx_date',
                        sort: 'desc',
                    },
                ];

                this.gridOptions.api.setSortModel(sort);
            },
            async loadRowData() {
                await this.loadTx(JSON.parse(localStorage.getItem('user')).user_id);
                await this.loadUserAccounts(JSON.parse(localStorage.getItem('user')).user_id);

                let final_array = this.getTx.filter((tx) => tx.user_account_id !== null);
                let sort_array = [];

                final_array.map((item, i) => {
                    if (item.isin !== '-' && this.getAllStocks.find((s) => s.isin === item.isin && s.currency_trade === item.currency)) {
                        let ticker = this.getAllStocks.find((s) => s.isin === item.isin && s.currency_trade === item.currency).ticker;
                        let stock_id = this.getAllStocks.find((s) => s.isin === item.isin && s.currency_trade === item.currency).stock_id;
                        let account_name = this.$store.getters.getUserAccounts.find((a) => a.user_account_id === item.user_account_id).account_name;
                        let hide = this.$store.getters.getUserAccounts.find((a) => a.user_account_id === item.user_account_id).hide;

                        console.log(hide);

                        final_array[i].ticker = ticker;
                        final_array[i].stock_id = stock_id;
                        final_array[i].edited = 'false';
                        final_array[i].account_name = account_name;

                        if ((item.tx_type === 'SELL' || item.tx_type === 'BUY') && hide) {
                            sort_array.push(final_array[i]);
                        }
                    }
                });

                sort_array = _.orderBy(sort_array, ["tx_date"], ["desc"]);

                this.transaction_array = sort_array;
                this.transaction_array_copy = JSON.parse(JSON.stringify(this.transaction_array));

                this.commissinsTotal(this.transaction_array);

                console.log(JSON.parse(JSON.stringify(this.transaction_array)));
            },
            async clickedInsertNewTransaction() {
                this.accountItemsSelectField = document.getElementById('accountItems').value;
                this.dateTextField = document.getElementById('addDate').value;
                this.tickerSelection = document.getElementById('addTicker').value;
                this.quantityTextField = document.getElementById('addQuantity').value;
                this.priceTextField = document.getElementById('addPrice').value;
                this.commissionTextField = document.getElementById('addCommission').value;
                this.transactionTypeSelection = document.querySelector('input[name="yesOrNo"]:checked').value;
                this.amountTextField = (this.transactionTypeSelection === 'BUY') ? -Math.abs((this.priceTextField * this.quantityTextField)) : Math.abs((this.priceTextField * this.quantityTextField));
                this.quantityTextField = (this.transactionTypeSelection === 'BUY') ? Math.abs(this.quantityTextField) : -Math.abs(this.quantityTextField);

                const userId = JSON.parse(localStorage.getItem('user')).user_id;
                const isin = this.getAllStocks.find((s) => s.ticker === this.tickerSelection).isin;
                const stock_id = this.getAllStocks.find((s) => s.ticker === this.tickerSelection).stock_id;
                const currency = this.getAllStocks.find((s) => s.stock_id === stock_id).currency_trade;

                const insertObject = {
                    user_id: userId,
                    account: '',
                    stock_id: stock_id,
                    user_account_id: this.accountItemsSelectField,
                    tx_date: this.dateTextField,
                    tx_type: this.transactionTypeSelection,
                    isin: isin,
                    description: '',
                    qty: this.quantityTextField,
                    price: this.priceTextField,
                    amount: this.amountTextField,
                    commission: this.commissionTextField,
                    currency: currency,
                    exchange_rate: this.priceTextField,
                };

                // console.log(insertObject);

                await this.saveOneTx(insertObject);

                await this.loadTx(JSON.parse(localStorage.getItem('user')).user_id);

                await this.loadRowData();

                const rowNodeStockIdGroup = [];

                this.transaction_array.forEach((rowNode) => {
                    if(stock_id === rowNode.stock_id) {
                        const rowNodeData = rowNode;
                        rowNodeData.qty = parseInt(rowNodeData.qty);
                        rowNodeData.price = parseFloat(rowNodeData.price);
                        rowNodeData.commission = parseInt(rowNodeData.commission);
                        rowNodeStockIdGroup.push(rowNodeData);
                    }
                });

                // console.log(rowNodeStockIdGroup);

                const updateData = this.reconstructUserTrades(rowNodeStockIdGroup);

                // console.log(updateData);

                const user_id = this.user_id;
                const stock_ids = [stock_id];
                const txs = [];
                const uts = updateData;

                const userTxAndTradeObject = {
                    user_id,
                    stock_ids,
                    txs,
                    uts
                };

                // console.log(userTxAndTradeObject);

                await this.saveTx(userTxAndTradeObject);

                const addDateElement = document.getElementById('addDate');
                const addTickerElement = document.getElementById('addTicker');
                const quantityElement = document.getElementById('addQuantity');
                const priceElement = document.getElementById('addPrice');
                const commissionElement = document.getElementById('addCommission');
                const transactionBuyElement = document.querySelector('input[value="BUY"]');
                const amountElement = document.getElementById('addAmount');
                const currencyElement = document.getElementById('addCurrency');

                addDateElement.value = '';
                addTickerElement.value = '';
                quantityElement.value = '';
                priceElement.value = '';
                commissionElement.value = '';
                amountElement.value = '';
                currencyElement.value = '';
                transactionBuyElement.checked = true;

                this.accountItemsSelectField = '';
                this.dateTextField = '';
                this.quantityTextField = '';
                this.priceTextField = '';
                this.amountTextField = '';
                this.commissionTextField = '';
                this.tickerSelection = '';
                this.transactionTypeSelection = '';
            },
            async clickSaveButton(row) {
                const updateSpecificRow = row;

                // console.log(updateSpecificRow);

                const rowNodeStockIdGroup = [];
                let rowForErrorHandling = null;

                this.gridOptions.api.forEachNode((rowNode) => {
                    if(updateSpecificRow.stock_id === rowNode.data.stock_id) {
                        const rowNodeData = rowNode.data;
                        rowNodeData.qty = parseInt(rowNodeData.qty);
                        rowNodeData.price = parseFloat(rowNodeData.price);
                        rowNodeData.commission = parseFloat(rowNodeData.commission);
                        rowNodeData.user_account_id = this.getUserAccountsShown.find((a) => a.account_name === rowNodeData.account_name).user_account_id;
                        rowNodeStockIdGroup.push(rowNodeData);
                    }

                    if(updateSpecificRow.tx_id === rowNode.data.tx_id) {
                        rowForErrorHandling = rowNode.data;
                    }
                });

                // console.log(rowForErrorHandling);

                if(rowForErrorHandling.tx_date === "") {
                    this.$store.commit('setMessage', { text: "You haven't inserted any date yet", type: "error" });
                    return;
                } else if(isNaN(rowForErrorHandling.qty)) {
                    this.$store.commit('setMessage', { text: "You need to use integer numbers as quantity", type: "error" });
                    return;
                } else if(rowForErrorHandling.qty === 0) {
                    this.$store.commit('setMessage', { text: "You can't set zero in quantity", type: "error" });
                    return;
                } else if(rowForErrorHandling.tx_type === "BUY" && rowForErrorHandling.qty < 0) {
                    this.$store.commit('setMessage', { text: "You can't have negative quantity when buying stocks", type: "error" });
                    return;
                } else if(rowForErrorHandling.tx_type === "SELL" && rowForErrorHandling.qty > 0) {
                    this.$store.commit('setMessage', { text: "You can't have positive quantity when selling stocks", type: "error" });
                    return;
                } else if(isNaN(rowForErrorHandling.price)) {
                    this.$store.commit('setMessage', { text: "You need to use numbers as price", type: "error" });
                    return;
                } else if(rowForErrorHandling.price <= 0) {
                    this.$store.commit('setMessage', { text: "You can't set zero or lower in price", type: "error" });
                    return;
                } else if(isNaN(rowForErrorHandling.commission)) {
                    this.$store.commit('setMessage', { text: "You need to use numbers as commission", type: "error" });
                    return;
                } else if(rowForErrorHandling.commission <= 0) {
                    this.$store.commit('setMessage', { text: "You can't set zero or lower in commission", type: "error" });
                    return;
                } else if(isNaN(rowForErrorHandling.amount)) {
                    this.$store.commit('setMessage', { text: "You need to use numbers as amount", type: "error" });
                    return;
                } else if(parseFloat(rowForErrorHandling.amount) === 0) {
                    this.$store.commit('setMessage', { text: "You can't set zero in amount", type: "error" });
                    return;
                } else if(rowForErrorHandling.tx_type === "BUY" && parseFloat(rowForErrorHandling.amount) > 0) {
                    this.$store.commit('setMessage', { text: "You can't have positive amount when buying stocks", type: "error" });
                    return;
                } else if(rowForErrorHandling.tx_type === "SELL" && parseFloat(rowForErrorHandling.amount) < 0) {
                    this.$store.commit('setMessage', { text: "You can't have negative amount when selling stocks", type: "error" });
                    return;
                }

                // console.log(JSON.parse(JSON.stringify(rowNodeStockIdGroup)));

                const updateData = this.reconstructUserTrades(rowNodeStockIdGroup);

                // console.log(updateData);

                const tx_id = updateSpecificRow.tx_id;
                const user_id = updateSpecificRow.user_id;
                const stock_id = updateSpecificRow.stock_id;
                const user_account_id = this.getUserAccountsShown.find((a) => a.account_name === updateSpecificRow.account_name).user_account_id;
                const uts = updateData;

                const tx = {
                    user_id: user_id,
                    stock_id: stock_id,
                    account: '',
                    user_account_id: user_account_id,
                    tx_date: updateSpecificRow.tx_date,
                    tx_type: updateSpecificRow.tx_type,
                    isin: updateSpecificRow.isin,
                    description: '',
                    qty: parseFloat(updateSpecificRow.qty),
                    price: parseFloat(updateSpecificRow.price),
                    amount: parseFloat(updateSpecificRow.amount),
                    commission: parseFloat(updateSpecificRow.commission),
                    currency: updateSpecificRow.currency,
                    exchange_rate: parseFloat(updateSpecificRow.price)
                };

                // console.log(tx);

                const userTxAndTradeObject = {
                    tx_id,
                    user_id,
                    stock_id,
                    tx,
                    uts
                };

                // console.log(userTxAndTradeObject);

                await this.updateTx(userTxAndTradeObject);

                let commissionsTotal = 0;

                this.gridOptions.api.forEachNode((rowNode) => {
                    commissionsTotal += parseInt(rowNode.data.commission);
                });

                const commissionArrayObject = [{
                    commission: commissionsTotal
                }];

                this.commissinsTotal(commissionArrayObject);
            },
            async clickRemoveButton(row) {
                const rowData = row;

                let rowNodeDataDelete;

                this.gridOptions.api.forEachNode((rowNode) => {
                    if(rowData.tx_id === rowNode.data.tx_id) {
                        rowNodeDataDelete = rowNode.data;
                    }
                });

                // console.log(rowNodeDataDelete);

                const transactions = { remove: [rowNodeDataDelete] };

                this.gridOptions.api.updateRowData(transactions);

                const rowNodeStockIdGroup = [];

                this.gridOptions.api.forEachNode((rowNode) => {
                    if(rowData.stock_id === rowNode.data.stock_id) {
                        const rowNodeData = rowNode.data;
                        rowNodeData.qty = parseInt(rowNodeData.qty);
                        rowNodeData.price = parseFloat(rowNodeData.price);
                        rowNodeData.commission = parseInt(rowNodeData.commission);
                        rowNodeData.user_account_id = this.getUserAccountsShown.find((a) => a.account_name === rowNodeData.account_name).user_account_id;
                        rowNodeStockIdGroup.push(rowNodeData);
                    }
                });

                const removeData = this.reconstructUserTrades(rowNodeStockIdGroup);

                // console.log(removeData);

                const tx_id = rowNodeDataDelete.tx_id;
                const user_id = rowNodeDataDelete.user_id;
                const stock_id = rowNodeDataDelete.stock_id;
                const uts = removeData;

                const userTxAndTradeObject = {
                    tx_id,
                    user_id,
                    stock_id,
                    uts
                };

                await this.deleteTx(userTxAndTradeObject);

                let commissionsTotal = 0;

                this.gridOptions.api.forEachNode((rowNode) => {
                    commissionsTotal += parseInt(rowNode.data.commission);
                });

                const commissionArrayObject = [{
                    commission: commissionsTotal
                }];

                this.commissinsTotal(commissionArrayObject);
            },
            reconstructUserTrades(stocks) {
                for(const stock of stocks) {
                    stock.amount = parseFloat(stock.amount);
                    stock.commission = parseFloat(stock.commission);
                    stock.exchange_rate = parseFloat(stock.exchange_rate);
                    stock.price = parseFloat(stock.price);
                    stock.qty = parseInt(stock.qty);
                    stock.stock_id = parseInt(stock.stock_id);
                    stock.tx_id = parseInt(stock.tx_id);
                    stock.user_id = parseInt(stock.user_id);
                    stock.edited = JSON.parse(stock.edited);
                }

                // console.log(JSON.parse(JSON.stringify(stocks)));

                let updatedStocks = JSON.parse(JSON.stringify(stocks));

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

                const insertToUserTradeTable = [];
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
                                        exit_price: null,
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
                        exit_price: null,
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
                // console.log(insertToUserTradeTable);

                return insertToUserTradeTable;
            }
        },
        data() {
            const thisVal = this;
            return {
                userAccountSelected: null,
                getUserAccountsSelected: 0,
                windowWidth: 0,
                windowHeight: 0,
                toggler: true,
                tickerFilterResults: [],
                user_id: JSON.parse(localStorage.getItem('user')).user_id,
                login_info: {
                    show: false,
                    message: "",
                    timeout: 3000,
                    color: "rgba(255, 100, 100, 0.8)",
                },
                success_info: {
                    show: false,
                    message: "",
                    timeout: 3000,
                    color: "rgba(0, 150 ,0, 0.8)",
                },
                accountItemsSelectField: '',
                dateTextField: '',
                quantityTextField: '',
                priceTextField: '',
                amountTextField: '',
                commissionTextField: '',
                tickerSelection: '',
                transactionTypeSelection: '',
                tickers: [],
                transactionTypes: ['BUY', 'SELL'],
                currencies: ['EUR', 'SEK', 'DKK', 'NOK', 'USD'],
                user: null,
                transaction_array: [],
                transaction_array_copy: [],
                defaultColDef: {
                    cellClass: 'number-cell',
                    resizable: true
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
                    {
                        headerName: "Date for sort",
                        field: "tx_date",
                        sortable: true,
                        hide: true,
                        maxWidth: 80
                    },
                    {
                        headerName: this.$t('account'),
                        field: "account_name",
                        suppressMenu: true,
                        editable: false,
                        maxWidth: 150,
                        cellRenderer: (row) => {
                            const element = document.createElement('div');

                            element.id = `userAccountElement${row.data.tx_id}`;
                            element.innerHTML = `
                                <div id="valueContainer${row.data.tx_id}">${row.value}</div>
                                <div id="selectContainer${row.data.tx_id}" style="display:none;">
                                    <select id="selectAccountElement${row.data.tx_id}" class="mt-1" style="background-color:white; appearance:searchfield; width:120px; height:25px; border:1px solid;"></select>
                                </div>
                            `;
                            element.style.width = '100%';
                            element.style.height = '100%';

                            element.addEventListener('dblclick', () => {
                                const valueContainerElement = document.getElementById(`valueContainer${row.data.tx_id}`);
                                valueContainerElement.style.display = 'none';

                                const selectContainer = document.getElementById(`selectContainer${row.data.tx_id}`);
                                selectContainer.style.display = 'block';

                                const selectAccountElement = document.getElementById(`selectAccountElement${row.data.tx_id}`);

                                selectAccountElement.innerHTML = '';

                                for(const account of thisVal.getUserAccountsShown) {
                                    selectAccountElement.innerHTML += `<option value="${account.user_account_id}">${account.account_name}</option>`;
                                }

                                thisVal.userAccountSelected = thisVal.getUserAccountsShown.find((a) => a.user_account_id === selectAccountElement.value).account_name;

                                selectAccountElement.addEventListener('change', () => {
                                    thisVal.userAccountSelected = thisVal.getUserAccountsShown.find((a) => a.user_account_id === selectAccountElement.value).account_name;
                                });

                                const isClickingOutsideElement = (event) => {
                                    const isClickInsideElement = selectAccountElement.contains(event.target);
                                    if (!isClickInsideElement) {
                                        valueContainerElement.style.display = 'block';
                                        selectContainer.style.display = 'none';

                                        row.node.setDataValue('account_name', thisVal.userAccountSelected);

                                        thisVal.gridOptions.api.forEachNode((rowNode) => {
                                            if(row.data.tx_id === rowNode.data.tx_id) {
                                                thisVal.lockAndUnlockSaveButton(rowNode);
                                            }
                                        });

                                        document.removeEventListener('click', isClickingOutsideElement);
                                    }
                                };

                                document.addEventListener('click', isClickingOutsideElement);
                            });

                            return element;
                        }
                    },
                    {
                        headerName: this.$t('date'),
                        field: "tx_date",
                        floatingFilter: true,
                        suppressMenu: true,
                        editable: true,
                        maxWidth: 120,
                        cellRenderer: (row) => {
                            thisVal.lockAndUnlockSaveButton(row);
                            return row.value;
                        }
                    },
                    {
                        headerName: this.$t('Ticker')',
                        field: "ticker",
                        cellRenderer: function(params) {
                            return '<span class="ticker blue1" style="line-height:17px; padding-top:3.6px; margin-top:4px;">' + params.value + '</span>';
                        },
                        maxWidth: 120
                    },
                    {
                        headerName: "Stock_id",
                        field: "stock_id",
                        sortable: true,
                        hide: true,
                        maxWidth: 80
                    },
                    {
                        headerName: this.$t('account'),
                        field: "account",
                        hide: true,
                        maxWidth: 90
                    },
                    {
                        headerName: this.$t('qty'),
                        field: "qty",
                        editable: true,
                        maxWidth: 100,
                        type: 'rightAligned',
                        cellRenderer: (row) => {
                            thisVal.lockAndUnlockSaveButton(row);
                            return helper.thousandFormatter(row.value);
                        }
                    },
                    {
                        headerName: this.$t('price'),
                        field: "price",
                        editable: true,
                        maxWidth: 100,
                        type: 'rightAligned',
                        cellRenderer: (row) => {
                            thisVal.lockAndUnlockSaveButton(row);
                            return helper.thousandFormatter(row.value);
                        }
                    },
                    {
                        headerName: this.$t('commission'),
                        field: "commission",
                        editable: true,
                        maxWidth: 120,
                        type: 'rightAligned',
                        cellRenderer: (row) => {
                            thisVal.lockAndUnlockSaveButton(row);
                            return helper.thousandFormatter(row.value);
                        }
                    },
                    {
                        headerName: this.$t('transaction_type'),
                        field: "tx_type",
                        maxWidth: 150
                    },
                    {
                        headerName: "Exchange_rate",
                        field: "exchange_rate",
                        hide: true,
                        maxWidth: 130
                    },
                    {
                        headerName: "Amount",
                        field: "amount",
                        editable: true,
                        maxWidth: 90,
                        type: 'rightAligned',
                        cellRenderer: (row) => {
                            thisVal.lockAndUnlockSaveButton(row);
                            return helper.thousandFormatter(row.value);
                        }
                    },
                    {
                        headerName: "Currency",
                        field: "currency",
                        maxWidth: 100
                    },
                    {
                        headerName: "Description",
                        field: "description",
                        hide: true,
                        maxWidth: 200
                    },
                    {
                        headerName: "",
                        field: 'tx_id',
                        type: 'rightAligned',
                        cellRenderer: (data) => {
                            const element = document.createElement('div');
                            element.className = 'saveRemoveStockBlock';
                            element.style.color = 'white';
                            element.innerHTML = `
                                <div class="save-button-layout" style="position:relative;">
                                    <div id="block${data.value}" class="block-save-button"></div>
                                    <button id="save${data.value}" class="save-button-design-blocked">
                                        Save
                                    </button>
                                </div>
                                <span id="remove${data.value}" class="remove-button-layout">
                                    ${thisVal.trashCanIcon()}
                                </span>
                            `;

                            const saveButton = element.querySelector('#save' + data.value);
                            const removeButton = element.querySelector('#remove' + data.value);

                            saveButton.addEventListener('click', async () => {
                                const rowData = JSON.parse(JSON.stringify(data.node.data));
                                await thisVal.clickSaveButton(rowData);
                                thisVal.lockButtonAfterSave(data);
                                thisVal.sortAgGrid();
                            });

                            removeButton.addEventListener('click', async () => {
                                const rowData = JSON.parse(JSON.stringify(data.node.data));
                                await thisVal.clickRemoveButton(rowData);
                            });

                            return element;
                        }
                    }
                ]
            }
        }
    }
</script>

<style scoped>
>>> .ag-center-cols-container .ag-row {
  background-color: #ffffff;
}

>>> .set-trash-can-container {
    width: 23px;
    height: 23px;
}

>>> .set-trash-can-color {
    stroke: #333333;
}

>>> span:hover .set-trash-can-color {
    stroke: red;
}

>>> span:hover {
    cursor: pointer;
}

>>> .save-button-layout {
    width: 90px;
    float: left;
    height: 27px;
    padding-top: 5px;
}

>>> .save-button-design {
    height: 27px;
    background: #408DF2;
    vertical-align: top;
    padding-left: 7px;
    padding-right: 7px;
}

>>> .save-button-design-blocked {
    display: none;
}

>>> .remove-button-layout {
    display: inline-block;
    margin-top: 5px;
}

>>> .block-save-button {
    position: absolute;
    display: block;
    width: 50px;
    height: 34px;
    top: 1px;
    left: -4px;
    color: black;
}

>>> .unblock-save-button {
    display: none;
}

>>> .ag-header {
    background-color: #EEEEEE;
}

.option-design {
    cursor: pointer;
}

.option-design:hover {
    background-color: lightgrey;
}

>>> #addDate {
    font-size: 11px;
}

>>> .ag-status-bar {
    position: fixed;
    bottom: 3px;
}

>>> .ag-header {
    position: fixed;
    top: 250px;
}
</style>
