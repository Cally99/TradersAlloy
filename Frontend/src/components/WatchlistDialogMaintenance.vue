<template lang="pug">
    v-dialog(v-model="showModalWatchlistMaintenance" scrollable width="900px")

        v-card
            h1 Watchlist Maintenance
            v-divider
            v-list
                v-list-item(v-for="(wl,j) in data" :key="j")
                    v-list-item-content
                        span(v-if="wl.type!='archive'" )
                            v-list-item-title {{wl.name}}
                            DIV
                                span(v-for="(t,k) in wl.tickers" class="ticker") {{t.ticker}}
                                v-text-field(small prepend-inner-icon="search" append-icon="add" placeholder="Search and Add" outlined class="pa-0" dense)
                        span(v-else)
                            v-divider
                            div
                                v-icon(v-if!="wl.type=='archive'") mdi-delete
                                v-list-item-title( style="display:inline-block") {{wl.name}}
                            v-chip(v-for="(t,k) in wl.tickers" small color="#556666" dark label close class="ml-2") {{t.ticker}}

            v-divider
            v-btn(color="#b2ebf2" small @click="insert(newWatchlistName)")
                v-icon(small) mdi-plus
            v-text-field(outlined dense placeholder="New watchlist name" style="float:right;" v-model="newWatchlistName")

            v-card-actions
                v-btn(v-show="true" color="blue darken-1" text @click="showModalWatchlistMaintenance = false") Close

</template>

<script>
export default {
  name: "WatchlistDialogMaintenance",
  props: ["showModalWatchlistMaintenance"],
  methods: {
    insert(newName) {
      //                data.showMessageSuccess
      //                watchlistModel.methods.insert(newName);
      //                this.data.user_watchlists.push({id: 1, name: 'Andrews', user_id: 1, type: null,});
    }
  }
};
</script>

<style>
</style>
