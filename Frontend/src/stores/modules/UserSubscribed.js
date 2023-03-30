import ApiService from "../../Services/ApiService";


export default {
    state: {
        userSubscribed: false,
        cancelSubscription: true
    },

    getters: {
        getUserSubscribed: (state) => {
            return state.userSubscribed;
        },
        getCancelSubscription: (state) => {
            return state.cancelSubscription;
        },
    },

    mutations: {
        setUserSubscribed(state, payload) {
            state.userSubscribed = payload;
        },
        setUserCancelSubscribed(state, payload) {
            state.cancelSubscription = payload;
        }
    },
    actions: {
        async upgradeSubscriptionAction({ commit }, obj) {
            let temp = await ApiService.upgradeSubscription();
            // commit("addWatchlistJoin", obj);
            return temp.data;
        },
        async getTransactionHistoryStripe({ commit }, obj) {
            let histories = await ApiService.getTransactionHistoryStripe(obj);
            return histories.data;
        },
        async getPromoCodes({ commit }, obj) {
            let res = await ApiService.getPromoCodes();
            return res.data;
        }
    }
};