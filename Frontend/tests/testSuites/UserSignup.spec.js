/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
/* eslint-disable no-console */
import apiService from "@/Services/ApiService";
import UserSignup from '@/views/landing/UserSignup';
import { createLocalVue, mount } from '@vue/test-utils';
import Vuex from 'vuex';
import Vue from 'vue';
import Vuetify from 'vuetify';
import sinon from 'sinon';
import chai from 'chai';
const expect = chai.expect;

import message from '@/stores/modules/Message';

Vue.config.silent = true;

Vue.use(Vuetify);

const localVue = createLocalVue();

localVue.use(Vuex);

describe.skip('UserSignup', () => {
    let store;
    let vuetify;
    let testUser;

    afterAll(async () => {
        const requestBody = {
            userID: testUser.user_id
        };

        const userWatchlists = JSON.parse(JSON.stringify(await apiService.fetchWatchlists(testUser.user_id))).data;

        for(const watchlist of userWatchlists) {
            await apiService.deleteWatchlist(watchlist.watchlist_id);
        }

        await apiService.deleteContent(requestBody);

        await apiService.deleteUser(testUser.user_id);
    });

    beforeEach(() => {
        store = new Vuex.Store({
            modules: {
                message
            }
        });

        vuetify = new Vuetify();
    });

    it('Signup without inserting any username and password', async () => {
        const wrapper = mount(UserSignup, {
            localVue,
            vuetify
        });

        // variables
        const emailElement = wrapper.find('#email');
        const passwordElement = wrapper.find('input[type="password"]');
        const signupButtonElement = wrapper.find('button[class="btn white--text btn-block"]');

        // CHeck signup_info object structure and content before signup
        expect(wrapper.vm.signup_info).to.be.an('object');
        expect(wrapper.vm.signup_info).to.have.keys([
            'show',
            'message',
            'timeout',
            'color'
        ]);
        expect(wrapper.vm.signup_info.show).to.be.equal(false);
        expect(wrapper.vm.signup_info.message).to.be.equal('');

        // Set the elements values
        await emailElement.setValue('');
        await passwordElement.setValue('');

        // Click the signup button here
        await signupButtonElement.trigger('click');

        // CHeck signup_info object structure and content after signup
        expect(wrapper.vm.signup_info).to.be.an('object');
        expect(wrapper.vm.signup_info).to.have.keys([
            'show',
            'message',
            'timeout',
            'color'
        ]);
        expect(wrapper.vm.signup_info.show).to.be.equal(true);
        expect(wrapper.vm.signup_info.message).to.be.equal('e-post och lösenord krävs');

        // Check elements values after signup
        expect(emailElement.element.value).to.be.equal('');
        expect(passwordElement.element.value).to.be.equal('');

        // Check variables after signup
        expect(wrapper.vm.email).to.be.equal('');
        expect(wrapper.vm.password).to.be.equal('');
    });

    it('Signup without inserting any username', async () => {
        const wrapper = mount(UserSignup, {
            localVue,
            vuetify
        });

        // variables
        const emailElement = wrapper.find('#email');
        const passwordElement = wrapper.find('input[type="password"]');
        const signupButtonElement = wrapper.find('button[class="btn white--text btn-block"]');

        // CHeck signup_info object structure and content before signup
        expect(wrapper.vm.signup_info).to.be.an('object');
        expect(wrapper.vm.signup_info).to.have.keys([
            'show',
            'message',
            'timeout',
            'color'
        ]);
        expect(wrapper.vm.signup_info.show).to.be.equal(false);
        expect(wrapper.vm.signup_info.message).to.be.equal('');

        // Set the elements values
        await emailElement.setValue('');
        await passwordElement.setValue('test');

        // Click the signup button here
        await signupButtonElement.trigger('click');

        // CHeck signup_info object structure and content after signup
        expect(wrapper.vm.signup_info).to.be.an('object');
        expect(wrapper.vm.signup_info).to.have.keys([
            'show',
            'message',
            'timeout',
            'color'
        ]);
        expect(wrapper.vm.signup_info.show).to.be.equal(true);
        expect(wrapper.vm.signup_info.message).to.be.equal('e-post och lösenord krävs');

        // Check elements values after signup
        expect(emailElement.element.value).to.be.equal('');
        expect(passwordElement.element.value).to.be.equal('test');

        // Check variables after signup
        expect(wrapper.vm.email).to.be.equal('');
        expect(wrapper.vm.password).to.be.equal('test');
    });

    it('Signup without inserting any password', async () => {
        const wrapper = mount(UserSignup, {
            localVue,
            vuetify
        });

        // variables
        const emailElement = wrapper.find('#email');
        const passwordElement = wrapper.find('input[type="password"]');
        const signupButtonElement = wrapper.find('button[class="btn white--text btn-block"]');

        // CHeck signup_info object structure and content before signup
        expect(wrapper.vm.signup_info).to.be.an('object');
        expect(wrapper.vm.signup_info).to.have.keys([
            'show',
            'message',
            'timeout',
            'color'
        ]);
        expect(wrapper.vm.signup_info.show).to.be.equal(false);
        expect(wrapper.vm.signup_info.message).to.be.equal('');

        // Set the elements values
        await emailElement.setValue('test@test.se');
        await passwordElement.setValue('');

        // Click the signup button here
        await signupButtonElement.trigger('click');

        // CHeck signup_info object structure and content after signup
        expect(wrapper.vm.signup_info).to.be.an('object');
        expect(wrapper.vm.signup_info).to.have.keys([
            'show',
            'message',
            'timeout',
            'color'
        ]);
        expect(wrapper.vm.signup_info.show).to.be.equal(true);
        expect(wrapper.vm.signup_info.message).to.be.equal('e-post och lösenord krävs');

        // Check elements values after signup
        expect(emailElement.element.value).to.be.equal('test@test.se');
        expect(passwordElement.element.value).to.be.equal('');

        // Check variables after signup
        expect(wrapper.vm.email).to.be.equal('test@test.se');
        expect(wrapper.vm.password).to.be.equal('');
    });

    it('Signup inserting less than 8 character for the password', async () => {
        const wrapper = mount(UserSignup, {
            localVue,
            vuetify
        });

        // variables
        const emailElement = wrapper.find('#email');
        const passwordElement = wrapper.find('input[type="password"]');
        const signupButtonElement = wrapper.find('button[class="btn white--text btn-block"]');

        // CHeck signup_info object structure and content before signup
        expect(wrapper.vm.signup_info).to.be.an('object');
        expect(wrapper.vm.signup_info).to.have.keys([
            'show',
            'message',
            'timeout',
            'color'
        ]);
        expect(wrapper.vm.signup_info.show).to.be.equal(false);
        expect(wrapper.vm.signup_info.message).to.be.equal('');

        // Set the elements values
        await emailElement.setValue('test@test.se');
        await passwordElement.setValue('test');

        // Click the signup button here
        await signupButtonElement.trigger('click');

        // CHeck signup_info object structure and content after signup
        expect(wrapper.vm.signup_info).to.be.an('object');
        expect(wrapper.vm.signup_info).to.have.keys([
            'show',
            'message',
            'timeout',
            'color'
        ]);
        expect(wrapper.vm.signup_info.show).to.be.equal(true);
        expect(wrapper.vm.signup_info.message).to.be.equal('Minst 8 tecken');

        // Check elements values after signup
        expect(emailElement.element.value).to.be.equal('test@test.se');
        expect(passwordElement.element.value).to.be.equal('test');

        // Check variables after signup
        expect(wrapper.vm.email).to.be.equal('test@test.se');
        expect(wrapper.vm.password).to.be.equal('test');
    });

    it('Signup with right username and password and check user settings', async () => {
        const wrapper = mount(UserSignup, {
            localVue,
            vuetify
        });

        const spyAddUser = sinon.spy(apiService, 'addUser');
        const stubChangePageToRapportkollen = sinon.stub(wrapper.vm, 'changePageToRapportkollen');
        const stubSuccessMessage = sinon.stub(wrapper.vm, 'successMessage');

        stubChangePageToRapportkollen.returns(null);
        stubSuccessMessage.returns(null);

        // variables
        const emailElement = wrapper.find('#email');
        const passwordElement = wrapper.find('input[type="password"]');
        const signupButtonElement = wrapper.find('button[class="btn white--text btn-block"]');

        // CHeck signup_info object structure and content before signup
        expect(wrapper.vm.signup_info).to.be.an('object');
        expect(wrapper.vm.signup_info).to.have.keys([
            'show',
            'message',
            'timeout',
            'color'
        ]);
        expect(wrapper.vm.signup_info.show).to.be.equal(false);
        expect(wrapper.vm.signup_info.message).to.be.equal('');

        // Set the elements values
        await emailElement.setValue('test123@test123.se');
        await passwordElement.setValue('test1234');

        // Click the signup button here
        await signupButtonElement.trigger('click');

        for(const userSignupItem of spyAddUser.returnValues) {
            const response = JSON.parse(JSON.stringify(await userSignupItem));
            testUser = response.data;
            const userSettings = JSON.parse(testUser.settings);

            expect(response.status).to.be.equal(200);
            expect(response.statusText).to.be.equal('OK');
            expect(response.data).to.be.an('object');
            expect(response.data).to.have.keys([
                'user_id',
                'email',
                'password',
                'type',
                'settings',
                'account',
                'screen',
                'created_date',
                'last_login_date',
                'membership_year',
                'membership_date',
                'subscription_id',
                'tabs'
            ]);
            expect(userSettings).to.be.an('object');
            expect(userSettings.tabs).to.be.an('array');
            for(const tab of userSettings.tabs) {
                if(tab.name === "Watchlist") {
                    expect(tab).to.have.keys([
                        'i',
                        'name',
                        'path',
                        'icon',
                        'isFocus'
                    ]);
                } else {
                    expect(tab).to.have.keys([
                        'i',
                        'name',
                        'path',
                        'icon',
                        'isFocus',
                        'insref',
                        'isin'
                    ]);
                }
            }
            expect(userSettings.tabs).to.have.deep.members(
                [
                    {
                        i: 0,
                        name: 'Watchlist',
                        path: '/watchlist',
                        icon: 'mdi-eye',
                        isFocus: true
                    },
                    {
                        i: 1,
                        name: 'FNOX',
                        path: '/stocks',
                        icon: 'mdi-cube',
                        isFocus: false,
                        insref: 42953,
                        isin: 'SE0001966656'
                    },
                    {
                        i: 2,
                        name: 'ERIC B',
                        path: '/stocks',
                        icon: 'mdi-cube',
                        isFocus: false,
                        insref: 772,
                        isin: 'SE0000108656'
                    },
                    {
                        i: 3,
                        name: 'SWMA',
                        path: '/stocks',
                        icon: 'mdi-cube',
                        isFocus: false,
                        insref: 5664,
                        isin: 'SE0000310336'
                    }
                ]
            );
        }

        spyAddUser.restore();
        stubChangePageToRapportkollen.restore();
        stubSuccessMessage.restore();
    });
});
