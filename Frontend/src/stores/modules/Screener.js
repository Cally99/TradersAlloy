import ApiStocks from "../../Services/ApiStocks";

export default {
    state: {
        screeners: [],
        array_data_screener: []
    },

    getters: {
        getScreeners(state) {
            return state.screeners;
        },
        getDataScreener(state) {
            return state.array_data_screener;
        }
    },

    mutations: {
        setScreeners(state, payload) {
            state.screeners = payload;
        },
        addScreener(state, payload) {
            state.screeners.push(payload);
        },
        setDataScreener(state, payload) {
            state.array_data_screener = payload;
        }
    },

    actions: {
        async loadScreenerData({ commit }) {
            const res = await ApiStocks.fetchAllStocks();
            commit("setDataScreener", res.data);
            return res.data;
        },
        async loadScreenerDataOnePage({ commit }) {
            const res = await ApiStocks.fetchOnePageStocks();
            commit("setDataScreener", res.data);
            return res.data;
        },
    },
};