<template>

  <div
    @mousemove="setCursorOnHover($event)"
    @contextmenu.prevent="rightMouse"
    tabindex="0"
    @keydown.esc="closeSetting"
    :class="{ 'pt-12': toolbar }"
    style="outline: none"
  >
    <trading-vue
      :chart-config="{ DEFAULT_LEN: 500, USER_TYPE: user.type, USER_TRADE_PLAN_COUNT: allTradeLine.length }"
      :title-txt="company.ticker"
      v-on:chnInterval="chnInterval"
      v-on:chnLineType="chnLineType"
      :legend-buttons="['display', 'remove']"
      v-on:legend-button-click="legend_button_click"
      :data="chart"
      :page="page"
      :width="chartWidth"
      :height="chartHeight"
      :toolbar="toolbar"
      :legendView="legendView"
      :color-back="colors.colorBack"
      :color-grid="colors.colorGrid"
      :color-text="colors.colorText"
      v-on:change-settings="chnTradeLine"
      v-on:drawing-mode-off="createTradeLine"
      v-on:remove-layer-meta="removeTradeLine"
      v-on:object-selected="selectTradeLine"
      v-on:grid-mousedown="blurTradeLine"
      v-on:settings-click="settingsClick"
      v-on:settings-history-click="historySettingsClick"
      ref="tradingVue"
    ></trading-vue>
    <div
      class="setting-popup d-flex align-center"
      v-if="settingPop"
      :style="`top:${mousePosition.y}px; left:${mousePosition.x}px`"
      @click="(settingPop = false), (focusedTradeLine = true)"
    >
      <v-icon>settings</v-icon>
      <span class="ml-1">Setting</span>
    </div>

    <div v-if="focusedTradeHistory" class="tradeInfo">
      <div class="setting-herader">
        <div class="d-flex justify-space-between align-center">
          <h3 class="mb-0">Edit Your Trade History</h3>
          <v-icon class="cursor-pointer" @click="focusedTradeHistory = false"
            >close</v-icon
          >
        </div>
      </div>
      <v-divider class="p-0 my-2"></v-divider>

      <div
        class="target-price-section d-flex justify-space-between align-center"
        style="display: flex; align-items: center; justify-content: center"
      >
        <label class="m-0" style="margin: 0px; min-width: 100px">Entry</label>
        <input
          type="date"
          class="text-right"
          v-model="entry_date"
          step="0.1"
          style="border: 1px solid #ccc; width: 180px; padding: 5px 10px"
        />

        <label style="min-width: 80px; margin: 0px; margin-left: 40px"
          >Price</label
        >
        <input
          type="number"
          class="text-right"
          v-model="entry_price"
          step="0.1"
          style="border: 1px solid #ccc; width: 100px; padding: 5px 10px"
        />
      </div>

      <div
        class="target-price-section d-flex justify-space-between align-center"
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 20px;
        "
      >
        <label class="m-0" style="margin: 0px; min-width: 100px">Exit</label>
        <input
          type="date"
          v-model="exit_date"
          class="text-right"
          step="0.1"
          style="border: 1px solid #ccc; width: 180px; padding: 5px 10px"
        />

        <label style="min-width: 80px; margin: 0px; margin-left: 40px"
          >Price</label
        >
        <input
          type="number"
          v-model="exit_price"
          class="text-right"
          step="0.1"
          style="border: 1px solid #ccc; width: 100px; padding: 5px 10px"
        />
      </div>

      <v-divider class="p-0 my-2"></v-divider>

      <div
        class="target-price-section d-flex justify-space-between align-center"
        style="display: flex; align-items: center; justify-content: center"
        v-if="!showPremiumBtn"
      >
        <label
          class="m-0"
          style="margin: 0px; min-width: 100px; max-width: 290px"
          >Premium Users Trades can also be maintained in portfoilio
          menu.</label
        >

        <v-btn
          depressed
          color="primary"
          style="
            width: 180px;
            background-color: #ffcc27 !important;
            color: #ca493f;
            border: 1px solid #ca493f !important;
          "
        >
          Premium Plan
        </v-btn>
      </div>
      <v-divider class="p-0 my-2"></v-divider>
      <div class="d-flex align-center mt-4 justify-end">
        <v-btn
          depressed
          color="primary"
          @click="updateTradeHistory"
          style="background-color: #0084fd !important"
        >
          Done
        </v-btn>
      </div>
    </div>

    <div v-if="focusedText" id="tradeInfoContainer" class="tradeInfo" :style="{top: positionY, left: positionX, border: '1px solid'}">
      <div class="setting-herader">
        <div class="d-flex justify-space-between">
          <h3 id="journalNoteHeadline" class="mb-0 pt-2" @mousedown="mouseDownCheck = true" @mouseup="mouseDownCheck = false, x = null" @mouseout="mouseDownCheck = false" @mousemove="moveTradeInfoContainer($event)" style="font-size: 21px;width: 305px;">Journal Note</h3>
          <v-icon class="cursor-pointer" style="height: 25px;" @click="focusedText = false"
            >close</v-icon
          >
        </div>
      </div>
      <div class="d-flex justify-space-between align-center mt-3 mr-4">
        <input
          @keypress.enter="focusedText = false"
          v-model="text"
          type="text"
          class="p-1"
          :style="{border: '1px solid', width: '100%', backgroundColor: textBackground}"
        />
      </div>
      <div class="d-flex align-center mt-4">
        <div v-for="(backgroundColor, index) in backgroundColors" :key="index">
          <div
            @click="textBackground = backgroundColor"
            class="background-color-item mr-4"
            :class="{ active: backgroundColor == textBackground }"
            :style="{ border: backgroundColor != textBackground ? '1px solid #BDBDBD' : '', background: backgroundColor }"
          ></div>
        </div>
      </div>
    </div>

    <div v-if="focusedNews" id="tradeInfoContainer" class="newsInfo" :style="{top: positionY, left: positionX, border: '1px solid #FFE5B1'}">
      <div class="main-news-container p-2">
        <div>
          <div class="title-design mb-1"> {{ newsTitle }}</div>
          <div class="news-text-design mb-2" v-html="newsText"></div>
        </div>
      </div>
    </div>


    <DropDownTradePlansChartPrice v-if="focusedTradeLine" :stock="stock" ticker="company.ticker" class="dropdown-trade-plans" style="width:570px;" ref="dropdown-trade-plans" :page="page"/>
    <TradePlansWarning class="trade-plans-warning" v-if="showWarning" @close-warning="changeShowWarning"/>
  </div>
</template>

<script>
/* eslint-disable no-console */
import TradingVue from "./Trading/TradingVue";
import DataCube from "./Trading/helpers/datacube.js";
import apiService from "@/Services/ApiService";
import DropDownTradePlansChartPrice from "@/components/DropDownTradePlansChartPrice.vue";
import TradePlansWarning from "@/components/TradePlansWarning.vue";
import { mapActions } from "vuex";

