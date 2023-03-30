<template lang="pug">
    v-dialog(v-model="showModalColumnEdit" scrollable width="1200px" height="700px")
        v-sheet(class="pa-5")
            v-toolbar( color="cyan" dark height="48px")
                v-icon mdi-settings
                span &nbsp; &nbsp;
                v-toolbar-title Watchlist: custom layout
                v-spacer
                span x
            v-divider
            v-row
                DIV(style="background-color:silver;width:100%;" class="my-8")
                    v-img(src="images/wl_ticker.png" style="max-width:97px; float:left; display:inline; border: 1px solid silver;")
                    v-img(src="images/wl_name.png" style="max-width:154px; float:left; display:inline; border: 1px solid silver;")
                    v-img(src="images/wl_sector.png" style="max-width:154px; float:left; display:inline; border: 1px solid silver;")
                    v-img(src="images/wl_conviction.png" style="max-width:154px; float:left; display:inline; border: 1px solid silver;")
            v-row
                v-card(:elevation="hover ? 24 : 6" class="mx-auto pa-6")
                    v-img(src="images/wl_name.png" style="width:154px; float:left; display:inline; border: 1px solid silver;")
                v-card(:elevation="hover ? 24 : 6" class="mx-auto pa-6")
                    v-img(src="images/wl_name.png" style="width:154px; float:left; display:inline; border: 1px solid silver;")
                v-card(:elevation="hover ? 24 : 6" class="mx-auto pa-6")
                    v-img(src="images/wl_market_cap.png" style="width:97px; float:left; display:inline; border: 1px solid silver;")
                v-card(:elevation="hover ? 24 : 6" class="mx-auto pa-6")
                    v-img(src="images/wl_earnings_date.png" style="width:97px; float:left; display:inline; border: 1px solid silver;")
                v-card(:elevation="hover ? 24 : 6" class="mx-auto pa-6")
                    v-img(src="images/wl_earnings_media.png" style="width:97px; float:left; display:inline; border: 1px solid silver;")
                v-card(:elevation="hover ? 24 : 6" class="mx-auto pa-6")
                    v-img(src="images/wl_earnings_results.png" style="width:97px; float:left; display:inline; border: 1px solid silver;")
                v-card(:elevation="hover ? 24 : 6" class="mx-auto pa-6")
                    v-img(src="images/wl_rrr.png" style="width:97px; float:left; display:inline; border: 1px solid silver;")


            v-divider
            v-spacer
            v-btn(v-show="true" color="blue darken-1 white--text"  @click="dialog = false") Done


</template>

<script>
export default {
  name: "WatchlistDialogColumnEdit",
  components: {},
  props: ["myText"]
};
</script>

<style scoped>
</style>
