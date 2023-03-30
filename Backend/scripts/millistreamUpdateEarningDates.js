const axios = require('axios');
require('dotenv').config()
const CompanyReport = require('../server/models').CompanyReport;

var startDate = "2017-01-01"
var updated_companies = []
get_insref()

function get_insref() {
    CompanyReport.findAll()  // get the reports array first for updating date_report
        .then(async s => {
            for (var i=0; i<s.length; i++) {
                if (s[i].date_report == null && !updated_companies.includes(s[i].company)) {
                    await get_OLD_date_report_date(s[i].company, startDate, s[i].period)
                }
            }
        })
        .catch(error => console.log(error));
}


function get_OLD_date_report_date(company, startDate, period) {  // get date_report data from millistream
    return new Promise((resolve, reject) => {
        axios.get('https://mws.millistream.com/mws.fcgi',
        {params: {usr: 'tradersalloy',
            pwd:process.env.MILLISTREAM_PWD,
            cmd:'calendar',
            insref: company,
            fields: 'name,type,subtype,dividend,period,date,fiscalperiod',
            startdate: startDate,
            subtype: '4',
            filetype: 'json'}})
        .then( async res => {
            if (res.data[0] && res.data[0].calendarevent.length != 0) {
                for (var i=0; i<res.data[0].calendarevent.length; i++) {
                    if (res.data[0].calendarevent[i].period == period) {
                        await update_CR(company, res.data[0].calendarevent[i].period, res.data[0].calendarevent[i].date)
                        break
                    }
                }
            }
            resolve();
        })
        .catch(error => {
            console.log(error)
            resolve();
        })
    })
}

function update_CR(company, period, date) { // update date_report data in company_report table
    return new Promise((resolve, reject) => {
        CompanyReport.findOne({where: {  period: period, company: company }})
            .then(async u => {
                CompanyReport.update( {date_report: date},
                                {where: { period: period, company: company }})
                    .then(() => {
                        console.log('updated CR earing_dates')
                        updated_companies.push(company)
                        resolve()
                    })
                    .catch((error) => {
                        console.log(error)
                        resolve()
                    });
            })
            .catch((error) => {
                console.log(error)
                resolve()
            });
    })
}

