/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
/* eslint-disable no-console */
import apiService from "@/Services/ApiService";
import TagDropDown from '@/components/TagDropDown';
import { createLocalVue, mount } from '@vue/test-utils';
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

describe.skip('TagDropDown', () => {
    let store;
    let vuetify;
    let testUser;

    beforeAll(async () => {
        const email = 'test123@test123.com';
        const password = 'test1234';
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
            mutations: {
                updateWatchlistItemTags: jest.fn()
            }
        });

        vuetify = new Vuetify();
    });

    it('successfully add a tag to user', async () => {
        const wrapper = mount(TagDropDown, {
            store,
            localVue,
            vuetify,
            propsData: {
                stock_id: 5664,
                tagsString: null
            }
        });

        const stubAssignTag = sinon.stub(wrapper.vm, 'assignTag');
        const stubLog = sinon.stub(console, 'log');

        stubAssignTag.returns(null);
        stubLog.returns(null);

        const openTagPopupElement = wrapper.find('#openTagPopup');

        expect(wrapper.vm.showDropDown).to.be.equal(false);

        await openTagPopupElement.trigger('click');

        expect(wrapper.vm.showDropDown).to.be.equal(true);

        const tabElement = wrapper.find('#tab0');

        await tabElement.trigger('click.prevent');

        expect(stubAssignTag.called).to.be.equal(true);

        stubAssignTag.restore();

        const tagForTest = JSON.parse(JSON.stringify(wrapper.vm.tagForTest));

        await wrapper.vm.assignTag(tagForTest);

        stubLog.restore();

        const userTagsObject = {
            user_id: testUser.user_id,
            stock_id: wrapper.vm.stock_id
        };

        const userTagsAfterUpdate = JSON.parse(JSON.stringify(await apiService.fetchTags(userTagsObject)));

        expect(userTagsAfterUpdate).to.be.an('object');
        expect(userTagsAfterUpdate).to.have.keys([
            'data',
            'status',
            'statusText',
            'headers',
            'config',
            'request'
        ]);
        expect(userTagsAfterUpdate.status).to.be.equal(200);
        expect(userTagsAfterUpdate.statusText).to.be.equal('OK');
        expect(userTagsAfterUpdate.data).to.be.an('object');
        expect(userTagsAfterUpdate.data).to.have.keys([
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
            'tags'
        ]);
        expect(userTagsAfterUpdate.data.tags).to.be.equal('[{"text":"Bullish","color":"blue"}]');
    });
});
