import ApiService from "../../Services/ApiService";

export default {
    state: {
        notifications: [],
        recentNotifications: [],
    },

    getters: {
        getNotifications: (state) => {
            return state.notifications;
        },
        getRecentNotifications: (state) => {
            return state.recentNotifications;
      },
    },

    mutations: {
        setNotifications(state, payload) {
            state.notifications = payload.slice(0,2);
            state.recentNotifications = payload.slice(2);
        },
    },

    actions: {
        async loadNotifications({commit}, user_id) {
            const notifications = (await ApiService.getNotifications(user_id)).data;
            commit('setNotifications', notifications);
            //const recentNotifications = [];
            //commit('setNotifications', recentNotifications);  // COULD NOT SET 2 in one action !
        },

    },
};
