const emailer = require('../helpers/emailer');
const passwordHash = require('password-hash');

const navigationTabs = {
    tabs: [
        { i: 0, name: 'Watchlist', path: "/watchlist", icon: "mdi-eye", isFocus: true },
        { i: 1, name: 'FNOX', path: "/stocks", icon: "mdi-cube", isFocus: false, insref: 42953, isin: 'SE0001966656' },
        { i: 2, name: 'ERIC B', path: "/stocks", icon: "mdi-cube", isFocus: false, insref: 772, isin: 'SE0000108656' },
        { i: 3, name: 'SWMA', path: "/stocks", icon: "mdi-cube", isFocus: false, insref: 5664, isin: 'SE0000310336' },
    ]
}

const crypto = require('crypto');

const userManager = require('../managers/UserManager');


/**
 * TODO: what does this function ?
 * */
function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


module.exports = {

    async create(email, password, settings) {
        const user_all = await userManager.create(email, password, settings);

        const user = user_all.dataValues;
        if (!user) {
            return null;
        }

        await userManager.addDefaultUserWatchlist(user, 'Exempellista');
        await userManager.addDefaultUserResearch(user, 42953, 'FNOX');
        await userManager.addDefaultUserScreener(user);
        await userManager.addDefaultUserTradePlan(user);
        await userManager.addDefaultUserAccount(user);
        await userManager.addDefaultTransactions(user);
        await emailer.welcomeEmail(user);

        return user;
    },

    async continue_GF(email, password, settings) {
        const user_data = await userManager.check_user_exist_withEmail(email);
        if (user_data) {
            const user_info = user_data.dataValues;
            return user_info;
        } else {
            const user_all = await userManager.create(email, password, settings);
            const user = user_all.dataValues;
            await userManager.addDefaultUserWatchlist(user, 'Exempellista');
            await userManager.addDefaultUserResearch(user, 42953, 'FNOX');
            await userManager.addDefaultUserScreener(user);
            await userManager.addDefaultUserTradePlan(user);
            await emailer.welcomeEmail(user);

            return user;
        }
    },

    async fetchWatchlistHeaders(userID) {
        const data = await userManager.fetchWatchlistHeaders(userID);
        const message = 'Användaren hittades inte';
        if (data) {
            return {
                flag: true,
                data: data
            };
        } else {
            return {
                flag: false,
                data: message
            };
        }
    },

    async saveWatchlistHeaders(user_id, headers) {
        const is_exist = await userManager.check_user_exist_withID(user_id)
        if (!is_exist) {
            return {
                flag: false,
                data: null
            }
        } else {
            const data = await userManager.saveWatchlistHeaders(user_id, headers)
            if (data) {
                return {
                    flag: true,
                    data: data
                }
            } else {
                return {
                    flag: false,
                    data: null
                }
            }
        }
    },

    async select(email) {
        const data = await userManager.select(email);
        const message = 'Användaren hittades inte';
        if (data) {
            return {
                flag: true,
                data: data
            };
        } else {
            return {
                flag: false,
                data: message
            };
        }
    },
    async findUser(user_id) {
        return await userManager.findUser(user_id);
    },

    async userLogin(email, password) {
        //   ***  PLEASE tidy up this code when not needed for reference ***
        //        const message1 = 'Användaren hittades inte'
        //        const message2 = 'fel lösenord, försök igen'
        //        if (!is_exist) {
        //            return {
        //                flag: false,
        //                data: message1
        //            }
        //        } else {
        //    const user = await userManager.userLogin(userEmail)

        const user_temp = await userManager.check_user_exist_withEmail(email);

        const user = user_temp.dataValues;
        if (user) {
            if (passwordHash.verify(password, user.password)) {
                const hmac = crypto.createHmac('sha256', 'secret');
                hmac.update('Message');
                // log so we can measure 'Monthly Active Users
                user.last_login_date = new Date().toISOString().slice(0, 10);
                // await userManager.save();

                // send the user object but not the password
                user.password = 'secret';
                return user;
            } else {
                throw new Error("INCORRECT_PASSWORD"); // use this string with i18n : 'fel lösenord, försök igen'
            }
        } else {
            throw new Error("USER_NOT_FOUND"); // use this string with i18n : 'Användaren hittades inte'
        }
    },

    async verifyUserPassword(email, password) {
        const user_temp = await userManager.check_user_exist_withEmail(email);
        const user = user_temp.dataValues;

        if (passwordHash.verify(password, user.password)) {
            user.password = 'secret';
            return {
                flag: true,
                passwordVerify: true
            };
        } else {
            return {
                flag: false,
                passwordVerify: false
            };
        }
    },

    async forgotPassword(email) {
        const is_exist = await userManager.check_user_exist_withEmail(email);
        const message1 = 'Användaren hittades inte';

        if (!is_exist) {
            return {
                data: {
                    flag: false,
                    data: message1
                }
            };
        } else {
            const data = await userManager.select(email);
            if (data) {
                const confirm_code = makeid(5);
                await emailer.forgottenPasswordEmail(email, confirm_code);

                return {
                    flag: true,
                    data: confirm_code
                };
            } else {
                return {
                    data: {
                        flag: false,
                        data: message1
                    }
                };
            }
        }
    },

    async newPassword(email, password) {
        const is_exist = await userManager.check_user_exist_withEmail(email);
        const message1 = 'Användaren hittades inte';

        if (!is_exist) {
            return {
                flag: false,
                data: message1
            };
        } else {
            const newPass = passwordHash.generate(password);
            const data = await userManager.newPassword(email, newPass);

            if (data) {
                return {
                    flag: true,
                    data: data
                };
            } else {
                return {
                    flag: false,
                    data: 'could not save the encrypted password'
                };
            }
        }
    },

    async resetPassword(user_id, password) {
        const is_exist = await userManager.check_user_exist_withID(user_id)
        const message1 = 'Användaren hittades inte'
        if (!is_exist) {
            return {
                flag: false,
                data: message1
            }
        } else {
            const newPass = passwordHash.generate(password)
            const data = await userManager.resetPassword(user_id, newPass)
            if (data) {
                return {
                    flag: true,
                    data: data
                }
            } else {
                return {
                    flag: false,
                    data: message1
                }
            }
        }
    },

    async update(email, type, settings, account, screen) {
        const is_exist = await userManager.check_user_exist_withEmail(email);
        const message1 = 'Användaren hittades inte';
        if (!is_exist) {
            return {
                flag: false,
                data: message1
            };
        }
        const data = await userManager.update(email, type, settings, account, screen);
        if (data) {
            return {
                flag: true,
                data: data
            }
        }
        return {
            flag: false,
            data: message1
        }
    },

    async verifyAndLogin(user_id) {
        const is_exist = await userManager.check_user_exist_withID(user_id)
        if (!is_exist) {
            return {
                flag: false,
                data: null
            }
        } else {
            const data = await userManager.verifyAndLogin(user_id)
            if (data) {
                return {
                    flag: true,
                    data: data
                }
            } else {
                return {
                    flag: false,
                    data: null
                }
            }
        }
    },

    async list() {
        const data = await userManager.list();
        if (data) {
            return {
                flag: true,
                data: data
            }
        } else {
            return {
                flag: false,
                data: null
            }
        }
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
    async addUserSettings(user_id, settings) { // before it was addUserTabs
        const is_exist = await userManager.check_user_exist_withID(user_id)
        const message = 'UserSettings Not Found'
        if (!is_exist) {
            return {
                flag: false,
                data: message
            }
        } else {
            const data = await userManager.addUserSettings(user_id, settings)
            if (data) {
                return {
                    flag: true,
                    data: data
                }
            } else {
                return {
                    flag: false,
                    data: message
                }
            }
        }
    },

    async addNavigationTabs(user_id, tabs) {
        const is_exist = await userManager.check_user_exist_withID(user_id);
        const message = 'UserNavTab Not Found';
        if (!is_exist) {
            return {
                flag: false,
                data: message
            }
        } else {
            const data = await userManager.addNavigationTabs(user_id, tabs);
            if (data) {
                return {
                    flag: true,
                    data: data
                }
            } else {
                return {
                    flag: false,
                    data: message
                }
            }
        }
    },

    async gotoPdf(user_id) {
        const is_exist = await userManager.check_user_exist_withID(user_id);
        if (!is_exist) {
            return {
                flag: false,
                data: null
            }
        } else {
            const data = await userManager.gotoPdf(user_id)
            if (data) {
                return {
                    flag: true,
                    data: data
                }
            } else {
                return {
                    flag: false,
                    data: null
                }
            }
        }
    },

    async findUser(user_id) {
        return await userManager.findUser(user_id);
    },
    async updateUser_stripe(subscribe_id, customer_id, cardId, membership_date, user_id, type) {
        return await userManager.updateUser_stripe(subscribe_id, customer_id, cardId, membership_date, user_id, type);
    },
    async userNotifications(user_id, weekly, newsletter) {
        return await userManager.userNotifications(user_id, weekly, newsletter);
    },


    async sendInvitationToFriend(userEmail, friendEmail) {
        let is_email = {
            flag: false
        }

        if (userEmail != null && friendEmail != null) {
            is_email.flag = true;
            await emailer.invitationEmail(friendEmail, userEmail);
        }

        return is_email;
    },
    async unsubscribeIntercomNewsletterFromUser(user_id) {
        return await userManager.unsubscribeIntercomNewsletterFromUser(user_id);
    },
    async unsubscribeEmailNewsletter(user_id) {
        const intercom_user_mail_id = (await userManager.unsubscribeIntercomNewsletterFromUser(user_id)).data[0].id;
        const newsletter = await userManager.unsubscribeEmailNewsletter(intercom_user_mail_id);
        const user = await userManager.unsubscribeEmailNewsletterFromUserTable(user_id);

        return {
            userData: user,
            intercomData: newsletter
        };
    },
    async unsubscribeEmailNewsletterFromUserTable(user_id) {
        return await userManager.unsubscribeEmailNewsletterFromUserTable(user_id);
    },

    async avanzaTest() {
        return await userManager.avanzaTest();
    }
}