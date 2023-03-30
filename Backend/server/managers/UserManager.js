const User = require('../models').User;
const axios = require('axios');
const WatchlistItem = require('../models').UserWatchlistItem;
const WatchlistJoin = require('../models').UserWatchlistJoin;
const Watchlist = require('../models').UserWatchlist;
const UserResearch = require('../models').UserResearch;
const UserScreen = require('../models').UserScreen;
const UserTradePlan = require('../models').UserTradePlan;
const UserAccount = require('../models').UserAccount;
const UserTx = require('../models').UserTx;
const Stock = require('../models').Stock;
const moment = require('moment');


const Avanza = require('avanza');
const avanza = new Avanza();

async function check_user_exist_withEmail_signup(email) {
    return await User.findOne({ where: { email } });
}

async function addDefaultUserWatchlistItems(u, stock_id, ticker, name, watchlist_id, isin) {
    const stock_in_WLI = await WatchlistItem.findOne({ where: { stock_id: stock_id, user_id: u.user_id } })

    if (!stock_in_WLI) {
        const priceToday = (await Stock.findOne({ where: { stock_id: stock_id } })).price_today;
        const company_id = (await Stock.findOne({ where: { stock_id: stock_id } })).company_id;
        await WatchlistItem.create({
            user_id: u.user_id,
            stock_id: stock_id,
            isin: isin,
            ticker: ticker,
            name: name,
            conviction: 0,
            watched_since: new Date().toISOString().slice(0, 10),
            watched_since_price: priceToday,
            company_id: company_id
        });
    }
    return await WatchlistJoin.create({
        watchlist_id: watchlist_id,
        user_id: u.user_id,
        stock_id: stock_id,
    });

}

