const competitionManager = require('./../managers/CompetitionManager');
const userAccountHistoryManager = require('./../managers/UserAccountHistoryManager');

const moment = require('moment');

module.exports = {
    async getCompetitions() {
        return await competitionManager.getCompetitions();
    },


    async getUserCompetitions(user_id) {
        try {
            let userCompetitions = await competitionManager.getUserCompetitions(user_id);

            for (let i=0; i < userCompetitions.length; i++) {
                const competition_id = userCompetitions[i].competition_id;
                const user_account_id = userCompetitions[i].user_account_id;

                userCompetitions[i].chartData = await this.getCompetitionChartData(competition_id, user_account_id);
                userCompetitions[i].tableData = await competitionManager.getCompetitionLeaderBoard(competition_id);
            }

            return userCompetitions;

        } catch (e) {
            console.log(e.message);
        }
    },




    async getCompetitionChartData(competition_id, user_account_id) {
        const leaderHistory = await userAccountHistoryManager.getCompetitionChartLeader(competition_id);
        const averageHistory = await userAccountHistoryManager.getCompetitionChartAverage(competition_id);
        const userHistory = JSON.parse(JSON.stringify(await userAccountHistoryManager.getUserAccountHistory(user_account_id)));

        return this.restructureChartData(leaderHistory, averageHistory, userHistory);
    },

    restructureChartData(leaderHistory, averageHistory, userHistory) {
        try {
            if (!leaderHistory[0]) {
                console.log('user history[0] is undefined');
                return;
            }

            const leaderAccountName = leaderHistory[0].account_name;
            const minLeaderHistory = leaderHistory[0].day;
            const maxLeaderHistory = leaderHistory[leaderHistory.length - 1].day;
            const minAverageHistory = averageHistory[0].day;
            const maxAverageHistory = averageHistory[averageHistory.length - 1].day;
            const minUserHistory = userHistory[0].day;
            const maxUserHistory = userHistory[userHistory.length - 1].day;

            const minDay = new Date(
                            Math.min(
                                new Date(minLeaderHistory),
                                new Date(minAverageHistory),
                                new Date(minUserHistory) ))
                                .toISOString().substring(0,10);

            const maxDay = new Date(
                            Math.max(
                                new Date(maxLeaderHistory),
                                new Date(maxAverageHistory),
                                new Date(maxUserHistory) ))
                                .toISOString().substring(0,10);

            // console.log(new Date(minDay).toISOString().substring(0,10), ' --- ', new Date(maxDay).toISOString().substring(0,10 ));

            let allDays = [];
            let d = minDay;
            for (let i=0;i < 100 ; i++) {
                allDays.push(d);
                if (d === maxDay) {
                    break;
                }
                d = moment(new Date(d)).add(1, 'day').format('YYYY-MM-DD');
            }

            let merged = [];
            for (let d of allDays) {
                const l = leaderHistory.find(x => x.day === d);
                let lBalance = (l ? l.balance : 0);

                const a = averageHistory.find(x => x.day === d);
                let aBalance = (a ? parseInt(a.avg) : 0);

                const u = userHistory.find(x => x.day === d);
                let uBalance = (u ? u.balance : 0);
                merged.push({
                    date: d,
                    leader: lBalance,
                    average: aBalance,
                    my_balance: uBalance,
                });
            }

            // TODO: leaderAccountName: leaderAccountName,

            return merged;
            // return [
            //     {date: '2022-02-01', leader: 101100, average: 101800, my_balance: 101900},
            //     {date: '2022-02-02', leader: 101200, average: 101800, my_balance: 101900},
            //     {date: '2022-02-03', leader: 102000, average: 101800, my_balance: 101900},
            //     {date: '2022-02-04', leader: 102000, average: 101800, my_balance: 101900},
            //     {date: '2022-02-05', leader: 102000, average: 101800, my_balance: 101900},
            //     {date: '2022-02-06', leader: 102000, average: 101800, my_balance: 101900},
            //     {date: '2022-02-07', leader: 102000, average: 101800, my_balance: 101900},
            //     {date: '2022-02-08', leader: 102000, average: 101800, my_balance: 101900},
            //     {date: '2022-02-09', leader: 102000, average: 101800, my_balance: 101900},
            //     {date: '2022-02-10', leader: 102000, average: 101800, my_balance: 101900},
            //     {date: '2022-02-11', leader: 102000, average: 101800, my_balance: 101900},
            //     {date: '2022-02-12', leader: 102000, average: 101800, my_balance: 101900},
            //     {date: '2022-02-13', leader: 102000, average: 101700, my_balance: 101900},
            //     {date: '2022-02-14', leader: 102000, average: 101600, my_balance: 101900},
            //     {date: '2022-02-15', leader: 102100, average: 101500, my_balance: 101900},
            //     {date: '2022-02-16', leader: 102200, average: 101400, my_balance: 101900},
            //     {date: '2022-02-17', leader: 102300, average: 101000, my_balance: 102500},
            // ];

        } catch (e) {
            console.log(e);
        }
    }
};
