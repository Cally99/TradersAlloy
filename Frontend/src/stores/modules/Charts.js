export default {
  state: {
    charts: []
  },

  getters: {
    getChart: (state) => (company_id) => {
      return state.charts.find((s) => s.company_id === company_id);
    }
  },

  mutations: {
    setChart(state, payload) {
      state.charts.push(payload);
    }
  },

  actions: {}
};
