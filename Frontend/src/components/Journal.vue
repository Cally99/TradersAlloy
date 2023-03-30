<template lang="pug">
    div(class="journal-section")
        div(:style="`height:${windowsHeight - 342}px;`" style="overflow-y:scroll; background-color:white; border:0px solid;")
            div(class="journal-header" style="border:0px solid;")
                div(style="border:0px solid;")
                    span(style="border:0px solid;" class="ticker blue1 pt-1 pl-2 pr-2") {{stockData.ticker}}
                    span(class="pt-2 pl-2 pr-2 ml-8" style="font-size:1.4em; border:0px solid;") {{this.$t('Trade_Journal')}}
                    span(class="mt-1" style="float:right; border:0px solid;")
                        v-btn(@click="addTradeJournal" depressed class="green3" style="height:24px; color:#ffffff;")
                            span(class="pb-1" style="font-size:1.5em;") +&nbsp;
                            span(style="font-size:0.9em;") {{this.$t('Add')}}

            div(class="journal-content mt-5")
                div(v-if="insiders.length<1")
                    v-simple-table(class="mb-3" style="font-weight: bold;" dense)
                        template(v-slot:default)
                            thead(class="blue5")
                                tr
                                    th(class="text-left" style="border:0;" width="20%") Date
                                    th(class="text-left" style="border:0;") Note

                    div(class="d-flex justify-content-center mb-4")
                        div(style="width: 280px;") {{this.$t('any_journal')}} {{stockData.name}}

                div(v-else)
                    v-simple-table(dense class="mb-3")
                        template(v-slot:default)
                            thead(class="blue5")
                                tr
                                    th(class="text-left" style="border-bottom:0;" width="110") Date
                                    th(class="text-left" style="border-bottom:0;" width="70") Note
                                    th(class="text-left" style="border-bottom:0;" width="70")
                                    th(class="text-left" style="border-bottom:0;" width="160")
                                    th(class="text-left" style="border-bottom:0;")
                                    th(class="text-left" style="border-bottom:0;")
                                    th(style="border-bottom:0;")
                            tbody
                                tr(v-for="(item, index) in insiders" :key="'tr_'+index" :style="{backgroundColor: removeHoverEffect ? 'white' : ''}")
                                    td(v-show="item.type === 'diary'" class="hover-item" style="border-bottom: 1px solid #A3B3C2;")
                                        span(@click="selectHere($event)" :id="'select' + item.diary_item_id") {{item.date_created}}
                                        input(@keyup.enter="saveDate($event)" @blur="removeEditText" :id="'edit' + item.diary_item_id" :value="item.date_created" type="text" name="date" placeholder="Date here..." maxlength="10" style="width: 75px;border: 1px solid;display: none;")
                                    td(v-show="item.type === 'diary'" colspan="5" @click="useColorPicker(item, $event)" :style="{background: item.background, borderBottom: '1px solid lightgrey', padding: '0', margin: '0'}" class="tdNote hover-item not-close-palette pl-4 pr-4")
                                        span(@click="selectNoteTextElement($event)" :id="'noteLabelSelect' + item.diary_item_id" style="border: 0px solid;float: left;width: 100%;height: 100%; padding-top:5px;") {{item.note}}
                                        input(:value="item.note" @keyup.enter="saveNote($event), closeColorPicker()" @blur="removeEditNoteText()" :id="'noteTextSelect' + item.diary_item_id" type="text" name="note" placeholder="Note here..." class="not-close-palette" style="width: 100%;border: 1px solid;display: none;")
                                    td(v-show="item.type === 'diary'" @mouseover="removeHoverEffect = true" @mouseout="removeHoverEffect = false" @click="removeJournalNote(item.diary_item_id)" style="width:30px; background-color:white; padding:0;")
                                        v-list-item-icon(class="ml-1 mt-0 mr-0 mb-0")
                                            v-icon(class="hover-trash-can") $trashCan

                                    td(v-show="item.type !== 'diary'") {{ item.date }}
                                    td(v-show="item.type !== 'diary'") {{ item.tx_type }}
                                    td(v-show="item.type !== 'diary'" style="text-align:right;") {{ item.amount }}
                                    td(v-show="item.type !== 'diary'") @ {{ item.price }} {{ item.currency }}
                                    td(v-show="item.type !== 'diary'")
                                    td(v-show="item.type !== 'diary'" style="text-align:right;") {{ item.account_name }}
                                    td(v-show="item.type !== 'diary'")

        div(style="border:0px solid;")
            div
                v-simple-table(dense)
                    template(v-slot:default)
                        thead
                                tr
                                    th(colspan="2" style="font-size:18px; border:0px solid;") Summary of Closed Transactions
                        tbody
                            tr
                                td(style="width:180px; padding-left:35px; border:0px solid;") Gains:
                                td(style="border:0px solid;") {{ gains }} {{ currency }} ({{ userTradesFinished.length }} {{ (userTradesFinished.length < 2) ? 'Trade' : 'Trades' }})
                            tr
                                td(style="padding-left:35px; border:0px solid;") Total Capital Gains:
                                td(style="border:0px solid;") {{ totalCapitalGains }} {{ currency }}
                            tr
                                td(style="padding-left:35px; border:0px solid;") Total Dividends:
                                td(style="border:0px solid;") {{ totalDividends }} {{ currency }}
                            tr
                                td(style="padding-left:35px; border:0px solid;") Total Commissions:
                                td(style="border:0px solid;") {{ totalCommissions }} {{ currency }}
                            tr
                                td(style="padding-left:35px; border:0px solid;") First entry:
                                td(style="border:0px solid;") {{ firstEntry }} ({{ timeDiffOnFirstEntry }})
                            tr
                                td(style="padding-left:35px; border:0px solid;") Average holding:
                                td(style="border:0px solid;") {{ averageHolding }} days

        ColorPicker(@updateChart="emitUpdateChart" :selectedColor="selectedColor" ref="colorPicker")
