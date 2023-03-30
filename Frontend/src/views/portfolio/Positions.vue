<template lang="pug">
    div(class="px-0")
        PortfolioHeader(:competition="competition" :title="$t('positions')" )

        v-container(fluid fill-height)
            v-row
                v-col(cols=12)
                    AgGridVue(
                        style="width: 98%; margin: 12px;"
                        :frameworkComponents="frameworkComponents"
                        :class="{'ag-theme-dark':$vuetify.theme.isDark,'ag-theme-balham':!$vuetify.theme.isDark}"
                        id="history"
                        gridApi=null
                        gridColumnApi=null
                        :gridOptions="gridOptions"
                        :defaultColDef="defaultColDef"
                        cellValueChanged="onCellValueChanged"
                        :animateRows="true"
                        :columnDefs="columnDefs"
                        :rowData="position_array"
                        :autoGroupColumnDef={headerName: 'Ticker'}
                    )
            div(id="diaryNotes" class="dropDown2")
                label(class="ml-1 mr-2") {{new Date().toISOString().slice(0,10)}}
                input(type="text"
                    v-model="newNote"
                    @keyup.enter="createDiaryItem"
                    @focus="closeColorPicker"
                    style="background-color:#FFFFBA; border:1px solid silver; width:280px;"
                    placeholder="new journal entry...")
                div(v-for="note in notes" :key="note.diary_item_id")
                    div(@click="useColorPicker(note, $event)" class="m-1" :style="`background-color:${note.background};`") {{ note.date_created }} {{ note.note }}


            v-row(justify="space-around")
                v-col(cols=6 align-self="center")
                    div(class="display-1 font-weight-thin") {{$t('conviction_sector_exposure')}}
                    ChartConvictionVsExposure

                v-col(cols=6 align-self="center")
                    div(class="display-1 font-weight-thin") {{$t('exposure_by_sector')}}
                    ChartExposureBySector

            ColorPicker(:selectedColor="selectedColor" ref="colorPicker")

</template>

