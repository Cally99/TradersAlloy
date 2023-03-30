import ApiService from "../../Services/ApiService";

export default {
    state: {
        tx: []
    },
    getters: {
        getTx(state) {
            return state.tx;
        },
        getNumberOfOwnedStock: (state) => (user_account_id, stock_id) => {
            let numberOfStocks = 0;

            for(const t of state.tx) {
                if(t.user_account_id === user_account_id && t.stock_id === stock_id) {
                    numberOfStocks += t.qty;
                }
            }

            return numberOfStocks;
        }
    },

    mutations: {
        setTx(state, payload) {
            state.tx = payload;
        },
    },

    actions: {
        async loadTx({commit, rootState}, user_id) {
            const responseTx = await ApiService.fetchTx(user_id);
            commit("setTx", responseTx);
        },
        async saveTx({commit, rootState}, data) {
            const user_id = data.user_id;
            const response = await ApiService.saveAvanza(data);  // a JSON is returned with Txs and Uts
            const responseTx = await ApiService.fetchTx(user_id);
            commit("setTx", responseTx);
            return response;
        },
        async saveOneTx({commit, rootState}, data) {
            const user_id = data.user_id;
            const response = await ApiService.insertOneTx(data);
            const responseTx = await ApiService.fetchTx(user_id);
            commit("setTx", responseTx);
            return response;
        },
        async updateTx({commit, rootState}, data) {
            const user_id = data.user_id;
            const response = await ApiService.updateTxOnId(data);
            const responseTx = await ApiService.fetchTx(user_id);
            commit("setTx", responseTx);
            return response;
        },
        async deleteTx({commit, rootState}, data) {
            const user_id = data.user_id;
            const response = await ApiService.deleteTxOnId(data);
            const responseTx = await ApiService.fetchTx(user_id);
            commit("setTx", responseTx);
            return response;
        }
    }
};