export default {
  name: "ChartPrice",
  components: {
    TradingVue,
    DropDownTradePlansChartPrice,
    TradePlansWarning,
  },
  props: {
    small: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: "chart",
    },
    company_id: Number,
    stock_id: Number,
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    toolbar: {
      type: Boolean,
      default: true,
    },
    legendView: {
      type: Boolean,
      default: true,
    },
    single: {
      type: Boolean,
      default: false,
    },
    page: {
      type: String,
      default: 'wl'
    }
  },

  data() {
    return {
      posX: 1,
      posY: 1,
      checkPreventDeleteTradePlan: true,
      pin: '',
      isChartPriceLinkVisible: false,
      x: null,
      positionX: '650px',
      positionY: '450px',
      mouseDownCheck: false,
      chartWidth: this.width,
      chartHeight: this.height,
      tagetPrice: 0,
      stopPrice: 0,
      entryPrice: 0,
      backgroundColors: ["#C2E0FC", "#C9FDCE", "#FFFFBA", "#FAE0BF", "#F4B6BB"],
      mousePosition: {
        x: 0,
        y: 0,
      },
      settingPop: false,
      errorSP: false,
      errorEP: false,
      errorTP: false,
      initial: true,
      tradeInfo: {},
      textInfo: {},
      newsInfo: {},
      focusedTradeLine: false,
      focusedText: false,
      focusedNews: false,
      focusedTradeHistory: false,
      selectedTradeLine: "",
      selectedText: "",
      selectedTradeHistory: "",
      entry_price: "",
      entry_date: "",
      exit_price: "",
      exit_date: "",
      tradeHistoryInfo: {},

      lineType: "Spline",
      interval: "",
      chart: new DataCube({}),
      lineData: [],
      count_onchart: 0,
      showPremiumBtn: this.$store.getters["getUserSubscribed"],
      showWarning: false,
    };
  },
  methods: {
    ...mapActions(["loadCompanyNews", "saveChartOverlays"]),
    getNews(booleanValue) {
      for(const c of this.chart.data.onchart) {
        if(c.id !== undefined && c.id.toString().indexOf('onchart.NewsTool') !== -1) {
          c.settings.display = booleanValue;
        }
      }
    },
    getJournalNotes(booleanValue) {
      for(const c of this.chart.data.onchart) {
        if(c.id !== undefined && c.id.toString().indexOf('onchart.TextTool') !== -1) {
          c.settings.display = booleanValue;
        }
      }
    },
    getPinFromChart(pin) {
      this.pin = pin;
    },
    setCursorOnHover(event) {
      const pinLeftX = this.pin.x;
      const pinRightX = this.pin.x + 20;
      const textLength = this.pin.textLength;

      const pinTopY = this.pin.side === -1 ? this.pin.y - (75 + textLength) : this.pin.y + (75 + textLength);
      const pinBottomY = this.pin.side === -1 ? this.pin.y - 5 : this.pin.y - 5;
      
      const tvElement = this.$refs.tradingVue.$el;
      const rect = tvElement.getBoundingClientRect();

      const left = rect.left;
      const top = rect.top;
      const leftX = event.clientX - (left + 45);
      const topY = event.clientY - (top + 1);

      if((leftX >= pinLeftX && leftX <= pinRightX && topY >= pinTopY && topY <= pinBottomY) && this.pin.side === -1) {
        tvElement.style.cursor = 'pointer';
      } else if((leftX >= pinLeftX && leftX <= pinRightX && topY <= pinTopY && topY >= pinBottomY) && this.pin.side === 1) {
        tvElement.style.cursor = 'pointer';
      } else {
        tvElement.style.cursor = '';
      }
    },
    updateChart(tempTradePlan = '') {
      this.blurTradeLine();
      this.chnInterval('', tempTradePlan);
    },
    moveTradeInfoContainer(event) {
      const tradeInfoContainer = document.getElementById('tradeInfoContainer');

      if(this.mouseDownCheck) {
        const rect = event.target.getBoundingClientRect();

        if(this.x === null) {
          this.x = event.clientX - rect.left; //x position within the element.
        }

        tradeInfoContainer.style.top = (event.clientY - 18) + 'px';
        tradeInfoContainer.style.left = (event.clientX - (this.x + 16)) + 'px';
      } else {
        this.positionY = tradeInfoContainer.style.top;
        this.positionX = tradeInfoContainer.style.left;
      }
    },
    fetchUserLines() {
      apiService
      .fetchUserLinesData({
        user_id: this.user.user_id,
        stock_id: this.stock_id,
      })
      .then((response) => {
        console.log("fetched UserLines")
        var line_data = JSON.parse(response.data.content);
        this.lineData = line_data;
      })
      .catch(() => {});
    },
    closeSetting() {
      if (this.focusedText) {
        this.focusedText = false;
      } else if (this.focusedTradeLine) {
        this.updateTradePlan();
      } else if (this.focusedTradeHistory) {
        this.updateTradeHistory();
      } else if (this.focusedNews) {
        this.focusedNews = false;
      }
    },
    updateTradeHistory() {
      this.focusedTradeHistory = false;

      if(this.selectedTradeHistory == undefined || this.selectedTradeHistory == "undefined") {
        return false;
      }
      let data = {
        trade_id: this.selectedTradeHistory,
        entry_price: Math.round(this.entry_price * 100) / 100,
        entry_date: this.entry_date,
        exit_price: Math.round(this.exit_price * 100) / 100,
        exit_date: this.exit_date,
      };
      let oldDatas = this.$store.getters["tradeHistory"];
      let index = oldDatas.findIndex(
        (item) => item.trade_id == this.selectedTradeHistory
      );

      oldDatas[index]["entry_price"] = data.entry_price;
      oldDatas[index]["entry_date"] = data.entry_date;
      oldDatas[index]["exit_price"] = data.exit_price;
      oldDatas[index]["exit_date"] = data.exit_date;

      this.$store.commit("setTradeHistory", oldDatas);

      apiService.updateTradeHistory(data);
      let d = this.chart.data.onchart.find(
        (item) => item.settings.$uuid == `tradeHistory_${this.selectedTradeHistory}`
      ).settings;
      let pp1 = d.pp1;
      let pp2 = d.pp2;
      this.$set(pp1, "0", new Date(this.entry_date).getTime());
      this.$set(pp1, "1", this.entry_price );
      this.$set(pp2, "0", new Date(this.exit_date).getTime());
      this.$set(pp2, "1", this.exit_price );

      this.$set(d, "update", true);

      setTimeout(() => {
        this.$set(d, "update", false);
      }, 100);
      this.focusedTradeHistory = false;
    },
    async updateTradePlan() {
      this.errorTP = false;
      this.errorEP = false;
      this.errorSP = false;

      if (
        this.tagetPrice == "" ||
        this.tagetPrice < this.tradeInfoObject.entry_price + 0.1
      ) {
        this.errorTP = true;
      } else if (
        this.entryPrice == "" ||
        this.entryPrice < this.tradeInfoObject.stoploss_price + 0.1 ||
        this.entryPrice > this.tradeInfoObject.target_price - 0.1
      ) {
        this.errorEP = true;
      } else if (
        this.stopPrice == "" ||
        this.stopPrice > this.tradeInfoObject.entry_price - 0.1
      ) {
        this.errorSP = true;
      }
      if (this.errorTP || this.errorEP || this.errorSP) {
        return false;
      }

      let data = {
        trade_plan_id: this.selectedTradeLine,
        target_price: Number(this.tagetPrice),
        entry_price: Number(this.entryPrice),
        stoploss_price: Number(this.stopPrice),
      };

      let oldDatas = this.$store.getters["userTradePlans"];
      let index = oldDatas.findIndex(
        (item) => item.trade_plan_id == this.selectedTradeLine
      );
      oldDatas[index]["target_price"] = data.target_price;
      this.$store.commit("setUserTradePlans", oldDatas);

      await apiService.updateTradePlan(data);
      let d = this.chart.data.onchart.find(
        (item) => item.settings.$uuid == `trade_${this.selectedTradeLine}`
      ).settings;
      let p1 = d.p1;
      let p2 = d.p2;
      let p3 = d.p3;
      this.$set(p1, "1", Number(this.tagetPrice));
      this.$set(p2, "1", Number(this.stopPrice));
      this.$set(p3, "1", Number(this.entryPrice));
      this.$set(d, "update", true);
      setTimeout(() => {
        this.$set(d, "update", false);
      }, 100);
      this.focusedTradeLine = false;
    },
    settingsClick() {
      this.focusedTradeLine = true;
      this.focusedTradeHistory = false;
      this.settingPop = false;
    },
    historySettingsClick() {
      this.focusedTradeHistory = true;
      this.focusedTradeLine = false;
      this.settingPop = false;
    },
    async chnPriceBell() {
      var bellStatus = "";
      if (this.tradeInfo.settings.target_alert_status == "on") {
        bellStatus = "off";
      } else if (
        this.tradeInfo.settings.target_alert_status == "off" ||
        this.tradeInfo.settings.target_alert_status == "fired"
      ) {
        bellStatus = "on";
      }
      let data = {
        trade_plan_id: this.selectedTradeLine,
        target_alert_status: bellStatus,
      };

      let oldDatas = this.$store.getters["userTradePlans"];
      let index = oldDatas.findIndex(
        (item) => item.trade_plan_id == this.selectedTradeLine
      );
      oldDatas[index]["target_alert_status"] = bellStatus;
      this.$store.commit("setUserTradePlans", oldDatas);
      await apiService.updateTradePlan(data);
      let d = this.chart.data.onchart.find(
        (item) => item.settings.$uuid == `trade_${this.selectedTradeLine}`
      ).settings;
      this.$set(d, "target_alert_status", bellStatus);
    },
    async chnEntryBell() {
      var bellStatus = "";
      if (this.tradeInfo.settings.entry_alert_status == "on") {
        bellStatus = "off";
      } else if (
        this.tradeInfo.settings.entry_alert_status == "off" ||
        this.tradeInfo.settings.entry_alert_status == "fired"
      ) {
        bellStatus = "on";
      }
      let data = {
        trade_plan_id: this.selectedTradeLine,
        entry_alert_status: bellStatus,
      };

      let oldDatas = this.$store.getters["userTradePlans"];
      let index = oldDatas.findIndex(
        (item) => item.trade_plan_id == this.selectedTradeLine
      );
      oldDatas[index]["entry_alert_status"] = bellStatus;
      this.$store.commit("setUserTradePlans", oldDatas);

      await apiService.updateTradePlan(data);
      let d = this.chart.data.onchart.find(
        (item) => item.settings.$uuid == `trade_${this.selectedTradeLine}`
      ).settings;
      this.$set(d, "entry_alert_status", bellStatus);
    },
    async chnStopBell() {
      var bellStatus = "";
      if (this.tradeInfo.settings.stoploss_alert_status == "on") {
        bellStatus = "off";
      } else if (
        this.tradeInfo.settings.stoploss_alert_status == "off" ||
        this.tradeInfo.settings.stoploss_alert_status == "fired"
      ) {
        bellStatus = "on";
      }
      let data = {
        trade_plan_id: this.selectedTradeLine,
        stoploss_alert_status: bellStatus,
      };

      let oldDatas = this.$store.getters["userTradePlans"];
      let index = oldDatas.findIndex(
        (item) => item.trade_plan_id == this.selectedTradeLine
      );
      oldDatas[index]["stoploss_alert_status"] = bellStatus;
      this.$store.commit("setUserTradePlans", oldDatas);

      await apiService.updateTradePlan(data);
      let d = this.chart.data.onchart.find(
        (item) => item.settings.$uuid == `trade_${this.selectedTradeLine}`
      ).settings;
      this.$set(d, "stoploss_alert_status", bellStatus);
    },
    rightMouse(e) {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
      if (this.selectedTradeLine != "") {
        this.settingPop = true;
      }
    },
    blurTradeLine() {
      this.selectedText = "";
      this.focusedTradeLine = false;
      this.focusedText = false;
      this.focusedNews = false;
      this.settingPop = false;
      this.errorSP = false;
      this.errorEP = false;
      this.errorTP = false;
      this.focusedTradeHistory = false;
      this.selectedTradeHistory = "";
    },
    selectTradeLine(e) {
      if (this.single) {
        return false;
      }
      if (e[1] && e[1].includes("PositionTool_")) {
        this.focusedText = false;
        this.focusedNews = false;
        this.selectedTradeLine = e[2].split("_")[1];
        this.tradeInfo = this.chart.data.onchart.find(
          (item) => item.settings.$uuid == e[2]
        );
      } else if (e[1] && e[1].includes("TradeHistory_")) {
        this.focusedText = false;
        this.focusedNews = false;
        this.selectedTradeHistory = e[2].split("_")[1];
        this.tradeHistoryInfo = this.chart.data.onchart.find(
          (item) => item.settings.$uuid == e[2]
        );
      } else if (e[1] && e[1].includes("TextTool_")) {
        this.focusedTradeLine = false;
        this.selectedText = e[2].split("_")[1];
        this.textInfo = this.chart.data.onchart.find(
          (item) => item.settings.$uuid == e[2]
        );
        this.focusedText = true;
        this.focusedNews = false;
      } else if (e[1] && e[1].includes("NewsTool_")) {
        this.focusedTradeLine = false;
        this.selectedText = e[2].split("_")[1];
        this.newsInfo = this.chart.data.onchart.find(
          (item) => item.settings.$uuid == e[2]
        );
        this.focusedText = false;
        this.focusedNews = true;
      }
    },
    async removeTradeLine(e) {

      if (this.single) {
        return false;
      }
      if (e[1] != undefined && e[1].includes("PositionTool_")) {
        if (this.selectedTradeLine == "" || this.selectedTradeLine == undefined){
          return;
        }

        if(this.checkPreventDeleteTradePlan) {
          this.$store.commit("removeUserTradePlans", this.selectedTradeLine);
          await apiService.deleteUserTradePlan({trade_plan_id: this.selectedTradeLine});
        }

        this.checkPreventDeleteTradePlan = true;

        this.selectedTradeLine = "";
        this.focusedTradeLine = false;
        this.settingPop = false;
      } else if (e[1] != undefined && e[1].includes("TradeHistory_")) {
        if (
          this.selectedTradeHistory == "" ||
          this.selectedTradeHistory == undefined
        ) {
          return;
        }

        this.$store.commit("removeTradeHistory", this.selectedTradeHistory);
        apiService.deleteUserTrade(this.selectedTradeHistory);

        this.selectedTradeHistory = "";
        this.focusedTradeHistory = false;
        this.settingPop = false;
      } else if (e[1] != undefined && e[1].includes("TextTool_")) {
        if (this.selectedText == "") {
          return false;
        }
        this.focusedText = false;
        this.textInfo = {};
        apiService.deleteDiaryItem(this.selectedText);
        this.$store.commit("removeMapUserDiaryItem", Number(this.selectedText));
        this.selectedText = "";
      } else if (e[1] != undefined && e[1].includes("NewsTool_")) {
        this.focusedNews = false;
        this.newsInfo = {};
      }
    },
    createTradeLine() {
      let p = this.chart.data.onchart[this.chart.data.onchart.length - 1].settings;
      const that = this;
      if ((this.user.type === 'new' || this.user.type === 'freemium') && this.allTradeLine.length === 10) return;

      if (p.$uuid !== undefined && p.$uuid.includes("onchart.PositionTool")) {
        let data = {
          user_id: this.user.user_id,
          stock_id: this.stock_id,
          target_price: p.p1[1],
          exit_date: p.p1[0],
          stoploss_price: p.p2[1],
          entry_date: p.p2[0],
          entry_price: p.p3[1],
          long: true,
          entry_alert_status: p.entry_alert_status,
          stoploss_alert_status: p.stoploss_alert_status,
          target_alert_status: p.target_alert_status,
        };

        apiService.insertUserTradePlan(data).then((res) => {
          this.$set(p, "$selected", false);
          this.$set(p, "$state", `finished`);
          this.$set(p, "$uuid", `trade_${res.data.trade_plan_id}`);
          this.$set(p, "update", false);
          this.$set(p, "target_alert_status", `${res.data.target_alert_status}`);
          this.$set(p, "stoploss_alert_status", `${res.data.stoploss_alert_status}`);
          this.$set(p, "entry_alert_status", `${res.data.entry_alert_status}`);
          that.$store.commit("addUserTradePlans", res.data);
          if (this.single) {
            this.chnInterval();
          }
        });
      } else if ( p.$uuid !== undefined && p.$uuid.includes("onchart.TradeHistory")) {
        let data = {
          user_id: this.user.user_id,
          stock_id: this.stock_id,
          ticker: this.company.ticker,
          instrument_type: "stock",
          entry_price: p.pp1[1],
          entry_date: new Date( p.pp1[0]).toISOString().slice(0, 10),
          exit_price: p.pp2[1],
          exit_date: new Date( p.pp2[0]).toISOString().slice(0, 10),
        };

        apiService.insertTradeHistory(data).then((res) => {
          this.$set(p, "$selected", false);
          this.$set(p, "$state", `finished`);
          this.$set(p, "$uuid", `tradeHistory_${res.data.trade_id}`);
          this.$set(p, "update", false);
          that.$store.commit("addTradeHistory" , res.data)
        });
      } else if ( p.$uuid !== undefined && p.$uuid.includes("onchart.TextTool")) {
        var date = new Date(p.p1[0]);
        let data = {
          user_id: this.user.user_id,
          stock_id: this.stock_id,
          date_created: `${date.getFullYear()}-${ date.getMonth() + 1 }-${date.getDate()}`,
          note: p.text || "text",
          background: p.background || "#FFFFBA",
          color: p.color || "#000000",
          y: p.p1[1],
        };
        apiService.insertDiaryItem(data).then((res) => {
          this.$set(p, "$selected", false);
          this.$set(p, "$state", `finished`);
          this.$set(p, "$uuid", `text_${res.data.diary_item_id}`);
          this.$set(p, "update", false);
          that.$store.commit("addMapUserDiaryItem", res.data);
          if (this.single) {
            this.chnInterval();
          }
        });
      }
    },
    async chnTradeLine(e) {
      if (this.single) {
        return false;
      }
      if (Array.isArray(e) && e[3] !== undefined && !e[3].includes("onchart")) {
        if (e[3].includes("trade_")) {
          var id = Number(e[3].split("_")[1]);
          let oldDatas = this.$store.getters["userTradePlans"];
          let index = oldDatas.findIndex((item) => item.trade_plan_id == id);
          var key = Object.keys(e[0])[0];
          var data = "";

          if (key == "p1") {
            if (e[0].p1[1]) {
              data = {
                trade_plan_id: id,
                target_price: Math.round(e[0].p1[1] * 100) / 100,
                exit_date: e[0].p1[0],
              };
            }
            oldDatas[index].target_price = e[0].p1[1];
            oldDatas[index].exit_date = e[0].p1[0];
          } else if (key == "p2") {
            data = {
              trade_plan_id: id,
              stoploss_price: Math.round(e[0].p2[1] * 100) / 100,
              entry_date: e[0].p2[0],
            };
            oldDatas[index].stoploss_price = e[0].p2[1];
            oldDatas[index].entry_date = e[0].p2[0];
          } else if (key == "p3") {
            data = {
              trade_plan_id: id,
              entry_price: Math.round(e[0].p3[1] * 100) / 100,
            };
            oldDatas[index].entry_price = e[0].p3[1];
          } else if (key == "entry_alert_status") {
            data = {
              trade_plan_id: id,
              entry_alert_status: e[0].entry_alert_status,
            };
            oldDatas[index].entry_alert_status = e[0].entry_alert_status;
          } else if (key == "stoploss_alert_status") {
            data = {
              trade_plan_id: id,
              stoploss_alert_status: e[0].stoploss_alert_status,
            };
            oldDatas[index].stoploss_alert_status = e[0].stoploss_alert_status;
          } else if (key == "target_alert_status") {
            data = {
              trade_plan_id: id,
              target_alert_status: e[0].target_alert_status,
            };
            oldDatas[index].target_alert_status = e[0].target_alert_status;
          }

          if (data == "") {
            return;
          }
          this.$store.commit("setUserTradePlans", oldDatas);
          await apiService.updateTradePlan(data);
        }
        if (e[3].includes("tradeHistory_")) {
          let id = Number(e[3].split("_")[1]);
          let oldDatas = this.$store.getters["tradeHistory"];
          let index = oldDatas.findIndex((item) => item.trade_id == id);
          let key = Object.keys(e[0])[0];
          let data = "";
          if (key == "pp1") {
            if (e[0].pp1[1]) {
              data = {
                trade_id: id,
                entry_price: e[0].pp1[1],
                entry_date:  new Date(e[0].pp1[0]).toISOString().slice(0, 10),
              };
            }
            oldDatas[index].entry_price = e[0].pp1[1];
            oldDatas[index].entry_date = new Date(e[0].pp1[0]).toISOString().slice(0, 10);
          } else if (key == "pp2") {
            data = {
              trade_id: id,
              exit_price: e[0].pp2[1],
              exit_date: new Date(e[0].pp2[0]).toISOString().slice(0, 10),
            };
            oldDatas[index].exit_price = e[0].pp2[1];
            oldDatas[index].exit_date = new Date(e[0].pp2[0]).toISOString().slice(0, 10);
          }

          if (data == "") {
            return;
          }
          this.$store.commit("setTradeHistory", oldDatas);
          apiService.updateTradeHistory(data);
        }

        if (e[3].includes("text_")) {
          if (!e[0].p1) {
            return;
          }
          var date = new Date(e[0].p1[0]);
          let id = Number(e[3].split("_")[1]);
          let data = {
            diary_item_id: id,
            date_created: date.toISOString().split("T")[0],
            y: e[0].p1[1],
          };
          apiService.updateDiaryItem(data);
          this.$store.commit(
            "updateMapUserDiaryItem",
            Object.assign({}, data, { key: "y" })
          );
          this.$store.commit(
            "updateMapUserDiaryItem",
            Object.assign({}, data, { key: "date_created" })
          );
        }
      }
    },
    filterOhlcv(data) {
      if (this.interval == "") {
        return data;
      }
      var init = 0;
      var temp = [];
      var low = Infinity;
      var high = 0;
      var ohlcv = [];
      data.map((item, index) => {
        if (index == 0) {
          init = item[0] + this.interval * 60 * 60 * 1000 * 24;
          temp[0] = item[0];
          temp[1] = item[1];
          temp[2] = item[2];
          temp[3] = item[3];
          temp[4] = item[4];
          temp[5] = item[5];
          if (temp[0] === null) {
            return;
          }
          low = item[3];
          high = item[2];
        } else {
          if (init <= item[0]) {
            ohlcv.push(temp);
            temp = [];
            temp[0] = item[0];
            temp[1] = item[1];
            temp[2] = item[2];
            temp[3] = item[3];
            temp[4] = item[4];
            temp[5] = item[5];
            init = item[0] + this.interval * 60 * 60 * 1000 * 24;
            low = Infinity;
            high = 0;
          } else {
            if (low > Math.min(item[3], item[2])) {
              low = Math.min(item[3], item[2]);
            }
            if (high < Math.max(item[3], item[2])){
              high = Math.max(item[3], item[2]);
            }
            temp[2] = high;
            temp[3] = low;
            temp[4] = item[4];
            temp[5] += item[5];
          }
        }
      });
      return ohlcv;
    },
    filterData(data) {
      if (this.interval == "") {
        data0 = data;
      } else {
        var init = 0;
        var data0 = data.filter((item, i) => {
          if (i == 0) {
            init = item[0] + this.interval * 60 * 60 * 1000 * 24;
            return true;
          } else {
            if (init <= item[0]) {
              init = item[0] + this.interval * 60 * 60 * 1000 * 24;
              return true;
            } else return false;
          }
        });
      }
      return data0;
    },
    getOHLCV() {
      return new Promise((resolve) => {
        apiService
          .getPrices(this.stock_id)
          .then((response) => {
            resolve(response);
          })
          .catch((error) => console.log(error));
      });
    },
    reMakeInside(ohlcv = [], data = []) {
      var newData = [];
      if (data.length == 0) {
        return [];
      }
      data = data.sort(
        (a, b) => a.transaction_timestamp - b.transaction_timestamp
      );
      var tempData;
      ohlcv.map((item, index) => {
        if (ohlcv.length - 1 > index) {
          tempData = data.find(
            (data_item) =>
              data_item.transaction_timestamp * 1000 >= ohlcv[index][0] &&
              data_item.transaction_timestamp * 1000 < ohlcv[index + 1][0]
          );
        } else {
          tempData = data.find(
            (data_item) =>
              data_item.transaction_timestamp * 1000 == ohlcv[index][0]
          );
        }
        if (tempData !== undefined) {
          newData.push(tempData);
        } else {
          newData.push({
            transaction_timestamp: Math.round(item[0] / 1000),
            volume: 0,
          });
        }
      });

      return newData;
    },
    getInsiderDotChart() {
      var insiderData = this.$store.getters["getInsiders"](this.company_id).insiders;
      var data = [];
      var index;

      insiderData.map((item) => {
        var transaction_nature =
          item.transaction_nature !== undefined && item.transaction_nature == "Avyttring"  ;
        if (item.price !== undefined && item.price !== null && item.price > 0) {
          index = data.findIndex(
            (di) =>
              di[0] ==
                new Date(item.transaction_date).setUTCHours(0, 0, 0, 0) &&
              di[1] == item.price
          );
          if (index > -1) {
            if (
              data[index][2].find(
                (iiid) =>
                  iiid[0] == transaction_nature &&
                  iiid[3] == item.person &&
                  iiid[4] == item.person_title
              )
            ) {
              return;
            }
            data[index][2].push([
              transaction_nature,
              item.qty_or_amount,
              item.transaction_nature || "Förvärv",
              item.person || "",
              item.person_title || "",
              item.volume || 0,
              item.price || 0,
            ]);
          } else {
            data.push([
              new Date(item.transaction_date).setUTCHours(0, 0, 0, 0),
              item.price,
              [
                [
                  transaction_nature,
                  item.qty_or_amount,
                  item.transaction_nature || "Förvärv",
                  item.person || "",
                  item.person_title || "",
                  item.volume || 0,
                  item.price || 0,
                ],
              ],
            ]);
          }
        }
      });
      return data;
    },
    getInsiderData() {
      return new Promise((resolve) => {
        apiService.fetchChartInsiderData(this.company_id).then((res) => {
          resolve(res.data);
        });
      });
    },
    getInsiderChart(ohlcv, insider) {
      // apiService.fetchChartInsiderData(this.isin).then((res) => {
      var payload = this.reMakeInside(ohlcv, insider);
      var now = new Date().setUTCHours(0, 0, 0, 0);
      var volume = 0;
      var data = [];
      if (payload.length == 0) {
        data = [];
      } else {
        // payload = payload.sort(
        //   (a, b) => a.transaction_timestamp - b.transaction_timestamp
        // );
        payload.map((item, i) => {
          if (item.volume !== undefined && item.volume !== null) {
            if (
              item.transaction_nature !== undefined &&
              item.transaction_nature == "Avyttring"
            )
              volume -= item.volume;
            else volume += item.volume;
          }
          var date = new Date(item.transaction_timestamp * 1000).setUTCHours(
            0,
            0,
            0,
            0
          );
          if (payload.length == i + 1) {
            if (now >= date) {
              data.push([date, now, volume]);
            }
          } else {
            data.push([
              date,
              new Date(payload[i + 1].transaction_timestamp * 1000).setUTCHours(
                0,
                0,
                0,
                0
              ),
              volume,
            ]);
          }
        });
      }
      return data;
      // });
    },
    getEarningDate() {
      return new Promise((resolve) => {
        apiService.fetchEarningDates(this.stock_id).then((res) => {
          var data = [];
          if (res.data.length > 0) {
            res.data.map((item) => {
              data.push([item.date_report_ms * 1000]);
            });
          }
          resolve(data);
        });
      });
    },
    getOnchart(stock_id) {
      return new Promise((resolve) => {
        apiService.getPrices(stock_id)
          .then((response) => {
            resolve(response.data.ohlcv);
          })
          .catch((error) => console.log(error));
      });
    },
    makeMa(ohlcv, n) {
      var sum = [];
      var val = 0;
      var ma = [];
      ohlcv.map((item) => {
        sum.push(item[4]);
        if (sum.length > n) {
          sum.shift();
        }
        val = Math.round((eval(sum.join("+")) * 100) / sum.length) / 100;
        ma.push([item[0], val]);
      });
      return ma;
    },
    // getTradeLine() {
    //   return new Promise((resolve) => {
    //     apiService
    //       .getTradePlan({
    //         user_id: this.user.user_id,
    //         stock_id: this.stock_id,
    //       })
    //       .then((res) => {
    //         resolve(res.data);
    //       });
    //   });
    // },
    async chnInterval(interval, tempTradePlan = '') {
      // chnInterval() is called whenever switch stocks and sections. So that I fetched line data here
      await this.fetchUserLines();


      /**
       * Earning Date             : dataIndex: 4
       * MA 20                    : dataIndex: 6
       * MA 50                    : dataIndex: 7
       * MA 200                   : dataIndex: 8
       * Insiders: By Transaction : dataIndex: 1
       * Insiders: Silent Period  : dataIndex: 3
       * Portfolio Transactions   : dataIndex: 2
       */


      let overlays_conf = this.$store.getters["getChart_overlays"];

      if (!this.single) {
        ////////////////-------- Get Earning Date ---------------- ////////////////////////////
        data = await this.getEarningDate();
        var newData = [];
        data.map((item) => {
          if (item[0] == 0) {
            return;
          }
          if (
            newData.find(
              (newItem) =>
                newItem[0] > item[0] - 10 * 24 * 3600 * 100 &&
                newItem[0] < item[0] + 10 * 24 * 3600 * 100
            ) !== undefined
          ) {
            return;
          }
          newData.push([new Date(item[0]).setUTCHours(0, 0, 0, 0)]);
        });
        var sections = {
          name: "Earning Date",
          type: "Earnings",
          data: newData,
          settings: {
            legend: true,
            show: overlays_conf[4] ? overlays_conf[4].show : false,
            display: overlays_conf[4] ? overlays_conf[4].display : false,
          },
        };
        ////////////////-------- Get Earning Date End---------------- ////////////////////////////

        var sections1 = {
          // name: "Silent Period",
          name: "Insiders: Silent Period",
          type: "Earnings1",
          data: newData,
          settings: {
            legend: true,
            display: overlays_conf[3] ? overlays_conf[3].display : false,
            show: overlays_conf[3] ? overlays_conf[3].show : false,
          },
        };
      }

      if (this.company == undefined) {
        // watermarkData = {
        //   ticker: "",
        //   name: "",
        // };
      }
      var watermark = {
        type: "Watermark",
        name: "Watermark",
        settings: {
          legend: false,
          data: {
            ticker: this.company.ticker,
            name: this.company.name,
          },
        },
        data: [],
      };

      this.interval = interval;
      var response = await this.getOHLCV();
      var ohlcv = [];
      if (response.data.ohlcv) {
        ohlcv = response.data.ohlcv;
        ohlcv = ohlcv.sort((a, b) => a[0] - b[0]);
      }

      var temp_ohlcv = ohlcv;
      ohlcv = [];
      var data0, data1, data2, data3, data4, data5;

      temp_ohlcv.map((item, index) => {
        if (item[0] === null) {
          if (index == 0) {
            data0 = 0;
          } else {
            data0 = ohlcv[index - 1][0];
          }
        } else data0 = item[0];
        if (item[1] === null) {
          if (index == 0) {
            data1 = 0;
          } else {
            data1 = ohlcv[index - 1][1];
          }
        } else data1 = item[1];
        if (item[2] === null) {
          if (index == 0) {
            data2 = 0;
          } else {
            data2 = ohlcv[index - 1][2];
          }
        } else {
          data2 = item[2];
        }
        if (item[3] === null) {
          if (index == 0) {
            data3 = 0;
          } else {
            data3 = ohlcv[index - 1][3];
          }
        } else {
          data3 = item[3];
        }

        if (item[4] === null) {
          if (index == 0) {
            data4 = 0;
          } else {
            data4 = ohlcv[index - 1][4];
          }
        } else {
          data4 = item[4];
        }

        if (item[5] === null) {
          if (index == 0) {
            data5 = 0;
          } else {
            data5 = ohlcv[index - 1][5];
          }
        } else {
          data5 = item[5];
        }

        ohlcv.push([
          new Date(data0).setUTCHours(0, 0, 0, 0),
          data1,
          data2,
          data3,
          data4,
          data5,
        ]);
      });

      var ohlcvFilter = this.filterOhlcv(ohlcv);
      var onchart = [];
      if (!this.single) {
        // var data = await this.getInsiderChart(ohlcvFilter);
        var insiderData = await this.getInsiderData();
        var data = this.getInsiderChart(ohlcvFilter, insiderData);
        var insider = {
          name: "Insiders: By Volume",
          type: "InsiderTrades",
          settings: {
            display: this.type == "insider" ? true : false,
            show: this.type == "insider" ? true : false,
          },
          data: data,
        };
        var insiderDotData = this.getInsiderDotChart();

        var insiderDot = {
          name: "Insiders: By Transaction",
          type: "InsiderDot",
          settings: {
            display: overlays_conf[1] ? overlays_conf[1].display : false,
            show: overlays_conf[1] ? overlays_conf[1].show : false,
            "z-index": 50,
          },
          data: insiderDotData,
        };

        var portfolioTransactions = {
          name: "Portfolio Transactions",
          type: "PortfolioTransactions",
          settings: {
            display: overlays_conf[2] ? overlays_conf[2].display : false,
            show: overlays_conf[2] ? overlays_conf[2].show : false,
            "z-index": 50,
          },
          data: []
        };

        var ma20 = [];
        var ma50 = [];
        var ma200 = [];

        ma20 = this.makeMa(ohlcvFilter, 20);

        ma20 = {
          name: "MA 20",
          type: "Splines",
          settings: {
            display: overlays_conf[6] ? overlays_conf[6].display: false,
            show: overlays_conf[6] ? overlays_conf[6].show: false,
          },
          data: ma20,
        };

        ma50 = this.makeMa(ohlcvFilter, 50);

        ma50 = {
          name: "MA 50",
          type: "Splines",
          settings: {
            display: overlays_conf[7] ? overlays_conf[7].display: false,
            show: overlays_conf[7] ? overlays_conf[7].show: false,
          },
          data: ma50,
        };

        ma200 = this.makeMa(ohlcvFilter, 200);

        ma200 = {
          name: "MA 200",
          type: "Splines",
          settings: {
            display: overlays_conf[8] ? overlays_conf[8].display: false,
            show: overlays_conf[8] ? overlays_conf[8].show: false,
          },
          data: ma200,
        };

        var sections2 = {
          name: 'Journal Notes',
          type: 'TextTool',
          data: [],
          settings: {
            legend: true,
            display: true,
            show: true
          }
        }

        var sections3 = {
          name: 'News',
          type: 'NewsTool',
          data: [],
          settings: {
            legend: true,
            display: false,
            show: false
          }
        }

        onchart.push(insider);
        onchart.push(insiderDot);
        onchart.push(portfolioTransactions);
        onchart.push(sections2);
        onchart.push(sections3);
        onchart.push(sections1);
        onchart.push(sections);
        onchart.push(watermark);

        onchart.push(ma20);
        onchart.push(ma50);
        onchart.push(ma200);

        let compareDatas = this.$store.getters["compareDatas"];
        compareDatas.map(async (compareData) => {
          var data = await this.getOnchart(compareData.isin);
          data = data.sort((a, b) => a[0] - b[0]);
          data = this.filterData(data);
          onchart.push({
            name: compareData.name,
            type: "Compare",
            data: data,
            settings: {
              display: true,
              "z-index": 5,
              show: true,
            },
          });
        });

        let journalDatas = this.$store.getters["getMapUserDiary"].filter((item) => item.stock_id == this.stock_id);

        if (journalDatas) {
          journalDatas.map((item, index) => {
            onchart.push({
              data: [],
              grid: {
                id: index,
              },
              id: `onchart.TextTool${index}`,
              name: `TextTool ${index}`,
              type: "TextTool",
              settings: {
                update: false,
                $selected: false,
                $state: "finished",
                legend: false,
                display: true,
                $uuid: "text_" + item.diary_item_id,
                p1: [new Date(item.date_created).getTime(), item.y],
                background: item.background,
                text: item.note,
                color: item.color,
                single: this.single,
              },
            });
          });
        }

        let newsDatas = await this.loadCompanyNews(this.company_id);
        if (newsDatas) {
          newsDatas.map((item, index) => {
            onchart.push({
              data: [],
              grid: {
                id: index,
              },
              id: `onchart.NewsTool${index}`,
              name: `NewsTool ${index}`,
              type: "NewsTool",
              settings: {
                update: false,
                $selected: false,
                $state: "finished",
                legend: false,
                display: false,
                $uuid: "news_" + item.news_id,
                p1: [new Date(item.date).getTime(), item.y],
                text: item.newstext,
                title: item.title,
                single: this.single,
              },
            });
          });
        }
      }

      var tradeLines = tempTradePlan === '' ? this.getTradeLine : tempTradePlan;
      tradeLines.map((item, index) => {
        onchart.push({
          data: [],
          grid: {
            id: index,
          },
          id: `onchart.PositionTool${index}`,
          name: `PositionTool ${index}`,
          type: "PositionTool",
          settings: {
            update: false,
            $selected: false,
            $state: "finished",
            legend: false,
            $uuid: "trade_" + item.trade_plan_id,
            p1: [Number(item.exit_date), item.target_price],
            p2: [Number(item.entry_date), item.stoploss_price],
            p3: [
              item.exit_date * 0.5 + item.entry_date * 0.5,
              item.entry_price,
            ],
            target_alert_status: item.target_alert_status,
            entry_alert_status: item.entry_alert_status,
            stoploss_alert_status: item.stoploss_alert_status,
            single: this.single,
          },
        });
      });

      // var tradeHistory = this.getTradeHistory;
      // tradeHistory.map((item, index) => {
      //   onchart.push({
      //     data: [],
      //     grid: {
      //       id: index,
      //     },
      //     id: `onchart.TradeHistory${index}`,
      //     name: `TradeHistory ${index}`,
      //     type: "TradeHistory",
      //     settings: {
      //       update: false,
      //       $selected: false,
      //       $state: "finished",
      //       legend: true,
      //       $uuid: "tradeHistory_" + item.trade_id,
      //       pp1: [
      //         new Date(item.entry_date).getTime(),
      //         item.entry_price,
      //       ],
      //       pp2: [
      //         new Date(item.exit_date).getTime(),
      //         item.exit_price,
      //       ],
      //       single: this.single,
      //     },
      //   });
      // });

      // lines data

      /**
       * don't know the reason for push the line data again.
       */

      // this.lineData.map((item) => {
      //   onchart.push(item)
      // })

      var offchart = [];
      this.chart = new DataCube({
        ohlcv: ohlcvFilter,
        onchart: onchart,
        offchart: offchart,
      });

      if(tempTradePlan === "") {
        this.$refs.tradingVue.resetChart();
      }
    },
    async legend_button_click(event1) {
      var event = event1[0];

      if (event.button == "remove") {
        if (event.overlay.includes("Compare")) {
          let compareName = this.chart.data[event.type][event.dataIndex].name;
          this.$store.commit("removeCompareDatasByName", compareName);
          this.chart.data[event.type] = this.chart.data[event.type].filter((item, index) => index != event.dataIndex);
        } else {
          let d = this.chart.data[event.type][event.dataIndex];

          if(event.overlay === 'TextTool_0') {
            this.getJournalNotes(false);
          }

          if(event.overlay === 'NewsTool_0') {
            this.getNews(false);
          }

          if (d) {
            if (!("show" in d.settings)) {
              this.$set(d.settings, "show", false);
              this.$set(d.settings, "display", false);
            } else {
              this.$set(d.settings, "show", !d.settings.show);
              this.$set(d.settings, "display", d.settings.show);
            }
          }

          if(event.chart_type === 'TextTool') {
            this.getJournalNotes(d.settings.show);
          }

          if(event.chart_type === 'NewsTool') {
            this.getNews(d.settings.show);
          }
        }
      } else if (event.button === "display") {
        let d = this.chart.data[event.type][event.dataIndex];

        if (d) {
          if (!("display" in d.settings)) {
            this.$set(d.settings, "display", true);
          } else {
            this.$set(d.settings, "display", !d.settings.display);
          }

          if(event.overlay === 'TextTool_0') {
            this.getJournalNotes(d.settings.display);
          }

          if(event.overlay === 'NewsTool_0') {
            this.getNews(d.settings.display);
          }

          if (event.overlay.includes("InsiderTrades")) {
            d = this.chart.data["onchart"].find((item) => item.type == "Earnings1");
            this.$set(d.settings, "display", !d.settings.display);
          }
        }
      } else if(event.button === "trade_history"){
        this.chart.data[event.type].filter((item) => item.type == "TradeHistory").map((item) => {
          let d = item;
          this.$set(d.settings, "display", event.tradeHistoryStatus);
        });
      }

      // save overlays configration into VUEX/DB using dataIndex
      /**
       * Earning Date             : dataIndex: 4
       * MA 20                    : dataIndex: 6
       * MA 50                    : dataIndex: 7
       * MA 200                   : dataIndex: 8
       * Insiders: By Transaction : dataIndex: 1
       * Insiders: Silent Period  : dataIndex: 3
       * Portfolio Transactions   : dataIndex: 2
       */

      let overlays_conf = this.$store.getters["getChart_overlays"];

      if (overlays_conf[event.dataIndex]) {
        if (event.button == 'remove') {
          overlays_conf[event.dataIndex] = {display: !overlays_conf[event.dataIndex].show, show: !overlays_conf[event.dataIndex].show};
        } else if (event.button == 'display') {
          overlays_conf[event.dataIndex] = {display: !overlays_conf[event.dataIndex].display, show: true};
        }
      } else {
        overlays_conf[event.dataIndex] = {display: true, show: true};
      }
      
      let overlay_conf_data = {
        user_id: this.user.user_id,
        content: JSON.stringify(overlays_conf),
        feature: 'CHART'
      }
      await this.saveChartOverlays(overlay_conf_data);
    },
    chnLineType(type) {
      this.lineType = type;
      let d = this.chart.data;
      this.$set(d.chart, "type", type);
    },
    // In the future, CSS grid minmax
    onResize() {
      if (this.page == 'wl') {
        if (window.innerWidth > 950) {
          this.chartWidth = (window.innerWidth - 400) / 3;
        } else {
          this.chartWidth = (window.innerWidth - 400) / 2;
        }
      }
      if (this.page == 'main') {
        this.chartWidth = window.innerWidth - 400;
      }
      if (this.page == 'overview') {
        if(window.innerWidth < 2090) {
          this.chartWidth = (window.innerWidth - 400) / 4;
          this.chartHeight = this.chartWidth - 22;
        }
      }
      // this.height = window.innerHeight - 240;
    },
    changeShowWarning() {
        this.showWarning = false;
    },
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
    this.onResize();
    window.DataCube = this.chart; // Debug
    // apiService
    //   .fetchUserLinesData({
    //     user_id: this.user.user_id,
    //     stock_id: this.stock_id,
    //   })
    //   .then((response) => {
    //     console.log("fetched UserLines")
    //     var line_data = JSON.parse(response.data.content);
    //     this.lineData = line_data;
    //   })
    //   .catch((error) => {});
  },
  beforeDestroy() {
    this.selectedTradeLine = "";
    this.selectedTradeHistory = "";
    this.selectedText = "";
    this.focusedTradeLine = false;
    this.focusedText = false;
    this.focusedNews = false;
    this.settingPop = false;
    this.errorSP = false;
    this.errorEP = false;
    this.errorTP = false;
    window.removeEventListener("resize", this.onResize);
  },
  watch: {
    focusedTradeLine(newVal) {
        if (newVal) {
            this.tagetPrice = this.tradeInfoObject.target_price;
            this.stopPrice = this.tradeInfoObject.stoploss_price;
            this.entryPrice = this.tradeInfoObject.entry_price;
            setTimeout(() => {
                this.$refs['dropdown-trade-plans'].fromChart = false;
                this.$refs['dropdown-trade-plans'].showDropDown = newVal;
            }, 200);
        }
    },
    focusedTradeHistory(val) {
      if (val) {
        this.entry_price = this.tradeHistoryObject.entry_price;
        this.entry_date = this.tradeHistoryObject.entry_date;
        this.exit_price = this.tradeHistoryObject.exit_price;
        this.exit_date = this.tradeHistoryObject.exit_date;
      }
    },
    stock_id() {
        this.chnInterval("");
        this.selectedTradeLine = "";
    },
    "chart.data.onchart": {
      deep: true,
      immediate: true,
      handler() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {

          if (this.chart.data.onchart.length > 7) {
            var dummy = [];
            for (var i = 7; i < this.chart.data.onchart.length; i++) {
              var p = this.chart.data.onchart[i];
              if (!p.id.includes("onchart.PositionTool")) {
                dummy.push(this.chart.data.onchart[i]);
              }
            }

            apiService
              .save_UserLines({
                user_id: this.user.user_id,
                stock_id: this.stock_id,
                content: JSON.stringify(dummy),
              })
              .then(() => {
                console.log("saved User Lines");
              })
              .catch((error) => console.log(error));
          }
        }, 1000);
      },
    },
    "chart.data.tool": {
      deep: true,
      immediate: true,
        handler(newValue, oldValue) {
            if(newValue && newValue.includes('PositionTool') && newValue !== oldValue) {
                this.showWarning = this.page === 'main' && (this.user.type === 'new' || this.user.type === 'freemium') && this.allTradeLine.length === 10;
            }
        }
    }
  },
  created() {
    this.chnInterval("");
  },
  computed: {
    textColor: {
      get() {
        return this.textInfo.settings.color || "#000000";
      },
      set(val) {
        let d = this.chart.data.onchart.find(
          (item) => item.settings.$uuid == `text_${this.selectedText}`
        ).settings;
        this.$set(d, "color", val);
        let data = {
          diary_item_id: Number(this.selectedText),
          color: val,
        };
        apiService.updateDiaryItem(data);
        this.$store.commit(
          "updateMapUserDiaryItem",
          Object.assign({}, data, { key: "color" })
        );
      },
    },
    textBackground: {
      get() {
        return this.textInfo.settings.background || "#FFFFBA";
      },
      set(val) {
        let d = this.chart.data.onchart.find(
          (item) => item.settings.$uuid == `text_${this.selectedText}`
        ).settings;
        this.$set(d, "background", val);
        let data = {
          diary_item_id: Number(this.selectedText),
          background: val,
        };
        apiService.updateDiaryItem(data);
        this.$store.commit(
          "updateMapUserDiaryItem",
          Object.assign({}, data, { key: "background" })
        );
      },
    },
    newsText: {
      get() {
        return this.newsInfo.settings.text
      },
      set(val) {
      }
    },
    newsTitle: {
      get() {
        return this.newsInfo.settings.title
      },
      set(val) {
        
      }
    },
    text: {
      get() {
        return this.textInfo.settings.text || "text";
      },
      set(val) {
        let d = this.chart.data.onchart.find(
          (item) => item.settings.$uuid == `text_${this.selectedText}`
        ).settings;
        this.$set(d, "text", val);
        let data = {
          diary_item_id: Number(this.selectedText),
          note: val,
        };
        apiService.updateDiaryItem(data);
        this.$store.commit(
          "updateMapUserDiaryItem",
          Object.assign({}, data, { key: "note" })
        );
      },
    },
    getTradeLine() {
      return this.$store.getters["userTradePlans"].filter(
        (item) =>
          item.stock_id === this.stock_id &&
          item.user_id === this.user.user_id
      );
    },
    getTradeHistory() {

      return this.$store.getters["tradeHistory"].filter(
        (item) =>
          item.stock_id == this.stock_id &&
          item.user_id == this.user.user_id
      );
    },
    targetPriceInfo() {
      let targetPriceInfo = null;
      if (this.tradeInfo.settings.target_alert_status == "on") {
        targetPriceInfo = {
          color: "primary",
          icon: "mdi-bell",
        };
      } else if (this.tradeInfo.settings.target_alert_status == "off") {
        targetPriceInfo = {
          color: "#c4c4c4",
          icon: "mdi-bell-off",
        };
      } else {
        targetPriceInfo = {
          color: "primary",
          icon: "mdi-bell",
        };
      }
      return targetPriceInfo;
    },
    entryPriceInfo() {
      let entryPriceInfo = null;
      if (this.tradeInfo.settings.entry_alert_status == "on") {
        entryPriceInfo = {
          color: "success",
          icon: "mdi-bell",
        };
      } else if (this.tradeInfo.settings.entry_alert_status == "off") {
        entryPriceInfo = {
          color: "#c4c4c4",
          icon: "mdi-bell-off",
        };
      } else {
        entryPriceInfo = {
          color: "success",
          icon: "mdi-bell",
        };
      }
      return entryPriceInfo;
    },
    stopPriceInfo() {
      var stopPriceInfo = null;
      if (this.tradeInfo.settings.stoploss_alert_status == "on") {
        stopPriceInfo = {
          color: "red",
          icon: "mdi-bell",
        };
      } else if (this.tradeInfo.settings.stoploss_alert_status == "off") {
        stopPriceInfo = {
          color: "#c4c4c4",
          icon: "mdi-bell-off",
        };
      } else {
        stopPriceInfo = {
          color: "red",
          icon: "mdi-bell",
        };
      }
      return stopPriceInfo;
    },
    tradeHistoryObject() {
      if (this.tradeHistoryInfo.settings.pp1 == undefined) {
        return {
          entry_date: "0000-00-00",
          exit_date: "0000-00-00",
          entry_price: 0,
          exit_price: 0,
        };
      }
      let entry_date = new Date(this.tradeHistoryInfo.settings.pp1[0]).toISOString().slice(0, 10);
      let entry_price = Math.round(this.tradeHistoryInfo.settings.pp1[1] * 100) / 100;

      let exit_date = new Date(this.tradeHistoryInfo.settings.pp2[0]).toISOString().slice(0, 10);
      let exit_price = Math.round(this.tradeHistoryInfo.settings.pp2[1] * 100) / 100;

      return {
        entry_date: entry_date,
        entry_price: entry_price,
        exit_date: exit_date,
        exit_price: exit_price,
      };
    },
    tradeInfoObject() {
      if (this.tradeInfo.settings.p1 == undefined) {
        return {
          target_price: 0,
          stoploss_price: 0,
          entry_price: 0,
          ratio: 0,
          targetPriceInfo: {
            color: "primary",
            icon: "notifications",
          },
        };
      }
      let target_price =
        Math.round(
          Math.max(
            this.tradeInfo.settings.p1[1],
            this.tradeInfo.settings.p2[1]
          ) * 10
        ) / 10;
      let stoploss_price =
        Math.round(
          Math.min(
            this.tradeInfo.settings.p1[1],
            this.tradeInfo.settings.p2[1]
          ) * 10
        ) / 10;
      let entry_price = Math.round(this.tradeInfo.settings.p3[1] * 10) / 10;
      let ratio =
        Math.round(
          ((target_price - entry_price) / (entry_price - stoploss_price)) * 100
        ) / 100;

      return {
        target_price: target_price,
        stoploss_price: stoploss_price,
        entry_price: entry_price,
        ratio: ratio,
      };
    },
    colors() {
      return this.$vuetify.theme.isDark
        ? {}
        : {
            colorBack: "#ffffff",
            colorGrid: "#dbe2d9",
            colorText: "#6d6d6d",
          };
    },
    company() {
      if (this.toolbar) {
        return this.$store.getters["getMapStocks"].find(s => s.stock_id == this.stock_id);
      } else {
        return { title: "" };
      }
    },
    stock() {
      return this.$store.getters["getMapStocks"].find(s => s.stock_id == this.stock_id);
    },
    user() {
      return JSON.parse(localStorage.getItem('user'));
    },
    allTradeLine() {
      return this.$store.getters["userTradePlans"].filter(
        (item) => item.user_id === this.user.user_id
      );
    },
  },
};
</script>

