export default {
    state: {
        navigationTabs: [],
        isPdfReportsTableLoaded: 1,
        
        // navigationtabs: [
        //     {i: 0, name: 'Dashboard', path: "/dashboard", icon: "mdi-apps", isFocus: false},
        //     {i: 1, name: 'ERIC B', path: "/stocks", icon: "mdi-cube", isFocus: false, isin: 'SE0000000000'},
        //     {i: 2, name: 'Watchlist', path: "/watchlist", icon: "mdi-eye", isFocus: false},
        //     {i: 3, name: 'Portfolio', path: "/portfolio", icon: "mdi-currency-usd", isFocus: false},
        // ],
    },
    getters: {
        getIsPdfReportsTableLoaded(state) {
            return state.isPdfReportsTableLoaded;
        },
    },
  
    mutations: {
        setIsPdfReportsTableLoaded(state, index) {
            state.isPdfReportsTableLoaded = index;
        },
    },
  
    actions: {},
  };
