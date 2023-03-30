/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
/* eslint-disable no-console */
import apiService from "@/Services/ApiService";
import TestGetters from '../views/TestGetters';
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

describe('Vuex Getters', () => {
    let vuetify;
    let wrapper;
    beforeAll(async () => {
    });

    afterAll(async () => {
    });

    beforeEach(() => {
        vuetify = new Vuetify();
        // TestGetters: simple vue component to test getters
        wrapper = shallowMount(TestGetters, {
            store
        });
    });
    it('validate values from mapGetters', async () => {

        expect(wrapper.vm.stocks).to.be.an('array');
        expect(wrapper.vm.mapUserDiary).to.be.an('array');
        expect(wrapper.vm.userSettings).to.be.an('array');

        // // ******************************** navigationTabs undefined
        // expect(wrapper.vm.navigationTabs).to.be.an('array');

        expect(wrapper.vm.chartInsider).to.be.an('object');
        expect(wrapper.vm.chartInsider.name).to.be.an('string');
        expect(wrapper.vm.chartInsider.type).to.be.an('string');
        expect(wrapper.vm.chartInsider.data).to.be.an('array');
        expect(wrapper.vm.chartInsider.settings).to.be.an('object');

        expect(wrapper.vm.compareDatas).to.be.an('array');
        expect(wrapper.vm.tradeHistory).to.be.an('array');
        expect(wrapper.vm.userTradePlans).to.be.an('array');
        expect(wrapper.vm.screenerFilters).to.be.an('array');
    });
});
