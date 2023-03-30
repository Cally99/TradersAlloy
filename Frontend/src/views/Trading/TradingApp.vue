<template>
  <trading-vue
    title-txt
    v-on:chnInterval="chnInterval"
    v-on:chnLineType="chnLineType"
    :legend-buttons="['display']"
    v-on:legend-button-click="legend_button_click"
    :data="chart"
    :width="this.width"
    :height="this.height"
    :toolbar="true"
    :color-back="colors.colorBack"
    :color-grid="colors.colorGrid"
    :color-text="colors.colorText"
    ref="tradingVue"
  ></trading-vue>
</template>

<script>
import TradingVue from "@/components/Trading/TradingVue";
import Utils from "@/components/Trading/stuff/utils.js";
import DataCube from "@/components/Trading/helpers/datacube.js";
import Data from "@/data/data_simple.json";

export default {
  name: "ChartPrice",
  components: {
    TradingVue
  },
  methods: {
    filterOhlcv(data) {
      if (this.interval == "") return data;
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
          if (temp[0] === null) return;
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
            if (low > Math.min(item[3], item[2]))
              low = Math.min(item[3], item[2]);
            if (high < Math.max(item[3], item[2]))
              high = Math.max(item[3], item[2]);
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
      if (this.interval == "") return data;
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
      return data0;
    },
    chnInterval(interval) {
      let insider = this.insiderChart;
      this.interval = interval;
      let ohlcv = this.initData.ohlcv;
      var ohlcvFilter = this.filterOhlcv(ohlcv);

      var onchart = [];

      if (this.initData.onchart !== undefined) {
        this.initData.onchart.map(item => {
          var data = this.filterData(item.data);
          onchart.push({
            name: item.name,
            type: item.type,
            data: data,
            settings: item.settings == undefined ? {} : item.settings
          });
        });
      } else onchart = [];
      onchart.push(insider);
      var offchart = [];
      if (this.initData.offchart !== undefined) {
        this.initData.offchart.map(item => {
          var data = this.filterData(item.data);
          offchart.push({
            name: item.name,
            type: item.type,
            data: data,
            settings: item.settings == undefined ? {} : item.settings
          });
        });
      } else offchart = [];

      this.chart = new DataCube({
        ohlcv: ohlcvFilter,
        onchart: onchart,
        offchart: offchart
      });
      setTimeout(() => {
        this.chnLineType(this.lineType);
      }, 0.1);
      this.$refs.tradingVue.resetChart();
    },
    legend_button_click(event) {
      if (event.button === "display") {
        let d = this.chart.data[event.type][event.dataIndex];
        if (d) {
          if (!("display" in d.settings)) {
            this.$set(d.settings, "display", true);
          }
          this.$set(d.settings, "display", !d.settings.display);
        }
      }
    },
    chnLineType(type) {
      let d = this.chart.data;
      this.lineType = type;
      this.$set(d.chart, "type", type);
    },
    onResize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight - 60;
    }
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
    this.onResize();
    window.DataCube = this.chart; // Debug
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  },
  data() {
    return {
      lineType: "Candles",
      interval: "",
      chart: new DataCube({}),
      initData: Data,
      width: window.innerWidth,
      height: window.innerHeight - 60,
      colors: {
        colorBack: "#ffffff",
        colorGrid: "#dbe2d9",
        colorText: "#6d6d6d"
      }
    };
  },
  computed: {
    insiderChart() {
      var insiderChart = this.$store.getters["getChartInsider"];
      //   if (data.onchart !== undefined) {
      //     data.onchart = data.onchart.filter(
      //       item => item.name != "Insider Trades"
      //     );
      //     data.onchart.push(insiderChart);
      //   } else {
      //     data.onchart = [];
      //     data.onchart.push(insiderChart);
      //   }
      return insiderChart;
    }
  }
};
</script>

<style scoped>
html,
body {
  background-color: #fff;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
