const _ = require('lodash');
const userEmailWeeklyManager = require('../managers/UserEmailWeeklyManager');
const emailer = require('../helpers/emailer');
const log4js = require('log4js');
const logger = log4js.getLogger("health");

async function weeklyContent()  {
    const records = await userEmailWeeklyManager.getEarningsForAllUsers();
    const emails = _(records)
        .groupBy(x => [x.email])
        .map((value, key) => ({email: key, items: value}))
        .value();
    let groupOnEmail = [];

    logger.info('User emails - Weekly: Sending', emails.length, 'emails...');
    for(const email of emails) {
        for(const item of email.items) {
            groupOnEmail.push(item);
        }
    }

    groupOnEmail = _.groupBy(groupOnEmail, 'email');

    await emailer.weeklyEmailTemplate(groupOnEmail);


    return {emailsGeneratedCount: emails.length}
}

module.exports = {
    weeklyContent
}
