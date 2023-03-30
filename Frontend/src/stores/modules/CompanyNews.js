import ApiService from "../../Services/ApiService";

/**
 * Company News is specific to one company / stock
 *
 * News is the latest for all stocks AND other market news; now limited to 50 but should be lazy load infinitity.
 *
 * */
export default {
    state: {
        companyNews: [],
        news: [],
        newsWatched: [],
    },
    getters: {
        getCompanyNews(state) {
            return state.companyNews;
        },
        getNews(state) {
            return state.news;
        },
        getNewsWatched(state) {
            return state.newsWatched;
        }
    },
    mutations: {
        setCompanyNews(state, payload) {
            state.companyNews = payload;
        },
        setNews(state, payload) {
            state.news = payload;
        },
        setNewsWatched(state, payload) {
            state.newsWatched = payload;
        }

    },
    actions: {
        async loadCompanyNews({ commit, rootState }, company_id) {
            let news = (await ApiService.getNewsOnCompanyId(company_id)).data;
            let stock = rootState.Stocks.mapStocks.find(s => s.company_id == company_id);
            news.map(item => item.y = stock.price_today);
            commit("setCompanyNews", news);
            return news;
        },

        async loadNews50({ commit, rootState }) {
            let news = (await ApiService.getNews50()).data;
            commit("setNews", news);
            return news;
        },

        async loadNewsWatched({ commit, rootState }, user_id) {
            let news = (await ApiService.getNewsWatched(user_id)).data;
            commit("setNewsWatched", news);
            return news;
        }

    }
};
