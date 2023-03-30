<template lang="pug">
    v-app
        v-container(:class="banner.color" width="100%" fluid class="pb-0 pt-2" style="z-index:3;")
            v-row(no-gutters)
                v-col(cols="5")
                    v-img(src="/images/traders-alloy-logo_icon-white-transparent.png"
                        style="position:absolute; left:6px; top:-3px; width:50px; overflow:visible; z-index:10000;"
                    )

                    v-autocomplete(@change="isPdfReportsTableLoaded"
                        :label="$t('Search_by_company_name')"
                        :placeholder="$t('Search_by_company_name')"
                        data-v-step='0'
                        :filter="customFilter"
                        :items="getAllStocks"
                        item-text="name"
                        item-value="ticker"
                        return-object
                        dense
                        solo
                        :loading='loadingState' loader-height="3"
                        @input="onChange"
                        style="width:350px; padding:0; float:left; margin: 0 0 0 200px; z-index: 800;")
                        template( v-slot:selection="data")
                            span
                        template( v-slot:item="data")
                            div(style="height:60px;")
                                div(style="display:inline-block; width:60px; vertical-align:top;" class="ticker") {{data.item.ticker}}
                                div(style="display:inline-block; width:200px; vertical-align:top; margin:0 0 0 40px; height:60px;") {{data.item.name}}
                                div(style="display:inline-block; width:200px; margin:0px; vertical-align:top; height:60px;" class="ml-2") {{$t(data.item.sector_name)}}
                v-col(cols="5")
                    div
                        v-snackbar( v-model="message.visible" absolute :timeout="3001" :color="message.type")
                            span( class="h4 white--text") {{message.text}}

                    div(v-show="!this.userSubscribed" style="padding-left:120px;")
                        PremiumButton

                v-col(cols="2")
                    div(style="float:right; position:relative; z-index:1000;")
                        template( v-if="this.user.access === 'admin'")
                            v-dialog(  max-width="600px")
                                template(v-slot:activator="{on}")
                                    v-btn(color="blue6" v-on="on" class="white--text p-0 mr-4")
                                        v-icon(middle class=" pl-1 pr-1" style="font-size:25px;") mdi-bell
                                DialogNotifications

                        //- template( v-if="this.user.access === 'admin'")
                        template
                            v-dialog(v-model="dialog" width="400" v-click-outside="{include: include}")
                                template(v-slot:activator="{on}")
                                    v-btn(color="blue6" v-on="on" class="white--text p-0 mr-4 included" id="dialogCompetition")
                                        v-icon(middle class=" pl-1 pr-1" style="font-size:25px;") $trophy
                                template(v-slot:default="dialog")
                                    DialogCompetitions(:checkShortCode="code" @closeDialog="closeDialog")

                        v-menu(offset-y dense)
                            template(v-slot:activator="{ on }")
                                v-btn(color="blue6" v-on="on" class="white--text p-0")
                                    v-icon(middle class="pl-1 pr-1" style="font-size:25px;") mdi-account-outline
                            v-list(dense style="width:250px; float:right" )
                                //- span(style="font-size:0.8em; margin: 0 15px; ") {{this.user.email}}
                                v-list-item()
                                    v-icon(left) mdi-account-circle
                                    v-list-item-title {{this.user.email}}
                                v-divider
                                v-list-item(@click.stop="showUserSettings=true")
                                    v-icon(left) mdi-settings
                                    v-list-item-title {{$t('User_settings')}}
                                v-list-item(@click.stop="showUserAccount=true")
                                    v-icon(left) mdi-credit-card
                                    v-list-item-title {{$t('User_account')}}
                                v-list-item(@click.stop="goToHelp()")
                                    v-icon(left) mdi-human
                                    v-list-item-title {{$t('Help')}}
                                    v-icon(left) mdi-open-in-new
                                v-list-item(@click.stop="showUserInviteFriend=true")
                                    v-icon(left) mdi-account-plus
                                    v-list-item-title {{$t('Invite_a_friend')}}
                                v-divider
                                v-list-item(@click="logout")
                                    v-icon(left) mdi-logout
                                    v-list-item-title {{$t('Log_out')}}

        NavigationTabs(v-if="!loadingState")
        UserAccount(v-model="showUserAccount")
        UserSettings(v-model="showUserSettings")
        UserInviteFriend(v-model="showUserInviteFriend")


</template>

