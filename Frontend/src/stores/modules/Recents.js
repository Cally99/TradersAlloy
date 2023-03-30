import ApiService from "@/Services/ApiService";

export default {
    state: {
        recents: []
    },

    getters: {
        getRecents(state) {
            return state.recents;
        }
    },

    mutations: {
        removeRecent(state, index) {
            state.recents.splice(index, 1);
        },
        addStockToRecents(state, stock_id) { // often action and mutation have the same name
            state.recents.unshift(stock_id); // always add to beginning
        },
        setRecents(state, stockIdArray) {
            state.recents = stockIdArray;
        },

    },

    actions: {
        async addStockToRecents({ commit, getters }, stock_id) {
            let recents = getters.getRecents;
            if (recents) {
                const idIndex = recents.indexOf(stock_id);
                if (idIndex !== -1) {
                    commit('removeRecent', idIndex); // remove from middle
                }
                if (recents.length >= 8) {
                    commit('removeRecent', 7); // remove the last item
                }
            }
            commit('addStockToRecents', stock_id);

            let tabs_objectString = '{';
            getters.getRecents.forEach((element, inx) => {
                tabs_objectString += element;
                if (inx == getters.getRecents.length - 1) {
                    return;
                } else {
                    tabs_objectString += ','
                }
            });
            tabs_objectString += '}'
            await ApiService.addNavigationTabs({
                id: JSON.parse(localStorage.user).user_id,
                tabs: tabs_objectString, // '{1,2,3}'
            });
        }



    },
};