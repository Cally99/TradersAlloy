const UserAccountHistory = require('../models').UserAccountHistory;
const DB = require('../helpers/DB');
const connection = DB.getConnection();

module.exports = {

    async createUserAccountHistory(userAccountHistory) {
        await UserAccountHistory.create(userAccountHistory, {});
    },

    async getUserAccountHistory(user_account_id) {
        return await UserAccountHistory.findAll({ where: { user_account_id } });
    },

    async getCompetitionChartAverage(competition_id) {
        const participants = await connection.query(`
                select  day, round(avg(UAH.balance)) as avg
                from    user_account UA,
                        user_account_history UAH
                WHERE   UAH.user_account_id = UA.user_account_id
                AND     UA.competition_id = :competition_id
                group by day
                order by day;

            `, { replacements: {competition_id}, nest: false, type: connection.QueryTypes.SELECT });

        return participants;
    },

    async getCompetitionChartLeader(competition_id) {
        return  await connection.query(`
                SELECT  UA.account_name, UAH.day, UAH.balance
                FROM    user_account UA,
                        user_account_history UAH
                WHERE   UAH.user_account_id = UA.user_account_id
                AND     UA.competition_id = :competition_id
                AND     UA.user_account_id = (  select sub.user_account_id
                                                from   user_account_history sub, user_account t
                                                where sub.day = (select max(day) 
                                                                    from user_account_history           
                                                                    where UA.competition_id = :competition_id)
                                                and sub.user_account_id = t.user_account_id
                                                and t.competition_id = :competition_id
                                                order by sub.balance DESC
                                                limit 1);
            `, { replacements: {competition_id}, nest: false, type: connection.QueryTypes.SELECT });

    },


};
