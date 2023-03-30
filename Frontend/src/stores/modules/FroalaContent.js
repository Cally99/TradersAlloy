import UserWatchList from './UserWatchList';

export default {
    state: {
        froalaContent: []
    },

    getters: {
        getFroalaContent: (state) => (stock_id) => {
            return state.froalaContent.find((s) => s.stock_id === stock_id);
        },
    },

    mutations: {
        setFroalaContent(state, payload, rootState) {
            if (state.froalaContent.find((s) => s.stock_id === payload.stock_id)) {
                const index = state.froalaContent.findIndex((s) => s.stock_id === payload.stock_id);
                state.froalaContent[index].content = payload.content;
            } else {
                state.froalaContent.push(payload);
            }

            let item_index = UserWatchList.state.watchlistItems.findIndex(WL => WL.stock_id === payload.stock_id);
            if (item_index > -1) {
                UserWatchList.state.watchlistItems[item_index].research_state = "EXISTS";
            }
        },
    },

    actions: {},
};
