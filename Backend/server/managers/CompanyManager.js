const Company = require('../models').Company;
const CompanyReport = require('../models').CompanyReport;
const CompanyCalendar = require('../models').CompanyCalendar;
const companyCalendarManager = require('../managers/CompanyCalendarManager');
const log4js = require('log4js');
const logger = log4js.getLogger("app_log");

const DB = require('../helpers/DB');
const connection = DB.getConnection();

module.exports = {

    // Do we want logging here? It shows up when doing unit test on the function
    async getCompaniesAndReports(company_id_array) {
        const deepObject = await Company.findAll({
            include: [
                { model: CompanyReport, attributes: ['company_id', 'date_report', 'period', 'pdf_link'] },
                { model: CompanyCalendar }
            ],
            where: { company_id: { in: company_id_array } }
            // limit: 10
            // logging: true,

        });

        return deepObject;

    },
    async get(company_id) {
        return await Company.findOne({ where: { company_id } });
    },

    async companiesAndReportONE(company_id) {
        const deepObject = await Company.findOne({
            include: [
                { model: CompanyReport, attributes: ['company_id', 'date_report', 'period', 'pdf_link'] },
                { model: CompanyCalendar }
            ],
            where: { company_id: company_id }
        });

        return deepObject;

    },
    async getCompaniesAll() {
        const deepObject = await Company.findAll();

        return deepObject;
    },

    async listStaleSummaryData() {
        return await connection.query(`
                SELECT  *
                FROM    company  C
                WHERE   (next_report_date < CURRENT_DATE 
                     OR next_report_date is null
                     OR last_report_date < CURRENT_DATE - INTERVAL '365 days'
                     OR last_report_date is null
                    )                    
            `, { nest: false, type: connection.QueryTypes.SELECT })
    },

    async list() {
        return await Company.findAll();
    },

    async minlist() {
        return await Company.findAll({
            attributes: [['name', 'name'], ['market_cap', 'market_cap'], ['last_report_date', 'last_report_date'], ['company_id', 'company_id']],
        });
    },

    async updateISINs(company_id, isins) {
        return await Company.update({ insider_trade_isins: isins }, { where: { company_id } });
    },

    async asyncget(company_id) {
        return await Company.findByPk(company_id);
    },

    async insert(company) {
        return await Company.create(company);
    },

    async textSearch(searchString) {
        return await connection.query(`
            SELECT  *
            FROM    company  C
            WHERE   C.description ILIKE :searchString
            `, { replacements: { searchString: '%' + searchString + '%' }, nest: false, type: connection.QueryTypes.SELECT });
    },

    /**
     *
     * */
    async getCompaniesDelisted() {
        return await connection.query(`
            SELECT  C.company_id, 
                    C.stock_id, 
                    C.name, 
                    C.status_flag
            FROM stock_delisted  C 
            `, { nest: false, type: connection.QueryTypes.SELECT, logging: false });
    },

    async updateCEOComments(company_id, ceo_comment) {
        const result = await Company.update({ ceo_comments: ceo_comment }, { where: { company_id, company_id } });
        if (result[0] != 0) {
            return result;
        } else {
            throw new Error(`updated zero rows - ${company_id}`);
        }

    },


    /**
     * MILLISTREAM LOADING PROCESS
     *
     * old
     * */
    async getCompaniesReportingNow() {
        logger.debug("Finding reports for companies that reported yesterday.");

        return await connection.query(`
                SELECT  CC.company_id,
                        CC.period,
                        CC.date_report,
                        CC.type_report
                FROM    company_calendar  CC
                WHERE   CC.date_report  =  CURRENT_DATE - integer '1'
            `, { nest: false, type: connection.QueryTypes.SELECT },

            //for reference: WHERE   CR.date_report  BETWEEN  CURRENT_DATE - integer '5'  AND  CURRENT_DATE
        );
    },

    /**
     * Status flag is used to capture status business information
     *
     * */
    async setStatusFlag(company_id, status_flag) {
        const rowsUpdated = await Company.update({ status_flag }, { where: { company_id } });
        return rowsUpdated[0];
    },

    /**
     * MILLISTREAM LOADING PROCESS
     *
     * currently defaults to EUR or zero
     *
     * - MarketCap is in EUR for comparisons
     * - other metrics are in the Conmpany currency - Avanza have this : where does Millistream have this ?
     * */
    async updateCompanyWithLatestReport(company_id, last_report_date, last_eps_ttm, last_sales, last_pe, market_cap, ceo_comments, next_report_date, last_np) {
        try {
            let rowsUpdated;

            rowsUpdated = await Company.update({
                market_cap,
                last_report_date,
                last_eps_ttm,
                last_sales,
                ceo_comments,
                last_pe,
                next_report_date,
                last_np
            }, {
                where: { company_id },
            });
            return rowsUpdated;

        } catch (error) {
            console.log(error.message)
        }
    },


};
