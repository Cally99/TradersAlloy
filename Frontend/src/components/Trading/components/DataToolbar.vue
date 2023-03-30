
<template>
  <div class="trading-vue-data-toolbar" :style="styles">
    <div class="trading-vue-data-toolbar-contaner">
      <div class="trading-vue-data-toolbar-date">
        <div class="trading-vue-data-toolbar-company-name">
          <span
            class="company-name"
            style="color: #6ec8a0;font-size: 20px;font-weight: 500"
          >{{title_txt}}</span>
        </div>
        <div class="trading-vue-data-toolbar-compare" @click="activeCompare=true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
            <path
              fill="currentColor"
              d="M13.5 6a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM4 14.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"
            />
            <path fill="currentColor" d="M9 14h4v-4h1v4h4v1h-4v4h-1v-4H9v-1z" />
          </svg>
          {{this.$t('Compare')}}
        </div>
        <div>
          <div
            class="trading-vue-data-toolbar-item"
            :class="{'active':range=='10y'}"
            @click="filterDay(10,'y')"
          >{{this.$t('ten_years')}}</div>
          <div
            class="trading-vue-data-toolbar-item"
            :class="{'active':range=='5y'}"
            @click="filterDay(5,'y')"
          >{{this.$t('five_years')}}</div>
          <div
            class="trading-vue-data-toolbar-item"
            :class="{'active':range=='3y'}"
            @click="filterDay(3,'y')"
          >{{this.$t('three_years')}}</div>
          <div
            class="trading-vue-data-toolbar-item"
            :class="{'active':range=='1y'}"
            @click="filterDay(1,'y')"
          >{{this.$t('one_year')}}</div>
          <!-- <div class="trading-vue-data-toolbar-item" @click="filterDay('','y')">All</div> -->
        </div>
        <div>
          <div
            class="trading-vue-data-toolbar-item"
            :class="{'active':interval=='30interval'}"
            @click="filterDay(30,'interval')"
          >M</div>
          <div
            class="trading-vue-data-toolbar-item"
            :class="{'active':interval=='7interval'}"
            @click="filterDay(7,'interval')"
          >{{this.$t('W_V')}}</div>
          <div
            class="trading-vue-data-toolbar-item"
            :class="{'active':interval=='1interval'}"
            @click="filterDay(1,'interval')"
          >D</div>
          <!-- <div class="trading-vue-data-toolbar-item" @click="filterDay('','')">All</div> -->
        </div>
        <div class="trading-vue-line-type">
          <div
            class="btn-line-type"
            :class="{'active':lineType=='Candles'}"
            @click="chnLineType('Candles')"
          >
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAhklEQVRIS+3WUQqAIBAE0PEEdf9T1gkKg8IkmZEWoW393diht5kmDF5pcB4isBTfgPciPaR+AxcAU/U1P8lIAgpp3ajV2G+gSn5MxYJUJY/AayMwMla/7aiYYeZgZLlerhXA3DpnLUjP3t/+0yhkZm/YRcbuSMoM/xPItKR6D6nUkD3kP3AHLeg2HYuirx0AAAAASUVORK5CYII="
            />
          </div>
          <div
            class="btn-line-type"
            :class="{'active':lineType=='Spline'}"
            @click="chnLineType('Spline')"
          >
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAA20lEQVRIS+2U0Q3CIBRFTyfQERxBN3EER9BRnECdQDcwbqAT6AiOYK7xGdJKAS18GEiaNAQ4nPteaCg8msI8KnDwxP8u0jFwd2PKaTgFjsAMuBk0F1BmV2AFbHMbCiazdRsmcA7DM6Bv8anFfwXKZgPMncN3PlisoYqvoVu7w6K79AHaliFDwQ6vTbIw6ATYAydgmfI69AENZnEJbP9qik4HxoB9QBdmVjY3+hbmq6FqI4gboV3eV88Yuecan2HnSYo+MbAw1DRDcd7nVGCNNDmB2jTJkYU2FI/0ARgLHh3TLxBjAAAAAElFTkSuQmCC"
            />
          </div>
        </div>
        <div class="trading-vue-line-type"></div>
      </div>
      <div class="trading-vue-legend-group">
        <div class="trading-vue-legend-group-title" @click="showLegends=!showLegends">
          <span style="color:#081016;">{{this.$t('Overlays')}}</span>
          <v-icon v-if="showLegends" style="font-size:1.8em; color:#081016;">mdi-chevron-up</v-icon>
          <v-icon v-else style="font-size:1.8em; color:#081016;">mdi-chevron-down</v-icon>
        </div>
        <ul v-show="showLegends">
          <template v-for="(caption, cIndex) in orders" @key="'C'+cIndex">
            <li class="divider" :key="`L_${cIndex}`" v-if="cIndex > 0 && regendsByCaption(caption).length > 0"/>
              <!-- :class="{'ma-start': item.overlay=='Ma 20' , 'ma-end': item.overlay =='Ma 200'} " -->
            <li
              v-for="(item, index) in regendsByCaption(caption)"
              @click="regend_click(item)"
              :key="`i_${cIndex}_${index}`"
              class="d-flex align-center"
            >
            <v-icon size="15px" class="mr-1" color="grey" v-if="item.display">check</v-icon>
            <v-icon size="15px" class="mr-1" v-else style="opacity:0">check</v-icon>
              {{item.overlay}}
            </li>
          </template>
          <template v-if="false">
            <li
              class="d-flex align-center"  
              @click="trade_history_status"
            >
            <v-icon size="15px" class="mr-1" color="grey" v-if="this.tradeHistoryStatus">check</v-icon>
            <v-icon size="15px" class="mr-1" v-else style="opacity:0">check</v-icon>
              Porfolio Trade History
            </li>
          </template>
        </ul>
      </div>
    </div>
    <compare-data :open="activeCompare" @close="activeCompare=false" @chnData="filterDay" />
  </div>