<script>
    /* eslint-disable no-console */
    "use strict";

    import {mapGetters, mapActions} from "vuex";
    import NavigationTabs from "../components/NavigationTabs.vue";
    import DialogCompetitions from "../components/DialogCompetitions.vue";
    import DialogNotifications from "../components/DialogNotifications.vue";
    import PremiumButton from "../components/PremiumButton.vue";
    import UserSettings from "./landing/UserSettings.vue";
    import UserAccount from "./landing/UserAccount.vue";
    import UserInviteFriend from "./landing/UserInviteFriend.vue";
    import ApiStocks from "@/Services/ApiStocks.js";
	import Cookies from 'js-cookie';

    export default {
        name: "Application",
        components: {
            NavigationTabs,
            UserAccount,
            UserSettings,
            UserInviteFriend,
            PremiumButton,
            ApiStocks,
            DialogCompetitions,
            DialogNotifications,
        },
        created: async function() {
            if(localStorage.user === undefined) {
                const urlParams = new URLSearchParams(window.location.search);
                if(urlParams.get('tab') !== null) {
                    window.location.href = `/?stockOverview=${window.location.href}`;
                } else if(urlParams.get('unsubscribe_email_newsletter') !== null) {
                    window.location.href = `/?unsubscribe_email_newsletter=true`;
                } else if(urlParams.get('show_premium') !== null) {
                    window.location.href = `/?show_premium=true`;
                }
            }

            this.path = window.location.pathname;
            this.user = JSON.parse(localStorage.getItem('user'));
            this.handleUserAction(JSON.parse(localStorage.user));

            console.log("Application CREATED");
            await this.loadUserTabs(this.user.user_id);

            /// The following load function is  asynchronous (loaded in sequence) and creates the VUEX **MAP** stores
            await this.load(this.user.user_id); // calling the action function inside index.js store to fetch stocks companies etc.

            for(const competition of this.getCompetitions) {
                if(localStorage.getItem(`${competition.short_code}`) !== null) {
                    this.shortCodeSet = competition.short_code;
                }
            }
            
            /// we update VUEX data for 12 hours
            setInterval(async () => {
                await this.load(this.user.user_id);
            }, 12*60*60*1000);

            this.connectWithIntercom();

            if (localStorage.user) {
                this.user = JSON.parse(localStorage.user);
                if (this.user.subscription_id != null) {
                    this.is_showPremiumBtn = false;
                    this.$store.commit("setUserSubscribed", true);
                    this.$store.commit("setUserCancelSubscribed", false);
                } else {
                    this.$store.commit("setUserSubscribed", false);
                    this.$store.commit("setUserCancelSubscribed", true);
                }
            } else if (this.getCookie("userInfo")) {
                this.user = JSON.parse(this.getCookie("userInfo"));
            }
            if (JSON.parse(this.user.settings).language) {
                this.language = JSON.parse(this.user.settings).language;
            }
            if (this.getCookie("is_email") == "true") {
                this.$store.commit("setSelectedResearchTabIndex", JSON.parse(this.user.settings).length);
            }

        },
        data() {
            return {
                user: null,
                path: "",
                //stockModels: [],  dont need this anymore, we have this.getAllStocks from vuex store
				dialog: false,
                showMessage: false,
                showUserSettings: false,
                showUserAccount: false,
                showUserInviteFriend: false,
                loadingState: "amber",
                language: null,
                showPP: true,
                is_showPremiumBtn: true,
                shortCodeSet: null,
                code: ''
            };
        },
        watch: {
            length(val) {
                this.tab = val - 1;
            },
            search() {
                if (this.items.length > 0) return; // Items have already been loaded
            },
            getShortCode() {
                this.code = this.shortCodeSet;
                this.dialog = true;
            }
        },
        computed: {
            ...mapGetters([
                "getWatchlistItems",
                "getWatchlistItem",
                "getFinancials",
                "getMapSectors",
                "getMapExchanges",
                "getMapCompanies",
                "getResearchs",
                "getResearchStaleCount",
                "screenerFilters",
                "userTradePlans",
                "userTradePlansActiveCount",
                "getMapUserWatchlists",
                "getMapUserWatchlistItems",
                "getMapStocks",
                "getAllStocks",
                "getWatchlists",
                "getCompetitions",
                "getEarningsDateArray",
                "getTabIndex",
                "getUserSettings",
                "getUser",
                "getCompanyCalendars",
                "getMapUserDiary",
                "getUserAccounts",
                "getShowUserAccountMenu"
            ]),
            getShortCode() {
                return this.shortCodeSet;
            },
            banner: function () {
                let part_1;
                let part_2;
                let color = "blue3";
                let display = {};

                if ( String(window.location).includes('localhost')) {
                    part_1 = "localhost";
                    // color ="blue3";
                    // color ="pink darken-4";
                } else {
                    part_1 = " beta ... beta ...  beta ";
                }

                if ( this.user.type === 'admin') {
                    part_2 =  this.user.type;
                } else {
                    part_2 = " beta ... beta ... beta ";
                }

                display.text = part_1+' - '+part_2;
                display.color = color;
                return display;
            },
            message: {
                get() {
                    return this.$store.getters.getMessage;
                },
                set(v) {
                    if (!v) {
                        this.$store.commit("setMessageClear");
                    }
                },
            },
            userSubscribed: {
                get() {
                    return this.$store.getters.getUserSubscribed;
                },
            },
            userDiaries() {
                return this.$store.getters.getMapUserDiary;
            },
        },
        methods: {
            ...mapActions([
                "loadFinancials",
                "loadFinancials_year",
                "loadUserTabs",
                "loadUserPortfolioPlan",
                "loadUserDiary",
                "loadUserTradePlans",
                "loadUserTradeHistory",
                "loadSectors",
                "loadAllSectors",
                "loadTx",
                "loadTrade",
                "loadScreeners",
                "loadNews50",
                "loadCompaniesv0",
                "loadCompanies",
                "loadCompanyAnalysts",
                "loadCompanyWebcasts",
                "loadExchanges",
                "loadEarningsdatenext",
                "loadStocks",
                "loadUserResearch",
                "loadUserWatchLists",
                "loadCompetitions",
                "loadNotifications",
                "loadUserCompetitions",
                "loadUserWatchlistJoins",
                "loadUserWatchListItems",
                "loadWLColumns",
                "loadChartOverlays",
                "clickUserNavTab",
                "setRemoveNavigationTabsAction",
                "setAddNavigationTabsAction",
                "setNavigationTabsAction",
                "setPushToStocksAction",
                "handleUserAction",
                "loadUserAccounts",
                "loadAllUserAccounts",
                "loadCompanyDataNeeded",
                "loadAllStocksForAutocompleteOnStartup",
                "loadExchangeRates",
            ]),
            closeDialog(dialog) {
                this.dialog = dialog;
            },
            isPdfReportsTableLoaded() {
                this.$store.commit('setIsPdfReportsTableLoaded', 0);

                setTimeout(() => {
                    this.$store.commit('setIsPdfReportsTableLoaded', 1);
                }, 50);
            },
			include () {
				return [document.querySelector('.included')]
			},
            async load(user_id) {
                console.time("loadAL/tors");

                // await this.loadChartOverlays(user_id);
                // await this.loadCompanyWebcasts();

                // await this.loadCompanyAnalysts();
                await this.loadCompaniesv0();
                await this.loadCompanies();
                await this.loadSectors();
                await this.loadExchanges();
                await this.loadAllSectors();
                await this.loadAllStocksForAutocompleteOnStartup();
                await this.loadEarningsdatenext(); // where do we need this? No use right now, maybe upload later?
                await this.loadCompetitions();
                await this.loadNews50();
                await this.loadFinancials();
                await this.loadFinancials_year();
                await this.loadExchangeRates();

                await this.loadUserDiary(user_id);
                await this.loadUserTradePlans(user_id);
                await this.loadUserResearch(user_id);
                await this.loadWLColumns(user_id);
                await this.loadUserCompetitions(user_id);
                await this.loadNotifications(user_id);
                await this.loadUserWatchLists(user_id);
                await this.loadUserWatchListItems(user_id);
                await this.loadUserWatchlistJoins(user_id);
                await this.loadScreeners(user_id);
                await this.loadUserPortfolioPlan(user_id);
                // await this.loadUserTabs(user_id);
                await this.loadTx(user_id);
                await this.loadUserTradeHistory(user_id);
                await this.loadUserAccounts(user_id);
                await this.loadAllUserAccounts();

                this.loadingState = false;


            },

            connectWithIntercom () {
                // Send Intercom custom User data on login.
                let user = JSON.parse(localStorage.getItem('user'));
                if (user.user_id) {
                    this.$intercom.boot({
                        user_id: user.user_id,
                        email: user.email,
                        name: user.email.split('@')[0],
                        user_hash: hashInHex,

                        researches: this.getResearchs.length,
                        researches_stale: this.getResearchStaleCount,
                        screeners: this.screenerFilters.length,
                        trade_plans: this.userTradePlans.length,
                        trade_plans_active: this.userTradePlansActiveCount,
                        user_type: user.type,
                        email_newsletter: user.email_newsletter,
                        userSubscribed: this.userSubscribed,
                        watchlists: this.getWatchlists.length,
                        watchlist_items: this.getWatchlistItems.length,
                        number_of_trade_journal_entries: this.userDiaries.length,
                    });
                }
            },

            customFilter(item, searchText) {
                // before update, the return value was only the ticker value of object, after update, return value  is whole object
                const s = searchText.toLowerCase();
                if (item.ticker.toLowerCase().indexOf(s) > -1 || item.name.toLowerCase().indexOf(s) > -1) {
                    return item;
                }
            },

            async onChange(stock) {
                await this.loadCompanyDataNeeded(stock);
                this.$router.push({name: 'landing-page.stock-detail', params: {stock_id: stock.stock_id}});
            },

            getCookie(cname) {
                var name = cname + "=";
                var decodedCookie = decodeURIComponent(document.cookie);
                var ca = decodedCookie.split(";");
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == " ") {
                        c = c.substring(1);
                    }
                    if (c.indexOf(name) == 0) {
                        return c.substring(name.length, c.length);
                    }
                }
                return "";
            },

            logout() {
                localStorage.removeItem('user');
				Cookies.remove('user');
                window.location.href = "/";
            },
            goToHelp() {
                if(this.language === "en") {
                    window.open("https://intercom.help/tradersalloy/en/");
                } else if(this.language === "sv") {
                    window.open("https://intercom.help/tradersalloy/sv/");
                }
            },
        },
    };
