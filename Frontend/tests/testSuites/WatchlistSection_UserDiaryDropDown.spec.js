/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
/* eslint-disable no-console */
import apiService from "@/Services/ApiService";
import UserDiaryDropDown from '@/components/UserDiaryDropDown';
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

describe.skip('UserDiaryDropDown', () => {
    let store;
    let vuetify;
    let testUser;
    let userDiaryItems;

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
        userDiaryItems = JSON.parse(JSON.stringify(await apiService.selectDiaryItems(testUser.user_id))).data;

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
                getMapUserDiary: () => userDiaryItems
            },
            mutations: {
                addMapUserDiaryItem: jest.fn()
            }
        });

        vuetify = new Vuetify();
    });

    it('successfully add a diary note to user', async () => {
        const wrapper = shallowMount(UserDiaryDropDown, {
            store,
            localVue,
            vuetify
        });

        const stubCreateDiaryItem = sinon.stub(wrapper.vm, 'createDiaryItem');
        const stubLog = sinon.stub(console, 'log');

        stubCreateDiaryItem.returns(null);
        stubLog.returns(null);

        await wrapper.setProps({
            stock_id: 5664
        });

        await wrapper.setData({
            showDropDown: true
        });

        const newTagElement = wrapper.find('[name="newTag"]');

        // Set the elements values
        await newTagElement.setValue('Some test text here...');

        await newTagElement.trigger('keyup.enter');

        expect(stubCreateDiaryItem.called).to.be.equal(true);

        stubCreateDiaryItem.restore();

        await wrapper.vm.createDiaryItem();

        const userDiaryItemsTemp = JSON.parse(JSON.stringify(await apiService.selectDiaryItems(testUser.user_id)));

        for(const diaryItem of userDiaryItemsTemp.data) {
            await apiService.deleteDiaryItem(diaryItem.diary_item_id);
        }

        expect(userDiaryItemsTemp).to.be.an('object');
        expect(userDiaryItemsTemp).to.have.keys([
            'data',
            'status',
            'statusText',
            'headers',
            'config',
            'request'
        ]);
        expect(userDiaryItemsTemp.status).to.be.equal(200);
        expect(userDiaryItemsTemp.statusText).to.be.equal('OK');
        expect(userDiaryItemsTemp.data).to.be.an('array');
        for(const diaryItem of userDiaryItemsTemp.data) {
            expect(diaryItem).to.be.an('object');
            expect(diaryItem).to.have.keys([
                'diary_item_id',
                'user_id',
                'stock_id',
                'date_created',
                'note',
                'background',
                'color',
                'y'
            ]);
            expect(diaryItem.user_id).to.be.equal(testUser.user_id);
            expect(diaryItem.stock_id).to.be.equal(5664);
            expect(diaryItem.note).to.be.equal('Some test text here...');
        }

        stubLog.restore();
    });

    it('try to add no text to diary note', async () => {
        const wrapper = shallowMount(UserDiaryDropDown, {
            store,
            localVue,
            vuetify
        });

        const stubCreateDiaryItem = sinon.stub(wrapper.vm, 'createDiaryItem');
        const stubLog = sinon.stub(console, 'log');

        stubCreateDiaryItem.returns(null);
        stubLog.returns(null);

        await wrapper.setProps({
            stock_id: 5664
        });

        await wrapper.setData({
            showDropDown: true
        });

        const newTagElement = wrapper.find('[name="newTag"]');

        // Set the elements values
        await newTagElement.setValue('');

        await newTagElement.trigger('keyup.enter');

        expect(stubCreateDiaryItem.called).to.be.equal(true);

        stubCreateDiaryItem.restore();

        await wrapper.vm.createDiaryItem();

        const userDiaryItemsTemp = JSON.parse(JSON.stringify(await apiService.selectDiaryItems(testUser.user_id)));

        if(userDiaryItemsTemp.data.length > 0) {
            for(const diaryItem of userDiaryItemsTemp.data) {
                await apiService.deleteDiaryItem(diaryItem.diary_item_id);
            }
        }

        expect(userDiaryItemsTemp).to.be.an('object');
        expect(userDiaryItemsTemp).to.have.keys([
            'data',
            'status',
            'statusText',
            'headers',
            'config',
            'request'
        ]);
        expect(userDiaryItemsTemp.status).to.be.equal(200);
        expect(userDiaryItemsTemp.statusText).to.be.equal('OK');
        expect(userDiaryItemsTemp.data).to.be.an('array');
        expect(userDiaryItemsTemp.data).to.deep.equal([]);

        stubLog.restore();
    });
});
