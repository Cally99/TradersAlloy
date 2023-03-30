/* eslint-disable no-console */
import Vuex from "vuex";
import Vue from "vue";

//import Message from './modules/Message';
import Companies from './modules/Companies.ts';


Vue.use(Vuex);

export const store = new Vuex.Store({
    modules: {
        Companies,
    },
});

console.log('***** VUEX');