</template>

<script>
import Icons from "../stuff/icons.json";
import CompareData from "./CompareData";
export default {
  name: "DataToolbar",
  components: {
    CompareData
  },
  props: ["data", "height", "colors", "tv_id", "config", "width", "title_txt"],
  data() {
    return {
      orders: [
        ['Earning Date', 'MA 20' , 'MA 50', 'MA 200'],
        ['Insiders: By Transaction' , 'Insiders: Silent Period'],
        'Compare',
        ['Portfolio Transactions'],
        ['Portfolio Trade History'],
        ['Journal Notes'],
        ['News']
      ],
      interval: "1interval",
      activeCompare: false,
      tool_count: 0,
      range: "5y",
      lineType: "Spline",
      showLegends: false,
      tradeHistoryStatus: true,
    };
  },
  mounted() {},
  methods: {
    trade_history_status(){
      if(this.tradeHistoryStatus === false){
        this.tradeHistoryStatus = true;
      }
      else {
        this.tradeHistoryStatus = false;
      }
      this.$emit("legend-button-click", {
        button: "trade_history",
        dataIndex: 9,
        grid: 0,
        overlay: "TradeHistory_1",
        type: "onchart",
        tradeHistoryStatus: this.tradeHistoryStatus
      });
      this.showLegends = false;

    },
    regend_click(item) {
      this.showLegends = false;
      this.$emit("legend-button-click", item);
    },
    chnLineType(type) {
      this.lineType = type;
      this.$emit("chnLineType", type);
    },
    filterDay(val, key) {
      this.activeCompare = false;
      var now = new Date();
      var to = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes()
      );
      var from = "";
      if (key == "y") {
        this.range = val + key;

        if (val == "") this.$emit("chnInterval", val);
        else {
          from = new Date(
            now.getFullYear() - val,
            now.getMonth(),
            now.getDate(),
            now.getHours(),
            now.getMinutes()
          );
          this.$emit("chnDateFilter", from.getTime(), to.getTime());
        }
      } else if (key == "interval") {
        this.interval = val + key;

        this.$emit("chnInterval", val);
      } else if (key == "") {
        this.range = "";
        this.interval = "";
        this.$emit("chnInterval", val);
      }
    },
    /**
     * Removing element of array that have duplicate element.
     */
    uniqBy(arr, key) {
        let seen = new Set();
        return arr.filter(item => {
            let k = item[key];
            return seen.has(k) ? false : seen.add(k);
        });
    }
  },
  computed: {
    base64() {
      return item => {
        return Icons[item];
      };
    },
    regendsByCaption() {
      return (caption) => {
        let regends = this.regends
        if(caption == 'Compare') {
          return regends.filter(item => caption == item.chart_type)
        }

        return regends.filter(item => caption.indexOf(item.overlay) > -1)
      }

    },
    regends() {
      let chartData = this.$props.data;
      var regends = [];
      var show = true;
      if(chartData.onchart) {
        chartData.onchart.map((item, index) => {
          if(item.settings.legend === false) return
          show = item.settings.show === undefined ? true : item.settings.show;
          regends.push({
            chart_type: item.type,
            display: show ,
            button: "remove",
            dataIndex: index,
            overlay: item.name,
            grid: 0,
            type: "onchart"
          });
        })
      }
      
      if (chartData.offchart !== undefined) {
       chartData.offchart.map((item, index) => {
          if(item.settings.legend === false) return
          show = item.settings.show === undefined ? true : item.settings.show;
          regends.push({
            display: show,
            button: "remove",
            dataIndex: index,
            overlay: item.name,
            grid: 0,
            type: "offchart"
          });
        })
      }

      return this.uniqBy(regends, 'overlay');
    },
    styles() {
      let colors = this.$props.colors
      let width = this.$props.width;
      let b = this.$props.config.TB_BORDER
      let w = this.$props.config.TOOLBAR - b
      let c = colors.grid
      let cb = colors.tbBack || colors.back
      let brd = colors.tbBorder || colors.scale
      let st = this.$props.config.TB_B_STYLE

      return {
        top:`${-w}px`,
        width: `${width + 58}px`,
        left:0,
        height: `${w}px`,
        'background-color': cb,
        "border-bottom": `${b}px ${st} ${brd}`
      };
    }
  },
  watch: {
    data: {
      handler(n) {
        // For some reason Vue.js doesn't want to
        // update 'tools' automatically when new item
        // is pushed/removed. Yo, Vue, I herd you
        // you want more dirty tricks?
        if (n.tools) this.tool_count = n.tools.length;
      },
      deep: true
    },
    range(val) {
      this.$emit("chnRange", val);
    }
  },
  created() {
  },
};
</script>

