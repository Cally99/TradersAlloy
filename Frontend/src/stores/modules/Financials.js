import ApiService from "../../Services/ApiService";

export default {
  state: {
    financials: [],
    financials_yearArray: []
  },

  getters: {
    getFinancials: (state) => {
      return state.financials;
    },
    getFinancials_year: (state) => {
      return state.financials_yearArray;
    },
  },

  mutations: {
    setFinancials(state, payload) {
      state.financials = payload;
    },
    setFinancials_year(state, payload) {
      state.financials_yearArray = payload;
    },
  },

  actions: {
    async loadFinancials({commit}) {
      const responseFinancials = (await ApiService.fetchMapFinancials()).data;
      commit("setFinancials", responseFinancials);
    },

    async loadFinancials_year({commit}) {
      const responseFinancials_year = (await ApiService.fetchMapFinancialsYear()).data;
      commit("setFinancials_year", responseFinancials_year);
    },
  },
};
