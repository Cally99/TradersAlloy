/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
/* eslint-disable no-console */
import apiService from "@/Services/ApiService";
import TestMutations from '../views/TestMutations';
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

describe.skip('Vuex Mutations', () => {
    let vuetify;
    let wrapper;
    beforeAll(async () => {
    });

    afterAll(async () => {
    });

    beforeEach(() => {
        vuetify = new Vuetify();
        // TestMutations: simple vue component to test mutations
        wrapper = shallowMount(TestMutations, {
            store
        });
    });

    it('commit set, add, remove userTradePlans mutation', async () => {
        // commit "setUserTradePlans" and confirm updated data
        wrapper.find('button.set-utp').trigger('click');

        expect(wrapper.vm.userTradePlans).to.be.an('array');
        expect(JSON.stringify(wrapper.vm.userTradePlans)).to.be.equal(JSON.stringify([{trade_plan_id: 1},{trade_plan_id: 2},{trade_plan_id: 3}]));

        // commit "addUserTradePlans" and confirm updated data
        wrapper.find('button.add-utp').trigger('click');

        expect(wrapper.vm.userTradePlans).to.be.an('array');
        expect(JSON.stringify(wrapper.vm.userTradePlans)).to.be.equal(JSON.stringify([{trade_plan_id: 1},{trade_plan_id: 2},{trade_plan_id: 3}, {trade_plan_id: 4}]));

        // commit "removeUserTradePlans" and confirm updated data
        wrapper.find('button.rm-utp').trigger('click');

        expect(wrapper.vm.userTradePlans).to.be.an('array');
        expect(JSON.stringify(wrapper.vm.userTradePlans)).to.be.equal(JSON.stringify([{trade_plan_id: 1},{trade_plan_id: 3}, {trade_plan_id: 4}]));
    });

    it('commit set, add, update, rename, remove ScreenerFilters mutation', async () => {
        // commit "setScreenerFilters" and confirm updated data
        wrapper.find('button.set-scf').trigger('click');

        expect(wrapper.vm.screenerFilters).to.be.an('array');
        expect(JSON.stringify(wrapper.vm.screenerFilters)).to.be.equal(JSON.stringify([{name: "john", screen_id: 12, filter: "flt1"}, {name: "bob", screen_id: 14, filter: "flt2"}]));

        // commit "addScreenerFilters" and confirm updated data
        wrapper.find('button.add-scf').trigger('click')

        expect(wrapper.vm.screenerFilters).to.be.an('array');
        expect(JSON.stringify(wrapper.vm.screenerFilters)).to.be.equal(JSON.stringify([{name: "john", screen_id: 12, filter: "flt1"}, {name: "bob", screen_id: 14, filter: "flt2"}, {name: "Aley", screen_id: 16, filter: "flt3"}]));

        // commit "updateScreenerFilters" and confirm updated data
        wrapper.find('button.udt-scf').trigger('click')

        expect(wrapper.vm.screenerFilters).to.be.an('array');
        expect(JSON.stringify(wrapper.vm.screenerFilters)).to.be.equal(JSON.stringify([{name: "john", screen_id: 12, filter: "flt1"}, {name: "bob", screen_id: 14, filter: "flt2"}, {name: "Aley", screen_id: 16, filter: "flt4"}]));

        // commit "renameScreenerFilters" and confirm updated data
        wrapper.find('button.rnm-scf').trigger('click')

        expect(wrapper.vm.screenerFilters).to.be.an('array');
        expect(JSON.stringify(wrapper.vm.screenerFilters)).to.be.equal(JSON.stringify([{name: "john", screen_id: 12, filter: "flt1"}, {name: "max", screen_id: 14, filter: "flt2"}, {name: "Aley", screen_id: 16, filter: "flt4"}]));
        
        // commit "removeScreenerFilters" and confirm updated data
        wrapper.find('button.rm-scf').trigger('click')

        expect(wrapper.vm.screenerFilters).to.be.an('array');
        expect(JSON.stringify(wrapper.vm.screenerFilters)).to.be.equal(JSON.stringify([{name: "john", screen_id: 12, filter: "flt1"}, {name: "max", screen_id: 14, filter: "flt2"}]));
    });

    it('commit set, add, remove, clear CompareDatas mutation', async () => {
        // commit "setCompareDatas" and confirm updated data
        wrapper.find('button.set-compd').trigger('click')

        expect(wrapper.vm.compareDatas).to.be.an('array');
        expect(JSON.stringify(wrapper.vm.compareDatas)).to.be.equal(JSON.stringify([{isin: "number1"}, {isin: "number2"}]));

        // commit "addCompareDatas" and confirm updated data
        wrapper.find('button.add-compd').trigger('click')

        expect(wrapper.vm.compareDatas).to.be.an('array');
        expect(JSON.stringify(wrapper.vm.compareDatas)).to.be.equal(JSON.stringify([{isin: "number1"}, {isin: "number2"}, {isin: "number3"}]));

        // commit "removeCompareDatas" and confirm updated data
        wrapper.find('button.rm-compd').trigger('click')

        // ********************************************** BUG?? When click button delete all. 
        expect(wrapper.vm.compareDatas).to.be.an('array');
        expect(JSON.stringify(wrapper.vm.compareDatas)).to.be.equal(JSON.stringify([{isin: "number1"}, {isin: "number3"}]));

        // commit "clearCompareDatas" and confirm updated data
        wrapper.find('button.cls-compd').trigger('click')

        expect(wrapper.vm.compareDatas).to.be.an('array');
        expect(wrapper.vm.compareDatas).to.have.length(0);
    });

    it('commit set, add, remove TradeHistory mutation', async () => {
        // commit "setTradeHistory" and confirm updated data
        wrapper.find('button.set-th').trigger('click');

        expect(wrapper.vm.tradeHistory).to.be.an('array');
        expect(JSON.stringify(wrapper.vm.tradeHistory)).to.be.equal(JSON.stringify([{trade_id: "t1"}, {trade_id: "t2"}, {trade_id: "t3"}]));

        // commit "addTradeHistory" and confirm updated data
        wrapper.find('button.add-th').trigger('click');

        // ********************************************** BUG?? When click button nothing is added
        expect(wrapper.vm.tradeHistory).to.be.an('array');
        expect(JSON.stringify(wrapper.vm.tradeHistory)).to.be.equal(JSON.stringify([{trade_id: "t1"}, {trade_id: "t2"}, {trade_id: "t3"}, {trade_id: "t4"}]));

        // commit "removeTradeHistory" and confirm updated data
        wrapper.find('button.rm-th').trigger('click')

        expect(wrapper.vm.tradeHistory).to.be.an('array');
        expect(JSON.stringify(wrapper.vm.tradeHistory)).to.be.equal(JSON.stringify([{trade_id: "t1"}, {trade_id: "t3"}, {trade_id: "t4"}]));
    });    
});
