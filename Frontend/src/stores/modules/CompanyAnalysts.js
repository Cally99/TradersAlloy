import ApiService from "../../Services/ApiService";

export default {
    state: {
        companyAnalysts: [],
        companyAnalystsOne: []
    },

    getters: {
        getCompanyAnalysts(state) {
            return state.companyAnalysts;
        },
        getCompanyAnalystsOne(state) {
            return state.companyAnalystsOne;
        },
    },

    mutations: {
        setCompanyAnalysts(state, payload) {
            state.companyAnalysts = payload;
        },
        setOneCompanyAnalysts(state, payload) {
            state.companyAnalystsOne = payload;
        },
    },

    actions: {
        async loadCompanyAnalysts({ commit }) {
            const companyAnalysts_array = (await ApiService.getCompanyAnalysts()).data;
            commit("setCompanyAnalysts", companyAnalysts_array);
        },


    },
};