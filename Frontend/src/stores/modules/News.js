export default {
  state: {
    news: []
  },

  getters: {
    getNewsRedundant: (state) => (comnpany_id) => {
      return state.news.find(s => s.comnpany_id === comnpany_id);
    },
  },

  mutations: {
    setNews(state, item) {
      state.news.push(item);
    },
  },

  actions: {
  },
};