<style>
.trading-vue-data-toolbar {
  position: absolute;
  /* border-right: 1px solid black; */
  z-index: 5;
  top: 0;
}
.trading-vue-data-toolbar-contaner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding-right: 20px;
}
.trading-vue-data-toolbar-date {
  display: flex;
  align-items: center;
  margin-left: 20px;
}
.trading-vue-data-toolbar-date > div {
  display: flex;
  align-items: center;
  margin-right: 20px;
}
.trading-vue-data-toolbar-compare {
  cursor: pointer;
}
.theme--dark .trading-vue-data-toolbar-item {
  background: rgb(64, 68, 76);
}
.trading-vue-data-toolbar-item {
  padding: 5px 10px;
  font-size: 15px;
  font-weight: 400;
  border-radius: 3px;
  cursor: pointer;
  background: rgb(236, 236, 236);
  transition: all 0.15s;
}
.trading-vue-data-toolbar-item:hover {
  transform: translateY(-2px);
  font-weight: 500;
}
.trading-vue-data-toolbar-item.active {
  background: rgba(149, 249, 137, 0.83);
  font-weight: 500;
}
.theme--dark .btn-line-type {
  background: rgb(64, 68, 76);
}
.btn-line-type {
  background: #ececec;
  border-radius: 3px;
  transition: all 0.15s;
}
.btn-line-type:hover {
  transform: translateY(-2px);
  background: #00ff6645;
}
.btn-line-type.active {
  background: #0aff83;
}
.btn-line-type.active:hover {
  transform: unset;
}
.trading-vue-legend-group {
  position: relative;
}
.theme--dark .trading-vue-legend-group-title {
  background: rgb(64, 68, 76);
}
.trading-vue-legend-group-title {
  background: #E0E6EB;
  border-radius: 3px;
  cursor: pointer;
  padding-left: 10px;
  padding-right: 10px;
}
.trading-vue-legend-group-title > span {
  font-size: 0.85rem;
  font-weight: 500;
  padding: 5px;
}
.theme--dark .trading-vue-legend-group ul {
  background: rgb(64, 68, 76);
}
.trading-vue-legend-group ul {
  position: absolute;
  min-width: 200px;
  right: 0;
  margin: 0;
  padding: 0;
  top: 1.71rem;
  list-style: none;
  border: 1px solid rgb(51, 23, 23);
  border-radius: 3px;
  background: white;
  transition: all 0.25s;
}
.trading-vue-legend-group ul li {
  display: flex;
  justify-items: center;
  font-size: 0.8rem;
  padding: 5px;
  padding-left: 10px;
  cursor: pointer;
}
.trading-vue-legend-group ul li:hover {
  background: blue;
  color: white;
}
.trading-vue-legend-group-title {
  display: flex;
  align-items: center;
}
li.ma-start {
  border-top: 1px solid;
  margin-top: 5px;
}
li.ma-end {
  border-bottom: 1px solid;
  margin-bottom: 5px;
}
li.divider{
  border-top: 1px solid;
  border-bottom: 0;
  border-right: 0;
  border-left: 0;
  height: 0;
  padding: 0 !important;
  margin: 1px 0;
  border-style: dashed;
}
</style>

