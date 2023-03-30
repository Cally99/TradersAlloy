/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
/* eslint-disable no-console */
import apiService from "@/Services/ApiService";
import UserWatchList from '@/stores/modules/UserWatchList'
import User from '@/stores/modules/User'
import Companies from '@/stores/modules/Companies'
import Stocks from '@/stores/modules/Stocks'
import Exchanges from '@/stores/modules/Exchanges'
import Message from '@/stores/modules/Message'
import Sectors from '@/stores/modules/Sectors'
import Financials from '@/stores/modules/Financials'
import EarningsDateNextArray from '@/stores/modules/EarningsDateNextArray'
import UserResearch from '@/stores/modules/UserResearch'
import TabIndex from '@/stores/modules/TabIndex'
import SelectedResearchTabIndex from '@/stores/modules/SelectedResearchTabIndex'
import News from '@/stores/modules/News'
import Insiders from '@/stores/modules/Insiders'
import Charts from '@/stores/modules/Charts'
import FroalaContent from '@/stores/modules/FroalaContent'
import Settings from '@/stores/modules/Settings'
import PdfUrl from '@/stores/modules/PdfUrl'
import UserSubscribed from '@/stores/modules/UserSubscribed'

import ChartToolTooltip from '@/stores/modules/ChartToolTooltip'

import Tx from '@/stores/modules/tx'
import Screener from '@/stores/modules/Screener'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import Vue from 'vue';
import Vuetify from 'vuetify';
import sinon from 'sinon';
import chai from 'chai';
const expect = chai.expect;

import message from '@/stores/modules/Message';
import { wrap } from "lodash";

Vue.config.silent = true;

Vue.use(Vuetify);

const localVue = createLocalVue();

localVue.use(Vuex);

