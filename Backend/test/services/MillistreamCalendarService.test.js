const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const test = require("sinon-test")(sinon, { useFakeTimers: false });
const Company  = require('./../../server/models/').Company;
const CompanyCalendar  = require('./../../server/models/').CompanyCalendar;
const millistreamManager = require('./../../server/managers/MillistreamManager');

const millistreamCalendarService = require('./../../server/loaders/MillistreamCalendarService');

describe.skip('MillistreamCalendarService . checkCompanyCalendar', () => {
    afterEach(async () => {
        await CompanyCalendar.destroy({where: { company_id: 1}});
        await Company.destroy({where: { company_id: 1}});

    });

    beforeEach (async () => {
        sinon.restore();
        await Company.create({ company_id: 1, name: "COMPANY ONE", last_eps_ttm: null, next_report_date: null, last_sales: 200, last_report_date: '2021-08-08', last_pe: 79, market_cap: '11004179104'} );
        await CompanyCalendar.create( {company_id: 1, period: '2021', date_report: '2020-08-08', type_report: 15  } );
        await CompanyCalendar.create( {company_id: 1, period: '2021-Q2', date_report: '2020-08-09', type_report: 15  } );
    });

    it('simple case', test( async function () {
        const stubData = {
            calendarevent: {
                company: '1',
                period: "2021-Q2",
                date_report: "2021",
                type_report: "type"
            }
        };

        const eventResponse = {
            status: 200,
            data: [stubData],
        }

        let getCalendar = this.stub(millistreamManager, 'getCalendar');
        getCalendar.returns(eventResponse)
        const result = await millistreamCalendarService.checkCompanyCalendar(1);
    }));
});
