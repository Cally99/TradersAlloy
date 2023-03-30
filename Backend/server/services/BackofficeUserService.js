
const backofficeUserManager = require ("../managers/BackofficeUserManager.js");
const userManager = require ("../managers/UserManager.js");
const log4js = require('log4js');
const logger = log4js.getLogger("app_log");


module.exports = {
    async getUserDataDump() {
        // compile many sources of data into one return.
        const users = await userManager.list();

        const usersNewThisWeek = 0;

        const usersPremiumCount = 0;

        let dataDump = {
            users: users,
            usersNewThisWeek: usersNewThisWeek,
            usersPremiumCount: usersPremiumCount,
        };
        return dataDump;
    },

};
