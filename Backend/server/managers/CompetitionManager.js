const Competition = require('../models').Competition;
const UserAccount = require('../models').UserAccount;
const DB = require('../helpers/DB');
const connection = DB.getConnection();


module.exports = {
    async getCompetitions() {
        const competitions = await Competition.findAll();
        return competitions;
    },

    async getUserCompetitions(user_id) {
        try {
            let userCompetitions =  await connection.query(`
                            select    UA.user_id
                                     ,UA.user_account_id
                                     ,UA.account_name
                                     ,UA.cash
                                     ,UA.currency
                                     ,UA.nominal_position_size
                                     ,C.competition_id
                                     ,C.date_from
                                     ,C.date_to
                                     ,C.banner_image
                                     ,C.banner_color
                                     ,C.banner_background
                                     ,C.svg_icon
                                     ,C.title
                            from user_account UA , sys_competition C
                            where C.competition_id = UA.competition_id
                            and UA.competition_id is not null 
                            and UA.user_id = :user_id;
        `, {replacements: {user_id}, nest: false, type: connection.QueryTypes.SELECT});

            return userCompetitions;

        } catch (error) {
            console.log(error);
        }

    },

    async getCompetitionLeaderBoard(competition_id) {
        const participants = await connection.query(`
                    SELECT  UA.account_name, 
                            UA.user_account_id,  
                            UAH.balance, 
                            UAH.exposure, 
--                            (select '{stock_id:'||stock_id||',ticker:"'||ticker||'"}'
                            (select ticker
                                 from    user_trade 
                                 where   user_account_id = UA.user_account_id
                                 and     exit_date is null
                                 order by ENTRY_qty*EXIT_price DESC 
                                 limit 1)  as top_holding
                    FROM        user_account UA 
                                LEFT JOIN   user_account_history UAH 
                                ON          UAH.user_account_id = UA.user_account_id 
                                AND         UAH.day = (select max(day) 
                                                        from user_account_history
                                                        where UA.competition_id = :competition_id)         
                    WHERE       UA.competition_id = :competition_id
                    order by balance DESC;
        `, { replacements: {competition_id}, nest: false, type: connection.QueryTypes.SELECT });
        return participants;
    },


    async getCompetitionLeaderBoard_sequelize(competition_id) {
        const participants = await UserAccount.findAll({
            where: { competition_id: competition_id },
            attributes: ['account_name', 'balance'],
            order:   [['balance', 'DESC']],
        });
        return participants
    }
};



