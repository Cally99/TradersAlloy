import ApiService from "../../Services/ApiService";

export default {
    state: {
        mapSectors: [],
        sectors: [],
        allSectors: []
    },

    getters: {
        getMapSectors(state) {
            return state.mapSectors;
        },

        getSectors(state) {
            return state.sectors;
        },

        getAllSectors(state) {
            return state.allSectors;
        },

        getSectorsTree(state) {
            // add "locked=true" to stock
            const recallMap = function(obj) {
                return obj.map(itr => {
                    if (itr.children) {
                        itr.children = recallMap(itr.children);
                    } else {
                        itr.locked = true;
                    }
                    return itr;
                })
            }
            const initArr = recallMap(state.sectors);


            const { tree } = initArr.reduce((acc, curr) => {
                if (acc.parentMap[curr.parentid]) {

                    (acc.parentMap[curr.parentid].children = acc.parentMap[curr.parentid].children || []).push(curr);
                } else {
                    acc.tree.push(curr);
                }
                acc.parentMap[curr.id] = curr;
                return acc;
            }, { parentMap: {}, tree: [] });
            tree.sort((a, b) => a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1) // sort Ascending
            return tree;
        }

    },
    mutations: {
        setMapSectors(state, payload) {
            state.mapSectors = payload;
        },

        setSectors(state, payload) {
            state.sectors = payload;
        },

        setAllSectors(state, payload) {
            state.allSectors = payload;
        }
    },

    actions: {
        async loadSectors({ commit }) {
            let mapSectors = new Map();
            const sectors = (await ApiService.fetchSectors()).data;
            commit("setSectors", sectors);
            await sectors.forEach((sector) => {
                mapSectors.set(sector.id, sector);
            });
            commit("setMapSectors", mapSectors); // Map keyed on the sector_id
        },

        async loadAllSectors({commit}) {
            const sectors = (await ApiService.getAllSectors()).data;
            commit("setAllSectors", sectors);
        }
    },
};
