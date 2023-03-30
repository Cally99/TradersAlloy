/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
/* eslint-disable no-console */
import apiService from "@/Services/ApiService";
import UserLogin from '@/views/landing/UserLogin';
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

describe.skip('UserLogin', () => {
    let store;
    let vuetify;
    let testUser;

    beforeAll(async () => {
        const email = 'test123@test123.com';
        const password = 'test123';
        const settings = '{\"language\":\"sv\",\"settings\":[]}';

        testUser = await JSON.parse(JSON.stringify(await apiService.addUser({
            email: email,
            password: password,
            settings: settings
        }))).data;
    });

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

    it('Login without inserting any username and password', async () => {
        const wrapper = mount(UserLogin, {
            localVue,
            vuetify
        });

        // variables
        const emailElement = wrapper.find('#email');
        const passwordElement = wrapper.find('#userpassword');
        const loginButtonElement = wrapper.find('button[class="btn white--text btn-block"]');

        // CHeck login_info object structure and content before login
        expect(wrapper.vm.login_info).to.be.an('object');
        expect(wrapper.vm.login_info).to.have.keys([
            'show',
            'message',
            'timeout',
            'color'
        ]);
        expect(wrapper.vm.login_info.show).to.be.equal(false);
        expect(wrapper.vm.login_info.message).to.be.equal('');

        // Check elements values before login
        expect(emailElement.element.value).to.be.equal('');
        expect(passwordElement.element.value).to.be.equal('');

        // Check variables before login
        expect(wrapper.vm.email).to.be.equal('');
        expect(wrapper.vm.password).to.be.equal('');

        // Set the elements values
        await emailElement.setValue('');
        await passwordElement.setValue('');

        // Click the login button here
        await loginButtonElement.trigger('click');

        // CHeck login_info object structure and content after login
        expect(wrapper.vm.login_info).to.be.an('object');
        expect(wrapper.vm.login_info).to.have.keys([
            'show',
            'message',
            'timeout',
            'color'
        ]);
        expect(wrapper.vm.login_info.show).to.be.equal(true);
        expect(wrapper.vm.login_info.message).to.be.equal('e-post och lösenord krävs');

        // Check elements values after login
        expect(emailElement.element.value).to.be.equal('');
        expect(passwordElement.element.value).to.be.equal('');

        // Check variables after login
        expect(wrapper.vm.email).to.be.equal('');
        expect(wrapper.vm.password).to.be.equal('');
    });

    it('Login without inserting any username', async () => {
        const wrapper = mount(UserLogin, {
            localVue,
            vuetify
        });

        // variables
        const emailElement = wrapper.find('#email');
        const passwordElement = wrapper.find('#userpassword');
        const loginButtonElement = wrapper.find('button[class="btn white--text btn-block"]');

        // CHeck login_info object structure and content before login
        expect(wrapper.vm.login_info).to.be.an('object');
        expect(wrapper.vm.login_info).to.have.keys([
            'show',
            'message',
            'timeout',
            'color'
        ]);
        expect(wrapper.vm.login_info.show).to.be.equal(false);
        expect(wrapper.vm.login_info.message).to.be.equal('');

        // Check elements values before login
        expect(emailElement.element.value).to.be.equal('');
        expect(passwordElement.element.value).to.be.equal('');

        // Check variables before login
        expect(wrapper.vm.email).to.be.equal('');
        expect(wrapper.vm.password).to.be.equal('');

        // Set the elements values
        await emailElement.setValue('');
        await passwordElement.setValue('test');

        // Click the login button here
        await loginButtonElement.trigger('click');

        // CHeck login_info object structure and content after login
        expect(wrapper.vm.login_info).to.be.an('object');
        expect(wrapper.vm.login_info).to.have.keys([
            'show',
            'message',
            'timeout',
            'color'
        ]);
        expect(wrapper.vm.login_info.show).to.be.equal(true);
        expect(wrapper.vm.login_info.message).to.be.equal('e-post och lösenord krävs');

        // Check elements values after login
        expect(emailElement.element.value).to.be.equal('');
        expect(passwordElement.element.value).to.be.equal('test');

        // Check variables after login
        expect(wrapper.vm.email).to.be.equal('');
        expect(wrapper.vm.password).to.be.equal('test');
    });

    it('Login without inserting any password', async () => {
        const wrapper = mount(UserLogin, {
            localVue,
            vuetify
        });

        // variables
        const emailElement = wrapper.find('#email');
        const passwordElement = wrapper.find('#userpassword');
        const loginButtonElement = wrapper.find('button[class="btn white--text btn-block"]');

        // CHeck login_info object structure and content before login
        expect(wrapper.vm.login_info).to.be.an('object');
        expect(wrapper.vm.login_info).to.have.keys([
            'show',
            'message',
            'timeout',
            'color'
        ]);
        expect(wrapper.vm.login_info.show).to.be.equal(false);
        expect(wrapper.vm.login_info.message).to.be.equal('');

        // Check elements values before login
        expect(emailElement.element.value).to.be.equal('');
        expect(passwordElement.element.value).to.be.equal('');

        // Check variables before login
        expect(wrapper.vm.email).to.be.equal('');
        expect(wrapper.vm.password).to.be.equal('');

        // Set the elements values
        await emailElement.setValue('test@test.se');
        await passwordElement.setValue('');

        // Click the login button here
        await loginButtonElement.trigger('click');

        // CHeck login_info object structure and content after login
        expect(wrapper.vm.login_info).to.be.an('object');
        expect(wrapper.vm.login_info).to.have.keys([
            'show',
            'message',
            'timeout',
            'color'
        ]);
        expect(wrapper.vm.login_info.show).to.be.equal(true);
        expect(wrapper.vm.login_info.message).to.be.equal('e-post och lösenord krävs');

        // Check elements values after login
        expect(emailElement.element.value).to.be.equal('test@test.se');
        expect(passwordElement.element.value).to.be.equal('');

        // Check variables after login
        expect(wrapper.vm.email).to.be.equal('test@test.se');
        expect(wrapper.vm.password).to.be.equal('');
    });

    it('Login inserting either wrong username or password', async () => {
        const wrapper = mount(UserLogin, {
            localVue,
            vuetify
        });

        const spyUserLogin = sinon.spy(apiService, 'userLogin');

        // variables
        const emailElement = wrapper.find('#email');
        const passwordElement = wrapper.find('#userpassword');
        const loginButtonElement = wrapper.find('button[class="btn white--text btn-block"]');

        // CHeck login_info object structure and content before login
        expect(wrapper.vm.login_info).to.be.an('object');
        expect(wrapper.vm.login_info).to.have.keys([
            'show',
            'message',
            'timeout',
            'color'
        ]);
        expect(wrapper.vm.login_info.show).to.be.equal(false);
        expect(wrapper.vm.login_info.message).to.be.equal('');

        // Check elements values before login
        expect(emailElement.element.value).to.be.equal('');
        expect(passwordElement.element.value).to.be.equal('');

        // Check variables before login
        expect(wrapper.vm.email).to.be.equal('');
        expect(wrapper.vm.password).to.be.equal('');

        // Set the elements values
        await emailElement.setValue('test@test.se');
        await passwordElement.setValue('test');

        // Click the login button here
        await loginButtonElement.trigger('click');

        for(const userLoginItem of spyUserLogin.returnValues) {
            try {
                await userLoginItem;
            } catch(error) {
                expect(error.message).to.be.equal('Request failed with status code 400');
            }
        }

        spyUserLogin.restore();
    });

    it('Login with right username and password', async () => {
        const wrapper = mount(UserLogin, {
            localVue,
            vuetify
        });

        const spyUserLogin = sinon.spy(apiService, 'userLogin');

        // variables
        const emailElement = wrapper.find('#email');
        const passwordElement = wrapper.find('#userpassword');
        const loginButtonElement = wrapper.find('button[class="btn white--text btn-block"]');

        // CHeck login_info object structure and content before login
        expect(wrapper.vm.login_info).to.be.an('object');
        expect(wrapper.vm.login_info).to.have.keys([
            'show',
            'message',
            'timeout',
            'color'
        ]);
        expect(wrapper.vm.login_info.show).to.be.equal(false);
        expect(wrapper.vm.login_info.message).to.be.equal('');

        // Check elements values before login
        expect(emailElement.element.value).to.be.equal('');
        expect(passwordElement.element.value).to.be.equal('');

        // Check variables before login
        expect(wrapper.vm.email).to.be.equal('');
        expect(wrapper.vm.password).to.be.equal('');

        // Set the elements values
        await emailElement.setValue('test123@test123.com');
        await passwordElement.setValue('test123');

        // Click the login button here
        await loginButtonElement.trigger('click');

        for(const userLoginItem of spyUserLogin.returnValues) {
            const response = JSON.parse(JSON.stringify(await userLoginItem));

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
        }

        spyUserLogin.restore();
    });
});
