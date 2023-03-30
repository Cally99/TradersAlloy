/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
/* eslint-disable no-console */
import apiService from "@/Services/ApiService";
import ChartPrice from "@/components/ChartPrice.vue";
import { createLocalVue, mount, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import Vue from 'vue';
import Vuetify from 'vuetify';
import sinon from 'sinon';
import chai from 'chai';
import 'jsdom-worker';
import 'jest-canvas-mock';

const expect = chai.expect;

Vue.config.silent = true;

Vue.use(Vuetify);

const localVue = createLocalVue();

localVue.use(Vuex);

describe.skip('ChartPrice', () => {
    let store;
    let getters;
    let vuetify;

    beforeAll(async () => {

    });

    afterAll(async () => {

    });

    beforeEach(() => {
        // mock getters data to render vue component using getters.
        getters = {
            getAllStocks: () => [],
            getMapStocks: () => {
                let mstock = new Map();
                mstock.set(469606, {
                    sector_name: "no sector defined",
                    insref: '469606',
                    isin: 'NO0010196140',
                    ticker: 'PAY',
                    descripton: ''
                });
                return mstock;
            },
            getNavigationTabs: () => [],
            getMapCompanies: () => {
                let mcompany = new Map();
                mcompany.set('NO0010196140', {
                    ceo_comments: '',
                    last_report_date: '2020-08-20',
                    last_sales: 0,
                    market_cap: '733'
                })
                return mcompany;
            },
            getCRP: () => {
                let crps = new Map();
                crps.set('NO0010196140', {audio:[], company:[], isin: [], language: [], period: [],  uuid: []});
                return crps;
            },
            getInsiders: () => {},
            userTradePlans: () => [],
            tradeHistory: () => [],
            getUserSubscribed: () => false,
            getFinancials: () => [],
            getStock: () => {},
        }
        store = new Vuex.Store({
            modules: {
            },
            getters
        });
        // vuetify options
        const opts = {
            theme: {
                dark: false,
                themes: {
                light: {
                    primary: '#3f51b5',
                    secondary: '#ecefff',
                    accent: '#8c9eff',
                    success: '#46a842',
                    info: '#316bd2',
                    warning: '#ffc158',
                    error: '#b71c1c',
                    appTabs: '#b9c1c7',
                    tradersAlloyBlue: '#316bd2',
                    surface: '#ECEFF1',
                    stockTab: '#acc0c7',
                },
                dark: {
                    primary: '#3f51b5',
                    secondary: '#929ea4',
                    accent: '#8c9eff',
                    success: '#46a842',
                    info: '#316bd2',
                    warning: '#ffc158',
                    error: '#b71c1c',
                    appTabs: '#414447',
                    surface: '#374147',
                    stockTab: '#f9f932',
                }
                },
            },
            options: {
                customProperties: true
            },
            icons: {
                iconfont: "mdi"
            }
        };
        vuetify = new Vuetify(opts);
    });

    it('Validate ChartPrice Data', async () => {
        let propsData = {
            isin: 'NO0010196140',
            insref: 469606
        }
        const spyGetUserLines = sinon.spy(apiService, 'fetchUserLinesData');
        const spySetUserLines = sinon.spy(apiService, 'save_UserLines');
        const wrapper = shallowMount(ChartPrice, {
            store,
            localVue,
            vuetify,
            propsData
        });

        expect(wrapper.vm.company).to.be.an('object')
        expect(wrapper.vm.company).to.have.keys([
            'sector_name',
            'insref',
            'isin',
            'ticker',
            'descripton'
        ]);

        expect(wrapper.vm.lineData).to.be.an('array');

        spyGetUserLines.restore();
        spySetUserLines.restore();
    });
});
