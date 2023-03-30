import ApiService from "../../Services/ApiService";

export default {
    state: {
        allCompanies: [],
        mapCompanies: [],
    },

    getters: {
        getAllCompanies(state) {
            return state.allCompanies;
        },
        getMapCompanies(state) {
            return state.mapCompanies;
        },
    },

    mutations: {
        setAllCompanies(state, payload) {
            state.allCompanies = payload;
        },
        setMapCompanies(state, payload) {
            state.mapCompanies = payload;
        },
    },

    actions: {
        async loadCompaniesv0({ commit }) {
            let mapCompanies = new Map();
            const responseCompanies = (await ApiService.fetchMinimizedCompanies()).data;
            await responseCompanies.forEach((company) => {
                mapCompanies.set(company.company_id, company);
            });
            commit("setAllCompanies", mapCompanies); // Map keyed on the isin
        },

        async loadCompanies({ commit, rootState }, payload) {
            let mapCompanies = new Map();
            if (payload) {
                // add the recent tabs 
                let company_id_array = payload;
                rootState.Recents.recents.forEach(item => {
                    company_id_array.push(item);
                });
                const companies = (await ApiService.getCompaniesAndReports(company_id_array)).data;
                for (const company of companies) {
                    mapCompanies.set(company.company_id, company);
                }
                commit("setMapCompanies", mapCompanies); // Map keyed on the isin
            }
        },

        async loadCompanyDataNeeded({ commit, state }, payload) {
            if (!state.mapCompanies.get(payload.company_id)) {
                const company = (await ApiService.getCompaniesAndReportONE(payload)).data;
                let exist_companies = state.mapCompanies;
                exist_companies.set(company.company_id, company);
                commit("setMapCompanies", exist_companies);
            }
        }
    },
};