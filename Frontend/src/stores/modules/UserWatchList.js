import ApiService from "../../Services/ApiService";
import ApiUserFun from "../../Services/ApiUserFun";
import Companies from './Companies';
import Stocks from './Stocks';

export default {
    state: {
        watchlists: [],
        watchlistItems: [],
        isDragged: -1,
        isDraggedOverWatchlistItem: false,
        watchlistJoins: [],

        //map
        mapUserWatchlists: [],
        mapUserWatchlistItems: [],
        mapUserWatchlistJoins: [],
        userCurrentWatchlistId: null,
    },

    getters: {
        getIsDragged(state) {
            return state.isDragged;
        },
        getIsDraggedOverWatchlistItem(state) {
            return state.isDraggedOverWatchlistItem;
        },
        getWatchlists: (state) => {
            return state.watchlists;
        },
        getWatchlistItems(state) {
            return state.watchlistItems;
        },
        getWatchlistItem: (state) => (stock_id) => {
            return state.watchlistItems.find((s) => s.stock_id === stock_id);
        },
        getWatchlistJoins(state) {
            return state.watchlistJoins;
        },

        //map
        getMapUserWatchlists(state) {
            return state.mapUserWatchlists;
        },
        getMapUserWatchlistItems(state) {
            return state.mapUserWatchlistItems;
        },
        getMapUserWatchlistJoins(state) {
            return state.mapUserWatchlistJoins;
        },
        getUserCurrentWatchlistId(state) {
            return state.userCurrentWatchlistId;
        },
    },

    mutations: {
        addWatchlists(state, payload) {
            state.watchlists.push(payload);
        },
        setIsDragged(state, payload) {
            state.isDragged = payload;
        },
        setIsDraggedOverWatchlistItem(state, payload) {
            state.isDraggedOverWatchlistItem = payload;
        },
        addWatchlist(state, payload) {
            const { watchlist_id } = payload;
            state.userCurrentWatchlistId = watchlist_id;
            state.watchlists.push(payload);
        },
        setWatchlists(state, payload) {
            state.watchlists = payload;
        },
        setWatchlistItems(state, payload) {
            state.watchlistItems = payload;
        },
        addWatchlistItems(state, payload) {
            state.watchlistItems.push(payload);
        },
        setWatchlistJoins(state, payload) {
            state.watchlistJoins = payload;
        },
        addWatchlistItem(state, item) {
            if (!item.company_id) {
                console.log(JSON.stringify(item));
            }
            let company = Companies.state.mapCompanies.get(item.company_id);

            if (!!company) {
                item.eps = company.last_eps_ttm;
                item.sales = company.last_sales;
                item.pe = company.pe;
                item["Earnings Date"] = company.last_report_date;
            }
            let stock_data = Stocks.state.mapStocks.find(s => s.stock_id == item.stock_id);
            item.sector_name = stock_data ? stock_data.sector_name : "no sector name";
            state.watchlistItems.push(item);

            state.userCurrentWatchlistId = item.watchlist_id;
        },
        addWatchlistJoin(state, payload) {
            state.watchlistJoins.push(payload)
        },
        addWatchlistItemToWLI(state, payload) {
            state.watchlistItems.push(payload);
        },

        updateWatchlistItemConviction(state, payload) {
            if (state.watchlistItems.find((s) => s.stock_id === payload.stock_id)) {
                const index = state.watchlistItems.findIndex((s) => s.stock_id === payload.stock_id);
                state.watchlistItems[index].conviction = payload.conviction;
            }
        },
        updateWatchlistItemTags(state, payload) {
            if (state.watchlistItems.find((s) => s.stock_id === payload.stock_id)) {
                const index = state.watchlistItems.findIndex((s) => s.stock_id === payload.stock_id);
                state.watchlistItems[index].tags = payload.tags;
            }
        },
        updateWatchlistItem(state, payload) {
            let index = -1;
            if ((index = state.watchlistItems.find((s) => s.watchlist_item_id === payload.watchlist_item_id)) > -1) {
                state.watchlistItems[index] = payload;
            }
        },
        removeWatchlistItem(state, payload) {
            const index = state.watchlistJoins.findIndex((item) => item.stock_id === payload.stock_id && item.watchlist_id === payload.watchlist_id);
            state.watchlistJoins.splice(index, 1);
        },
        removeWatchlistItemFromWL(state, payload) {
            const index = state.watchlistItems.findIndex((item) => item.stock_id === payload.stock_id && item.user_id === payload.user_id);
            state.watchlistItems.splice(index, 1);
        },
        renameWatchlist(state, payload) {
            if (state.watchlists.find((item) => item.watchlist_id === payload.watchlist_id)) {
                const index = state.watchlists.findIndex((s) => s.watchlist_id === payload.watchlist_id);
                state.watchlists[index].name = payload.name;
            }
        },
        removeWatchlist(state, id) {
            if (state.watchlists.find((item) => item.watchlist_id === id)) {
                const index = state.watchlists.findIndex((s) => s.watchlist_id === id);
                state.watchlists.splice(index, 1);

                // we need to remove WLI as well when remove WL.
                for (var i = 0; i < state.watchlistItems.length; i++) {
                    if (state.watchlistItems[i].watchlist_id === id) {
                        state.watchlistItems.splice(i, 1);
                        i--;
                    }
                }
                state.userCurrentWatchlistId = state.watchlistJoins[0].watchlist_id;
            }
        },

        setUserCurrentWatchlistId(state, id) {
            state.userCurrentWatchlistId = id;
        },

        //map
        setMapUserWatchlists(state, payload) {
            state.mapUserWatchlists = payload;
        },
        setMapUserWatchlistItems(state, payload) {
            state.mapUserWatchlistItems = payload;
        },
        setOneMapUserWatchlistItem(state, payload) {
            state.mapUserWatchlistItems.set(payload.watchlist_item_id, payload);
        },
        setMapUserWatchlistJoins(state, payload) {
            state.mapUserWatchlistJoins = payload;
        },
    },

    actions: {
        async addStocksToWLJ({ commit, rootState, dispatch }, obj) {
            var addedObj = await ApiUserFun.addStocksToWLs(obj);
            commit("addWatchlistJoin", addedObj.data.WLJ);
            if(addedObj.data.exist_WLI == false) {
                var wli_item = addedObj.data.WLI;
                let staleResearchDate = new Date();
                staleResearchDate.setMonth(staleResearchDate.getMonth() - 3);

                await dispatch('loadCompanyDataNeeded', wli_item, { root: true });

                let stock = rootState.Stocks.mapStocks.find(s => s.stock_id == wli_item.stock_id);
                wli_item.sector_name = stock ? stock.sector_name : "no sector name";
                let company = rootState.Companies.mapCompanies.get(wli_item.company_id);
                if (!!company) {
                    wli_item.eps = company.last_eps_ttm;
                    wli_item.sales = company.last_sales;
                    wli_item["Earnings Date"] = company.last_report_date;
                }
                let research = rootState.UserResearch.mapUserResearch.find(r => wli_item.stock_id === r.stock_id);
                if (research) {
                    let d = new Date(research.last_update_date);
                    if (d > staleResearchDate) {
                        wli_item.research_state = "EXISTS";
                    } else {
                        wli_item.research_state = "EXISTS_BUT_STALE";
                    }
                } else {
                    wli_item.research_state = "MISSING";
                }

                commit("addWatchlistItems", wli_item);
                commit("setOneMapUserWatchlistItem", wli_item);
            }
        },
        async addWatchlistItemAction({ commit }, item) {
            try {
                // await ApiUserFun.WLIsave(item);
                await ApiService.WLIsave(item);
                commit("addWatchlistItem", item);

            } catch (error) {
                console.log("..." + error);
            }
        },
        async removeStocksFromWLJ({ commit }, obj) {
            await ApiUserFun.removeStocksFromWLs(obj);
            commit("removeWatchlistItem", obj);
        },
        async removeStocksFromWLI({ commit }, obj) {
            await ApiUserFun.removeStocksFromWLI(obj);
            commit("removeWatchlistItemFromWL", obj);
        },
        async loadUserWatchLists({ commit }, user_id) {
            let mapUserWatchlists = new Map();
            const watchLists = (await ApiService.fetchWatchlists(user_id)).data; // response data from backend


            await watchLists.forEach((watchlist) => {
                mapUserWatchlists.set(watchlist.watchlist_id, watchlist);
            });
            commit("setWatchlists", watchLists);
            commit("setMapUserWatchlists", mapUserWatchlists); // be aware the old code was setting setMapUserWatchlists to responseWatchLists ? dont know why
        },
        async loadUserWatchlistJoins({ commit }, user_id) {
            let mapUserWatchlistJoins = new Map();
            const watchListJoins = (await ApiService.fetchWatchlistJoins(user_id)).data; // response data from backend

            await watchListJoins.forEach((join) => {
                mapUserWatchlistJoins.set(join.watchlist_id, join);
            });
            commit("setWatchlistJoins", watchListJoins);
            commit("setMapUserWatchlistJoins", mapUserWatchlistJoins); // be aware the old code was setting setMapUserWatchlists to responseWatchLists ? dont know why
            if (watchListJoins.length != 0) {
                commit("setUserCurrentWatchlistId", watchListJoins[0].watchlist_id);
            }
        },

        async loadUserWatchListItems({ commit, rootState, dispatch }, user_id) {
            let mapUserWatchlistItems = new Map();
            let staleResearchDate = new Date();

            staleResearchDate.setMonth(staleResearchDate.getMonth() - 3);

            const userWatchListItems = (await ApiUserFun.fetchUserWatchlistItems(user_id)).data;
            let final_array = [];

            let company_id_array = [];
            userWatchListItems.map(item => company_id_array.push(item.company_id));

            await dispatch('loadCompanies', company_id_array, { root: true });
            await dispatch('loadStocks', company_id_array, { root: true });

            await userWatchListItems.forEach((item) => {

                let stock = rootState.Stocks.mapStocks.find(s => s.stock_id === item.stock_id);
                item.sector_name = stock ? stock.sector_name : "no sector name";
                item.sector_id = stock.sector_id;

                let company = rootState.Companies.mapCompanies.get(item.company_id);
                //                console.log("COMPANY =============== ")
                //              console.log(company);
                if (!!company) {
                    item.eps = company.last_eps_ttm;
                    item.sales = company.last_sales;
                    item["Earnings Date"] = company.last_report_date;
                }

                let research = rootState.UserResearch.mapUserResearch.find(r => item.stock_id === r.stock_id);
                if (research) {
                    let d = new Date(research.last_update_date);
                    if (d > staleResearchDate) {
                        item.research_state = "EXISTS";
                    } else {
                        item.research_state = "EXISTS_BUT_STALE";
                    }
                } else {
                    item.research_state = "MISSING";
                }
                final_array.push(item);
                mapUserWatchlistItems.set(item.watchlist_item_id, item);


            });
            commit("setWatchlistItems", final_array); // the fetched array from backend, no changes made to it
            commit("setMapUserWatchlistItems", mapUserWatchlistItems); // // Map keyed on watchlist_item_id
        },

        async setWatchlistColumns({ commit, rootState }, obj) {
            let user_data = JSON.parse(localStorage.user);
            let user_settings = JSON.parse(user_data.settings);
            user_settings.watchlistColumns = JSON.stringify(obj);
            user_data.settings = JSON.stringify(user_settings);

            const userSettings = {
                id: JSON.parse(localStorage.user).user_id,
                settings: user_data
            }
            await ApiService.addUserSettings(userSettings)
        }
    },
};