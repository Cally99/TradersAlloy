const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

// const userEmailWeeklyService = require('./../../server/services/UserEmailWeeklyService');
// const userEmailWeeklyManager = require('./../../server/managers/UserEmailWeeklyManager');
// const emailer = require('./../../server/helpers/emailer');
// const userEmailWeeklyManagerMock = require('./../mocks/UserEmailWeeklyManagerMock');

const userSettingsService = require('./../../server/services/UserSettingsService');
const userSettingsManager = require('./../../server/managers/UserSettingsManager');

describe.skip('UserEmailWeeklyService_weeklyContent', () => {
    //TODO: Will skip this unit test until
    //adding the test user and assertions
    it('test', async () => {
        const spyFetchUserSettingsWLConf = sinon.spy(userSettingsManager, 'fetchUserSettingsWLConf');

        //TODO: create test user to get user settings
        //from the not to specific user 98.
        await userSettingsService.fetchUserSettingsWLConf(98);

        console.log(spyFetchUserSettingsWLConf.returnValues[0]);

        // for(item of spyFetchUserSettingsWLConf) {
        //     console.log(await item);
        // }

        spyFetchUserSettingsWLConf.restore();

        //TODO: Need to add assertions here

        // const spyWeeklyEmailTemplate = sinon.spy(emailer, 'weeklyEmailTemplate');

        // const stubGetEarningsForAllUsers = sinon.stub(userEmailWeeklyManager, 'getEarningsForAllUsers');
        // stubGetEarningsForAllUsers.returns(userEmailWeeklyManagerMock.getEarningsForAllUsers());

        // await userEmailWeeklyService.weeklyContent();

        // for(const mails of spyWeeklyEmailTemplate.returnValues) {
        //     const mailsTemp = await mails;
        //     for(const mail of mailsTemp) {
        //         expect(mail.message).to.be.equal('Queued. Thank you.');
        //     }
        // }

        // stubGetEarningsForAllUsers.restore();
        // spyWeeklyEmailTemplate.restore();
    });
});
