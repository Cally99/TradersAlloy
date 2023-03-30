import ApiService from "../../Services/ApiService";

export default {
    state: {
        mapUserDiary: []
    },

    getters: {
        getMapUserDiary(state) {
            return state.mapUserDiary;
        }
    },

    mutations: {
        setMapUserDiary(state, payload) {
            state.mapUserDiary = payload;
        },
        addMapUserDiaryItem(state, payload) {
            state.mapUserDiary.push(payload);
        },
        updateMapUserDiaryItem(state, payload) {
            var index = state.mapUserDiary.findIndex(item => item.diary_item_id === payload.diary_item_id);
            if (index > -1) {
                state.mapUserDiary[index][payload.key] = payload[payload.key];
            }
            if (payload.diary_item_id == -1) { // input tag - background
                state.mapUserDiary.push(payload);
            }
        },
        removeMapUserDiaryItem(state, payload) {
            state.mapUserDiary = state.mapUserDiary.filter(item => item.diary_item_id !== payload);
        }
    },

    actions: {
        async loadUserDiary({ commit }, user_id) {
            const diaryItems = await ApiService.selectDiaryItems(user_id);
            commit("setMapUserDiary", diaryItems);
        }
    }
};