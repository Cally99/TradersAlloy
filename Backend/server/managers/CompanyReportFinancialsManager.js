const Sequelize = require('sequelize');
const { Op } = require("sequelize");
const _ = require('lodash');
const cron = require('node-cron');
const log4js = require('log4js');
const logger = log4js.getLogger("health");

let sequelize;
let mapFinancials = new Map();
let arrayFinancials = [];
let arrayFinancials_years = [];


sequelize = new Sequelize(process.env.DB_database, process.env.DB_username, process.env.DB_password, {
    logging: false,
    host: 'localhost',
    dialect: 'postgres',
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
    },
    define: {
        timestamps: false,
        underscored: false,
        freezeTableName: true
    },
});

cron.schedule('0 22 * * *', () => {
    this.getFinancialsData();
    this.getFinancialsDataYear();
}, {
    scheduled: true,
    timezone: "Europe/Stockholm"
});

module.exports = {
    /** sends data for Overview and Financials tab (not screener)
     *
     * */
    async getFinancialsData() {
        try {
            const sequalizing = await sequelize.query(`
                SELECT company_id,
                period,
                date_report,
                eps,
                sales,
                sales - gp              AS costofgoodssold,
                gp,
                pe,
                ps,
                ebitda,
                ebit,
                ptp,
                profit,
                intangibleasset,
                fixedasset,
                financialasset,
                noncurrentasset,
                cce,
                currentassets - cce     AS othercurrentassets,
                currentassets,
                totalassets,
                price,

                shequity,
                ltliabilities,
                curliabilities,
                ltliabilities + curliabilities              AS totalliabilities,
                ltliabilities + curliabilities + shequity   AS totalequityandliabilities,
                pdf_link,
                pdf_language,
                eps_ttm,
                ibl,
                totalnumberofshares

            FROM company_report CR
            WHERE     CR.type_report = 'Q'
            ORDER BY CR.company_id ASC, CR.period ASC`, 
            { nest: false, replacements: {}, type: sequelize.QueryTypes.SELECT });
    
                let results = _(sequalizing)
                    .groupBy('company_id')
                    .map((item, key) => ({
                        company_id: _.map(item, 'company_id'),
                        period: _.map(item, 'period'),
                        date_report: _.map(item, 'date_report'),
                        eps: _.map(item, 'eps'),
                        sales: _.map(item, 'sales'),
                        profit: _.map(item, 'profit'),
                        pe: _.map(item, 'pe'),
                        ps: _.map(item, 'ps'),
                        gp: _.map(item, 'gp'),
                        ebitda: _.map(item, 'ebitda'),
                        ebit: _.map(item, 'ebit'),
                        ptp: _.map(item, 'ptp'),
                        intangibleasset: _.map(item, 'intangibleasset'),
                        fixedasset: _.map(item, 'fixedasset'),
                        financialasset: _.map(item, 'financialasset'),
                        noncurrentasset: _.map(item, 'noncurrentasset'),
                        cce: _.map(item, 'cce'),
                        othercurrentassets: _.map(item, 'othercurrentassets'),
                        currentassets: _.map(item, 'currentassets'),
                        totalliabilities: _.map(item, 'totalliabilities'),
                        totalequityandliabilities: _.map(item, 'totalequityandliabilities'),
                        totalassets: _.map(item, 'totalassets'),
                        shequity: _.map(item, 'shequity'),
                        ltliabilities: _.map(item, 'ltliabilities'),
                        curliabilities: _.map(item, 'curliabilities'),
                        totalnumberofshares: _.map(item, 'totalnumberofshares'),
                        pdf_link: _.map(item, 'pdf_link'),
                        pdf_language: _.map(item, 'pdf_language'),
                        price: _.map(item, 'price'),
                        eps_ttm: _.map(item, 'eps_ttm'),
                        ibl: _.map(item, 'ibl')
                    }))
                    .value()
                arrayFinancials = results;
                results.forEach(result => {
                    if (result.company_id[0]) {
                        mapFinancials.set(result.company_id[0], result);
                    }
                });
                return arrayFinancials;
        } catch (error) {
            (error => console.log('error', error));
        }
    },
    
    async getFinancialsDataYear() {
        try {
            const sequalizing = await sequelize.query(`
                SELECT company_id,
                    period,
                    date_report,
                    eps,
                    sales,
                    sales - gp              AS costofgoodssold,
                    gp,
                    pe,
                    ps,
                    ebitda,
                    ebit,
                    ptp,
                    profit,
                    intangibleasset,
                    fixedasset,
                    financialasset,
                    noncurrentasset,
                    cce,
                    currentassets - cce     AS othercurrentassets,
                    currentassets,
                    totalassets,
                    price,

                    shequity,
                    ltliabilities,
                    curliabilities,
                    ltliabilities + curliabilities              AS totalliabilities,
                    ltliabilities + curliabilities + shequity   AS totalequityandliabilities,
                    pdf_link,
                    pdf_language,
                    eps_ttm,
                    ibl,
                    totalnumberofshares

                FROM company_report CR
                WHERE     CR.type_report = 'FY'
                ORDER BY CR.company_id ASC, CR.period ASC`, 
                { nest: false, replacements: {}, type: sequelize.QueryTypes.SELECT });
            let results = _(sequalizing)
                .groupBy('company_id')
                .map((item, key) => ({
                    company_id: _.map(item, 'company_id'),
                    period: _.map(item, 'period'),
                    date_report: _.map(item, 'date_report'),
                    eps: _.map(item, 'eps'),
                    sales: _.map(item, 'sales'),
                    profit: _.map(item, 'profit'),
                    pe: _.map(item, 'pe'),
                    ps: _.map(item, 'ps'),
                    gp: _.map(item, 'gp'),
                    ebitda: _.map(item, 'ebitda'),
                    ebit: _.map(item, 'ebit'),
                    ptp: _.map(item, 'ptp'),
                    intangibleasset: _.map(item, 'intangibleasset'),
                    fixedasset: _.map(item, 'fixedasset'),
                    financialasset: _.map(item, 'financialasset'),
                    noncurrentasset: _.map(item, 'noncurrentasset'),
                    cce: _.map(item, 'cce'),
                    othercurrentassets: _.map(item, 'othercurrentassets'),
                    currentassets: _.map(item, 'currentassets'),
                    totalliabilities: _.map(item, 'totalliabilities'),
                    totalequityandliabilities: _.map(item, 'totalequityandliabilities'),
                    totalassets: _.map(item, 'totalassets'),
                    shequity: _.map(item, 'shequity'),
                    ltliabilities: _.map(item, 'ltliabilities'),
                    curliabilities: _.map(item, 'curliabilities'),
                    totalnumberofshares: _.map(item, 'totalnumberofshares'),
                    pdf_link: _.map(item, 'pdf_link'),
                    pdf_language: _.map(item, 'pdf_language'),
                    price: _.map(item, 'price'),
                    eps_ttm: _.map(item, 'eps_ttm'),
                    ibl: _.map(item, 'ibl')
                }))
                .value();
            arrayFinancials_years = results;
            return arrayFinancials_years;
        } catch (error) {
            (error => console.log('error', error));
        }
    },

    async getMapFinancialsData() {
        return mapFinancials;
    }
}
