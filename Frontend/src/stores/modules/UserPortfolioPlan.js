import ApiService from "../../Services/ApiService";

export default {
    state: {
        userPortfolioPlan: null,
    },

    getters: {
        getUserPortfolioPlan (state, user_id) {
            if (state.userPortfolioPlan === null) {
                return ApiService.getPlan(user_id);
            } else {
                return state.userPortfolioPlan;
            }
        },
    },

    mutations: {
        setUserPortfolioPlan(state, payload) {
            state.userPortfolioPlan = payload;
        },
    },

    actions: {
        async loadUserPortfolioPlan({commit}, user_id) {
            const plan = (await ApiService.getPlan(user_id)).data;
            commit("setUserPortfolioPlan", plan);
        },

        async upsertUserPortfolioPlan({commit, state}, plan) {
            const rv = await ApiService.setPlan(plan);

            if (rv !== null) {
                this.$store.commit('setUserPortfolioPlan', {
                    note: plan.note,
                    account_size: plan.account_size,
                    monthly_add: plan.monthly_add,
                    position_size: plan.position_size,
                } );

                this.$store.commit("setMessage", {text: 'Portfolio Plan Saved', type: 'success'});

            } else {
                this.$store.commit("setMessage", {text: 'Portfolio Plan Save failed', type: 'warn'});
            }
        },
    },
};
