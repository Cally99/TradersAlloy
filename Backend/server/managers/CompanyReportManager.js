const Company = require('../models').Company;
const CompanyReport = require('../models').CompanyReport;
const CompanyReportPDF = require('../models').CompanyReportPDF;
const _ = require('lodash');
const log4js = require('log4js');
const logger = log4js.getLogger("app_log");
const healthCheck = log4js.getLogger("health");

const DB = require('../helpers/DB');
const connection = DB.getConnection();
const moment = require('moment');

module.exports = {

    /**
     * MILLISTREAM LOADING PROCESS
     *
     *  MISSING REPORTS of 30 days
     * */
    async getCompanyIdsNotReported() {
        return await connection.query(`
                            select sub.company_id, sub.period , sub.date_report, S.stock_id, S.name, S.currency_trade
                            from stock S,
                                 (select company_id, period, date_report
                                 from  company_calendar
                                 -- where date_report between CURRENT_DATE-INTERVAL '30 days' and  CURRENT_DATE 
                                 EXCEPT
                                 select company_id, period, date_report
                                 from  company_report
                                 --where date_report between CURRENT_DATE-INTERVAL '30 days' and  CURRENT_DATE ) sub
                            where S.company_id = sub.company_id
                            and   S.primary_listing = true
                            order by sub.company_id,sub.date_report
            `, { nest: false, type: connection.QueryTypes.SELECT });
    },

    async getCompanyIdsNotReported2018() {
        return await connection.query(`
                                select sub.company_id, sub.period , sub.date_report, S.stock_id, S.name, S.currency_trade
                                from stock S,
                                        (select company_id, period, date_report
                                        from  company_calendar_history
                                        where to_char(date_report, 'YYYY-MM-DD') < '2022-02-20'
                                        EXCEPT
                                        select company_id, period, date_report
                                        from  company_report) sub
                                where S.company_id = sub.company_id
                                and   S.primary_listing = true
                                order by sub.company_id,sub.date_report
            `, { nest: false, type: connection.QueryTypes.SELECT });
    },


/**
     * MILLISTREAM LOADING PROCESS
     *
     *  MISSING REPORTS of more than SEVEN DAYS LATE
     * */
    async getCompanyIdsMissingReports() {
        return await connection.query(`
            SELECT  C.company_id
            FROM    company  C, 
                    company_calendar  CC 
            LEFT JOIN company_report  CR 
                    ON CC.company_id = CR.company_id 
                    AND CC.period = CR.period
            WHERE CR.company_id IS NULL AND CR.period IS NULL
            AND   C.company_id = CC.company_id
            AND   CC.date_report <=  CURRENT_DATE            
            AND   CC.date_report >  CURRENT_DATE - INTERVAL '7 days'
            AND   C.status_flag is null
            ORDER BY CC.date_report
            `, { nest: false, type: connection.QueryTypes.SELECT });
    },


    async list() {
        return await CompanyReport.findAll();
    },

    async fetchCompanyReports(company_id) {
        return await CompanyReport.findAll({ where: { company_id } });
    },

    async getCompanyReport(company_id, period) {
        return await CompanyReport.findOne({ where: { company_id, period } });
    },

    /**
     * I suspect that whatever calls this is expecting trailing 12 months... (?) is this a bug?
     * */
    async companyReport_eps(company_id) {
        return await CompanyReport.findAll({ where: { company_id } });
    },


    async getLastReport(company_id) {
        try {

            const x = await connection.query(`
                    SELECT  period,
                            totalnumberofshares,
                            date_report,
                            eps,
                            sales,
                            gp,
                            ltliabilities,
                            curliabilities,
                            shequity,
                            ild
                    FROM   company_report CR
                    WHERE  CR.company_id = :company_id
                    AND    CR.period = (
                                select max(period)
                                FROM company_report
                                WHERE  company_id = :company_id
                                )
                    `, { replacements: { company_id }, type: connection.QueryTypes.SELECT, nest: false })

            return x;
        } catch (error) {
            console.log(error.message);
        }

    },

    async companyReportPDF(company_id) {
        return await connection.query(`
                SELECT distinct CRP.period,
                            CRP.pdf_link,
                            CRP.pdf_language,
                            CRP.period||'-ZZ' as period_sorted   -- hack to order the periods
                FROM    company_report CRP
                WHERE   CRP.company_id = :company_id
                ORDER BY 4
                `, { replacements: { company_id }, type: connection.QueryTypes.SELECT, nest: false })
    },

    async fetchFinancialsQuarterly(company_id) {
        return await connection.query(`
            SELECT  period,

                    sales,
                    sales - gp              AS costofgoodssold,
                    gp,
                    ebitda,
                    ebit,
                    ptp,
                    profit,
                    ibl,

                    intangibleasset,
                    fixedasset,
                    financialasset,
                    noncurrentasset,
                    cce,
                    currentassets - cce     AS othercurrentassets,
                    currentassets           AS totalcurrentassets,
                    totalassets,

                    shequity,
                    ltliabilities,
                    curliabilities,
                    ltliabilities + curliabilities              AS totalliabilities,
                    ltliabilities + curliabilities + shequity   AS totalequityandliabilities,
                    pdf_link,
                    pdf_language

            FROM company_report  CR
            WHERE   CR.company_id = :company_id
            AND     CR.type_report = 'Q'
            ORDER BY CR.period ASC
            `, { replacements: { company_id }, type: connection.QueryTypes.SELECT, nest: false })
    },

    async fetchFinancialsAnnual(company_id) {
        return await connection.query(`
            SELECT  period,

                    sales,
                    sales - gp              AS costofgoodssold,
                    gp,
                    ebitda,
                    ebit,
                    ptp,
                    profit,
                    ibl,

                    intangibleasset,
                    fixedasset,
                    financialasset,
                    noncurrentasset,
                    cce,
                    currentassets - cce     AS othercurrentassets,
                    currentassets           AS totalcurrentassets,
                    totalassets,

                    shequity,
                    ltliabilities,
                    curliabilities,
                    ltliabilities + curliabilities              AS totalliabilities,
                    ltliabilities + curliabilities + shequity   AS totalequityandliabilities,
                    pdf_link,
                    pdf_language

            FROM company_report  CR
            WHERE   CR.company_id = :company_id
            AND     CR.type_report = 'FY'
            ORDER BY CR.period ASC
            `, { replacements: { company_id }, type: connection.QueryTypes.SELECT, nest: false })
    },

    async fetchFinancials(company_id) {
        logger.info('fetchFinancials - all good here...');
        return await CompanyReport.findAll({ where: { company_id } })

    },

    async fetchEarningsDateNext(req, res) { /// TODO: fix this !
        return await connection.query(`
                SELECT
                    company_id,
                    date_report
                FROM    company_report
                WHERE date(date_report) > 'today'
                `, {

            type: connection.QueryTypes.SELECT,
            nest: false
        })
    },

    /**
     * MILLISTREAM LOADING PROCESS
     *
     *
     * Improved version without workarounds and cleaner signature
     * */
    async createCompanyReport(report) {

        try {
            if (report.eventlinklanguages) {
                if (report.eventlinklanguages.length > 2) {
                    report.eventlinklanguages = report.eventlinklanguages.substring(0, 2);
                }
            } else {
                report.eventlinklanguages = null;
            }
            return await CompanyReport.create({
                company_id: report.company_id,
                period: report.period,
                currency: report.currency,
                price: report.price,
                type_report: report.type_report,
                date_report: report.date_report,
                eps: report.eps,
                sales: report.sales,

                gp: report.gp,
                ptp: report.ptp,
                profit: report.np,
                ibl: report.ibl,

                ebitda: report.ebitda,
                ebit: report.ebit,

                intangibleasset: report.intangibleasset,
                fixedasset: report.fixedasset,
                financialasset: report.financialasset,
                noncurrentasset: report.noncurrentasset,
                cce: report.cce,
                currentassets: report.currentassets,
                totalassets: report.totalassets,

                costofgoodssold: report.costofgoodssold,
                shequity: report.shequity,
                ltliabilities: report.ltliabilities,
                curliabilities: report.curliabilities,
                totalliabilities: report.totalliabilities,
                totalequityandliabilities: report.totalequityandliabilities,

                totalnumberofshares: report.totalnumberofshares,
                pdf_link: report.eventlink,
                pdf_language: report.eventlinklanguages,
                created_at: report.date_report+' 12:00' // moment(new Date()).format('YYYY-MM-DD HH:mm'),
            });
        } catch (error) {

            throw error;
        }

    },

    async   updatePEandPSandEPS(report) {
        //console.log( ` :: ${report.ps} == ${report.price} / ${sales_ttm}` );
        const rowCount = await CompanyReport.update({
            eps_ttm: report.eps_ttm,
            pe: report.pe,
            ps: report.ps,
        }, { where: { company_id: report.company_id, period: report.period } })

        return rowCount[0];
    },

    async selectAllNullPE() {
        const rows = await connection.query(`
                    SELECT DISTINCT company_id -- price , totalnumberofshares, sales, eps_ttm, date_report
                    FROM   company_report CR
                    WHERE  pe is null OR ps is null
                    `, { type: connection.QueryTypes.SELECT, nest: false });
        return rows;
    },

    async selectAllNullPEByCompany(company_id) {
        const rows = await connection.query(`
                    SELECT CR.company_id, 
                            CR.period,
                            CR.type_report, 
                            CR.pe, 
                            CR.ps, 
                            CR.eps, 
                            CR.sales, 
                            CR.price, 
                            CR.currency, 
                            CR.date_report,
                            CR.totalnumberofshares
                    FROM   company_report CR
                    WHERE  CR.company_id = :company_id
                    `, { replacements: { company_id }, type: connection.QueryTypes.SELECT, nest: false });
        return rows;
    },

    async shouldHaveReported() {
        const missingReports = await connection.query(`
                select C.company_id, C.name, CC.period, CC.date_report, S.currency_trade as currency
                from company_calendar CC, company C, stock S 
                where CC.company_id = C.company_id
                and   S.company_id = C.company_id
                and   S.primary_listing = true
                and   CC.date_report < CURRENT_DATE
                and   not exists (select company_id
                                  from company_report CR
                                  where CC.company_id = CR.company_id
                                  and   CC.period = CR.period )
                  `, { type: connection.QueryTypes.SELECT, nest: false });
        return missingReports;
    },

    async checkCompanyReportPrice() {
        const nullPriceReports = await connection.query(`
                select CR.company_id, CR.period, CR.date_report, S.stock_id, S.name as stock_name, S.currency_trade as currency
                from    company_report CR, 
                        stock S 
                where S.company_id = CR.company_id
                and   S.primary_listing = true
                and   CR.price is null
                order by company_id, CR.date_report 
                  `, { type: connection.QueryTypes.SELECT, nest: false });
        return nullPriceReports;
    }


};
