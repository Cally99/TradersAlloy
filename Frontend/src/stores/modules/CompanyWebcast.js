import ApiService from "../../Services/ApiService";

export default {
    state: {
        companyWebcasts: [],
    },

    getters: {
        getCompanyWebcasts(state) {
            return state.companyWebcasts;
        },
    },

    mutations: {
        setCompanyWebcasts(state, payload) {
            state.companyWebcasts = payload;
        },
    },

    actions: {
        async loadCompanyWebcasts({ commit }) {
            const companyWebcasts_array = (await ApiService.getCompanyWebcasts()).data;
            commit("setCompanyWebcasts", companyWebcasts_array);
        },

        async hasCompanyWebcast({ commit, state }, payload) {
            var companyWebcasts = state.companyWebcasts;
            var companyWebcastIds = companyWebcasts.map(cw => cw.company_id);
            const hasCompanyWebcasts = companyWebcastIds.includes(payload.company_id);
            if ( ! hasCompanyWebcasts) {
                const webcasts = (await ApiService.getOneCompanyWebcast(payload.company_id)).data;
                for(var i in webcasts) {
                    companyWebcasts.push(webcasts[i]);
                }
                commit("setCompanyWebcasts", companyWebcasts);
            }
        }
    },
};