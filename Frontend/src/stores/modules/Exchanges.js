import ApiService from "../../Services/ApiService";

export default {
  state: {
    mapExchanges: [],
  },

  getters: {
    getMapExchanges(state) {
      return state.mapExchanges;
    },
  },

  mutations: {
    setMapExchanges(state, payload) {
      state.mapExchanges = payload;
    },
  },

  actions: {
    async loadExchanges({commit}) {
      let mapExchanges = new Map();
      const responseExchanges = (await ApiService.fetchExchanges()).data;
      await responseExchanges.forEach((exchange) => {
        mapExchanges.set(exchange.id, exchange);
      });
      commit("setMapExchanges", mapExchanges); // Map keyed on the id
    },
  },
};
