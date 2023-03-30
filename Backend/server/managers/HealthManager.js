const CompanyCalendarHistory = require('../models').CompanyCalendarHistory;
const companyCalendarManager = require('../managers/CompanyCalendarManager');
const companyManager = require('../managers/CompanyManager');
const millistreamManager = require('../managers/MillistreamManager');



const DB = require('../helpers/DB');
const connection = DB.getConnection();

const log4js = require('log4js');
const logger = log4js.getLogger("app_log");
const healthCheck = log4js.getLogger("health");

const moment = require('moment');

module.exports = {


    async getWaitingForLateReport() {
        const rows = await connection.query(`
                        select C.company_id, C.name, CC.period, CC.date_report, CURRENT_DATE-CC.date_report as days_late, SE.name as exchange_name 
                        from    company_calendar CC, 
                                company C, 
                                stock S, 
                                stock_exchange SE
                        where CC.company_id = C.company_id
                        and   S.company_id = C.company_id
                        and   SE.id = S.stock_exchange_id
                        and   S.primary_listing = true
                        and   CC.date_report < CURRENT_DATE
                        and   not exists (select company_id
                                          from company_report CR
                                          where CC.company_id = CR.company_id
                                          and   CC.period = CR.period )
                        ORDER BY days_late DESC;
                `,{ type: connection.QueryTypes.SELECT, nest: false });
        return rows;
    },

    async getPricesTwoDaysLate() {
        const days = [
            {today: 'Tuesday',   problemDate: moment(new Date()).subtract(2, 'days').format('YYYY-MM-DD')},
            {today: 'Wednesday', problemDate: moment(new Date()).subtract(2, 'days').format('YYYY-MM-DD')},
            {today: 'Thursday',  problemDate: moment(new Date()).subtract(2, 'days').format('YYYY-MM-DD')},
            {today: 'Friday',    problemDate: moment(new Date()).subtract(2, 'days').format('YYYY-MM-DD')},
            {today: 'Saturday',  problemDate: moment(new Date()).subtract(2, 'days').format('YYYY-MM-DD')},
            {today: 'Sunday',    problemDate: moment(new Date()).subtract(3, 'days').format('YYYY-MM-DD')},
            {today: 'Monday',    problemDate: moment(new Date()).subtract(4, 'days').format('YYYY-MM-DD')},
        ];
        const problemDate = (days.find( d => d.today === moment(new Date()).format('dddd'))).problemDate;

        const rows = await connection.query(`
                        select price_updated, name, stock_id, CURRENT_DATE-price_updated as days_late
                        from stock
                        where price_updated < :problemDate
                        order by 1;
                `,{ replacements: {problemDate}, type: connection.QueryTypes.SELECT, nest: false });
        return rows;
    },

    async getMostPricesUpdated() {
        const rows = await connection.query(`
                        select to_char(price_updated, 'Day') as day, count(*)
                        from stock
                        group by 1
                        order by 2 DESC
                        limit 1;
                `,{ type: connection.QueryTypes.SELECT, nest: false });
        return rows;
    },

    async getCompaniesWithNoReports() {
        const rows = await connection.query(`
                        select company_id , name , 'add created_at' as created_at
                        from company
                        where company_id in (
                            select company_id from company
                        EXCEPT
                        select distinct (company_id) from company_report);
                `,{ type: connection.QueryTypes.SELECT, nest: false });
        return rows;
    },

    async getEventsOfMillistreamWeDoNotHave() {
        const rows = await connection.query(`
                        select CCH.company_id, CCH.period, C.name
                        from company C,
                             company_calendar_history CCH
                                LEFT JOIN company_report CR 
                                ON   CR.company_id = CCH.company_id
                                AND  CR.period = CCH.period
                        WHERE C.company_id = CCH.company_id
                `,{ type: connection.QueryTypes.SELECT, nest: false });
        return rows;
    },


    async getDelistedStocks() {
        const rows = await connection.query(`
                        select stock_id, company_id,name, status_flag
                        from stock_delisted
                `,{ type: connection.QueryTypes.SELECT, nest: false });
        return rows;
    },

    async getStocksWithNoCompany() {
        const rows = await connection.query(`
                        select stock_id , name
                        from stock
                        where company_id in (
                            select company_id from stock
                            EXCEPT
                            select distinct (company_id) from company)
                `,{ type: connection.QueryTypes.SELECT, nest: false });
        return rows;
    },

    async getDateReportIsNull() {
        const rows = await connection.query(`
                        select name, period, CR.company_id
                        from company_report CR, company C
                        where date_report is null
                        and C.company_id = CR.company_id;
                `,{ type: connection.QueryTypes.SELECT, nest: false });
        return rows;
    },
    async getEPSIsNull() {
        const rows = await connection.query(`
                        select name, period,  CR.company_id, eps, ps, pe, price
                        from company_report CR,
                            company C
                        where (eps is null or price is null or ps is null or ps is null)
                        and C.company_id = CR.company_id;
                `,{ type: connection.QueryTypes.SELECT, nest: false });
        return rows;
    },

    async getStocksWithNoSector() {
        const rows = await connection.query(`
                        select S.name, S.company_id, S.stock_id, S.primary_listing, SE.name  as exchange_name
                        from   stock S, stock_exchange SE
                        where S.sector_id = 0 
                        and SE.id = S.stock_exchange_id
                        order by 4;
                `,{ type: connection.QueryTypes.SELECT, nest: false });
        return rows;
    },







/// -- -

    async noEvents6months () {
        const rows = await connection.query(`
                                select C.company_id, C.name, max(CC.date_report) as max_date_report
                                from company C, company_calendar CC
                                where C.company_id not in (
                                        select  company_id
                                        from company_calendar
                                        where date_report between CURRENT_DATE and CURRENT_DATE+180
                                )
                                and C.company_id = CC.company_id
                                group by 1,2
                                order by 1
                `,{ type: connection.QueryTypes.SELECT, nest: false })

        return rows;
    },

    /*
        stock_id |                    name                     | price_updated
    ----------+---------------------------------------------+---------------
    1704 | Clas Ohlson B                               | 2022-01-24
    2295 | Eastnine                                    | 2022-01-24
    1703 | Cloetta                                     | 2022-01-24
    1691 | cBrain                                      | 2022-01-25
    1521 | BioPorto                                    | 2022-01-25
    2671 | Eurocine Vaccines                           | 2022-01-24
    1983 | Danske Bank                                 | 2022-01-25
    1713 | Columbus                                    | 2022-01-25
    2013 | Djurslands Bank                             | 2022-01-25
    2000 | DFDS                                        | 2022-01-25
    */
    async checkUpdatedPricesHistory() {
        return await connection.query(`
                            select price_updated, count(*) as count
                            from stock
                            group by price_updated
            `, { nest: false, type: connection.QueryTypes.SELECT })
    },


    async stocksWithStalePrice() {
        let todayOrYesterday;
        if (moment(new Date(), "hh", true) > 19) {
            todayOrYesterday = new Date().toISOString().substring(0,10);
        } else {
            todayOrYesterday = moment(new Date).subtract(1, 'day').format('YYYY-MM-DD');
        }

        const problemPrices = await connection.query(`
                            select stock_id, name, price_updated
                            from stock
                            where price_updated != :todayOrYesterday
            `, { replacements: todayOrYesterday, nest: false, type: connection.QueryTypes.SELECT })

        return problemPrices;
    },


    async stocksWithFreshPrice() {
         const todayOrYesterday = new Date().toISOString().substring(0,10);

        const problemPrices = await connection.query(`
                            select count(*)
                            from stock
                            where price_updated >= :todayOrYesterday
            `, { replacements: todayOrYesterday, nest: false, type: connection.QueryTypes.SELECT })

        return problemPrices;
    },

    async notUpdatedToday(today) {
        return await connection.query(`
                            select price_updated, ticker, name
                            from stock
                            where price_updated != :today
                            order by 1 desc
            `, { nest: false, replacements: { today: today }, type: connection.QueryTypes.SELECT })
    },

    async companiesWithNoReports() {
        return await connection.query(`
            select name from company
            where company_id in (
                    select company_id from company
                    EXCEPT
                    select distinct (company_id) from company_report)
            `, { nest: false,  type: connection.QueryTypes.SELECT })
    },

    /*

    healthCheck.info(`Prices not updated:`);
    const notUpdatedToday = await stockManager.notUpdatedToday(today);
    for (const anomaly of notUpdatedToday) {
        healthCheck.info(`${anomaly.price_updated} ${anomaly.ticker} ${anomaly.name}`);
    }
    */


};
