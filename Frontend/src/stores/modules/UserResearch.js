import ApiService from "../../Services/ApiService";
import UserWatchList from './UserWatchList';
import moment from 'moment';

export default {
    state: {
        mapUserResearch: [],
        remained_researches: 9,
        default_value:
            '<p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;"><strong><span style="color: rgb(84, 172, 210); font-size: 14px;">Verksamheten</span></strong></span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000; min-height: 15.0px;"><br></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;"><strong><span style="color: rgb(84, 172, 210);">3 anledningar till att bolaget är intressant&nbsp;</span></strong></span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000; min-height: 14.0px;"><br></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;"><strong><span style="color: rgb(84, 172, 210);">Investeringstes</span>&nbsp;</strong></span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000; min-height: 14.0px;"><br></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;"><strong><span style="color: rgb(84, 172, 210);">Marknad</span></strong></span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000; min-height: 14.0px;"><br></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;"><strong><span style="color: rgb(84, 172, 210);">Konkurrens</span></strong>&nbsp;</span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000; min-height: 14.0px;"><br></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;"><strong><span style="color: rgb(84, 172, 210); font-size: 14px;">Ledning</span></strong>&nbsp;</span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000; min-height: 14.0px;"><br></p><p style="margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;"><strong><span style="color: rgb(84, 172, 210); font-size: 14px;">Risker</span></strong>&nbsp;</span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000; min-height: 15.0px;"><br></p>',
    },

    getters: {
        getResearchs(state) {
            return state.mapUserResearch;
        },
        getResearchStaleCount(state) {
            const count = state.mapUserResearch.reduce( (count , r) => {
                const bestBeforeDate = moment(r.last_update_date).add(3, 'M');
                return (bestBeforeDate < new Date() ? count+1 : count);
            }, 0);

            return count;
        },
    },

    mutations: {
        setMapUserResearch(state, payload) {
            state.mapUserResearch = payload;
        },
        addResearchs(state, item) {
            let research_index = state.mapUserResearch.findIndex(r => r.stock_id === item.stock_id);
            if (research_index > -1) {
                state.mapUserResearch[research_index].content = item.content;
            } else {
                state.mapUserResearch.push(item);
            }

            let item_index = UserWatchList.state.watchlistItems.findIndex(WL => WL.stock_id === item.stock_id);
            if (item_index > -1) {
                UserWatchList.state.watchlistItems[item_index].research_state = "EXISTS";
            }
        },
    },

    actions: {
        async loadUserResearch({commit, state}, user_id) {
            // let mapUserResearch = new Map();
            const responseMapUserResearch = (await ApiService.fetchResearchData(user_id)).data;
            let final_array = responseMapUserResearch;


            for (var i = 0; i < responseMapUserResearch.length; i++) {
                let result = responseMapUserResearch[i].content.localeCompare(state.default_value);
                if (result === 0) {
                    final_array.splice(i, 1);
                }
            }
            // if (JSON.parse(localStorage.user).subscription_id != null) {
            commit("setMapUserResearch", final_array);
            // } else {
            //     var final_array_unsubscription = [];
            //     if (final_array.length >= 10) {
            //         for (var k = 0; k < 10; k++) {
            //             final_array_unsubscription.push(final_array[k]);
            //         }
            //         commit("setMapUserResearch", final_array_unsubscription);
            //     } else {
            //         commit("setMapUserResearch", final_array);
            //     }
            // }
        },
    },
};
