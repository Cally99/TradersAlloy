import ApiService from "../../Services/ApiService";

export default {
    state: {
        WL_columns: {},
        chart_overlays: {}
    },

    getters: {
        getWL_columns(state) {
            return state.WL_columns;
        },
        getChart_overlays(state) {
            return state.chart_overlays;
        }
    },

    mutations: {
        setWL(state, payload) {
            state.WL_columns = payload;
        },
        setChartOverlays(state, payload) {
            state.chart_overlays = payload;
        }
    },

    actions: {
        async loadWLColumns({ commit, rootState }, user_id) {
            const wl_columns = (await ApiService.loadWLColumns(user_id)).data;
            if (wl_columns) {
                commit("setWL", JSON.parse(wl_columns.content));
            }
        },
        async saveWLColumns({ commit, rootState }, data) {
            await ApiService.saveWLColumns(data);
            commit("setWL", JSON.parse(data.content));
        },
        async loadChartOverlays({ commit, rootState }, user_id) {
            const overlays = (await ApiService.loadChartOverlays(user_id)).data;
            if (overlays) {
                commit("setChartOverlays", JSON.parse(overlays.content));
            } else {
                // Earning Date is the default conf
                let default_overlays = {
                    4: { display: true, show: true }
                };
                commit("setChartOverlays", default_overlays);
            }
        },
        async saveChartOverlays({ commit, rootState }, data) {
            await ApiService.saveChartOverlays(data);
            commit("setChartOverlays", JSON.parse(data.content));
        },
    },
};