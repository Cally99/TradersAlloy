const company = require("../models/Company.js");
const CompanyCalendar = require("../models/CompanyCalendar.js");
const millistreamReportService = require("../loaders/MillistreamReportService.js");
const stockManager = require('../managers/StockManager');
const companyManager = require("../managers/CompanyManager.js");
const companyReportManager = require("../managers/CompanyReportManager.js");
const companyCalendarManager = require("../managers/CompanyCalendarManager.js");
const backofficeCompanyManager = require ("../managers/BackofficeCompanyManager.js");
const healthManager = require ("../managers/HealthManager.js");
const logFileManager = require ("../managers/LogFileManager.js");


const millistreamManager = require("../managers/MillistreamManager.js");
const log4js = require('log4js');
const logger = log4js.getLogger("app_log");
const healthCheck = log4js.getLogger("health");

module.exports = {
    /** This is a verison of the CRON job, but this gets all outstanding reports that we are missing , rather than
     * today's reports... otherwise it is the same as found in MillistreamReportService.
     *
     * */
    async getMissingReports() {
        let results = [];
        logger.info('Millistream  MISSING');
        const events = []; //await millistreamReportService.getCompaniesMissingReports();
        for (const e of events) {
            const message = await millistreamReportService.getReportFromMillistream(e.company_ref, e.period);
            results.push(message);
            logger.info(`Looking for MISSING reports: 
                                        ${message.type} : 
                                        ${message.text} : 
                                        ${e.company_ref} for period ${e.period} 
                                        ${e.name} 
                                        (expected on ${e.date_report}) `);
        };
        return results;
    },

    async getCompanyDataDump() {
        // compile many sources of data into one return.
        const companiesReportingToday = await backofficeCompanyManager.getCompaniesReportingToday();

        const companiesWithNoFutureEvents = await backofficeCompanyManager.getCompaniesWithNoFutureEvents();

        const companiesReportingCount60 = await backofficeCompanyManager.getCompaniesReportingCount60();

        const companiesReportMissing = await companyReportManager.getCompanyIdsMissingReports();

        const companiesDelisted = await companyManager.getCompaniesDelisted();

        const dataLoad = await logFileManager.getDataLoad();
        const dataLoadScheduled = await logFileManager.getDataLoadScheduled();
        const merged = [...dataLoad.concat(dataLoadScheduled).reduce((m, o) =>
                m.set(o.date_report, Object.assign(m.get(o.date_report) || {}, o))
            , new Map()).values()];

        const loadedVsExpectedReports = merged.map(d => {return {date_report:d.date_report, reports:d.reports, events:  Number(d.events)- Number(d.reports)}});
        loadedVsExpectedReports.sort( (a, b) => {
            if (a.date_report < b.date_report) {
                return -1
            }
            if (a.date_report > b.date_report) {
                return 1
            }
            return 0;
        });



        let next60days = [];
        let next60daysCount = [];
        companiesReportingCount60.forEach((record,i) => {
            next60days.push( i); //record.date_report);
            next60daysCount.push(parseInt(record.counted) );
        });


        let dataDump = {
            companiesWithNoFutureEvents: companiesWithNoFutureEvents,
            companiesReportingToday: companiesReportingToday,
            companiesReportMissing: companiesReportMissing,
            companiesDelisted: companiesDelisted,
            companiesReportingCount60_date_report: next60days,
            companiesReportingCount60_count: next60daysCount,
            reported_yesterday: [],
            reporting_errors: [],
            loadedVsExpectedReports: loadedVsExpectedReports,
        };


//        console.log('-----');
//        console.log(dataDump);
//        console.log('-----');
        return dataDump;
    },


    async dataIntegrityProcessStale () {
        const yesterday = moment(new Date).subtract(1, 'day').format('YYYY-MM-DD');
        const oneYearAgo = moment(new Date).subtract(365, 'day').format('YYYY-MM-DD');

        const staleCompanies = await companyManager.listStaleSummaryData();
        const noLastReport = staleCompanies.filter(r => r.last_report_date === null);
        const veryOldLastReport = staleCompanies.filter(r => r.last_report_date < oneYearAgo);
        const noNextReport = staleCompanies.filter(r => r.next_report_date === null);
        const nextReportDateWasYesterday = staleCompanies.filter(r => r.next_report_date < yesterday);

        for (let company of staleCompanies) {
            const companyReports = await companyReportManager.fetchCompanyReports(company.company_id);
            const lastReportDate = companyReports.reduce( (max, r ) =>
                (r.date_report > max ? r.date_report: max)
            );

            const nextReportDate = await companyCalendarManager.getNextReport(company.company_id);

            companyManager.updateCompanyWithLatestReport(
                company_id,
                last_report_date,
                last_eps_ttm,
                last_sales,
                last_pe,
                market_cap,
                ceo_comments,
                next_report_date,
                last_np)
        }
        // Check the company has the last and next summary data
        const company = await companyManager.get(pk.company_id);
        if (company.last_report_date === null) {
            logger.info(`--- UPDATING COMPANY -- patching`);
            logger.info (reports.map( r => r.date_report));

            const companyReports = await companyReportManager.fetchCompanyReports(pk.company_id);
            const latestDate =  companyReports.reduce( (max, r) => (r.date_report > max ? r.date_report: max) );
            const latestCompanyReport  = companyReports.find( r => r.date_report === latestDate );
            await this.postProcessUpdateCompany(latestCompanyReport);
        }
    },


    async getDataIntegrity () {
        let dataDump = {};
        dataDump.waitingForLateReport = await healthManager.getWaitingForLateReport();
        dataDump.pricesTwoDaysLate = await healthManager.getPricesTwoDaysLate();
        dataDump.mostPricesUpdated = await healthManager.getMostPricesUpdated();
        dataDump.companiesWithNoReports = await healthManager.getCompaniesWithNoReports();
        dataDump.eventsOfMillistreamWeDoNotHave = await healthManager.getEventsOfMillistreamWeDoNotHave();
        dataDump.delistedStocks = await healthManager.getDelistedStocks();
        dataDump.stocksWithNoCompany = await healthManager.getStocksWithNoCompany();
        dataDump.dateReportIsNull = await healthManager.getDateReportIsNull();
        dataDump.ePSIsNull = await healthManager.getEPSIsNull();
        dataDump.stocksWithNoSector = await healthManager.getStocksWithNoSector();





        return dataDump;
    },

};
