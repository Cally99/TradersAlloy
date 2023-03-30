export default {
  state: {
    pdfURL: []
  },

  getters: {
    getPDFURL: (state) => (comnpany_id) => {
      return state.pdfURL.find((s) => s.comnpany_id === comnpany_id);
    },
  },

  mutations: {
    setPDFURL(state, item) {
      state.pdfURL.push(item);
    },
    setUpdatePDF(state, payload) {
      if (state.pdfURL.find((s) => s.company_id === payload.company_id)) {
        const index = state.pdfURL.findIndex((s) => s.company_id === payload.company_id);
        state.pdfURL[index].url = payload.url;
      } else {
        state.pdfURL.push(payload);
      }
    }
  },
  
  actions: {}
};
