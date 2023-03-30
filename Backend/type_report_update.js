require('dotenv').config()
const CompanyReport = require('./server/models').CompanyReport;

getReports()

function getReports() {
    CompanyReport.findAll()
        .then(async reports => {
            for (var i=0; i<reports.length; i++) {
                await update_typeReport(reports[i].company_id, reports[i].period, reports[i].eps)
            }
        })
        .catch(error => console.log(error));
}


function update_typeReport(isin, period, eps) {
    return new Promise((resolve, reject) => {
        var temp = 'Q'
        if (eps != null && period.length > 4) temp = 'Q'
        if (eps != null && period.length < 5) temp = 'Y'
        if (eps == null) temp = 'E'

        CompanyReport.update({
            type_report: temp,
        },{
            where: { company_id: company_id, period : period }
        })
            .then(response => {
                console.log('11111111111111111111111111', isin, period, eps, temp)
            })
            .catch((error) => console.log('failed to update CompanyReport table', error));

            resolve();
    })
}
