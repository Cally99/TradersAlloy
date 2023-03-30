const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const userEmailWeeklyService = require('./../../server/services/UserEmailWeeklyService');
const userEmailWeeklyManager = require('./../../server/managers/UserEmailWeeklyManager');
const emailer = require('./../../server/helpers/emailer');
const userEmailWeeklyManagerMock = require('./../mocks/UserEmailWeeklyManagerMock');

//TODO: Need to change mocked email to a generic one,
//instead of a specific one that only one user can see.
//Skipping this unit test for the time being until generic mail is implemented.
describe.skip('UserEmailWeeklyService_weeklyContent', () => {
    it('should manage to send all the mails to the users', async () => {
        const spyWeeklyEmailTemplate = sinon.spy(emailer, 'weeklyEmailTemplate');

        const stubGetEarningsForAllUsers = sinon.stub(userEmailWeeklyManager, 'getEarningsForAllUsers');
        stubGetEarningsForAllUsers.returns(userEmailWeeklyManagerMock.getEarningsForAllUsers());

        await userEmailWeeklyService.weeklyContent();

        for (const mails of spyWeeklyEmailTemplate.returnValues) {
            const mailsTemp = await mails;

            for (const mail of mailsTemp) {
                expect(mail.message).to.be.equal('Queued. Thank you.');
            }
        }

        stubGetEarningsForAllUsers.restore();
        spyWeeklyEmailTemplate.restore();
    });
});
