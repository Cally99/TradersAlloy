/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
/* eslint-disable no-console */
import apiService from "@/Services/ApiService";
import {store} from '@/stores/index.js';
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

describe('Vuex Actions', () => {
    let vuetify;
    let wrapper;
    beforeAll(async () => {
    });

    afterAll(async () => {
    });

    beforeEach(() => {
        vuetify = new Vuetify();
    });

    it('dispatch "loadUserDiary"', async () => {
        // dispatch action "loadUserDiary"
        await store.dispatch("loadUserDiary", 146);

        // get mapUserDiary via getter "getMapUserDiary" and confirm it.
        const mapUserDiary = store.getters['getMapUserDiary'];
        const firstMapUserDiary = mapUserDiary[0];

        expect(firstMapUserDiary).to.be.an('object');
        expect(firstMapUserDiary).to.have.keys([
            'diary_item_id',
            'user_id',
            'stock_id',
            'date_created',
            'note',
            'background',
            'color',
            'y'
        ]);
    });
    /**
     * Expected: ["i", "icon", "insref", "isFocus", "isin", "name", "path"]
     * Received: ["i", "icon", "isFocus", "name", "path"]
     * sometimes some fields are missed on response data.
     * need to consider backend api
     */
    it('dispatch "loadUserTabs"', async () => {
        await store.dispatch("loadUserTabs", 146);
        
        const navigationTabs = await store.getters['getNavigationTabs'];
        expect(navigationTabs).to.be.an('array');
        for (let itr of navigationTabs) {
            expect(itr).to.be.an('object');
            expect(itr).to.have.keys([
                'i',
                'name',
                'path',
                'icon',
                'insref',
                'isin',
                'isFocus'
            ]);
        }
    });

    it('dispatch "addWatchlistAction"', async () => {
        // mock action "addWatchlistAction"
        let actions = {
            addWatchlistAction: sinon.stub()
        }

        const store = new Vuex.Store({
            actions
        });

        store.dispatch('addWatchlistAction', {});
        expect(actions.addWatchlistAction.calledOnce).to.equal(true);
    });

    it('dispatch "addWatchlistItemAction"', async () => {
        // mock action "addWatchlistItemAction"
        let actions = {
            addWatchlistItemAction: sinon.stub()
        }

        const store = new Vuex.Store({
            actions
        });

        store.dispatch('addWatchlistItemAction', {});
        expect(actions.addWatchlistItemAction.calledOnce).to.equal(true);
    });

    it('dispatch "setMessageAction"', async () => {
        // mock action "setMessageAction"
        let actions = {
            setMessageAction: sinon.stub()
        }
        const store = new Vuex.Store({
            actions
        });
        store.dispatch('setMessageAction', {});
        expect(actions.setMessageAction.calledOnce).to.equal(true);
    });

    // TODO: add a test for the FIFO Recents, an array of stock_ids


    it('dispatch "setPushToStocksAction"', async () => {
        // dispatch action "setPushToStocksAction"
        await store.dispatch('setPushToStocksAction', {stock_id: '1294'});

        // get stocks via getter "getStocks" and confirm it.
        const stocks = store.getters['getStocks'];
        expect(stocks).to.be.an('array');
        const firstStocks = stocks[0];

        expect(firstStocks).to.be.an('object');
        expect(firstStocks).to.have.keys([
            'company_id',
            'currency_trade',
            'isin',
            'name',
            'sector_id',
            'price_today',
            "price_updated",
            'primary_listing',
            'stock_id',
            "StockExchange",
            "status_flag",
            'stock_exchange_id',
            'ticker'
        ]);
        expect(firstStocks.stock_id).to.be.an('number');
        expect(firstStocks.company_id).to.be.an('number');
        expect(firstStocks.stock_exchange_id).to.be.an('string');
        expect(firstStocks.ticker).to.be.an('string');
        expect(firstStocks.name).to.be.an('string');
        expect(firstStocks.sector_id).to.be.an('number');
        expect(firstStocks.currency_trade).to.be.an('string');
        expect(firstStocks.price_today).to.be.an('number');
    });
});
