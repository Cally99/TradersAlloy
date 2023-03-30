const companyManager = require("../managers/CompanyManager");
const companyReportFinancialsManager = require("../managers/CompanyReportFinancialsManager");

const log4js = require('log4js');
const logger = log4js.getLogger("app_log");

const { promisify } = require('util');
const redis = require('redis');
const StripeController = require("../controllers/StripeController");

// const redisPassword = process.env.REDIS_PASS || '';

// const newClient = {
//     host: "localhost",
//     post: 6379,
//     password: redisPassword
// };

// const client = redis.createClient(newClient);
// const setAsync = promisify(client.set).bind(client);
// const getAsync = promisify(client.get).bind(client);
// const expires = 'EX';

module.exports = {
    //Specify a unique key.
    async cacheCompanies(key) {
        // get data from cache.
        const cachedCompanies = await getAsync(key);

        if (cachedCompanies) {
            console.log("Getting Companies from Cache...");
            return JSON.parse(cachedCompanies);
        } else {
            console.log("Getting Companies from Database...");
            const companies = JSON.stringify(await companyManager.getCompaniesAndReports());
            // Save data in cache.
            // EX = Expires time / 1 day in cache = 86400 sec.
            await setAsync(key, companies, expires, 86400);

            return JSON.parse(companies);
        }
    },
    async cacheFinancials(key) {
        // get data from cache.
        const cachedFinancials = await getAsync(key);

        if (cachedFinancials) {
            console.log("Getting Financials from Cache...");
            return JSON.parse(cachedFinancials);
        } else {
            console.log("Getting Financials from Database...");
            const financials = await companyReportFinancialsManager.getFinancialsData();
            // Save data in cache.
            // EX = Expires time / 1 day in cache = 86400 sec.
            await setAsync(key, JSON.stringify(financials), expires, 86400);

            return financials;
        }
    },
    async cacheFinancialsYear(key) {
        // get data from cache.
        const cachedFinancialsYear = await getAsync(key);

        if (cachedFinancialsYear) {
            console.log("Getting FinancialsYear from Cache...");
            return JSON.parse(cachedFinancialsYear);
        } else {
            console.log("Getting FinancialsYear from Database...");
            const financialsYear = await companyReportFinancialsManager.getFinancialsDataYear();
            // Save data in cache.
            // EX = Expires time / 1 day in cache = 86400 sec.
            await setAsync(key, JSON.stringify(financialsYear), expires, 86400);

            return financialsYear;
        }
    },
    async getMapFinancialsData(key) {
        // get data from cache.
        const cachedMapFinancials = await getAsync(key);

        if (cachedMapFinancials) {
            console.log("Getting mapFinancials from Cache...");
            return JSON.parse(cachedMapFinancials);
        } else {
            console.log("Getting mapFinancials from Database...");
            const mapFinancials = await companyReportFinancialsManager.getMapFinancialsData();
            // Save data in cache.
            // EX = Expires time / 1 day in cache = 86400 sec.
            await setAsync(key, JSON.stringify(mapFinancials), expires, 86400);

            return mapFinancials;
        }
    },
};