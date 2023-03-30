const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const User = require('./../../server/models').User;

const userPortfolioPlanManager = require('./../../server/managers/UserPortfolioPlanManager');

describe ('UserPortfolioPlan', () => {
    it(':: insert', async () => {
        const plan = {user_id: 1, note: "SOME TEXT", account_value: 10000, monthly_add: 100, position_size: 1000};

        const rv = await userPortfolioPlanManager.setPlan(plan);

        // Assertions
        expect(rv).to.equal(true);
        const planInserted = JSON.parse(JSON.stringify(await userPortfolioPlanManager.getPlan(1) ))[0];
        expect(planInserted.note).to.equal("SOME TEXT");
        expect(planInserted.account_value).to.equal(10000);
        expect(planInserted.monthly_add).to.equal(100);
        expect(planInserted.position_size).to.equal(1000);
    });

    it(':: update', async () => {
        const plan = {user_id: 1, note: "SOME NEW TEXT", account_value: 10000, monthly_add: 100, position_size: 1000};

        const rv = await userPortfolioPlanManager.setPlan(plan);

        // Assertions
        expect(rv).to.equal(false);  // where false means updated a record. Alternatively use { returning: true }
        const planUpdated = JSON.parse(JSON.stringify(await userPortfolioPlanManager.getPlan(1)))[0];
        expect(planUpdated.note).to.equal("SOME NEW TEXT");

    });

    it(':: update with partial model', async () => {
        const plan = {user_id: 1, note: "UPDATE WITHOUT NUMBERS"};

        const rv = await userPortfolioPlanManager.setPlan(plan);

        // Assertions
        expect(rv).to.equal(false);
        const planUpdated = JSON.parse(JSON.stringify(await userPortfolioPlanManager.getPlan(1)))[0];
        expect(planUpdated.account_value).to.equal(10000);
        expect(planUpdated.monthly_add).to.equal(100);
        expect(planUpdated.position_size).to.equal(1000);

    });

    it(':: delete', async () => {
        const rv = await userPortfolioPlanManager.deletePlan(1);

        // Assertions
        const planDeleted = await userPortfolioPlanManager.getPlan(1);
        expect(planDeleted.length).to.equal(0);

    });
});
