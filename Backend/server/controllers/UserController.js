const passwordHash = require('password-hash');

// How to set these for production ?
const Server_address = process.env.SERVER_ADDR + ':' + process.env.PORT;
const env = process.env.NODE_ENV || 'development';


const settings = JSON.stringify({
    tabs: [
        { i: 0, name: 'Watchlist', path: "/watchlist" },
        { i: 1, name: 'FNOX', path: "/stocks", stock_id: 42953 },
        { i: 2, name: 'ERIC B', path: "/stocks", stock_id: 772 },
        { i: 3, name: 'SWMA', path: "/stocks", stock_id: 5664 },
    ]
});

const tabs = '{3561, 5664, 42953}';

const userSettings = {
    settings,
    tabs
};

const User = require('../models').User;
const userService = require('../services/UserService');
const log4js = require('log4js');
const logger = log4js.getLogger("app_log");

module.exports = {
    // Test that the API is working front to back
    // test(req, res) {
    //     if(req.query.test=='test') {
    //         res.status(200).send();
    //     } else {
    //         res.status(400);
    //     }
    // },
    async create(req, res) {
        const userEmail = req.body.email;
        const userPassword = passwordHash.generate(req.body.password);
        const userData = await userService.create(userEmail, userPassword, userSettings);

        res.status(200).send(userData);
    },

    async continue_GF(req, res) {
        const userEmail = req.body.email;
        const userPassword = passwordHash.generate(req.body.password);

        const userData = await userService.continue_GF(userEmail, userPassword, userSettings);

        res.status(200).send(userData);
    },

    async deleteUser(req, res) {
        const user_id = req.params.user_id;

        const userData = await userService.findUser(user_id);
        await User.destroy({ where: { user_id: user_id } });
        res.status(200).send(userData.data);
    },

    async fetchWatchlistHeaders(req, res) {
        const user_id = req.params.user_id;

        const userData = await userService.fetchWatchlistHeaders(user_id);
        res.status(200).send(userData.data);
    },

    async saveWatchlistHeaders(req, res) {
        const user_id = req.body.user_id;
        const headers = req.body.headers;

        const userData = await userService.saveWatchlistHeaders(user_id, headers);
        res.status(200).send(userData.data);
    },

    async select(req, res) {
        const email = req.params.email;

        const userData = await userService.select(email);
        res.status(200).send(userData.data);
    },

    async findUser(req, res) {
        const user_id = req.params.id;

        const user = await userService.findUser(user_id);
        res.status(200).send(user);
    },

    async userLogin(req, res) {
        const userEmail = req.body.email;
        const userPassword = req.body.password;

        const userData = await userService.userLogin(userEmail, userPassword);
        res.status(200).send(userData);
    },

    async forgotPassword(req, res) {
        const userEmail = req.body.email;

        const userData = await userService.forgotPassword(userEmail);
        res.status(200).send(userData.data);
    },

    async newPassword(req, res) {
        const userEmail = req.body.email;
        const userPassword = req.body.password;

        const userData = await userService.newPassword(userEmail, userPassword);
        res.status(200).send(userData.data);
    },

    async resetPassword(req, res) {
        const user_id = req.body.id;
        const userPassword = req.body.password;

        const userData = await userService.resetPassword(user_id, userPassword);
        res.status(200).send(userData.data);
    },

    async update(req, res) {
        const userEmail = req.body.email;
        const userType = req.body.type;
        const userSettings = req.body.settings;
        const userAccount = req.body.account;
        const userScreen = req.body.screen;

        const userData = await userService.update(userEmail, userType, userSettings, userAccount, userScreen);
        res.status(200).send(userData.data);
    },

    async verifyAndLogin(req, res) {
        const user_id = req.params.user_id;

        const userData = await userService.verifyAndLogin(user_id);
        if (userData.flag) {
            res.cookie("userInfo", JSON.stringify(userData.data));
            res.redirect(Server_address + '/rapportkollen');
        } else {
            res.status(400).send(null);
        }
    },

    async list(req, res) {
        const userData = await userService.list();
        res.status(userData.flag ? 200 : 400).send(userData.data);
    },

    // destroy(req, res) {
    //     return User.findById(req.params.iduser)
    //         .then(u => {
    //             if (!u) return res.status(400).send({message: 'Användaren hittades inte'});
    //             return User.destroy()  // TODO:
    //                 .then(() => res.status(204).send())
    //                 .catch((error) => res.status(400).send(error));
    //         })
    //         .catch((error) => res.status(400).send(error));
    // },
    async addUserSettings(req, res) {
        const user_id = req.body.id;
        const userSettings = req.body.settings;

        const userData = await userService.addUserSettings(user_id, userSettings);
        res.status(200).send(userData.data);
    },

    async addNavigationTabs(req, res) {
        const user_id = req.body.id;
        const userTabs = req.body.tabs;

        const userData = await userService.addNavigationTabs(user_id, userTabs);
        res.status(200).send(userData.data);
    },

    async gotoPdf(req, res) {
        const user_id = req.params.user_id;
        const company_id = req.params.company_id;
        //        const pdf_link = req.params.pdf_link;   I do not think we need this we are only ever going to the LATEST pdf, which is what we see by default for this ISIN.

        const userData = await userService.gotoPdf(user_id);
        if (userData.flag) {
            res.cookie("userInfo", JSON.stringify(userData.data));
            res.redirect('http://' + Server_address + '/rapportkollen');
        } else {
            res.status(400).send(null);
        }
    },

    createAccountByInvitation: function(req, res) {
        console.log('-- New user invited ', req.params);
        res.redirect('http://' + Server_address + '/invitation');
        res.status(200).send();
    },

    async userNotifications(req, res) {
        const user_id = req.body.user_id;
        const weekly = req.body.weekly;
        const newsletter = req.body.newsletter;

        const userNotifications = await userService.userNotifications(user_id, weekly, newsletter);
        res.status(200).send(userNotifications.data);
    },

    async verifyUserPassword(req, res) {
        const email = req.body.email;
        const password = req.body.password;

        const passwordVerify = await userService.verifyUserPassword(email, password);
        res.status(200).send(passwordVerify);
    },

    async sendInvitationToFriend(req, res) {
        const userEmail = req.body.userEmail;
        const friendEmail = req.body.friendEmail;

        const userToSend = await userService.sendInvitationToFriend(userEmail, friendEmail);
        res.status(200).send(userToSend);
    },
    async unsubscribeIntercomNewsletterFromUser(req, res) {
        const user_id = req.params.user_id;

        const response = await userService.unsubscribeIntercomNewsletterFromUser(user_id);

        res.status(200).send(response);
    },

    async unsubscribeEmailNewsletter(req, res) {
        const user_id = req.params.user_id;

        const response = await userService.unsubscribeEmailNewsletter(user_id);

        res.status(200).send(response);
    },

    async unsubscribeEmailNewsletterFromUserTable(req, res) {
        const user_id = req.params.user_id;

        const response = await userService.unsubscribeEmailNewsletterFromUserTable(user_id);

        res.status(200).send(response);
    },

    async avanzaTest(req, res) {
        const transactions = await userService.avanzaTest();
        res.status(200).send(transactions);
    }
};