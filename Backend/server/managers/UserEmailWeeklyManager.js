const DB = require('../helpers/DB');
const connection = DB.getConnection();

module.exports = {
    async getEarningsForAllUsers() {
        const results = await connection.query(`
        SELECT  U.email,
                'PAST'              as time_group,
                CR.date_report,
                I.stock_id,
                I.ticker,
                I.company_id,
                I.name,
                CR.eps,
                CR.sales
        FROM    user_watchlist_item  as I,
                users                as U,
                company_report       as CR,
                (select  company_id , max(date_report) as REPORT_DATE
                    from company_report
                    where eps is not  null
                    and date_report > CURRENT_DATE - 10
                    group by company_id
                ) as sub
        WHERE     I.user_id = U.user_id
        AND      U.email_weekly = true        
        AND     I.company_id = CR.company_id
        AND     I.company_id = sub.company_id
        AND     CR.date_report = sub.REPORT_DATE
    UNION
        SELECT  U.email,
            'IMMINENT',
            sub.REPORT_DATE,
            I.stock_id,
            I.ticker,
            I.company_id,
            I.name,
            null,
            null
        FROM    user_watchlist_item  as I,
                users                as U,
                (select  company_id as COMPANY_ID, min(date_report) as REPORT_DATE
                    from company_calendar
                    where  date_report BETWEEN CURRENT_DATE AND CURRENT_DATE + 10
                    group by company_id
                ) as sub
        WHERE     U.user_id = I.user_id
        AND      U.email_weekly = true
        AND     I.company_id = sub.COMPANY_ID
        ORDER BY 1,2,3;
            `,
            {nest: false, type: connection.QueryTypes.SELECT },);
        return results;

    },


};
