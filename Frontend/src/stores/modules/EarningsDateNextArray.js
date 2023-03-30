import ApiService from "../../Services/ApiService";

export default {
  state: {
    earningsDateNextArray: [], // for displaying earning_date in Rapportkollen/Watchlist pages with isin
  },

  getters: {
    getEarningsDateArray: (state) => {
      return state.earningsDateNextArray;
    },
  },

  mutations: {
    setEarningsDateArray(state, payload) {
      state.earningsDateNextArray = payload;
    }
  },

  actions: {
    async loadEarningsdatenext({commit}) {
      const responseEarningsDateNext = (await ApiService.fetchEarningsDateNext()).data;
      commit("setEarningsDateArray", responseEarningsDateNext);
    },
  },
};
