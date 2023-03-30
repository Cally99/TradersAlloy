const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const companyCalendarManager = require('../../server/managers/companyCalendarManager');

describe ('CompanyCalendarManager :: getNextReport', () => {
    it('simple case', async () => {
        const nextReportDate = await companyCalendarManager.getNextReport(33233);
        expect(nextReportDate).to.not.be.null;
    });
});
