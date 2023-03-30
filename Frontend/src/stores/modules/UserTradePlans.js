import ApiService from "../../Services/ApiService"
import moment from "moment";

export default {
    state: {
        userTradePlans: []
    },
    getters: {
        userTradePlans(state) {
            return state.userTradePlans;
        },
        userTradePlansActiveCount(state) {
            const count = state.userTradePlans.reduce( (count , utp) => {
                const today = new Date();
                return (utp.entry_date > today || utp.exit_date > today ? count+1 : count);
            }, 0);

            return count;
        },
    },
    mutations: {
        removeUserTradePlans(state, query) {
            state.userTradePlans = state.userTradePlans.filter(item => item.trade_plan_id != query);
        },
        addUserTradePlans(state, query) {
            state.userTradePlans.push(query);
        },
        setUserTradePlans(state, query) {
            state.userTradePlans = query;
        },
    },
    actions: {
        async loadUserTradePlans({commit}, user_id) {
            const tradePlans = await ApiService.getTradePlans(user_id);
          /*  let tradePlans = [...response];
            tradePlans.forEach(row => {
                // the initial data includes many decimals, but we should display only 2 decimals.
                // If we do it in component, the users have troubles while editing values.
                // So that we cut decimals when we get the data from DB.
                row.target_price = row.target_price == null ? 0 : row.target_price.toFixed(2);
                row.entry_price = row.entry_price == null ? 0 : row.entry_price.toFixed(2);
                row.stoploss_price = row.stoploss_price == null ? 0 : row.stoploss_price.toFixed(2);
            });
           */
            commit("setUserTradePlans", tradePlans);
        },
    },
  };
