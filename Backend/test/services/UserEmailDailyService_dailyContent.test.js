const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const userEmailDailyService = require('./../../server/services/UserEmailDailyService');
const userEmailDailyManager = require('./../../server/managers/UserEmailDailyManager');
const emailer = require('./../../server/helpers/emailer');
const userEmailDailyManagerMock = require('./../mocks/UserEmailDailyManagerMock');

//TODO: Need to change mocked email to a generic one,
//instead of a specific one that only one user can see.
//Skipping this unit test for the time being until generic mail is implemented.
describe.skip('UserEmailDailyService_dailyContent', () => {
    it('should manage to send mails', async () => {
        const spyDailyEmailTemplate = sinon.spy(emailer, 'dailyEmailTemplate');

        const stubGetAllAlertsForAllUsers = sinon.stub(userEmailDailyManager, 'getAllAlertsForAllUsers');
        stubGetAllAlertsForAllUsers.returns(userEmailDailyManagerMock.getAllAlertsForAllUsers());

        await userEmailDailyService.dailyContent();

        for (const mails of spyDailyEmailTemplate.returnValues) {
            const mailsTemp = await mails;

            for (const mail of mailsTemp) {
                expect(mail.message).to.be.equal('Queued. Thank you.');
            }
        }

        stubGetAllAlertsForAllUsers.restore();
        spyDailyEmailTemplate.restore();
    });
});
