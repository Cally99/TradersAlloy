/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
/* eslint-disable no-console */
import apiService from "@/Services/ApiService";
import StocksOverview from '@/views/stock/StocksOverview';
import ChartPrice from "@/components/ChartPrice.vue";
import CanvasEPS from "@/views/stock/CanvasEPS.vue";
import CanvasPE from "@/views/stock/CanvasPE.vue";
import CanvasRevenue from "@/views/stock/CanvasRevenue.vue";
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

describe.skip('StocksOverview', () => {
    let store;
    let getters;
    let vuetify;
    let actions;
    let mutations;
    beforeAll(async () => {

    });

    afterAll(async () => {

    });

    beforeEach(() => {
        // mock getters data to render vue component using getters.
        getters = {
            getAllStocks: () => [
                {
                    stock_id: 45655,
                    company_id: 40119,
                    sector_name: "no sector defined",
                    sector_id: 0,
                    isin: 'NO0010196140',
                    ticker: 'NAS',
                    descripton: ''
                }
            ],
            getMapStocks: () => {
                let mstock = new Map();
                mstock.set(45655, {
                    stock_id: 45655,
                    company_id: 40119,
                    sector_name: "no sector defined",
                    sector_id: 0,
                    isin: 'NO0010196140',
                    ticker: 'NAS',
                    descripton: ''
                });
                return mstock;
            },
            getNavigationTabs: () => [],
            getMapCompanies: () => {
                let mcompany = new Map();
                mcompany.set(40119, {
                    company_id: 40119,
                    name: 'Norwegian Air Shuttle',
                    ceo_comments: '',
                    last_report_date: '2020-08-20',
                    last_sales: 0,
                    market_cap: '733'
                })
                return mcompany;
            },
//            language: ["en"],
//            uuid: ["b697806f-5747-44bd-8c3e-e8244fbb426e"]
            getInsiders: () => {},
            userTradePlans: () => [],
            tradeHistory: () => [],
            getUserSubscribed: () => false,
            getFinancials: () => [],
            getStock: () => {},
        }
        // mock actions to test action dispatch
        actions = {
            setAddNavigationTabsAction: sinon.stub()
        }
        store = new Vuex.Store({
            modules: {
            },
            getters,
            actions
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

    it('data values and method execution', async () => {
        let propsData = {
            stock_id: 45655,
            company_id: 40119,
        }
        /**
         * mount vs shallowMount
         * shallowMount excludes child components when rendering target component while mount
         * include and render all of it's child components either.
         */
        const wrapper = shallowMount(StocksOverview, {
            store,
            localVue,
            vuetify,
            propsData
        });
        expect(wrapper.vm.yearReports).to.be.an('array');
        expect(wrapper.vm.extract_date).to.be.an('string');
        expect(wrapper.vm.last_pdfURL).to.be.an('string');
        expect(wrapper.vm.stocksInSector).to.be.an('array');

        expect(wrapper.vm.earningsDateWarning('2020-10-20')).to.be.an('string')
        expect(wrapper.vm.earningsDateWarning('2020-10-20')).to.be.equal('silver')

        expect(wrapper.vm.earningsDateColor('2020-10-20')).to.be.an('string')
        expect(wrapper.vm.earningsDateColor('2020-10-20')).to.be.equal('grey')

        expect(wrapper.vm.truncateLongText('Lorem Isput', 5)).to.be.an('string')
        expect(wrapper.vm.truncateLongText('Lorem Isput', 5)).to.be.equal('Lorem...')

    });
    it('dispatches "setAddNavigationTabsAction" when click each pdf link', () => {
        let propsData = {
            stock_id: 45655,
            company_id: 40119,
        }
        const wrapper = shallowMount(StocksOverview, {
            store,
            localVue,
            vuetify,
            propsData
        });
        wrapper.find('.stock-pdf').trigger('click');
        expect(actions.setAddNavigationTabsAction.calledOnce).to.equal(true);
    })
    it('validate chart-price data', async () => {
        let propsData = {
            stock_id: 45655,
            company_id: 40119,
        }
        const wrapper = shallowMount(ChartPrice, {
            store,
            localVue,
            vuetify,
            propsData
        });
    });

    it('validate canvas-eps data', async () => {
        let propsData = {
            company_id: 40119,
        }
        const wrapper = shallowMount(CanvasEPS, {
            store,
            localVue,
            vuetify,
            propsData
        });
    });
    it('validate canvas-pe data', async () => {
        let propsData = {
            company_id: 40119,
        }
        const wrapper = shallowMount(CanvasPE, {
            store,
            localVue,
            vuetify,
            propsData
        });
    });
    it('validate canvas-revenue data', async () => {
        let propsData = {
            company_id: 40119,
        }
        const wrapper = shallowMount(CanvasRevenue, {
            store,
            localVue,
            vuetify,
            propsData
        });
    });
});