<script>
    import { AgGridVue } from "ag-grid-vue";
    import 'ag-grid-enterprise';
    import "ag-grid-community/dist/styles/ag-grid.css";
    import "ag-grid-community/dist/styles/ag-theme-dark.css";
    import "ag-grid-community/dist/styles/ag-theme-balham.css";
    import "ag-grid-community/dist/styles/ag-theme-alpine.css";
    import ApiService from "@/Services/ApiService.js";
    import { mapGetters, mapActions } from "vuex";
    import ChartConvictionVsExposure from './ChartConvictionVsExposure.vue';
    import ChartExposureBySector from './ChartExposureBySector.vue';
    import ColorPicker from './../../components/ColorPicker.vue';
    import UserAccountDropdownMenu from "./../../components/UserAccountDropdownMenu.vue";
    import PortfolioHeader from "./PortfolioHeader";

    const _ = require('lodash');

    const helper = require("../../util/helper.js");

    export default {
        name: "Positions",
        components: {
            PortfolioHeader,
            AgGridVue,
            ChartConvictionVsExposure,
            ChartExposureBySector,
            ColorPicker,
            UserAccountDropdownMenu
        },
        watch : {
            async getShowSelectedAccounts() {
                this.position_array = await this.getGridData();
                this.position_array_sell = JSON.parse(JSON.stringify(this.position_array));
                this.setNotes();
            },
            async competition_user_account_id() {
                this.position_array = await this.getGridData();
                this.position_array_sell = JSON.parse(JSON.stringify(this.position_array));
                this.setNotes();
            }
        },
        computed: {
            ...mapGetters(["getTx", 'getCompetitions', 'getUserAccounts', 'getUserTrades']),
            competition() {
                if (this.competition_id !== -1) {
                    return this.$store.getters.getCompetitions.find( x => x.competition_id === this.competition_id);
                } else {
                    return null;
                }
            },
            getUserAccountsShownAmount() {
                return this.getUserAccounts.filter((a) => a.is_selected === true && a.competition_id === null).length;
            },
            getUserAccountsShown() {
                return this.getUserAccounts.filter((a) => a.is_selected === true && a.competition_id === null);
            },
            getShowSelectedAccounts() {
                return this.$store.getters.getShowSelectedAccounts;
            },
            getCompetitionAccount() {
                return this.getUserAccounts.filter((a) => a.user_account_id === this.competition_user_account_id);
            },
            competition_id() {
                return (this.$route.params.competition_id !== undefined) ? Number(this.$route.params.competition_id) : -1;
            },
            competition_user_account_id() {
                return this.competition_id !== -1 ? this.getUserAccounts.find((a) => a.competition_id === this.competition_id).user_account_id : -1;
            }
        },
        beforeMount() {
            this.context = { componentParent: this };
            this.frameworkComponents = {}
        },
        async mounted() {
            this.gridOptions.api.setDomLayout("autoHeight");

            const agStatusBarCenter = document.getElementsByClassName('ag-status-bar-left')[0];
            const plChild = document.createElement('span');
            plChild.style.paddingLeft = "20px";
            plChild.style.paddingRight = "4px";
            plChild.style.paddingTop = "8px";
            plChild.style.paddingBottom = "8px";
            plChild.innerHTML = '<span ref="eLabel">P/L(Sum):</span>' +
                                ':&nbsp;' +
                                '<span ref="eValue" id="p_l_sum" class="ag-status-name-value-value">0</span>' +
                                '&nbsp;' + '&nbsp;'+ '&nbsp;'+ '&nbsp;'+ '&nbsp;'+

                                '<span>avg' + '&nbsp;<span>' +
                                '<span id="trades_sum" class="ag-status-name-value-value">0</span>' + '&nbsp;' +
                                '<span> trades week' +

                                '&nbsp;' + '&nbsp;'+ '&nbsp;'+ '&nbsp;'+ '&nbsp;'+
                                '<span>     Value: </span>' +
                                ':&nbsp;' +
                                '<span ref="eValue" id="value_sum" class="ag-status-name-value-value">0</span>'
                                ;

            agStatusBarCenter.append(plChild);

            console.log('agStatusBarCenter', agStatusBarCenter);

            this.position_array = await this.getGridData();
            this.position_array_sell = JSON.parse(JSON.stringify(this.position_array));

            console.log('position_array: ', JSON.parse(JSON.stringify(this.position_array)));
            console.log('position_array_sell: ', JSON.parse(JSON.stringify(this.position_array_sell)));

            this.setNotes();
        },
        created() {
            window.addEventListener('click', this.close)
        },
        beforeDestroy() {
            window.removeEventListener('click', this.close)
        },
        data() {
            function customGetLatestDate(values) {
                let latestdate = _.maxBy(values, function(o) {
                    return o;
                });

                return latestdate;
            }

            function customSum(values) {
                let sum = 0;

                for(const value of values) {
                    sum += parseFloat(value);
                }

                const decimalCheck = sum.toFixed(2).split(".")[1];

                let editedSum = 0;

                if(decimalCheck === "00") {
                    editedSum = sum.toFixed(0);
                }

                if(decimalCheck[0] > 0) {
                    editedSum = sum.toFixed(1);
                }

                else if(decimalCheck[1] > 0) {
                    editedSum = sum.toFixed(2);
                }

                return editedSum;
            }

            // plProcent group ******************************
            function plProcentQtyGetter(params) {
                if (!params.node.group) {
                    return createPlProcentObject(params.data.qty, params.data.p_l_procent);
                }
            }

            function plProcentWeightedAverageAggFunc(values) {
                let p_l_procentSum = 0;
                let qtySum = 0;

                values.forEach(function(value) {
                    p_l_procentSum += (value.p_l_procent * value.qty);
                    qtySum += value.qty;
                });

                return (p_l_procentSum / qtySum).toFixed(2) + '%';
            }

            function createPlProcentObject(qty, p_l_procent) {
                return {
                    qty: qty,
                    p_l_procent: p_l_procent,
                    toString: function() {
                        return p_l_procent + '%';
                    }
                }
            }
            // **********************************************

            // price group **********************************
            function priceQtyGetter(params) {
                if (!params.node.group) {
                    return createPriceObject(params.data.qty, params.data.price);
                }
            }

            function priceWeightedAverageAggFunc(values) {
                let priceSum = 0;
                let qtySum = 0;

                values.forEach(function(value) {
                    priceSum += (value.price * value.qty);
                    qtySum += value.qty;
                });
                return (Number.isInteger((priceSum / qtySum))) ? helper.thousandFormatter((priceSum / qtySum)) : helper.thousandFormatter((priceSum / qtySum).toFixed(2));
            }

            function createPriceObject(qty, price) {
                return {
                    qty: qty,
                    price: price,
                    toString: function() {
                        return price;
                    }
                }
            }
            // **********************************************

            return {
                selectedColor: null,
                user: JSON.parse(localStorage.getItem('user')),
                plSum: 0,
                agCenterColsViewport: null,
                todaysDateField: new Date().toISOString().slice(0,10),
                priceField: '',
                quantityField: '',
                commissionField: '',
                buy: true,
                stockId: null,
                scrollLeft: null,
                tempScrollLeft: null,
                scrollTop: null,
                tempScrollTop: null,
                notes: [],
                rect: null,
                posLeft: null,
                posTop: null,
                newNote: '',
                allDocs: [],
                allBuySellAggElements: [],
                position_array: [],
                position_array_sell: [],
                defaultColDef: {
                    cellClass: 'number-cell',
                    resizable: true,
                    filter: true
                },
                gridOptions: {
                    rowHeight: 40,
                    headerHeight: 40,
                    floatingFiltersHeight: 0,
                    suppressRowTransform: true,
                    suppressAggFuncInHeader: true,
                    groupRowRendererParams: {
                        checkbox: true
                    },
                    statusBar: {
                        statusPanels: [
                            { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' }
                        ]
                    },
                    context: {
                        componentParent: this
                    },
                },
                columnDefs: [
                    {
                        headerName: this.$t('ticker'),
                        field: "stock_id",
                        sortable: true,
                        rowGroup: true,
                        hide: true,
                        maxWidth: 100,
                        cellRenderer: (row) => {
                            const stock_id = parseInt(row.value);
                            const ticker = this.$store.getters.getAllStocks.find((s) => s.stock_id === stock_id).ticker;

                            return `<div class="ticker blue1 mt-1 mr-1">${ticker}</div>`;
                        }
                    },
                    {
                        headerName: "Sort on date field",
                        field: "tx_date",
                        sortable: true,
                        hide: true
                    },
                    {
                        headerName: this.$t('date'),
                        field: "tx_date",
                        filter: 'filterExchanges',
                        floatingFilter: true,
                        suppressMenu: true,
                        sortable: true,
                        aggFunc: customGetLatestDate,
                        maxWidth: 100,
                        // valueFormatter: function(params) {
                        //     return params.value.slice(0,10);
                        // },
                    },
                    {
                        headerName: "Trade ID",
                        field: "trade_id",
                        hide: true,
                        maxWidth: 100
                    },
                    {
                        headerName: this.$t('qty'),
                        field: "qty",
                        aggFunc: 'sum',
                        type: 'rightAligned',
                        maxWidth: 100,
                        valueFormatter: (params) => {
                            return helper.thousandFormatter(params.value);
                        }
                    },
                    {
                        headerName: this.$t('price'),
                        field: "price",
                        valueGetter: priceQtyGetter,
                        aggFunc: priceWeightedAverageAggFunc,
                        type: 'rightAligned',
                        maxWidth: 100
                    },
                    {
                        headerName: this.$t('Value'),
                        field: "value",
                        // aggFunc: customSum,
                        aggFunc: params => {
                            console.log('+++++++++++++', params);

                            let sum = 0;
                            for (const v of params.values) {
                                sum = sum + parseInt(v)
                            }
                            return sum;
                        },
                        type: 'rightAligned',
                        maxWidth: 100,
                        valueFormatter: (params) => {
                            return helper.thousandFormatter(params.value);
                        }
                    },
                    {
                        headerName: this.$t('price_today'),
                        field: "price_today",
                        aggFunc: 'last',
                        type: 'rightAligned',
                        maxWidth: 120,
                        valueFormatter: (params) => {
                            return helper.thousandFormatter(params.value);
                        }
                    },
                    {
                        headerName: this.$t('pl'),
                        field: "p_l",
                        // aggFunc: customSum,
                        aggFunc: params => {
                            let sum = 0;
                            params.values.forEach(value => sum += parseInt(value));
                            return sum;
                        },
                        type: 'rightAligned',
                        maxWidth: 100,
                        valueFormatter: function(params) {
                            return helper.thousandFormatter(params.value);
                        }
                    },
                    {
                        headerName: this.$t('pl_pct'),
                        field: "p_l_procent",
                        valueGetter: plProcentQtyGetter,
                        aggFunc: plProcentWeightedAverageAggFunc,
                        type: 'rightAligned',
                        maxWidth: 100,
                        valueFormatter: function(params) {
                            return helper.thousandFormatter(params.value);
                        }
                    },
                    {
                        headerName: this.$t('dairy_notes'),
                        field: "description",
                        suppressColumnsToolPanel: true,
                        maxWidth: 200,
                        cellRenderer: () => {
                            return `<div class="descriptionField"></div>`;
                        }
                    },
                    {
                        headerName: this.$t('amount'),
                        field: "amount",
                        hide: true,
                        maxWidth: 100
                    },
                    {
                        headerName: this.$t('commission'),
                        field: "commission",
                        hide: true,
                        maxWidth: 120
                    }
                ]
            }
        },
        destroyed() {
            this.agCenterColsViewport.removeEventListener('scroll', this.scrollNone);
            this.agCenterColsViewport.parentElement.parentElement.removeEventListener('scroll', this.scrollTopNone);
            document.removeEventListener('mouseup', this.displayNotesNone);
            this.newNote = "";
        },
        methods: {
            ...mapActions(["loadTx", "saveTx", "saveTrade", "loadTrades"]),
            closeColorPicker() {
                this.$refs.colorPicker.closeColorPicker();
            },
            close(e) {
                if (!this.$el.contains(e.target)) {
                    this.$refs.colorPicker.closeColorPicker();
                }
            },
            useColorPicker(note, event) {
                this.$refs.colorPicker.openColorPicker();
                this.$refs.colorPicker.setClickedNote(note);

                const colorPickerElement = this.$refs.colorPicker.$el;
                const bottom = event.clientY;
                const left = event.clientX;

                colorPickerElement.style.top = `${bottom}px`;
                colorPickerElement.style.left = `${left + 5}px`;

                this.selectedColor = note.background.trim();
            },
            methodFromParent(cell) {
                alert('Parent Component Method from ' + cell + '!');
            },
            displayNotesNone(e) {
                const diaryNotes = document.getElementById('diaryNotes');

                if(!diaryNotes.contains(e.target) && !this.$refs.colorPicker.$el.contains(e.target)) {
                    this.$refs.colorPicker.closeColorPicker();
                    diaryNotes.style.display = 'none';
                }
            },
            scrollNone() {
                this.scrollLeft = this.agCenterColsViewport.scrollLeft;

                const diaryNotes = document.getElementById('diaryNotes');
                const sellBuyPopup = document.getElementById('sellBuyPopup');

                diaryNotes.style.left = ((this.posLeft + this.tempScrollLeft) - this.scrollLeft) + 'px';
                sellBuyPopup.style.left = ((this.posLeft + this.tempScrollLeft) - this.scrollLeft) + 'px';
            },
            scrollTopNone() {
                this.scrollTop = this.agCenterColsViewport.parentElement.parentElement.scrollTop;
                const diaryNotes = document.getElementById('diaryNotes');
                const sellBuyPopup = document.getElementById('sellBuyPopup');

                diaryNotes.style.top = ((this.posTop + this.tempScrollTop) - this.scrollTop) + 'px';
                sellBuyPopup.style.top = ((this.posTop + this.tempScrollTop) - this.scrollTop) + 'px';
            },
            async createDiaryItem() {
                if(!this.newNote) {
                    return;
                }

                try {
                    const response = await ApiService.insertDiaryItem({
                        user_id: this.user.user_id,
                        stock_id: this.stockId,
                        note: this.newNote,
                        date_created: new Date().toISOString().slice(0,10),
                        background: '#FFFFBA'
                    });

                    this.$store.commit("addMapUserDiaryItem", response.data);
                    this.notes = _.orderBy(this.$store.getters["getMapUserDiary"].filter(item => item.stock_id === this.stockId), ['date_created', 'diary_item_id'], ['desc', 'desc']);
                    const updateTextForSpecificDiaryNote = document.getElementById(this.stockId);
                    updateTextForSpecificDiaryNote.textContent = this.newNote;
                    updateTextForSpecificDiaryNote.classList.remove("btnTest");
                    updateTextForSpecificDiaryNote.style.backgroundColor = '#FFFFBA';
                    this.newNote = "";
                } catch(error) {
                    console.log(error.message);
                }
            },
            async getGridData() {
                const user_id = this.user.user_id;

                await this.loadTrades(user_id);

                let userTrades = this.getUserTrades;

                if(this.competition_user_account_id === -1) {
                    userTrades = userTrades.filter((group) => {
                        return (group.exit_date === null );
                    });
                } else {
                    userTrades = userTrades.filter((group) => {
                        return (group.user_account_id === this.competition_user_account_id && group.exit_date === null );
                    });
                }

                let modifiedUserTrades = [];

                userTrades.forEach((item) => {
                    const userTradeTempObject = {
                        amount: -(item.entry_price * item.entry_qty),
                        commission: item.entry_commission,
                        description: "",
                        stock_id: item.stock_id,
                        price: item.entry_price,
                        qty: item.entry_qty,
                        ticker: item.ticker,
                        tx_date: item.entry_date,
                        user_id: item.user_id,
                        trade_id: item.trade_id,
                        user_account_id: item.user_account_id
                    };
                    modifiedUserTrades.push(userTradeTempObject);
                });

                modifiedUserTrades.forEach((item) => {
                    this.$store.getters['getAllStocks'].map((stock) => {
                        if(item.stock_id === stock.stock_id) {
                            item.price_today = stock.price_today;
                        }
                    });

                    const sum = item.qty * item.price;
                    const decimalCheck = sum.toFixed(2).split(".")[1];

                    let editedSum = 0;

                    if(decimalCheck === "00") {
                        editedSum = sum.toFixed(0);
                    }

                    if(decimalCheck[0] > 0) {
                        editedSum = sum.toFixed(1);
                    }

                    else if(decimalCheck[1] > 0) {
                        editedSum = sum.toFixed(2);
                    }

                    item.value = editedSum;
                    item.p_l = ((item.price_today - item.price) * item.qty).toFixed(2);
                    item.p_l_procent = (item.p_l / item.value).toFixed(2);
                    item.description = "";

                    return item;
                });

                let arrSortedOnStockId = _.orderBy(modifiedUserTrades, ["stock_id", "tx_date"], ["asc", "desc"]);
                arrSortedOnStockId = arrSortedOnStockId.filter((t) => t.user_account_id !== null);

                const tradesOnShownAccounts = [];

                if(this.competition_user_account_id === -1) {
                    for(const trade of arrSortedOnStockId) {
                        for(const account of this.getUserAccountsShown) {
                            if(account.user_account_id === trade.user_account_id) {
                                tradesOnShownAccounts.push(trade);
                            }
                        }
                    }
                } else {
                    for(const trade of arrSortedOnStockId) {
                        for(const account of this.getCompetitionAccount) {
                            if(account.user_account_id === trade.user_account_id) {
                                tradesOnShownAccounts.push(trade);
                            }
                        }
                    }
                }

                console.log('aaaaa - final');
                console.table(tradesOnShownAccounts);

                return tradesOnShownAccounts;
            },
            setNotes() {
                this.allDocs = this.$el.getElementsByClassName('descriptionField');
                const arrNumberOfAggGroups = Object.keys(_.groupBy(this.position_array, 'stock_id'));

                const myInterval = setInterval(() => {
                    if(this.allDocs.length === arrNumberOfAggGroups.length) {
                        this.agCenterColsViewport = document.getElementsByClassName('ag-center-cols-viewport')[0];

                        for (let i = 0; i < this.allDocs.length; i++) {
                            const tempNotes = this.$store.getters["getMapUserDiary"].filter(item => item.stock_id === parseInt(arrNumberOfAggGroups[i]));

                            if(tempNotes.length > 0) {
                                const sortedTempNotes = _.orderBy(tempNotes, ['date_created', 'diary_item_id'], ['desc', 'desc']);
                                const latestNote = sortedTempNotes[0].note;
                                const background = (sortedTempNotes[0].background).trim();
                                this.allDocs[i].innerHTML = '<button id="' + arrNumberOfAggGroups[i] + '" style="width:100%; text-align:left; background-color:' + background + ';">' + latestNote + '</button>';
                            } else {
                                this.allDocs[i].innerHTML = '<button id="' + arrNumberOfAggGroups[i] + '" class="btnTest" style="width:100%; text-align:left;">Click to add Journal Notes</button>';
                            }

                            this.allDocs[i].addEventListener("click", (item) => {
                                this.tempScrollLeft = this.agCenterColsViewport.scrollLeft;
                                this.tempScrollTop = this.agCenterColsViewport.parentElement.parentElement.scrollTop;

                                this.stockId = parseInt(item.target.id);

                                this.notes = _.orderBy(this.$store.getters["getMapUserDiary"].filter(item => item.stock_id === this.stockId), ['date_created', 'diary_item_id'], ['desc', 'desc']);

                                // console.log(this.notes);

                                this.rect = item.target.getBoundingClientRect();
                                this.posLeft = this.rect.left - 52;
                                this.posTop = this.rect.top + document.body.scrollTop + 30;

                                const diaryNotes = document.getElementById('diaryNotes');
                                diaryNotes.style.display = 'block';
                                diaryNotes.style.left = this.posLeft + 'px';
                                diaryNotes.style.top = this.posTop + 'px';
                            });
                        }

                        this.getPlSum();

                        document.addEventListener('mouseup', this.displayNotesNone);

                        this.sortLocalAgGrid();

                        clearInterval(myInterval);
                    }
                }, 50);
            },
            sortLocalAgGrid() {
                const sort = [
                    {
                        colId: 'stock_id',
                        sort: 'asc',
                    },
                    {
                        colId: 'tx_date',
                        sort: 'desc',
                    }
                ];

                this.gridOptions.api.setSortModel(sort);
            },
            getPlSum() {
                this.plSum = 0;
                this.valueSum = 0;
                this.tradeSum = 0;
                this.gridOptions.api.forEachNode((rowNode) => {
                    if(rowNode.data !== undefined) {
                        this.plSum += parseFloat(rowNode.data.p_l);
                        this.valueSum += parseFloat(rowNode.data.value);
                        this.tradeSum += 1;
                    }
                });
                this.plSum = this.plSum.toFixed(2);
                this.valueSum = this.valueSum.toFixed(2);
                this.tradeSum = (this.tradeSum / 52).toFixed(2);

                const plSumElement = document.getElementById('p_l_sum');
                plSumElement.innerHTML = this.plSum;

                const valueSumElement = document.getElementById('value_sum');
                valueSumElement.innerHTML = this.valueSum;

                const tradeSumElement = document.getElementById('trades_sum');
                tradeSumElement.innerHTML = this.tradeSum;
            }
        }
    }
</script>

<style>
    input[type="text"]::placeholder {
        text-align: right;
    }

    .btnTest {
        color: rgb(0, 161, 255);
    }

    .dropDown2 {
        display: none;
        z-index: 0;
        position: absolute;
        background: white;
        border: 1px solid rgba(0, 0, 0, 0.1);
        padding: 5px 0 0 0 ;
        margin: -5px 0 0 40px;
        min-width: 380px;
        box-shadow: 10px 13px 48px -4px rgba(0,0,0,0.49);
        overflow-y: visible;
        -webkit-overflow-scrolling: touch;
    }

    .ag-theme-balham .ag-header,
    .ag-theme-balham .ag-status-bar {
        background-color: #EEEEEE;
    }

    .ag-theme-balham .ag-row {
        border: 0;
    }

    .ag-theme-balham .ag-row-level-1 {
        color: #AEAEAE;
    }

    #x-mark-close {
        cursor: pointer;
    }
</style>

<style scoped>
    .headline-text {
        font-size: 36px;
        font-weight: bold;
    }

</style>
