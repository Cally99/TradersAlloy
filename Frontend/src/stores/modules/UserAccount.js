import ApiService from "../../Services/ApiService";

function generateNewUserAccountId (accounts) {
    // TODO better to match /-[0-9][0-9]/
    //    ... get the maximum and +1
    const account_ids = accounts.map( a => {
        const x = a.user_account_id.indexOf("-")
        if (x !== -1) {
            return parseInt(a.user_account_id.substr(x+1));
        }
    });  //[2,3,4]

    for (let i=0; i < account_ids.length; i++) {
        if ( !  account_ids.includes(parseInt(account_ids[i])+1)) {
            return accounts[0].user_id+'-'+(parseInt(account_ids[i])+1);
        }
    }
    return "532-99";
}



export default {
    state: {
        userAccounts: {},
        allUserAccounts: [],
        showUserAccountMenu: false,
        showSelectedAccounts: false,
    },

    getters: {
        getUserAccounts(state) {
            return state.userAccounts;
        },
        getUserAccount(state, user_account_id) {
            return state.userAccounts.find((a) => a.user_account_id === user_account_id);
        },
        getShowUserAccountMenu(state) {
            return state.showUserAccountMenu;
        },
        getAllUserAccounts(state) {
            return state.allUserAccounts;
        },
        getShowSelectedAccounts(state) {
            return state.showSelectedAccounts;
        },
    },

    mutations: {
        setUserAccounts(state, query) {
            state.userAccounts = query;
        },
        setShowUserAccountMenu(state, query) {
            state.showUserAccountMenu = query;
        },
        setAllUserAccounts(state, query) {
            state.allUserAccounts = query;
        },
        setUserAccountsModiy(state, query) {
            state.userAccounts = query;
        },
        setShowSelectedAccounts(state, query) {
            state.showSelectedAccounts = query;
        },
    },

    actions: {
        async loadUserAccounts({ commit }, user_id) {
            const userAccounts = (await ApiService.getUserAccounts(user_id)).data;

            commit('setUserAccounts', userAccounts);
        },

        async insertUserAccount({ commit , getters}, account) {

            if (account.user_account_id === null) {
                account.user_account_id = generateNewUserAccountId(getters.getUserAccounts);
            }

            const insertedUserAccount = (await ApiService.createUserAccount(account)).data;
            const userAccounts = (await ApiService.getUserAccounts(insertedUserAccount.user_id)).data;
            commit('setUserAccounts', userAccounts);
            return insertedUserAccount;
        },

        async updateUserAccount({ commit, getters }, user_account_id) {
            const updatedUserAccount = getters.getUserAccounts.find((a) => a.user_account_id === user_account_id);

            await ApiService.updateUserAccount(updatedUserAccount);

            const userAccounts = (await ApiService.getUserAccounts(updatedUserAccount.user_id)).data;

            commit('setUserAccounts', userAccounts);
        },
        async updateUserAccountOnUserObject({ commit }, account) {
            await ApiService.updateUserAccount(account);

            const userAccounts = (await ApiService.getUserAccounts(account.user_id)).data;

            commit('setUserAccounts', userAccounts);
        },
        async loadAllUserAccounts({ commit }) {
            const userAllAccounts = (await ApiService.getAllUserAccounts()).data;

            commit('setAllUserAccounts', userAllAccounts);
        },
        async avanzaGenerate2FA({ commit }, secret_key) {
            const bankID = (await ApiService.avanzaGenerate2FA(secret_key)).data;
            return bankID;
        },

        async avanzaGetTransactions({ commit }, user) {
            const transactions = (await ApiService.avanzaGetTransactions(user)).data;
            return transactions;
        }
    },

}


