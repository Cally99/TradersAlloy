export default {
    state: {
        compareDatas: [],
    },
    
    getters: {
        compareDatas(state) {
            return state.compareDatas;
        },
    },

    mutations: {
        setCompareDatas(state, query) {
            state.compareDatas = query;
        },
        addCompareDatas(state, query) {
            state.compareDatas.push(query);
        },
        removeCompareDatas(state, query) {
            state.compareDatas = state.compareDatas.filter(item => item.company_id !== query.company_id);
        },
        removeCompareDatasByName(state, query) {
            state.compareDatas = state.compareDatas.filter(item => item.name != query);
        },
        clearCompareDatas(state) {
            state.compareDatas = []
        },
    },

    actions: {},
  };