import ApiStocks from "../../Services/ApiStocks";
import ApiService from "../../Services/ApiService";

export default {
    state: {
        stocks: [], // for user tabs
        allStocks: [], // all stocks
        mapStocks: [],
    },

    getters: {
        getStock: (state) => (company_id) => {
            return state.stocks.find(s => s.company_id === company_id);
        },
        getMapStocks(state) {
            return state.mapStocks;
        },
        getAllStocks(state) {
            return state.allStocks;
        },
        getStockByINSREF: (state) => (stock_id) => {
            return state.stocks.find(s => s.stock_id === stock_id);
        },
        getStocks(state) {
            return state.stocks;
        },
    },

    mutations: {
        setAllStocks(state, payload) {
            state.allStocks = payload;
        },
        setMapStocks(state, payload) {
            state.mapStocks = payload;
        },
        setUserStocks(state, payload) {
            // DO We need this? seems to be the same as the setStock , does the same thing and never been user // AB
            // We could check if the mutation "SetUserStocks" is usefull or delete it. // Facundo
            state.stocks.push(payload);
        },
        setStock(state, payload) {
            state.stocks.push(payload);
        },
    },

    actions: {
        // states allStocks and mapStocks
        async loadStocks({ commit }, payload) {
            // if (payload) {
            //     let arrayStocks = (await ApiStocks.fetchMapStocks(payload)).data;
                
            //     commit("setAllStocks", arrayStocks); // the fetched array from backend, no changes made to it
            //     commit("setMapStocks", arrayStocks); // Map keyed on the stock_id
            // }
        },

        async loadAllStocksForAutocompleteOnStartup({ commit }) {
            let arrayStocks = (await ApiStocks.loadAllStocksForAutocompleteOnStartup()).data;

            commit("setAllStocks", arrayStocks); // the fetched array from backend, no changes made to it
            commit("setMapStocks", arrayStocks); // Map keyed on the stock_id
        },
        async setPushToStocksAction({ commit }, stock) {
            await ApiStocks.fetchStock(stock.stock_id).then((response) => {
                commit("setStock", response.data);
            });
        },
    },
};