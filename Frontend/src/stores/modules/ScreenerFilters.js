import ApiService from "../../Services/ApiService";

export default {
    state: {
        screenerFilters: [],
        screen_id: null,
        is_screener: false
    },
    
    getters: {
        screenerFilters(state) {
            return state.screenerFilters;
        },
        screen_id(state) {
            return state.screen_id;
        },
        is_screener(state) {
            return state.is_screener;
        }
    },
  
    mutations: {
        setScreenerFilters(state, query) {
            state.screenerFilters = query;
        },
        renameScreenerFilters(state, payload) {
            state.screenerFilters[payload.index].name = payload.name;
        },
        addScreenerFilters(state, query) {
            state.screenerFilters.push(query);
        },
        removeScreenerFilters(state, index) {
            state.screenerFilters.splice(index, 1);
        },
        setScreenID(state, payload) {
            state.screen_id = payload;
        },
        setIsScreener( state, payload) {
            state.is_screener = payload;
        },
        updateScreenerFilters(state, payload) {
            let screen_index = state.screenerFilters.findIndex(item => item.screen_id == payload.screen_id);
            if (screen_index > -1) {
                state.screenerFilters[screen_index].filter = payload.filter;
                state.screenerFilters[screen_index].name = payload.name;
            } else {
                state.screenerFilters.push(payload);
            }
        }
    },
  
    actions: {
        async loadScreeners({commit, rootState}, user_id) {
            const responseScreeners = (await ApiService.getUserScreenerFilters(user_id)).data;
            commit("setScreenerFilters", responseScreeners);
        },
    },
};