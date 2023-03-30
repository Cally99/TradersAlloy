/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
/* eslint-disable no-console */
import ApiService from "@/Services/ApiService";
import ScreenerDropDown from '@/components/ScreenerDropDown';
import Screener from '@/views/screener/Screener';
import { createLocalVue, mount, shallowMount } from '@vue/test-utils';
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

describe.skip('StocksOverview', () => {
    let store;
    beforeAll(async() => {

    });

    afterAll(async() => {

    });

    beforeEach(() => {

        store = new Vuex.Store({
            state: {
                screenerFilters: [{
                        name: 'screener name1',
                        screen_id: 231
                    },
                    {
                        name: 'screener name2',
                        screen_id: 232
                    },
                    {
                        name: 'screener name3',
                        screen_id: 233
                    }
                ]
            },
            getters: {
                screenerFilters: (state) => {
                    return state.screenerFilters;
                }
            },
            mutations: {
                renameScreenerFilters: (state, payload) => {
                    state.screenerFilters[payload.index].name = payload.name;
                },
                removeScreenerFilters: (state, index) => {
                    state.screenerFilters.splice(index, 1)
                }
            }
        });
    });

    it('delete screener', async() => {
        const propsData = {
            screenername: 'screener name2'
        };

        const wrapper = shallowMount(ScreenerDropDown, {
            store,
            localVue,
            propsData
        });

        const stub = sinon.stub(ApiService, 'deleteScreen');
        stub.resolves();

        await wrapper.find('.delete-screener').trigger('click');

        expect(stub.calledOnce).to.be.true;

        const screenerFlts = store.getters['screenerFilters'];

        expect(screenerFlts).to.be.an('array');
        expect(screenerFlts).to.have.length(2);
        screenerFlts.forEach((itr) => {
            expect(itr).to.be.an('object');
            expect(itr).to.have.keys([
                'name',
                'screen_id'
            ]);
            expect(itr.name).to.be.an('string');
            expect(itr.screen_id).to.be.an('number');
        });
    });
    it('rename screener', async() => {
        const propsData = {
            screenername: 'screener name2'
        };

        const wrapper = shallowMount(ScreenerDropDown, {
            store,
            localVue,
            propsData
        });

        const stub = sinon.stub(ApiService, 'updateScreenFilters');
        stub.resolves({ success: true });

        wrapper.find('input.rename-screener').element.value = "updated name";
        await wrapper.find('input.rename-screener').trigger('input');
        await wrapper.find('input.rename-screener').trigger('keyup.enter');

        expect(stub.calledOnce).to.be.true;

        const screenerFlts = store.getters['screenerFilters'];

        expect(screenerFlts).to.be.an('array');
        screenerFlts.forEach((itr) => {
            expect(itr).to.be.an('object');
            expect(itr).to.have.keys([
                'name',
                'screen_id'
            ]);
            expect(itr.name).to.be.an('string');
            expect(itr.screen_id).to.be.an('number');
        });

        const updatedScreenerFlt = screenerFlts.find(item => item.name === 'updated name');

        expect(updatedScreenerFlt.name).to.be.equal('updated name');
    });
    /**
     * unable to mount sheetscreen because of ag-grid-vue component.
     * not sure about the error while mounting that component.
     * need to consider more detail about component structure.
     */
    // it('create screener', async() => {
    //     const propsData = {
    //         screenername: 'screener name2'
    //     };

    //     const parentWrapper = shallowMount(Screener, {
    //         store,
    //         localVue,
    //     });
    //     const childWrapper = shallowMount(ScreenerDropDown, {
    //         store,
    //         localVue
    //     });
    // });

    /**
     * unable to mount sheetscreen because of ag-grid-vue component.
     * not sure about the error while mounting that component.
     * need to consider more detail about component structure.
     */
    it('add selected rows to watchlist', async() => {
        const wrapper = shallowMount(Screener, {
            store,
            localVue
        });
    })
});