module.exports = {
    async addDefaultUserWatchlist(u, watchlist_name) {
        const wl = await Watchlist.create({
            user_id: u.user_id,
            name: watchlist_name,
            type: '-'
        });
        await addDefaultUserWatchlistItems(u, 772, 'ERIC B', 'Ericsson B', wl.watchlist_id, 'SE0000108656');
        await addDefaultUserWatchlistItems(u, 42953, 'FNOX', 'Fortnox', wl.watchlist_id, 'SE0001966656');
        await addDefaultUserWatchlistItems(u, 5664, 'SWMA', 'Swedish Match', wl.watchlist_id, 'SE0000310336');
    },
    async addDefaultUserResearch(u, stock_id, ticker) {
        const research = await UserResearch.create({
            user_id: u.user_id,
            stock_id: stock_id,
            ticker: ticker,
            content: '<p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none; font-size: 18px;">Hej!&nbsp;</span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none; font-size: 18px;">Detta är ett förslag på en mall för bolagsanalys. Generellt föreslår vi följande områden men beroende på vilken bransch eller storlek på företag så kan den behöva kompletteras.&nbsp;</span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000; min-height: 14.0px;"><br></p><span style="font-kerning: none; font-size: 18px;">Hälsningar,</span><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none; font-size: 18px;">Petter Hattenbach Co-Founder &amp; CEO Traders Alloy. Har du några synpunkter eller idéer? Skicka gärna ett mail till: petter@tradersalloy.com&nbsp;</span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000; min-height: 14.0px;">------------------------------------</p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000; min-height: 14.0px;"><img src="https://dev-backend.tradersalloy.com/images/1594978985137-1.png" style="width: 300px;" class="fr-fic fr-dii"></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;"><strong><span style="color: rgb(97, 189, 109); font-size: 18px;">Verksamheten</span></strong><span style="font-size: 18px;">&nbsp;</span></span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;">Fortnox är ett svenskt mjukvarubolag som erbjuder en plattform för små och medelstora företag att sköta sin administration och finansiering. Mest kända är de framförallt för sitt bokföringsprogram.</span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000; min-height: 15.0px;"><br></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;">Finansiella mål:&nbsp;</span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000; min-height: 15.0px;"><br></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;">Årlig tillväxt: 25%</span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;">Rörelsemarginal: 20% &nbsp;</span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000; min-height: 15.0px;"><br></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;"><strong><span style="color: rgb(97, 189, 109); font-size: 18px;">3 anledningar till att bolaget är intressant&nbsp;</span></strong></span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;"><strong><span style="color: rgb(97, 189, 109); font-size: 18px;"><img src="https://dev-backend.tradersalloy.com/images/1594979061545-2.png" style="width: 298px;" class="fr-fic fr-dii"></span></strong></span><br></p><ol style="list-style-type: decimal;"><li style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;">Traditionellt har redovisnings program varit tröga och krävt installation. Fortnox erbjuder en innovativ produkt i ett tilltalande gränssnitt. Programmet är lätt att jobba i och funkar direkt i webbläsaren. Jag själv har också använt programmet och hört gått om det både från vänner och professionella.</span></li><li style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;">Google Ventures: Product Market Fit + tid för onboarding --&gt; Avgör tillväxthastigheten.&nbsp;</span><ol style="list-style-type: decimal;"><li style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;">PMF: Fortnox erbjuder en enkel och smidig lösning för att administrera det lilla eller medelstora företaget. Betydligt bättre än konkurrenterna. Stark produkt market fit.</span></li><li style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;">Tid för onboarding: Det går snabbt att komma igång med lösningen. Jag upplever också att det går snabbare än konkurrenternas.</span></li></ol></li></ol><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000; min-height: 14.0px;"><br></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;"><strong><span style="color: rgb(97, 189, 109); font-size: 18px;">Investeringstes</span>&nbsp;</strong></span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;">Välskött bolag med stark finansiell ställning så väl som hög kundnöjdhet. Bolaget går från klarhet till klarhet. Så länge bolaget kan visa upp hög tillväxt i kombination med låg churnrate är det definitivt en aktie att behålla på lång sikt.&nbsp;</span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000; min-height: 14.0px;"><br></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;"><strong><span style="color: rgb(97, 189, 109); font-size: 18px;">Marknad</span></strong></span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;">Sverige: Enligt SCB finns 800 000 små och medelstora förtag i Sverige. Fortnox hade 297 000 kunder (Q3 2019). Således 37% av marknaden. Vid varje rapport se över hur antalet företag och antalet kunder har förändrats.&nbsp;</span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000; min-height: 14.0px;"><br></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;"><strong><span style="color: rgb(97, 189, 109); font-size: 18px;">Konkurrens</span></strong>&nbsp;</span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;">Visma SPCS, Björn Lundén och Bokio. Håll ett öga på nya alternativ.&nbsp;</span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000; min-height: 14.0px;"><br></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;"><strong><span style="color: rgb(97, 189, 109); font-size: 18px;">Ledning</span></strong>&nbsp;</span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;">Ny VD med bra track-record. VD:n äger aktier i bolaget.&nbsp;</span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="text-decoration: underline ; font-kerning: none;"><a href="https://www.fortnox.se/om-fortnox/styrelseoledning/">https://www.fortnox.se/om-fortnox/styrelseoledning/</a></span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000; min-height: 14.0px;"><br></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000; min-height: 14.0px;"><br></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;"><strong><span style="color: rgb(97, 189, 109); font-size: 18px;">Risker</span></strong>&nbsp;</span></p><ol style="list-style-type: decimal;"><li style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;">Konkurrens, det kommer fler och fler aktörer.&nbsp;</span></li><li style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;">Att kunderna inte längre gillar produkten. Håll koll på churn-rate och kundnöjdhet.&nbsp;</span></li><li style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;">Hastigheten i omsättningstillväxt. Om bolaget inte kan hålla samma hastighet i tillväxten kommer inte den höga värderingen vara motiverad.&nbsp;</span></li></ol><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000; min-height: 14.0px;"><br></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;"><strong><span style="color: rgb(97, 189, 109); font-size: 18px;">Prognos &amp; Värdering</span><span style="color: rgb(97, 189, 109);">&nbsp;</span></strong></span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000; min-height: 14.0px;"><span style="font-kerning: none;">&nbsp;</span></p><p style="margin: 0.0px 0.0px 8.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;"><strong><span style="color: rgb(235, 107, 86); font-size: 18px;">Disclaimer</span>&nbsp;</strong></span></p><p style="margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px `Helvetica Neue`; color: #000000;"><span style="font-kerning: none;">En investering i värdepapper/fonder kan både öka och minska i värde och det är inte säkert att du får tillbaka det investerade kapitalet. Samtliga analyser och all annan information som tillhandahålls lämnas uteslutande i informationssyfte, för allmän spridning, och ska under inga förhållanden användas eller betraktas som rådgivning, uppmaning eller rekommendation för att köpa eller sälja aktier eller andra finansiella instrument. Åsikter och analyser som presenteras är personliga och informationen ska inte ensamt utgöra underlag för investeringsbeslut. Du bör inhämta råd från andra rådgivare och basera dina investeringsbeslut utifrån egen erfarenhet. Traders Alloy frånsäger sig därmed ansvar för eventuell förlust eller skada av vad slag det må vara som grundar sig på användandet av analyser, dokument och övrig information som härrör från Traders Alloy.&nbsp;</span></p>',
            last_update_date: new Date()
        });

        return research;
    },
    async addDefaultUserScreener(u) {
        const response = await UserScreen.create({
            user_id: u.user_id,
            name: 'My "Large Cap" >€1B',
            filter: '{"market_cap":{"filterType":"number","operator":"AND","condition1":{"filterType":"number","type":"greaterThan","filter":1000,"filterTo":null},"condition2":{"filterType":"number","type":"lessThan","filter":1000000,"filterTo":null}}}',
        });

        return response;
    },
    async addDefaultUserTradePlan(user) {
        const exitDate = moment().add(3, 'M').valueOf();
        const entryDate = moment().subtract(7, 'days').valueOf();
        const userId = user.user_id;
        const stockId = 42953;
        const priceToday = (await Stock.findOne({ where: { stock_id: stockId } })).price_today;

        return await UserTradePlan.create({
            user_id: userId,
            stock_id: stockId,
            entry_price: priceToday,
            stoploss_price: (priceToday * 0.9),
            target_price: (priceToday * 1.1),
            long: true,
            entry_alert_status: 'on',
            stoploss_alert_status: 'on',
            target_alert_status: 'on',
            entry_date: exitDate,
            exit_date: entryDate
        });
    },
    async addDefaultUserAccount(user) {
        const userId = user.user_id;
        const user_account_id = user.user_id + '-0';

        return await UserAccount.create({
            user_id: userId,
            user_account_id: user_account_id,
            account_name: 'Example Paper Account',
            account_type: 'PAPER',
            balance: 100000,
            scale: 0,
            currency: 'SEK',
            hide: false,
            broker: null,
            order_preference: 0,
            nominal_position_size: 10000,
            secret_key: null,
            last_import_date: new Date().toISOString().slice(0, 10)
        });
    },
    async addDefaultTransactions(user) {
        const userId = user.user_id;
        const user_account_id = user.user_id + '-0';
        let userTxs = [{
                user_id: userId,
                account: '',
                stock_id: 772,
                user_account_id: user_account_id,
                tx_date: '2021-11-04',
                tx_type: 'BUY',
                isin: 'SE0000108656',
                description: '',
                qty: 2,
                price: 93,
                amount: -186,
                commission: 0,
                currency: 'SEK',
                exchange_rate: 93,
            },
            {
                user_id: userId,
                account: '',
                stock_id: 2524980,
                user_account_id: user_account_id,
                tx_date: '2021-11-04',
                tx_type: 'BUY',
                isin: 'SE0007280482',
                description: '',
                qty: 100,
                price: 0.5,
                amount: -50,
                commission: 0,
                currency: 'SEK',
                exchange_rate: 0.5,
            },
            {
                user_id: userId,
                account: '',
                stock_id: 1983,
                user_account_id: user_account_id,
                tx_date: '2021-11-09',
                tx_type: 'BUY',
                isin: 'DK0010274414',
                description: '',
                qty: 10,
                price: 11,
                amount: -110,
                commission: 0,
                currency: 'SEK',
                exchange_rate: 11,
            }
        ];
        for (let j = 0; j < userTxs.length; j++) {
            await UserTx.create(userTxs[j]);
        }
    },

    async check_user_exist_withEmail(email) {
        return await User.findOne({ where: { email } });
    },

    async create(email, password, settings) {
        if (await check_user_exist_withEmail_signup(email)) {
            throw new Error("USER_ALREADY_EXISTS"); // use this string with i18n
        }
        return await User.create({
            email,
            password,
            type: 'new',
            settings: settings.settings, // we have userSettings in 2 places ? Add a comment if this is intentional
            account: '{}',
            screen: '{}',
            created_date: new Date().toISOString().slice(0, 10),
            last_login_date: new Date().toISOString().slice(0, 10),
            membership_year: null,
            membership_date: null,
            subscription_id: null,
            tabs: settings.tabs, // TODO: possible bug in user creation settings used twice.
            card_id: null,
            customer_id: null
        });
    },

    async check_user_exist_withID(user_id) {
        return (await User.findOne({ where: { user_id } }) ? true : false);
    },

    async select(email) {
        const u = await User.findOne({ where: { email } });

        if (!u) {
            return null;
        }
        return u;
    },

    async findUser(user_id) {
        return await User.findOne({ where: { user_id } });
    },

    // TODO: move to UserWatchListManager
    async fetchWatchlistHeaders(user_id) {
        const user = await User.findOne({ where: { user_id } })
        if (!user) {
            return null;
        } else {
            return user.screen;
        }
    },

    async saveWatchlistHeaders(user_id, headers) {
        const user = await User.update({ screen: headers }, { where: { user_id } });
        return user;
    },

    async newPassword(email, newPass) {
        return User.update({ password: newPass }, {
            where: { email },
            returning: true
        });
    },

    async resetPassword(user_id, newPass) {
        return User.update({ password: newPass }, {
            where: { user_id },
            returning: true
        });
    },

    async update(email, type, settings, account, screen) {
        return await User.update({
                type: type,
                settings: settings, // personal preferences
                account: account, // anything related to payments
                screen: screen
            }, // preserve screen layout
            {
                where: { email },
                returning: true
            })
    },

    async verifyAndLogin(user_id) {
        return await User.update({ type: 'freemium' }, {
            where: { user_id },
            returning: true
        })
    },

    async list() {
        return await User.findAll();
    },

    async addUserSettings(user_id, user_settings) { // before it was addUserTabs
        return await User.update({ settings: JSON.stringify(user_settings) }, {
            where: { user_id },
            returning: true
        });
    },

    async addNavigationTabs(user_id, user_tabs) {
        return await User.update({ tabs: user_tabs }, {
            where: { user_id },
            returning: true
        });
    },

    async gotoPdf(user_id) {
        return await User.findOne({ where: { user_id } });
    },

    // Work In Progress: TODO: moved from UserFunManager
    async userResearchShare(req, res) {
        const research = await UserResearch.update({
            is_shared: true
        }, {
            where: { insref: req.body.insref, user_id: req.body.user_id },
            returning: true
        });

        const friends = await UserFriend.findAll({ where: { "user_id": req.body.user_id } });

        await emailer.invitationEmail(friends);

    },


    async updateUser_stripe(subscribe_id, customer_id, cardId, membership_date, user_id, type) {
        return await User.update({
            subscription_id: subscribe_id,
            membershipDate: membership_date,
            customer_id: customer_id,
            card_id: cardId,
            type: type,
        }, {
            where: { user_id },
            returning: true
        })
    },

    async userNotifications(user_id, weekly, newsletter) {
        return await User.update({
            email_weekly: weekly,
            email_newsletter: newsletter
        }, {
            where: { user_id },
            returning: true
        })
    },

    async unsubscribeEmailNewsletter(intercom_user_mail_id) {
        const config = {
            headers: {
                Authorization: `Bearer ${process.env.INTERCOM_AUTHENTICATION}`,
                Accept: 'application/json'
            }
        };

        const body = {
            custom_attributes: {
                email_newsletter: false
            }
        };

        const responseUnsubscribeNewsletter = await axios.put(`https://api.intercom.io/contacts/${intercom_user_mail_id}`, body, config);

        return responseUnsubscribeNewsletter.data;
    },

    async unsubscribeEmailNewsletterFromUserTable(user_id) {
        await User.update({
            email_newsletter: false
        }, {
            where: { user_id }
        });

        const response = await User.findOne({ where: { user_id } });

        return response;
    },

    async unsubscribeIntercomNewsletterFromUser(user_id) {
        const str_user_id = `${user_id}`;

        const config = {
            headers: {
                Authorization: `Bearer ${process.env.INTERCOM_AUTHENTICATION}`
            }
        };

        const body = {
            query: {
                field: 'external_id',
                operator: '=',
                value: str_user_id
            }
        };

        const response = await axios.post('https://api.intercom.io/contacts/search', body, config);

        return response.data;
    },

    async avanzaTest() {
        await avanza.authenticate({
            username: process.env.AVANZA_USERNAME,
            password: process.env.AVANZA_PASSWORD,
            totpSecret: process.env.AVANZA_TOTP_SECRET
        });

        const transactions = await avanza.getTransactions(Avanza.BUY_SELL);

        return transactions;
    }


};