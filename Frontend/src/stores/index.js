/* eslint-disable no-console */
import Vuex from "vuex";
import Vue from "vue";
import Message from './modules/Message';

import User from './modules/User';
import UserResearch from './modules/UserResearch';
import UserWatchList from './modules/UserWatchList';
import Screener from './modules/Screener';
import UserPortfolioPlan from './modules/UserPortfolioPlan';
import TabIndex from './modules/TabIndex';
import SelectedResearchTabIndex from './modules/SelectedResearchTabIndex';
import FroalaContent from './modules/FroalaContent';
import Settings from './modules/Settings';
import Tx from './modules/UserTx';

import Charts from './modules/Charts';
import ChartToolTooltip from './modules/ChartToolTooltip';

import Companies from './modules/Companies';
import CompanyAnalysts from './modules/CompanyAnalysts';
import Financials from './modules/Financials';
import Stocks from './modules/Stocks';
import Insiders from './modules/Insiders';
import Exchanges from './modules/Exchanges';
import Sectors from './modules/Sectors';

import EarningsDateNextArray from './modules/EarningsDateNextArray';
import PdfUrl from './modules/PdfUrl';
import UserSubscribed from './modules/UserSubscribed';
import News from './modules/News';
import CompanyNews from './modules/CompanyNews';

import Trade from './modules/trade';

import ChartInsider from './modules/ChartInsider';
import CompareDatas from './modules/CompareDatas';
import MapUserDiary from './modules/MapUserDiary';
import NavigationTabs from './modules/NavigationTabs';
import ScreenerFilters from './modules/ScreenerFilters';
import TradeHistory from './modules/TradeHistory';
import UserSettings from './modules/UserSettings';
import UserTradePlans from './modules/UserTradePlans';
import CancelSubscription from './modules/CancelSubscription';
import Recents from './modules/Recents';

import UserAccount from './modules/UserAccount';
import CompanyWebcast from './modules/CompanyWebcast';
import Competitions from "./modules/Competitions";
import Notifications from "./modules/Notifications";
import SysExchangeRates from "./modules/SysExchangeRates";


Vue.use(Vuex);

export const store = new Vuex.Store({
    modules: {
        ChartToolTooltip,
        UserWatchList,
        Competitions,
        SysExchangeRates,
        Notifications,
        User,
        UserPortfolioPlan,
        Companies,
        CompanyAnalysts,
        Stocks,
        Message,
        Exchanges,
        Sectors,
        Financials,
        EarningsDateNextArray,
        UserResearch,
        TabIndex,
        SelectedResearchTabIndex,
        News,
        CompanyNews,
        Insiders,
        Charts,
        FroalaContent,
        PdfUrl,
        UserSubscribed,
        Tx,
        Trade,
        Screener,
        Settings,
        ChartInsider,
        CompareDatas,
        MapUserDiary,
        NavigationTabs,
        ScreenerFilters,
        TradeHistory,
        UserSettings,
        UserTradePlans,
        CancelSubscription,
        Recents,
        UserAccount,
        CompanyWebcast
    },
    state: {},

    getters: {
        pageId(state) {
            return state.pageId;
        }
    },

    mutations: {},

    actions: {}
});