</script>

<style>
    .ellipsis {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

    .cursor-pointer {
        cursor: pointer;
    }
    .v-input__control label {
        margin-bottom: 0;
    }
    .ticker {
        background: #556666;
        white-space: nowrap;
        font-size: 12px;
        font-weight: bold;
        color: white;
        /* width: 60px; */
        display: inline-block;
        min-width: 55px;
        height: 19px;
        /* max-width: 80px; */
        text-align: center;
        align-items: center;
        border-radius: 3px;
        cursor: pointer;
    }
    .ticker:hover {
        color: #58dddd;
        text-shadow: 0 0 15px #a0f8ff;
    }
    .ta_construction {
        z-index: 9999;
        transform: rotate(39deg);
        top: 90px;
        left: 1330px;
        width: 500px;
        height: 30px;
        position: absolute;
        background-image: repeating-linear-gradient(45deg, black, black 10px, yellow 10px, yellow 20px);
    }
    .ta_ribbon {
        z-index: 1;
        transform: rotate(20deg);
        position: absolute;
        top: 30px;
        right: -40px;
        background: #eed246;
        color: #444748;
        width: 400px;
        height: 40px;
        text-align: center;
        font-size: 1.5em;
        font-weight: bold;
        box-shadow: 30px 30px 100px 30px rgba(0, 0, 0, 0.3);
        border-bottom: 2px #932e1e solid;
        border-top: 2px #ffae6a solid;
    }
    .discreteIcon {
        visibility: hidden;
    }
    .discreteIcon:hover {
        visibility: visible;
        color: red;
    }
    .ta_sticker {
        background-color: #ebd14c;
        background-image: linear-gradient(140deg, rgba(255, 255, 220, 0), rgba(255, 255, 220, 0.3));
        transform: rotate(4deg);
        position: absolute;
        top: 100px;
        right: 100px;
        color: #444748;
        width: 340px;
        height: 530px;
        padding: 20px;
        text-align: center;
        font-size: 0.9em;
        font-family: Chalkduster;
        box-shadow: 30px 30px 100px 30px rgba(0, 0, 0, 0.3);
    }
    .ta_app {
        position: sticky;
        top: 0;
    }

    .v-btn {
        min-width: 0 !important;
    }

    #userAccountsContainer .v-list-item__title {
        font-size: 15px !important;
    }

    #userAccountsContainer .v-list--dense {
        padding: 0;
    }
    html {
        font-size: 12px;
    }
</style>
