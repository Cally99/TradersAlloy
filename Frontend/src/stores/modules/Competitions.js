import ApiService from "../../Services/ApiService";
import UserAccount from "./UserAccount";
const moment = require('moment');

export default {
    state: {
        competitions: [],
        userCompetitions: [],
    },

    getters: {
        getCompetitions: (state) => {
            return state.competitions;
        },
        getUserCompetitions: (state)  => {
            return state.userCompetitions;
        },
    },

    mutations: {
        setCompetitions(state, payload) {
            state.competitions = payload;
        },
        setUserCompetitions(state, payload) {
            state.userCompetitions = payload;
        },
        setUserCompetitionAddOne(state, payload) {  // add one to the existing array
            state.userCompetitions.push(payload);
        },
    },

    actions: {
        async loadCompetitions({ commit } ) {
            const competitions = (await ApiService.getCompetitions()).data; // response data from backend
            commit("setCompetitions", competitions);

        },

        async loadUserCompetitions({ commit }, user_id ) {
            const userCompetitions = (await ApiService.getUserCompetitions(user_id)).data;
            const userCompetitionsWithStatus = userCompetitions.map( c => {
                c.status = competitionStatus(c.date_from, c.date_to);
                return c;
            });

            commit("setUserCompetitions", userCompetitionsWithStatus);

        },
    },
};

function competitionStatus (date_from, date_to){
    const today = new Date().toISOString().substring(0, 10);

    if ( today < date_from) {
        const start = moment(today, "YYYY-MM-DD");
        const end = moment(date_from, "YYYY-MM-DD");
        const daysToGo = moment.duration(end.diff(start)).asDays();
        return `Startar om ${daysToGo} dagar`;
    } else if ( today > date_to ) {
        return  "Completed"
    } else {
        return "Live"
    }
}



