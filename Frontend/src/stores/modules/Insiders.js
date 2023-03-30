export default {
  state: {
    insiders: [],
  },

  getters: {
    getInsiders: (state) => (company_id) => {
      return state.insiders.find((s) => s.company_id === company_id);
    },
  },

  mutations: {
    setInsiders(state, item) {
      state.insiders.push(item);
    },
  },

  actions: {},
};
