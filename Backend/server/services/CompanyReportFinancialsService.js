const companyReportFinancialsManager = require("../managers/CompanyReportFinancialsManager");

module.exports = {
    async fetchMapFinancials() {
        // return await RedisCache.cacheFinancials("financialsKey2");
        const financials = await companyReportFinancialsManager.getFinancialsData();
        return financials;
    },
    async fetchMapFinancialsYear() {
        // return await RedisCache.cacheFinancialsYear("financialsYearKey2");
        const financialsYear = await companyReportFinancialsManager.getFinancialsDataYear();
        return financialsYear;
    },
    async getMapFinancialsData() {
        // return await RedisCache.getMapFinancialsData("mapFinancials2");
        const mapFinancials = await companyReportFinancialsManager.getMapFinancialsData();
        return mapFinancials;
    }
}