const cron = require('node-cron');
const millistreamReportService = require('../../loaders/MillistreamReportService');
const companyReportService = require('../../services/CompanyReportService');

const log4js = require('log4js');
const healthCheck = log4js.getLogger("health");
/**
 * Daily check on Millistream data and load into the Database
 *
 * */
cron.schedule('49 17 * * *', async() => {
        const startTime = Date.now();
        let metaData;

        try {
            let reportsAddedArray = await millistreamReportService.maintainCompanyReports2018();
            metaData = {newReports: reportsAddedArray.length};

        } catch (error) {
            healthCheck.error(`${error.message} type: ${error.name}  `);

        } finally {
            metaData.executionTime = ((Date.now() - startTime) / 1000 ).toFixed(2) + ' seconds';
            healthCheck.info(`* Company Reports:  ${ JSON.stringify(metaData) }  `);


            //await companyReportService.postProcessUpdateCompanyAndCompanyReport();

        }
}, {
    scheduled: true,
    timezone: "Europe/Stockholm"
});
