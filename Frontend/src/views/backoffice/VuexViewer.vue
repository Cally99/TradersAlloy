<template lang="pug">

    v-container(fluid class="pl-12 grey darken-3 green--text text--lighten-2" style="font-family:courier; width:100%; overflow:scroll; position:absolute; bottom:0; top:80px;" )

        h1 pageId
        div {{pageId}}

        h1 getNoteBtn_clicked
        div {{getNoteBtn_clicked}}

        h1 getMessage
        div {{message}}

        v-divider(class="orange")

        h1 getUser
            span(class="yellow--text text--lighten-3") (database data)
        div {{user_database}}

        h1 competitions
        div {{competitions}}

        h1 userCompetitions
        div {{userCompetitions}}

        h1 News
        h3 all companies limited to 50 items
        div {{news}}

        h1 userAccounts
        table(class="simpleTable")
            tr(v-for="x in userAccounts")
                td {{x.user_id}}
                td {{x.user_account_id}}
                td {{x.account_name}}
                td {{x.account_type}}
                td {{x.hide}}
                td {{x.broker}}
                td {{x.order_preference}}
                td {{x.last_import_date}}
                td {{x.hide}}
                td {{x.competition_id}}

        h1 userTrades
        table(class="simpleTable")
            tr(v-for="x in userTrades")
                td {{x.user_id}}
                td {{x.user_account_id}}
                td {{x.entry_date}}
                td {{x.entry_qty}}
                td {{x.ticker}}
                td {{x.exit_date}}
                td {{x.pnl}}

        h1 getUserSubscribed ???
        div {{userSubscribed}}

        h1 getNavigationTabs ???
        div(v-for="tab in navigationTabs")
            div {{tab}}

        h1 getUserSettings ???
        div {{userSettings}}

        h1 getTabIndex ???
        div {{tabIndex}}


        h1 getResearchs [sic]
        table(class="simpleTable")
            tr
                td ticker
                td stock_id
                td content
            tr(v-for="x in userResearches")
                td {{x.ticker}}
                td {{x.stock_id}}
                td {{x.content.substring(0,100)}}

        h1 getRecents
        div(v-for="tab in recents")
            div {{tab}}

        h1 getMapUserWatchlists
        div {{mapUserWatchlists}}

        h1 getMapUserWatchlistItems
        div {{mapUserWatchlistItems}}

        h1 getWatchlists(0)
        div {{watchlists}}

        h1 getWatchlistItem
        div {{watchlistItem}}

        h1 getWatchlistItems
        div( v-for="item in watchlistItems" )
            div {{item}}

        h1 getMapUserDiary
        table(class="simpleTable")
            tr
                td diary_item_id
                td user_id
                td stock_id
                td date_created
                td note
                td color
                td y
            tr(v-for="x in mapUserDiary")
                td {{x.diary_item_id}}
                td {{x.user_id}}
                td {{x.stock_id}}
                td {{x.date_created}}
                td {{x.note}}
                td {{x.color}}
                td {{x.y}}

        h1 userTradePlans
        table(class="simpleTable")
            tr
                td trade_plan_id
                td user_id
                td stock_id
                td entry_price
                td stoploss_price
                td target_price
                td entry_date
                td exit_date
                td long
                td entry_alert_status
                td stoploss_alert_status
                td target_alert_status
            tr(v-for="x in userTradePlans")
                td {{x.trade_plan_id}}
                td {{x.user_id}}
                td {{x.stock_id}}
                td {{x.entry_price}}
                td {{x.stoploss_price}}
                td {{x.target_price}}
                td {{x.entry_date}}
                td {{x.exit_date}}
                td {{x.long}}
                td {{x.entry_alert_status}}
                td {{x.stoploss_alert_status}}
                td {{x.target_alert_status}}

        h1 userTradeHistory
        table(class="simpleTable")
            tr
                td trade_id
                td user_id
                td stock_id
                td ticker
                td instrument_type
                td entry_price
                td entry_date
                td entry_qty
                td exit_price
                td exit_date
                td exit_qty
                td commission
                td pnl
                td notes
            tr(v-for="x in userTradeHistory")
                td {{x.trade_id}}
                td {{x.user_id}}
                td {{x.stock_id}}
                td {{x.ticker}}
                td {{x.instrument_type}}
                td {{x.entry_price}}
                td {{x.entry_date}}
                td {{x.entry_qty}}
                td {{x.exit_price}}
                td {{x.exit_date}}
                td {{x.exit_qty}}
                td {{x.commission}}
                td {{x.pnl}}
                td {{x.notes}}

        v-divider(class="orange")

        h1 getMapCompanies
        div {{c1.company_id}} {{c1.name}} {{c1.description}}...  {{c1.last_report_date}} {{c1.last_eps_ttm}}
            div(class="pl-10" v-for="report of c1.CompanyReports" ) {{report.period}} {{report.date_report}} {{report.pdf_link}}

        h1 getFinancials
        //div {{getFinancials}}
        // div {{this.getFinancials.get(68179)}}

        h1 getEarningsDateArray
        div {{getEarningsDateArray}}

        h1 getMapStocks (1 only)
        div {{mapStocks}}



        h1 getAllStocks (selection)
        table(class="simpleTable")
            tr
                td stock_id
                td ticker
                td company_id
                td price_today
                td currency_trade
                td exchange
                td country
                td sector_name
            tr(v-for="s in  allStocks")
                td {{s.stock_id}}
                td {{s.ticker}}
                td {{s.company_id}}
                td {{s.price_today}}
                td {{s.currency_trade}}
                td {{s.exchange}}
                td {{s.country}}
                td {{s.sector_name}}


        v-divider(class="orange")


        v-divider(class="orange")

        h1  getSectorsTree
        table(class="simpleTable")
            tr
                td id
                td parentid
                td name
            tr(v-for="x in sectors")
                td {{x.id}}
                td {{x.parentid}}
                td {{x.name}}

        h1  getMapSectors (3 of 512 )
        div {{this.mapSectors.get(68179)}}
        div {{this.mapSectors.get(68180)}}
        div {{this.mapSectors.get(68181)}}
        div ...
            span(class="title blue-grey--text text--darken-1") (build a tree of these ?)

        h1   getMapExchanges
        div(v-for="x in mapExchanges") {{x}}

        //- span {{x.id}} {{x.country}} {{x.city}} {{x.handle}} {{x.name}}


