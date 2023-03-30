import ApiService from "../../Services/ApiService";

export default {
    state: {
        exchangeRates: [],
    },

    getters: {
        getExchangeRates: (state) => {
            return state.exchangeRates;
        },
    },

    mutations: {
        setExchangeRates(state, currency) {
            let exchangeRates = [
                {symbol: 'EUR', rate: currency.eur},
                {symbol: 'NOK', rate: currency.nok},
                {symbol: 'DKK', rate: currency.dkk},
            ];
            state.exchangeRates = exchangeRates;
        },
    },


    actions: {
        async loadExchangeRates({ commit } ) {
            const currency = (await ApiService.getExchangeRates()).data;
            console.log(currency[0])
            commit("setExchangeRates", currency[0]);

        },
    },
};