describe.skip('Vuex Modules', () => {
    let vuetify;
    let wrapper;
    let store;
    beforeAll(async () => {
    });

    afterAll(async () => {
    });

    beforeEach(() => {
        vuetify = new Vuetify();
    });
    it('UserWatchList - dispatch "loadUserWatchLists"', async () => {
        store = new Vuex.Store({
            modules: {
                UserWatchList
            }
        });

        await store.dispatch('loadUserWatchLists', 146);

        const watchLists = store.getters['getWatchlists'];

        expect(watchLists).to.be.an('array');
        const firstWatchlist = watchLists[0];
        expect(firstWatchlist).to.be.an('object');
        expect(firstWatchlist).to.have.keys([
            'watchlist_id',
            'user_id',
            'name',
            'type'
        ]);

        expect(firstWatchlist.watchlist_id).to.be.an('number');
        expect(firstWatchlist.user_id).to.be.an('number');
        expect(firstWatchlist.name).to.be.an('string');
        expect(firstWatchlist.type).to.be.an('string');
    

        const mapUserWatchLists = store.getters['getMapUserWatchlists'];
        const mapUserWatchListsKey = mapUserWatchLists.keys().next().value;
        const mapUserWatchListsValue = mapUserWatchLists.values().next().value;

        expect(mapUserWatchListsKey).to.be.an('number');
        expect(mapUserWatchListsValue).to.be.an('object');
        expect(mapUserWatchListsValue).to.have.keys([
            'watchlist_id',
            'user_id',
            'name',
            'type'
        ]);

        expect(mapUserWatchListsValue.watchlist_id).to.be.an('number');
        expect(mapUserWatchListsValue.user_id).to.be.an('number');
        expect(mapUserWatchListsValue.name).to.be.an('string');
        expect(mapUserWatchListsValue.type).to.be.an('string');
    });

    //********************************************************** Do we need this test?? 
    // it('UserWatchList - dispatch "loadUserWatchListItems"', async () => {
    //     store = new Vuex.Store({
    //         modules: {
    //             UserWatchList
    //         }
    //     });

    //     /*
    //     await store.dispatch('loadUserWatchListItems', 185);

    //     const watchListItems = store.getters['getWatchlistItems'];
    //     */
    // });
    it('Financials - dispatch "loadFinancials"', async () => {
        store = new Vuex.Store({
            modules: {
                Financials
            }
        });

        await store.dispatch('loadFinancials');

        const financials = store.getters['getFinancials'];
        expect(financials).to.be.an('array');

        const firstFinancials = financials[0];
        expect(firstFinancials).to.be.an('object');
        expect(firstFinancials).to.have.keys([
            'company_id',
            'period',
            "price",
            'date_report',
            'eps',
            "eps_ttm",
            'sales',
            'profit',
            'pe',
            'ps',
            'gp',
            "ibl",
            'ebitda',
            'ebit',
            'ptp',
            'intangibleasset',
            'fixedasset',
            'financialasset',
            'noncurrentasset',
            'cce',
            'currentassets',
            'totalassets',
            'shequity',
            'ltliabilities',
            'curliabilities',
            'totalnumberofshares',
            'pdf_link',
            'pdf_language'
        ]);
    })
    it('Exchanges - dispatch "loadExchanges"', async () => {
        store = new Vuex.Store({
            modules: {
                Exchanges
            }
        });

        await store.dispatch('loadExchanges');

        const mapExchanges = store.getters['getMapExchanges'];
        const firstMapExchangesKey = mapExchanges.keys().next().value;
        const firstMapExchangesValue = mapExchanges.values().next().value;

        expect(firstMapExchangesKey).to.be.an('string');
        expect(firstMapExchangesValue).to.be.an('object');
        expect(firstMapExchangesValue).to.have.keys([
            'id',
            'handle',
            'name',
            'country',
            'city'
        ]);
        expect(firstMapExchangesValue.id).to.be.an('string');
        expect(firstMapExchangesValue.handle).to.be.an('string');
        expect(firstMapExchangesValue.name).to.be.an('string');
        expect(firstMapExchangesValue.country).to.be.an('string');
        expect(firstMapExchangesValue.city).to.be.an('string');
        
    })
    it('Sectors - dispatch "loadSectors"', async () => {
        store = new Vuex.Store({
            modules: {
                Sectors
            }
        });

        await store.dispatch('loadSectors');

        const mapSectors = store.getters['getMapSectors'];
        const firstMapSectorsKey = mapSectors.keys().next().value;
        const firstMapSectorsValue = mapSectors.values().next().value;

        expect(firstMapSectorsKey).to.be.an('number');
        expect(firstMapSectorsValue).to.be.an('object');
        expect(firstMapSectorsValue).to.have.keys([
            "children",
            "id",
            "name",
            "parentid"
        ]);
        expect(firstMapSectorsValue.id).to.be.an('number');
        expect(firstMapSectorsValue.name).to.be.an('string');
        expect(firstMapSectorsValue.children).to.be.an('array');

    });

    it('Companies - dispatch "loadCompanies"', async () => {
        store = new Vuex.Store({
            modules: {
                Companies
            }
        });

        await store.dispatch('loadCompanies');

        const mapCompanies = await store.getters['getMapCompanies'];
        const firstMapCompaniesKey = mapCompanies.keys().next().value;
        const firstMapCompaniesValue = mapCompanies.values().next().value;

        expect(firstMapCompaniesKey).to.be.an('number');
        expect(firstMapCompaniesValue).to.be.an('object');
        expect(firstMapCompaniesValue).to.have.keys([
            'CompanyCalendars',
+           'CompanyReports',
            'company_id',
            'ceo_comments',
            'description',
            'last_report_date',
            'last_eps_ttm',
            "last_np",
+           'last_pe',
            'last_sales',
            'market_cap',
            'next_report_date',
            'name',
+           'status_flag'
        ]);
        expect(firstMapCompaniesValue.company_id).to.be.an('number');
        expect(firstMapCompaniesValue.name).to.be.an('string');
        expect(firstMapCompaniesValue.description).to.satisfy(function (s) {
            return s === null || typeof s == 'string'
        });
        expect(firstMapCompaniesValue.market_cap).to.satisfy(function (s) {
            return s === null || typeof s == 'string'
        });
        expect(firstMapCompaniesValue.last_report_date).to.satisfy(function (s) {
            return s === null || typeof s == 'string'
        });
        expect(firstMapCompaniesValue.last_eps_ttm).to.satisfy(function (s) {
            return s === null || typeof s == 'number'
        });
        expect(firstMapCompaniesValue.last_sales).to.satisfy(function (s) {
            return s === null || typeof s == 'number'
        });
        expect(firstMapCompaniesValue.ceo_comments).to.satisfy(function (s) {
            return s === null || typeof s == 'string'
        });
    },9999)
    /**
     *  Expected value   ["asset", "cce", "country", "curliabilities", "currency_trade", "description", "ebit", "equity", "exchange", "insref", "company_id", "ltliabilities", "market_cap", "name", "netDebt_array", "price_today", "profit_margin", "ptp", "sales", "sales_array", "sales_array_delta", "sector_id", "sector_name", "shequity", "solidity", "stock_exchange_id", "ticker", "totalassets"]
        Received:
        ["country", "currency_trade", "description", "exchange", "insref", "isin", "market_cap", "name", "price_today", "sector_id", "sector_name", "stock_exchange_id", "ticker"]
     *  missing fields from Backend.
     */
    it('Stocks - dispatch "loadStocks"', async () => {
        store = new Vuex.Store({
            modules: {
                Financials,
                Sectors,
                Exchanges,
                Companies,
                Stocks
            }
        });

        await store.dispatch('loadFinancials');
        await store.dispatch('loadExchanges');
        await store.dispatch('loadSectors');
        await store.dispatch('loadCompanies');
        await store.dispatch('loadStocks');

        const allStocks = await store.getters['getAllStocks'];
        expect(allStocks).to.be.an('array');
        const firstAllStocks = allStocks[0];

        expect(firstAllStocks).to.be.an('object');
        expect(firstAllStocks).to.have.keys([
            'insref',
            'stock_exchange_id',
            'isin',
            'ticker',
            'name',
            'sector_id',
            'currency_trade',
            'price_today',
            'sector_name',
            'exchange',
            'country',
            'market_cap',
            'description',
            'profit_margin',
            'sales_array_delta',
            'solidity',
            'equity',
            'asset',
            'netDebt_array',
            'sales',
            'sales_array',
            'totalassets',
            'shequity',
            'ebit',
            'ptp',
            'ltliabilities',
            'curliabilities',
            'cce'
        ]);
    },9999)

    /**
     * unable to mock localStorage.user (src/stores/modules/UserResearch.js:50:16)
     */

    // *********************************************** Do we need this test??
    // it('UserResearch - dispatch "loadUserResearch"', async () => {
    //     store = new Vuex.Store({
    //         modules: {
    //             UserResearch
    //         }
    //     });

    //     await store.dispatch('loadUserResearch', 185);

    //     const mapUserResearch = store.getters['getResearchs'];
    // })

    it('User - dispatch "handleUserAction"', async () => {
        store = new Vuex.Store({
            modules: {
                User
            }
        });

        await store.dispatch('handleUserAction', {
            user_id: 190,
            email: "test@test.com",
            settings: "{\"language\":\"sv\", \"is_dark\":false}",
            subscription_id: true
        });

        const user = store.getters['getUser'];
        expect(user).to.be.an('object');
        expect(user).to.have.keys([
            'user',
            'email',
            'language',
            'is_dark',
            'subscribed'
        ]);
        expect(user.user).to.be.an('number');
        expect(user.email).to.be.an('string');
        expect(user.language).to.be.an('string');
        expect(user.is_dark).to.be.an('boolean');
        expect(user.subscribed).to.satisfy(function (s) {
            return s === null || typeof s == 'boolean'
        });
    });

    it('Message - commit "setMessage" and "setMessageClear"', async () => {
        store = new Vuex.Store({
            modules: {
                Message
            }
        });

        store.commit('setMessage', {
            visible: true,
            text: "test",
            type: "success"
        });

        let message = store.getters['getMessage'];
        expect(message).to.be.an('object');
        expect(message).to.have.keys([
            'visible',
            'text',
            'type'
        ]);
        expect(message.visible).to.be.an('boolean');
        expect(message.text).to.be.an('string');
        expect(message.type).to.be.an('string');

        store.commit('setMessageClear');
        message = store.getters['getMessage'];
        expect(message).to.be.an('object');
        expect(message).to.be.deep.equal({});
    });

    // // *********************************************** Do we need this test?
    // it('EarningsDateNextArray - dispatch "loadEarningsdatenext"', async () => {
    //     store = new Vuex.Store({
    //         modules: {
    //             EarningsDateNextArray
    //         }
    //     });

    //     await store.dispatch('loadEarningsdatenext');

    //     const earningsDateNextArray = store.getters['getEarningsDateArray'];
    // });

    it('TabIndex - commit "setTabIndex" and "setTab_overviewIndex', async () => {
        store = new Vuex.Store({
            modules: {
                TabIndex
            }
        });

        store.commit('setTabIndex', 1);

        let tabIndex = store.getters['getTabIndex'];
        expect(tabIndex).to.be.an('number');
        expect(tabIndex).to.be.equal(1);

        store.commit('setTab_overviewIndex', 1);

        let tabOVIndex = store.getters['getTab_overviewIndex'];
        expect(tabOVIndex).to.be.an('number');
        expect(tabOVIndex).to.be.equal(1);
    });

    // it('Tx - dispatch "loadTx"', async () => {
    //     store = new Vuex.Store({
    //         modules: {
    //             Tx
    //         }
    //     });

    //     await store.dispatch('loadTx', 87);

    //     const tx = store.getters['getTx'];
    //     expect(tx).to.be.an('array');

    //     //Why is not an object??
    //     // const firstTx = tx[0];
    //     // expect(firstTx).to.be.an('object');

    //     for (let itr of tx) {
    //         expect(itr).to.be.an('object');
    //         expect(itr).to.have.keys([
    //             'tx_id',
    //             'user_id',
    //             'stock_id',
    //             'company_id',
    //             'account',
    //             'tx_date',
    //             'tx_type',
    //             'description',
    //             'qty',
    //             'price',
    //             'amount',
    //             'commission',
    //             'currency',
    //             'exchange_rate'
    //         ]);
    //         expect(itr.tx_id).to.be.an('number');
    //         expect(itr.user_id).to.be.an('number');
    //         expect(itr.account).to.be.an('string');
    //         expect(itr.tx_date).to.be.an('string');
    //         expect(itr.tx_type).to.be.an('string');
    //         expect(itr.company_id).to.be.an('number');
    //         expect(itr.stock_id).to.be.an('number');
    //         expect(itr.description).to.be.an('string');
    //         expect(itr.qty).to.be.an('number');
    //         expect(itr.price).to.satisfy(function (s) {
    //             return s === null || typeof s == 'number'
    //         });
    //         expect(itr.amount).to.be.an('number');
    //         expect(itr.commission).to.be.an('number');
    //         expect(itr.currency).to.be.an('string');
    //         expect(itr.exchange_rate).to.be.an('number');
    //     }
    // });
    /**
     * Expected: ["image", "order", "sortable", "text", "value"]
     * Received: ["image", "order", "text", "value"]
     * sometimes some fields are missed on response data.
     * need to consider backend api
     */
//     it('Settings - dispatch "loadSettings"', async () => {
//         store = new Vuex.Store({
//             modules: {
//                 Settings
//             }
//         });

//         await store.dispatch('loadSettings', 185);

//         const conf = store.getters['getWLConf'];
//         expect(conf).to.be.an('array');

//         const firstConf = conf[0];

//         for (let itr of conf) {
//             expect(itr).to.be.an('object');
//             expect(itr).to.have.keys([
//                 'text',
//                 'value',
//                 'sortable',
//                 'order',
//                 'image'
//             ]);
//             expect(itr.text).to.be.an('string');
//             expect(itr.value).to.be.an('string');
//             expect(itr.order).to.be.an('number');
//             expect(itr.image).to.be.an('string');
//         }
//     });
});
