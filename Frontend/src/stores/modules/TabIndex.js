export default {
  state: {
    tab_index: 0,
    tab_overview_index: 0
  },

  getters: {
    getTabIndex(state) {
      return state.tab_index;
    },
    getTab_overviewIndex(state) {
      return state.tab_overview_index
    }
  },

  mutations: {
    setTabIndex(state, index) {
      state.tab_index = index;
    },
    setTab_overviewIndex(state, index) {
      state.tab_overview_index = index;
    },
  },

  actions: {},
};
