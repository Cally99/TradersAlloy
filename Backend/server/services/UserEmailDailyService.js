const userEmailDailyManager = require('../managers/UserEmailDailyManager');
const emailer = require('../helpers/emailer');
const _ = require('lodash');
const log4js = require('log4js');
const logger = log4js.getLogger("app_log");

// This is set at the server level so that developer installs and TEST system are not sending.

async function dailyContent() {
    const records = await userEmailDailyManager.getAllAlertsForAllUsers();

    const results = _(records)
        .groupBy(x => [x.email])
        .map((value, key) => ({email: key, items: value}))
        .value();

    if (results.length > 0) {
        // send the raw data to the emailer to handle
        await emailer.dailyEmailTemplate(results);

        // finally, for all reasons, update the alert status as 'fired'
        const target_array = [];
        const stoploss_array = [];
        const entry_array = [];

        records.forEach(element => {
            if (element.reason === 'STOPLOSS') {
                stoploss_array.push(element.trade_plan_id);
            } else if (element.reason === 'ENTRY') {
                entry_array.push(element.trade_plan_id);
            } else if (element.reason === 'TARGET') {
                target_array.push(element.trade_plan_id);
            }
        });

        await userEmailDailyManager.updateTarget(target_array);
        await userEmailDailyManager.updateStoploss(stoploss_array);
        await userEmailDailyManager.updateEntry(entry_array);
    }

    return {emailsGeneratedCount: results.length};
}

module.exports = {
    dailyContent
}


