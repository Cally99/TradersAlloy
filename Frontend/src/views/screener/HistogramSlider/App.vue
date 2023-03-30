/* eslint-disable prettier/prettier */
<template>
  <div style="display:flex;">
    <HistogramSlider
      style="margin: 20px auto"
      ref="hist"
      type="double"
      :width="200"
      :bar-height="150"
      :data="dataPE"
      :clip="true"
      :grid="false"
      :hideFromTo="true"
      :drag-interval="true"
      @finish="finish"
      :force-edges="false"
      :colors="['#4facfe', '#4facfe']"
    />
    <HistogramSlider
      style="margin: 20px auto"
      ref="hist"
      type="double"
      :width="200"
      :bar-height="150"
      :data="dataMarketCap"
      :isMoney="true"
      :clip="true"
      :grid="false"
      :hideFromTo="true"
      :drag-interval="true"
      @finish="finish"
      :force-edges="false"
      :colors="['#4facfe', '#4facfe']"
    />
    <HistogramSlider
      style="margin: 20px auto"
      ref="hist"
      type="double"
      :width="200"
      :bar-height="150"
      :data="dataEPS"
      :clip="true"
      :grid="false"
      :hideFromTo="true"
      :drag-interval="true"
      @finish="finish"
      :force-edges="false"
      :colors="['#4facfe', '#4facfe']"
    />
    <HistogramSlider
      style="margin: 20px auto"
      ref="hist"
      type="double"
      :width="200"
      :bar-height="150"
      :data="dataSolidity"
      :clip="true"
      :grid="false"
      :hideFromTo="true"
      :drag-interval="true"
      @finish="finish"
      :force-edges="false"
      :colors="['#4facfe', '#4facfe']"
    />
  </div>
</template>

<script>
import HistogramSlider from './Components/HistogramSlider.vue'
export default {
  data() {
    return {
      //x0 = value to emit (range_low)
      //frequency = bars height
      //display = value labels
      //for P/E filter
      dataPE: [
        { x0: -2000, frequency: 541, display: '< -1' },
        { x0: -1, frequency: 390, display: '-1' },
        { x0: 0, frequency: 85, display: '0' },
        { x0: 1, frequency: 3, display: '1' },
        { x0: 5, frequency: 31, display: '5' },
        { x0: 10, frequency: 66, display: '10' },
        { x0: 15, frequency: 106, display: '15' },
        { x0: 20, frequency: 77, display: '20' },
        { x0: 40, frequency: 183, display: '40' },
        { x0: 60, frequency: 67, display: '60' },
        { x0: 80, frequency: 23, display: '80' },
        { x0: 100, frequency: 13, display: '100' },
        { x0: 10000, frequency: 70, display: '> 100' }
      ],

      //for Market-cap filter
      dataMarketCap: [
        { x0: 0, frequency: 263, display: '0 M' },
        { x0: 16000000, frequency: 235, display: '16 M' },
        { x0: 46000000, frequency: 205, display: '46 M' },
        { x0: 110000000, frequency: 174, display: '110 M' },
        { x0: 230000000, frequency: 137, display: '230 M' },
        { x0: 500000000, frequency: 117, display: '500 M' },
        { x0: 1000000000, frequency: 90, display: '1 B' },
        { x0: 2000000000, frequency: 77, display: '2 B' },
        { x0: 4000000000, frequency: 64, display: '4 B' },
        { x0: 9000000000, frequency: 49, display: '9 B' },
        { x0: 20000000000, frequency: 31, display: '20 B' },
        { x0: 50000000000, frequency: 21, display: '50 B' },
        { x0: 200000000000, frequency: 10, display: '> 50 B' }
      ],

      //for EPS
      dataEPS: [
        { x0: -1000, frequency: 11, display: '< -1' },
        { x0: -1, frequency: 100, display: '-1' },
        { x0: 0, frequency: 221, display: '0' },
        { x0: 0.5, frequency: 379, display: '0.5' },
        { x0: 1, frequency: 111, display: '1' },
        { x0: 1.5, frequency: 74, display: '1.5' },
        { x0: 2, frequency: 76, display: '2' },
        { x0: 2.5, frequency: 46, display: '2.5' },
        { x0: 3, frequency: 35, display: '3' },
        { x0: 3.5, frequency: 31, display: '3.5' },
        { x0: 4, frequency: 32, display: '4' },
        { x0: 4.5, frequency: 28, display: '4.5' },
        { x0: 5, frequency: 20, display: '5' }
      ],

      //for Solidity
      dataSolidity: [
        { x0: -1000, frequency: 9, display: '< 0 %' },
        { x0: 0, frequency: 15, display: '0 %' },
        { x0: 0.1, frequency: 21, display: '10 %' },
        { x0: 0.2, frequency: 41, display: '20 %' },
        { x0: 0.3, frequency: 48, display: '30 %' },
        { x0: 0.4, frequency: 137, display: '40 %' },
        { x0: 0.5, frequency: 210, display: '50 %' },
        { x0: 0.6, frequency: 166, display: '60 %' },
        { x0: 0.7, frequency: 134, display: '70 %' },
        { x0: 0.8, frequency: 135, display: '80 %' },
        { x0: 0.9, frequency: 167, display: '90 %' },
        { x0: 1, frequency: 245, display: '100 %' },
        { x0: 1000, frequency: 3, display: '> 100 %' }
      ]
    }
  },

  methods: {
    finish(val) {
      console.log(val)
    }
  },

  components: {
    HistogramSlider
  }
}
</script>