</template>

<script>
import ColorPicker from './ColorPicker';
import { mapGetters, mapActions } from "vuex";
import apiService from "@/Services/ApiService";
import moment from 'moment';
import _ from 'lodash';

const helper = require('./../util/helper');

export default {
    name: 'Journal',
    props: {
        stock_id: {
            type: Number,
        }
    },
    components: {
        ColorPicker
    },
    data() {
        return {
            windowsWidth: 0,
            windowsHeight: 0,
            selectedColor: null,
            userId: JSON.parse(localStorage.getItem('user')).user_id,
            removeHoverEffect: false,
            showColorSelector: false,
            backgroundColors: ["#C2E0FC", "#C9FDCE", "#FFFFBA", "#FAE0BF", "#F4B6BB"],
            colorSelected: null,
            diaryItemId: null
        };
    },
    async mounted() {
        await this.loadTx(this.userId);
        //  WHY ARE WE LOADING HERE ? TOO LATE ... TOO MANY HOLES.

        this.windowsWidth = window.innerWidth;
        this.windowsHeight = window.innerHeight;

        window.addEventListener('click', this.close);
        window.addEventListener('resize', this.setWindowDimensions);
    },
    beforeDestroy() {
        window.removeEventListener('click', this.close);
        window.removeEventListener('resize', this.setWindowDimensions);
    },
    computed: {
        ...mapGetters(['getTx', 'getMapUserDiary']),

        getAllStocks() {
            return this.$store.getters.getAllStocks;
        },
        stockData() {
            return this.$store.getters["getMapStocks"].find(s => s.stock_id == this.stock_id);
        },
        insiders() {
            let data = [];
            const diary = this.getMapUserDiary.filter(item => item.stock_id === this.stock_id);

            diary.map((item) => {
                data.push(Object.assign({}, item, {type: 'diary'}, {date: item.date_created}));
            });

            let tx = this.txData.map((x) => {
                x.account_name = this.$store.getters.getUserAccounts.find((a) => a.user_account_id === x.user_account_id).account_name;
                x.date = x.tx_date;
                x.type = 'tx';

                return x;
            });

            tx = tx.filter((x) => x.tx_type !== 'DIVIDEND');

            data = data.concat(tx);

            data = _.orderBy(data, ['date'], ['desc']);

            return data;
        },
        txData() {
            const tx = this.getTx.filter((x) => x.stock_id === this.stock_id);

            return tx;
        },
        userTradesFinished() {
            const userTrades = this.$store.getters.getTrade;
            const userTradesOnStock = userTrades.filter((tx) => tx.stock_id === this.stock_id);
            const userTradesFinished = userTradesOnStock.filter((tx) => tx.exit_date !== null && tx.exit_price !== null && tx.exit_qty !== null);

            return userTradesFinished;
        },
        gains() {
            let entryCostSum = 0;
            let exitProfitSum = 0;

            for(const trade of this.userTradesFinished) {
                entryCostSum += (trade.entry_price * trade.entry_qty);
                exitProfitSum += (trade.exit_price * trade.exit_qty);
            }

            const pnl = helper.thousandFormatter((exitProfitSum - entryCostSum).toFixed(0));

            return pnl;
        },
        totalCapitalGains() {
            let entryCostSum = 0;
            let exitProfitSum = 0;

            for(const trade of this.userTradesFinished) {
                entryCostSum += (trade.entry_price * trade.entry_qty) + trade.entry_commission;
                exitProfitSum += (trade.exit_price * trade.exit_qty) - trade.exit_commission;
            }

            const pnl = helper.thousandFormatter((exitProfitSum - entryCostSum).toFixed(0));

            return pnl;
        },
        dividendsData() {
            const dividends = this.txData.filter((tx) => tx.tx_type === 'DIVIDEND');

            return dividends;
        },
        totalDividends() {
            let totalSum = 0;

            for(const dividend of this.dividendsData) {
                totalSum += dividend.price * dividend.qty;
            }

            return helper.thousandFormatter(totalSum);
        },
        totalCommissions() {
            let commissionsSum = 0;

            for(const trade of this.userTradesFinished) {
                commissionsSum += (trade.entry_commission + trade.exit_commission);
            }

            return commissionsSum;
        },
        firstEntry() {
            const firstEntryDate = _.minBy(this.userTradesFinished, 'entry_date').entry_date;

            return firstEntryDate;
        },
        timeDiffOnFirstEntry() {
            const firstEntryDate = _.minBy(this.userTradesFinished, 'entry_date').entry_date;

            return helper.getTimeDiff(firstEntryDate);
        },
        averageHolding() {
            const diffDaysArray = [];

            for(const trade of this.userTradesFinished) {
                const diffDays = moment(trade.exit_date).diff(trade.entry_date, 'days');

                diffDaysArray.push(diffDays);
            }

            let sumOfDiffDays = 0;

            for(const days of diffDaysArray) {
                sumOfDiffDays += days;
            }

            const averageDiffDays = (sumOfDiffDays / diffDaysArray.length).toFixed(0);

            return averageDiffDays;
        },
        currency() {
            const currency = this.getAllStocks.find((s) => s.stock_id === this.stock_id).currency_trade;

            return currency;
        }
    },
    methods: {
        ...mapActions(['loadTx', 'loadTrade']),
        emitUpdateChart() {
            this.$emit('updateChart');
        },
        setWindowDimensions() {
            this.windowsWidth = window.innerWidth;
            this.windowsHeight = window.innerHeight;
        },
        close(e) {
            const element = document.getElementsByClassName('journal-content')[0].children[0];

            if (!element.contains(e.target)) {
                this.$refs.colorPicker.closeColorPicker();
                this.showDropDown = false;
            }
        },
        closeColorPicker() {
            this.$refs.colorPicker.closeColorPicker();
        },
        useColorPicker(item, event) {
            this.$refs.colorPicker.openColorPicker();
            this.$refs.colorPicker.setClickedNote(item);

            const colorPickerElement = this.$refs.colorPicker.$el;
            const element = event.target;
            const bottom = element.parentNode.offsetTop;
            const left = element.parentNode.offsetLeft;

            colorPickerElement.style.top = `${bottom + 90}px`;
            colorPickerElement.style.left = `${left + 45}px`;

            this.selectedColor = item.background.trim();
        },
        async saveNote(event) {
            const diaryItemId = parseInt((event.target.id).substr(14));
            const textElement = document.getElementById('noteTextSelect' + diaryItemId);
            const selectedElement = document.getElementById('noteLabelSelect' + diaryItemId);
            const textValue = textElement.value;

            const data = {
                diary_item_id: diaryItemId,
                note: textValue
            };

            await apiService.updateDiaryItem(data);

            this.$store.commit('updateMapUserDiaryItem', Object.assign({}, data, { key: 'note' }));

            textElement.style.display = 'none';
            selectedElement.style.display = 'block';

            this.$emit('updateChart');
        },
        removeEditNoteText() {
            for(const item of this.insiders) {
                const textElement = document.getElementById('noteTextSelect' + item.diary_item_id);
                const labelElement = document.getElementById('noteLabelSelect' + item.diary_item_id);

                textElement.value = item.note;
                textElement.style.display = 'none';

                labelElement.style.display = 'block';
            }
        },
        selectNoteTextElement(event) {
            for(const item of this.insiders) {
                const noteLabelSelectElement = document.getElementById('noteLabelSelect' + item.diary_item_id);
                const noteTextSelectElement = document.getElementById('noteTextSelect' + item.diary_item_id);

                noteTextSelectElement.value = item.note;
                noteTextSelectElement.style.display = 'none';

                noteLabelSelectElement.style.display = 'block';
            }

            const diaryItemId = parseInt((event.target.id).substr(15));
            const textElement = document.getElementById('noteTextSelect' + diaryItemId);
            const labelElement = document.getElementById('noteLabelSelect' + diaryItemId);

            textElement.style.display = 'block';
            textElement.focus();

            labelElement.style.display = 'none';
        },
        async removeJournalNote(diaryItemId) {
            await apiService.deleteDiaryItem(diaryItemId);

            this.$store.commit("removeMapUserDiaryItem", diaryItemId);

            this.$emit('updateChart');
        },
        removeEditText() {
            for(const item of this.insiders) {
                const textElement = document.getElementById('edit' + item.diary_item_id);
                const labelElement = document.getElementById('select' + item.diary_item_id);

                textElement.value = item.date_created;
                textElement.style.display = 'none';

                labelElement.style.display = 'block';
            }
        },
        async saveDate(event) {
            const diaryItemId = parseInt((event.target.id).substr(4));
            const textElement = document.getElementById('edit' + diaryItemId);
            const selectedElement = document.getElementById('select' + diaryItemId);
            const textValue = textElement.value;

            const data = {
                diary_item_id: diaryItemId,
                date_created: textValue
            };

            await apiService.updateDiaryItem(data);

            this.$store.commit('updateMapUserDiaryItem', Object.assign({}, data, { key: 'date_created' }));

            textElement.style.display = 'none';
            selectedElement.style.display = 'block';

            this.$emit('updateChart');
        },
        selectHere(event) {
            for(const item of this.insiders) {
                const textElementDelete = document.getElementById('edit' + item.diary_item_id);
                const labelElementShow = document.getElementById('select' + item.diary_item_id);

                textElementDelete.value = item.date_created;
                textElementDelete.style.display = 'none';

                labelElementShow.style.display = 'block';
            }

            const diaryItemId = parseInt((event.target.id).substr(6));
            const textElement = document.getElementById('edit' + diaryItemId);
            const labelElement = document.getElementById('select' + diaryItemId);

            textElement.style.display = 'block';
            textElement.focus();

            labelElement.style.display = 'none';
        },
        async addTradeJournal() {
            try {
                const diaryItem = {
                    user_id: this.userId,
                    stock_id: this.stock_id,
                    date_created: new Date().toISOString().substring(0, 10),
                    note: 'text',
                    background: '#FFFFBA'
                };

                const response = (await apiService.insertDiaryItem(diaryItem)).data;

                this.$store.commit('addMapUserDiaryItem', response);

                this.$emit('updateChart');
            } catch (error) {
                console.log(error.message);
            }
        }
    }
}
</script>

<style scoped>
.v-btn {
    text-transform: none;
}

.v-icon:hover {
    cursor: pointer;
    color: red;
}

.hover-item:hover {
    cursor: pointer;
}

.colorBox:hover {
    cursor: pointer;
    border: 1px solid grey;
}

#colorSelector {
    position: absolute;
    background-color: white;
}

>>> .set-trash-can-container {
    width: 20px;
    height: 20px;
}

>>> .set-trash-can-color {
    stroke: #333333;
}

>>> .hover-trash-can:hover .set-trash-can-color {
    stroke: red;
}
</style>
