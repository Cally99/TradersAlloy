const Company = require('../models').Company;
const CompanyReport = require('../models').CompanyReport;
const companyManager = require("../managers/CompanyManager.js");

const log4js = require('log4js');
const logger = log4js.getLogger("app_log");

const DB = require('../helpers/DB');
const connection = DB.getConnection();

module.exports = {
    async getCompaniesWithNoFutureEvents() {
        return await connection.query(`
                SELECT  C.company_id, C.name
                FROM    company  C, company_calendar  CC
                WHERE   C.company_id = CC.company_id
                GROUP BY  C.name, C.company_id
                HAVING   max(CC.date_report) < CURRENT_DATE
            `, {nest: false, type: connection.QueryTypes.SELECT});
    },

    /**
     * Reporting today INCLUDING THE REPORTS as they appear
     * */
    async getCompaniesReportingToday() {
        return await connection.query(`
            SELECT  C.company_id, C.name, CC.date_report, CC.period, CR.type_report, CR.currency, CR.eps, CR.sales, CR.pdf_language, CR.pdf_link,
                    CR.price, CR.pe, CR.ps, CR.eps_ttm 
            FROM    company  C,   
                    company_calendar  CC 
            LEFT JOIN company_report  CR 
                    ON CC.company_id = CR.company_id 
                    AND CC.period = CR.period
            WHERE  C.company_id = CC.company_id
            AND    CC.date_report = CURRENT_DATE
            ORDER BY CC.date_report
            `, {nest: false, type: connection.QueryTypes.SELECT});
        // This can eb used to get the week of events
        // -- AND   CC.date_report <  date_trunc('week', CURRENT_DATE) +INTERVAL'5days'
        // -- AND   CC.date_report >  date_trunc('week', CURRENT_DATE) -INTERVAL'1days'

    },

    /**
     *  profile of how many companies report each day in the next 60 days
     * */
    async getCompaniesReportingCount60() {
        return await connection.query(`
                SELECT  CC.date_report, count(*) as counted   
                FROM    company_calendar  CC
                WHERE   CC.date_report < CURRENT_DATE + integer '60'  
                AND     CC.date_report > CURRENT_DATE - 1  
                GROUP BY CC.date_report
                ORDER BY CC.date_report
            `, {nest: false, type: connection.QueryTypes.SELECT});
    },



    //Andrew code
    async getCompaniesReportingNow() {
        logger.debug("Finding reports for companies that reported yesterday.");

        return await connection.query(`
                SELECT  CC.company_id,
                        CC.period,
                        CC.date_report,
                        CC.type_report
                FROM    company_calendar  CC
                WHERE   CC.date_report  =  CURRENT_DATE - integer '1'
            `, {nest: false, type: connection.QueryTypes.SELECT},

            //for reference: WHERE   CR.date_report  BETWEEN  CURRENT_DATE - integer '5'  AND  CURRENT_DATE
        );
    },

    async companyReportHoles () {
        const gp_null = await connection.query(`
                        select CR.company_id, CR.period, C.name, SE.name, CR.gp, '!!! gp'
                        from   company_report CR, company C, stock_exchange SE, stock S
                        where  (gp is null or gp = 0 )
                        and    CR.company_id = C.company_id
                        and    S.company_id = C.company_id
                        and    S.stock_exchange_id = SE.id
                        order by 1,2        
        `,  {nest: false, type: connection.QueryTypes.SELECT});

        const sales_null = await connection.query(`
                        select CR.company_id, CR.period, C.name, SE.name, CR.sales, '!!! sales'
                        from   company_report CR, company C, stock_exchange SE, stock S
                        where  (sales = 0 OR sales is null)
                        and    CR.company_id = C.company_id
                        and    S.company_id = C.company_id
                        and    S.stock_exchange_id = SE.id
                        order by 1,2        
        `,  {nest: false, type: connection.QueryTypes.SELECT});

        const ibl_null = await connection.query(`
                        select CR.company_id, CR.period, C.name, SE.name, CR.ibl, '!!! ibl'
                        from   company_report CR, company C, stock_exchange SE, stock S
                        where  (ibl = 0 OR ibl is null)
                        and    CR.company_id = C.company_id
                        and    S.company_id = C.company_id
                        and    S.stock_exchange_id = SE.id
                        order by 1,2        
        `,  {nest: false, type: connection.QueryTypes.SELECT});

        const price_null = await connection.query(`
                        select CR.company_id, CR.period, C.name, SE.name, CR.price, '!!! price'
                        from   company_report CR, company C, stock_exchange SE, stock S
                        where  (price = 0 OR price is null)
                        and    CR.company_id = C.company_id
                        and    S.company_id = C.company_id
                        and    S.stock_exchange_id = SE.id
                        order by 1,2        
        `,  {nest: false, type: connection.QueryTypes.SELECT});

        const ebit_null = await connection.query(`
                        select CR.company_id, CR.period, C.name, SE.name, CR.ebit, CR.ebitda, '!!! ebit / ebitda'
                        from   company_report CR, company C, stock_exchange SE, stock S
                        where  (ebit = 0 OR ebit is null OR ebitda = 0 OR ebitda is null )
                        and    CR.company_id = C.company_id
                        and    S.company_id = C.company_id
                        and    S.stock_exchange_id = SE.id
                        order by 1,2        
        `,  {nest: false, type: connection.QueryTypes.SELECT});

        const pdf_null = await connection.query(`
                        select CR.company_id, CR.period, C.name, SE.name, CR.pdf_link, '!!! PDF'
                        from   company_report CR, company C, stock_exchange SE, stock S
                        where  (pdf_link is null)
                        and    CR.company_id = C.company_id
                        and    S.company_id = C.company_id
                        and    S.stock_exchange_id = SE.id
                        order by 1,2        
        `,  {nest: false, type: connection.QueryTypes.SELECT});

        const allHoles = [...gp_null, ...sales_null, ...ibl_null, ...pdf_null, ...ebit_null, ...price_null] ;
        return allHoles;

    }



};
