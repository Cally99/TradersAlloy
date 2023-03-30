export default {
    state: {
        userSettings: [],
    },
    
    getters: {
        getUserSettings(state) {
            return state.userSettings;
        },
    },

    mutations: {
        setUserSettings(state, payload) {
            state.userSettings = payload;
        },
        addUserSettings(state, item) {
            state.userSettings.push(item);
        },
        removeUserSettings(state, index) {
            state.userSettings.splice(index, 1);
        }
    },

    actions: {},
};