<style scoped>
.dropdown-trade-plans{
    position: absolute;
    top: 30%;
    left: 50%;
}
.trade-plans-warning{
    position: absolute;
    top: 20%;
    left: 8%;
}
.tradeInfo {
  padding: 0 0 15px 15px;
  position: fixed;
  top: 50%;
  left: 50%;
  min-width: 350px;
  background-color: #ECEBEB;
  z-index: 1000;
  box-shadow: 10px 10px 15px 0 rgba(0, 0, 0, 0.35);
}
.newsInfo {
  padding: 0 0 15px 15px;
  position: fixed;
  top: 50%;
  left: 50%;
  min-width: 350px;
  max-width: 700px;
  background-color: #FFFDF2;
  z-index: 1000;
  box-shadow: 10px 10px 15px 0 rgba(0, 0, 0, 0.35);
}
.material-icons-outlined {
  font-family: "Material Icons Outlined";
}
.setting-popup {
  cursor: pointer;
  position: fixed;
  z-index: 100000;
  background: white;
  box-shadow: 0 2px 4px 0 rgba(107, 121, 136, 0.4);
  padding: 5px 10px;
}
.background-color-item {
  width: 30px;
  height: 30px;
  cursor: pointer;
}
.background-color-item.active {
  border: 1px solid;
}
.background-color-item:hover {
  border: 1px solid green;
}
.v-btn--round:hover {
  background-color: #e5f0f6 !important;
}

#journalNoteHeadline:hover {
  cursor: pointer;
}

.main-news-container {
    align-items: start !important;
    justify-content: left !important;
}

.main-news-container > div {
    text-align: left;
}

.title-design {
    font-size: 12px;
    font-weight: bold;
}

.news-text-design {
    font-size: 11px;
}

.links-design {
    font-size: 14px;
}

.news-tabs-design {
    font-size: 14px;
}

.news-tabs-date {
    font-size: 14px;
}
</style>
