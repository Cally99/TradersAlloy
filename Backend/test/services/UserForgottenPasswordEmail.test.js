const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const emailer = require('./../../server/helpers/emailer');

describe.skip('UserForgottenPasswordEmail.test', () => {
    it('Forgotten password', async () => {
        const email = 'ulmezz@gmail.com';
        const confirm_code = '9QWN6';

        await emailer.forgottenPasswordEmail(email, confirm_code);
    });
});
