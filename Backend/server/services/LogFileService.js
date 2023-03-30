const logFileManager = require('../managers/LogFileManager');

const emailer = require('../helpers/emailer');
const common = require('../helpers/common');

/**
 *
 *
 * */
module.exports = {

    async  emailTodaysEntries() {
        if (common.getPlatform() === 'PROD') {
            const lines = await logFileManager.getTodaysEntries();
            await emailer.healthCheckEmail(lines);
        }

        return true;
    },

    async getTodaysEntries() {
        return await logFileManager.getTodaysEntries();
    },

    async getDataLoad() {
        return await logFileManager.getDataLoad();

    }

};
