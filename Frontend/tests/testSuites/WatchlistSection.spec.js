/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
/* eslint-disable no-console */
import apiService from "@/Services/ApiService";
import apiStocks from "@/Services/ApiStocks";
import apiUserFun from "@/Services/ApiUserFun";
import WatchlistSection from '@/components/WatchlistSection';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import Vue from 'vue';
import Vuetify from 'vuetify';
import sinon from 'sinon';
import chai from 'chai';
const expect = chai.expect;

Vue.config.silent = true;

Vue.use(Vuetify);

const localVue = createLocalVue();

localVue.use(Vuex);

describe.skip('WatchlistSection', () => {
    let store;
    let vuetify;
    let testUser;
    let allStocks;
    let userWatchlists;
    let userWatchlistItems;
    let companies;
    let stockExchangeSectors;
    let research;

    beforeAll(async () => {
        const email = 'test123@test123.com';
        const password = 'test123';
        const settings = '{"language":"sv","settings":[]}';

        testUser = JSON.parse(JSON.stringify(await apiService.addUser({
            email: email,
            password: password,
            settings: settings
        }))).data;
    });

    afterAll(async () => {
        const requestBody = {
            userID: testUser.user_id
        };

        const userWatchlistsTemp = JSON.parse(JSON.stringify(await apiService.fetchWatchlists(testUser.user_id))).data;

        for(const watchlist of userWatchlistsTemp) {
            await apiService.deleteWatchlist(watchlist.watchlist_id);
        }

        await apiService.deleteContent(requestBody);

        await apiService.deleteUser(testUser.user_id);
    });

    beforeEach(async () => {
        allStocks = JSON.parse(JSON.stringify(await apiStocks.fetchStocks())).data;
        userWatchlists = JSON.parse(JSON.stringify(await apiService.fetchWatchlists(testUser.user_id))).data;
        userWatchlistItems = JSON.parse(JSON.stringify(await apiUserFun.fetchUserWatchlistItems(testUser.user_id))).data;
        companies = JSON.parse(JSON.stringify(await apiService.fetchCompanies())).data;
        stockExchangeSectors = JSON.parse(JSON.stringify(await apiService.fetchSectors())).data;
        research = JSON.parse(JSON.stringify(await apiService.fetchResearchData(testUser.user_id))).data;

        for(const item of userWatchlistItems) {
            const company = companies.find((c) => c.company_id === item.company_id);
            const sector = stockExchangeSectors.find((s) => s.stock_id === item.stock_id);
            const innerResearch = research.find((r) => r.stock_id === item.stock_id);

            let staleResearchDate = new Date();
            let researchState = '';

            staleResearchDate.setMonth(staleResearchDate.getMonth() - 3);

            if(innerResearch !== undefined) {
                let d = new Date(innerResearch.last_update_date);
                if(d > staleResearchDate) {
                    researchState = "EXISTS";
                } else {
                    researchState = "EXISTS_BUT_STALE";
                }
            } else {
                researchState = "MISSING";
            }

            item['Earnings Date'] = company.last_report_date;
            item['eps'] = company.last_eps_ttm;
            item['research_state'] = researchState;
            item['sales'] = company.last_sales;
            item['sector_name'] = sector !== undefined ? sector.sector_name : 'no sector name';
        }

        const localStorageMock = (() => {
            const storeLocal = {
                user: JSON.stringify({
                    user_id: testUser.user_id
                })
            };
            return {
                getItem: (key) => {
                    return storeLocal[key];
                }
            };
        })();

        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
        });

        store = new Vuex.Store({
            getters: {
                getAllStocks: () => allStocks,
                getWatchlists: () => userWatchlists,
                getWatchlistItems: () => userWatchlistItems
            }
        });

        vuetify = new Vuetify();
    });

    it('watchlists array structure check', async () => {
        const stubInit = sinon.stub(WatchlistSection.methods, 'init');

        stubInit.returns(null);

        const wrapper = shallowMount(WatchlistSection, {
            store,
            mocks: {
                $intercom: {
                    hide: jest.fn()
                }
            },
            localVue,
            vuetify,
            propsData: {
                watchlistID: {
                    type: Number,
                    default: -1
                }
            },
            computed: {
                watchlistText: () => 'all watchlists'
            }
        });

        const watchlists = await wrapper.vm.watchlists;

        expect(watchlists).to.be.an('array');
        for(const watchlist of watchlists) {
            expect(watchlist).to.be.an('object');
            expect(watchlist).to.have.keys([
                'Ticker',
                'Name',
                'Sector',
                'EarningsDate',
                'Eps',
                'Sales',
                'Watched Since',
                '∆%',
                'Conviction',
                'company_id',
                'stock_id',
                'Research',
                'tags',
                'research_state'
            ]);
            expect(watchlist.Research).to.be.an('object');
            expect(watchlist.Research).to.have.keys([
                'watchlist_item_id',
                'user_id',
                'stock_id',
                'watchlist_id',
                'ticker',
                'company_id',
                'name',
                'conviction',
                'watched_since',
                'watched_since_price',
                'tags',
                'Earnings Date',
                'eps',
                'research_state',
                'sales',
                'sector_name'
            ]);
        }

        stubInit.restore();
    });
});
