import ApiService from "../../Services/ApiService";

export default {
    state: {
        user: {},
    },

    getters: {
        getUser(state) {
            return state.user;
        },
    },

    mutations: {
        setUser(state, payload) {
            state.user = payload;
        },
    },

    actions: {
        handleUserAction({ commit }, userInfo) {
            let userObject = {
                user: userInfo.user_id,
                email: userInfo.email,
                language: typeof userInfo.settings === "object" ? userInfo.settings : JSON.parse(userInfo.settings).language,
                is_dark: typeof userInfo.settings === "object" ? userInfo.settings : JSON.parse(userInfo.settings).is_dark,
                subscribed: userInfo.subscription_id ? true : null, //if usersubscription is truthy set value to true otherwise to false
            };
            commit("setUser", userObject);
        },
        async loadUserTabs({ commit }, user_id) {
            console.log("LOAD USER TABS");

            const user = (await ApiService.findUser(user_id));
            console.log(user_id);
            console.log(user);
            const tabs = user.tabs;
            commit("setRecents", tabs);

            tabs.forEach(x => {
                console.log(x);
            })
        },
    },
}