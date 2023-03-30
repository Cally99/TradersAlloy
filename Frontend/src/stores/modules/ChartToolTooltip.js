export default {
    state: {
        chartTooltip: ""
    },

    getters: {
        getChartTooltip: (state) => {
            return state.chartTooltip;
        }
    },

    mutations: {
        setChartTooltip(state, payload) {
            state.chartTooltip = payload;
        }
    },

    actions: {}
};
