require('dotenv').config()
const axios = require('axios');
const Sequelize = require('sequelize');
const config = require(`${__dirname}/../config/config.json`);

const DB = require('../server/config/DB');
const connection  = DB.getConnection();

const Company = require('../server/models').Company;
const CompanyReport = require('../server/models').CompanyReport;
const CompanyCalendar = require('../server/models').CompanyCalendar;
const CompanyReportPDF = require('../server/models').CompanyReportPDF;

/*
        run-func ./server/scripts/UpdateCompanyReports.js main
*/
module.exports = {

    async main() {
        console.log('BEGIN');
        const reports = await Company.findAll({where: {isin: 'SE0006219176'}});
        console.log(`selected ${reports.length} reports for analysis `);

        let count = 0;
        let errorCount = 0;
        for (const report of reports) {
            if (count++ % 100 == 0) {
                console.log('PROGRESS: '+count)
            }
            try {
                let pdfs = await getCompanyReportPDF(report.company);

                for (const pdf of pdfs) {
                    await insertCompanyReportPDF(report.isin, report.company, pdf);
                }
            } catch (error) {
                console.log('error getting millistream Calendar:'+error);
                errorCount++;
            }
        }
        console.log(`Error Count ${errorCount}`);
    },
}


//insert into company_report_pdf values ( null, 'FI0009801310', '2020-Q2', 'en','05108dec-3e05-485a-81fa-474beac77d2a',39858);
async function insertCompanyReportPDF(isin, company, pdf) {
    //console.log(`ticker: ${report.ticker}  period:  ${report.period}  eps:  ${report.eps}` );
    console.log(isin+' , LANGUAGE: '+pdf.eventlinklanguages+ ', period: '+pdf.period + ', link:'+pdf.eventlink);
    try  {
        CompanyReportPDF.create({
                "isin":                 isin,
                "period":               pdf.period,
                "language":             pdf.eventlinklanguages,
                "uuid":                 pdf.eventlink,
                "company":              company
        }, {logging:false})
//        console.log(company.ticker +' : q'+event.period);
    } catch(e) {
        console.log('error on insert'+e.message);
    }
}

/*
    39858
    https://documents.millistream.com/${eventlink}?language=${languages}

    https://documents.millistream.com/aee73e25-e29d-43e1-a13e-2e66530e120a?language=en
    https://documents.millistream.com/aee73e25-e29d-43e1-a13e-2e66530e120a?language=sv


    https://mws.millistream.com/mws.fcgi?usr=tradersalloy&pwd=zBaly0kTcfneORknIjvnK1kMIj1eO0iJTmdxKEkR&cmd=fundamentals&insref=39858&fields=eventlink,eventlinklanguages,name&startdate=2019-07-01&filetype=json
*/
async function getCompanyReportPDF(company_insref) {
    const res =   await   axios.get('https://mws.millistream.com/mws.fcgi',
        {params: {usr: 'tradersalloy',
                pwd:process.env.MILLISTREAM_PWD,
                cmd:'fundamentals',
                insref: company_insref,
                fields: 'eventlink,eventlinklanguages,name',
                startdate: '2017-01-01',
                filetype: 'json'}
        })
    if (res.data[0] && res.data[0].fundamentals.length != 0) {
        return new Set(res.data[0].fundamentals);  // a Set collection type forces uniqueness, no duplicates (why would a PDF report have a currency ?!?!?? )
    } else {
        throw new Error ('No Company REPORTS Found for company: ' + company_insref );
    }
}
