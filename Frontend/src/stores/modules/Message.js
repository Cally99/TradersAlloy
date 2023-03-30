export default {
  state: {
    message: {
      visible: false,
      text: "example text",
      type: "success",
    }
  },

  getters: {
    getMessage(state) {
      return state.message;
    }
  },

  mutations: {
    setMessage(state, payload) {
      payload.visible = true;
      state.message = payload;
    },
    setMessageClear(state) {
      state.message = {};
    }
  },

  actions: {
    setMessageAction({commit}, message) {
      commit("setMessage", message);
    }
  }
};
