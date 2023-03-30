export default {
  state: {
    selected_ResearchTabIndex: 1,
  },

  getters: {
    getSelectedResearchTabIndex(state) {
      return state.selected_ResearchTabIndex;
    },
  },

  mutations: {
    setSelectedResearchTabIndex(state, index) {
      state.selected_ResearchTabIndex = index;
    },
  },

  actions: {},
};