</template>

<script>
    export default {
        name: "VuexViewer",

        data() {
            return {

                c1: null,
                tabIndex: null,
                navigationTabs: null,
                recents: null,
                message: null,
                news: null,
                userSubscribed: null,
                userSettings: null,
                user_database: null,
                competitions: null,
                userCompetitions: null,
                userAccounts: null,
                userTrades: null,
                mapStocks: null,
                allStocks: null,
                userResearches: null,
                watchlists: null ,
                mapUserWatchlists: null,
                mapUserWatchlistItems : null,
                watchlistItems        : null,
                watchlistItem         : null,
                sectors: null,
                mapSectors: null,
                mapExchanges: null,
                mapUserDiary: null,
                userTradePlans: null,
                userTradeHistory: null,
                getFinancials:null,
                pageId: null,
                getNoteBtn_clicked: null,
                getEarningsDateArray: null,
            }
        },

        computed: {
        },

        methods: {

        },

        created: function () {
            const user_id = JSON.parse(localStorage.getItem('user')).user_id;

            this.message = this.$store.getters.getMessage;
            this.pageId = this.$store.getters["pageId"];
            this.getNoteBtn_clicked = this.$store.getters["getNoteBtn_clicked"];
            this.news = this.$store.getters["getNews"];

            this.recents  = this.$store.getters["getRecents"];
            this.navigationTabs  = this.$store.getters["getNavigationTabs"];
            this.tabIndex  = this.$store.getters["getTabIndex"];
            this.userSettings  = this.$store.getters["getUserSettings"];
            this.userSubscribed  = this.$store.getters["getUserSubscribed"];
            this.user_database  = this.$store.getters["getUser"];
            this.competitions = this.$store.getters["getCompetitions"];
            this.userCompetitions = this.$store.getters["getUserCompetitions"];
            this.userAccounts = this.$store.getters["getUserAccounts"];
            this.userTrades = this.$store.getters["tradeHistory"];
            this.mapUserDiary  = this.$store.getters["getMapUserDiary"];
            this.userResearches  = this.$store.getters["getResearchs"];
            this.mapUserWatchlists  = this.$store.getters["getMapUserWatchlists"].length;  // possibly nothing there !  ... possibly an ARRAY !
            this.mapUserWatchlistItems  = this.$store.getters["getMapUserWatchlistItems"].length;// possibly nothing there !  ... possibly an ARRAY !
            this.watchlists  = this.$store.getters["getWatchlists"];
            this.watchlistItems  = this.$store.getters["getWatchlistItems"];
            this.watchlistItem  = this.$store.getters["getWatchlistItem"];
            this.userTradePlans = this.$store.getters["userTradePlans"];
            this.userTradeHistory = this.$store.getters["tradeHistory"];


            this.c1 = this.$store.getters["getMapCompanies"].get(32391);
            this.c1.ceo_comments = this.c1.ceo_comments.substring(0,20);
            this.c1.description = this.c1.description.substring(0,20);

            this.getFinancials = this.$store.getters["getFinancials"];
            this.getEarningsDateArray = this.$store.getters["getEarningsDateArray"];

            this.mapStocks  = this.$store.getters["getMapStocks"].find(s => s.stock_id == 772);
            this.allStocks  = this.$store.getters["getAllStocks"].filter( s => {return (s.stock_id === 42953)} );

            this.sectors  = this.$store.getters["getSectors"];
            this.mapSectors  = this.$store.getters["getMapSectors"];
            this.mapExchanges  = this.$store.getters["getMapExchanges"];



            /*

                "",

                */




        }
    }
</script>

<style scoped>
    h1 {
        font-family:courier;
        color: yellow;
    }

    .simpleTable tr td {
        border: 1px solid #29c9dd;
        text-align: center;
        padding:2px 12px;
    }

</style>
