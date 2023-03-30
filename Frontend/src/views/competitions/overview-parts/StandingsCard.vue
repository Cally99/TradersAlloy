<template lang="pug">
  v-card(outlined rounded)
    v-row
      v-col(cols="8")
        v-card-title
          h3 {{$t('competition_standings')}}
      v-col(cols="4" class="d-flex justify-content-end")
        v-card-title
          v-btn-toggle(mandatory=true v-model="view" color="blue3" small)
            v-btn(value="CHART" small) {{$t('chart')}}
            v-btn(value="TABLE" small) {{$t('table')}}
    v-row
      v-col(cols="12")
          ChartLeaderBoard(v-if="view === 'CHART'"  :competition="competition")
          CompetitionTable(v-if="view === 'TABLE'"  :competition="competition")

</template>

<script>
import ChartLeaderBoard from "../ChartLeaderBoard";
import CompetitionTable from "./CompetitionTable.vue";

export default {
  name: "StandingsCard",
  props: ["competition"],
  components: {
    ChartLeaderBoard,
    CompetitionTable,
  },
  data() {
    return {
      view: 'CHART'
    }
  }
};
</script>

<style scoped>

</style>
