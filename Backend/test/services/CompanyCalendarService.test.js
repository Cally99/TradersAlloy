const chai = require('chai');
const expect = chai.expect;

const CompanyCalendar = require('./../../server/models').CompanyCalendar;
const companyCalendarManager = require('./../../server/managers/CompanyCalendarManager');

describe('CompanyCalendarService . checkCompanyCalendar', () => {
    const events = [
                    {company_id: 33233, "type":15, "subtype":4, "date":"2020-10-22", "period":"2020-Q3"},
                    {company_id: 33233, "type":15, "subtype":4, "date":"2021-04-28", "period":"2021-Q1"},
                    {company_id: 33233, "type":15, "subtype":4, "date":"2021-08-19", "period":"2021-Q2"},
                    {company_id: 33233, "type":15, "subtype":4, "date":"2021-10-26", "period":"2021-Q3"},
                ];

    beforeEach(async () => {
        CompanyCalendar.destroy({where: {company_id: 33233, period: '2020-Q1'}});
    });

    it('should insert bulk and select one to confirm', async () => {
        await companyCalendarManager.insertCompanyCalendar(events);

        const cc1 =  await CompanyCalendar.findOne({where: { company_id: 33233, period: '2021-Q3'}}) ;
        const cc = cc1.toJSON();
        expect(cc).is.exist;
        expect(cc.company_id).to.equal(33233);
        expect(cc.period).to.equal('2021-Q3');
    });
});
