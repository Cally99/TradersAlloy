require('dotenv').config();

const API_KEY = process.env.MAILGUN_API_KEY;
const DOMAIN = process.env.MAILGUN_DOMAIN;

const mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: DOMAIN });
const _ = require('lodash');
const moment = require('moment');

const i18n = require('./i18n.js');

const { getPlatform, formatMillions } = require('./common');

const log4js = require('log4js');
const healthCheck = log4js.getLogger("health");

let Insiders_PricesAlerts_array = [];
let is_insiders = false;
let is_priceAlert = false;

// WHERE to put this so it can be used everywhere in the application ?
Date.prototype.getWeekOfYear = function() {
    let date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    let week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

// standard email header
const emailHeader = `
    <table style="width:100%;background:linear-gradient(120deg, #19c6ca, #082749);height:120px;">
        <tr>
            <td>
                <img width="100px" src="https://app.tradersalloy.com/images/traders-alloy-logo_icon-white-transparent.png" style="margin-top:10px; margin-left:10px;">
                <span style="color:white; font-size:5rem; font-weight:lighter; vertical-align:top;"> 
                    &nbsp; Traders Alloy
                </span>
            </td>
        </tr>
    </table>
`;

// standard email footer
const emailFooter = `
    <table style="margin-top:25px;color:white;font-size:0.8rem;width:100%;background:#444455;height:120px;">
        <tr>
            <td>Copyright © 2021 TradersAlloy OÜ, All rights reserved.
                <br/>
                <br/>
                <br/>
                <br/>
                <a style="color:#aaaaaa;" href="">Avregistrera</a>
            </td>
        </tr>
    </table>    
`;

// new design email header
const emailHeaderNewDesign = `
    <div style="background-color:#fcfcfc;background-image:url(https://app.tradersalloy.com/images/BlueGradientBox.png);background-repeat:no-repeat;background-position:center top;margin:auto;width:600px;border:0px solid;"> 
        <div style="margin-left:30px;margin-right:30px;padding-top:20px;border:0px solid;"> 
            <table style="width:100%;border:0px solid;"> 
                <tr> 
                    <td style="border:0px solid;">
                        <div style="width:34px;margin:auto;border:0px solid;">
                            <img src="https://app.tradersalloy.com/images/traders-alloy-logo_icon-white-transparent.png" alt="icon" style="width:34px;">
                        </div>
                    </td> 
                </tr> 
                <tr> 
                    <td style="height:35px;vertical-align:top;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:27px;color:#ffffff;font-size:18px;text-align:center;border:0px solid;">Traders Alloy</td> 
                </tr> 
`;

// new design email footer
const emailFooterNewDesign = (FRONTEND_URL) => {
    return `
                    <tr> 
                        <td align="center" style="padding-bottom:40px;border:0px solid;"> 
                            <div style="display:table-cell;width:170px;height:40px;text-align:center;vertical-align:middle;background-color:#325d85;color:#FFFFFF;border-radius:4px;">
                                <a href="${FRONTEND_URL}" target="_blank" style="font-size:14px;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:17px;color:#FFFFFF;text-decoration:none;padding-left:19px;padding-right:19px;padding-top:10px;padding-bottom:9px;">Till Traders Alloy</a>
                            </div>
                        </td> 
                    </tr>
                </table>
            </div>
            <table style="width:600px;border:0px solid;">
                <tr> 
                    <td style="background-color:#ebf0f4;padding-top:30px;padding-bottom:30px;border:0px solid;"> 
                        <table style="margin:auto;"> 
                            <tr> 
                                <td style="padding-right:30px;border:0px solid;"><a target="_blank" href="https://www.facebook.com/tradersalloy"><img title="Facebook" src="https://pyheht.stripocdn.email/content/guids/CABINET_4a5c8221c34b17320fe962a93790c7c5/images/48631627931635413.png" alt="Fb" style="width:24px;height:24px;"></a></td> 
                                <td style="padding-right:30px;border:0px solid;"><a target="_blank" href="https://www.instagram.com/tradersalloy"><img title="Instagram" src="https://pyheht.stripocdn.email/content/guids/CABINET_4a5c8221c34b17320fe962a93790c7c5/images/6171627931651434.png" alt="Inst" style="width:24px;height:24px;"></a></td> 
                                <td style="padding-right:30px;border:0px solid;"><a target="_blank" href="https://twitter.com/tradersalloy"><img title="Twitter" src="https://pyheht.stripocdn.email/content/guids/CABINET_4a5c8221c34b17320fe962a93790c7c5/images/45351627931663244.png" alt="Tw" style="width:24px;height:24px;"></a></td> 
                                <td style="padding-right:30px;border:0px solid;"><a target="_blank" href="https://www.youtube.com/channel/UCliNaWbzPcOXvLnU2s15UpA"><img title="Youtube" src="https://pyheht.stripocdn.email/content/guids/CABINET_4a5c8221c34b17320fe962a93790c7c5/images/76271627931672135.png" alt="Yt" style="width:24px;height:24px;"></a></td> 
                                <td style="border:0px solid;"><a target="_blank" href="https://linkedin.com/company/tradersalloy"><img title="Linkedin" src="https://pyheht.stripocdn.email/content/guids/CABINET_4a5c8221c34b17320fe962a93790c7c5/images/28811627931681717.png" alt="In" style="width:24px;height:24px;"></a></td> 
                            </tr> 
                            <tr> 
                                <td colspan="5" style="text-align:center;padding-top:5px;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;font-size:16px;border:0px solid;"><u>Avregistrera</u></td> 
                            </tr> 
                            <tr> 
                                <td colspan="5" style="text-align:center;padding-top:20px;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:18px;font-size:12px;border:0px solid;">Copyright © 2021 TradersAlloy OÜ, All rights reserved</td> 
                            </tr> 
                        </table>
                    </td> 
                </tr> 
            </table>
        </div> 
    `;
};

const emailFooterNewDesignWithoutButton = (FRONTEND_URL) => {
    return `
                </table>
            </div>
            <table style="width:600px;border:0px solid;">
                <tr> 
                    <td style="background-color:#ebf0f4;padding-top:30px;padding-bottom:30px;border:0px solid;"> 
                        <table style="margin:auto;"> 
                            <tr> 
                                <td style="padding-right:30px;border:0px solid;"><a target="_blank" href="https://www.facebook.com/tradersalloy"><img title="Facebook" src="https://pyheht.stripocdn.email/content/guids/CABINET_4a5c8221c34b17320fe962a93790c7c5/images/48631627931635413.png" alt="Fb" style="width:24px;height:24px;"></a></td> 
                                <td style="padding-right:30px;border:0px solid;"><a target="_blank" href="https://www.instagram.com/tradersalloy"><img title="Instagram" src="https://pyheht.stripocdn.email/content/guids/CABINET_4a5c8221c34b17320fe962a93790c7c5/images/6171627931651434.png" alt="Inst" style="width:24px;height:24px;"></a></td> 
                                <td style="padding-right:30px;border:0px solid;"><a target="_blank" href="https://twitter.com/tradersalloy"><img title="Twitter" src="https://pyheht.stripocdn.email/content/guids/CABINET_4a5c8221c34b17320fe962a93790c7c5/images/45351627931663244.png" alt="Tw" style="width:24px;height:24px;"></a></td> 
                                <td style="padding-right:30px;border:0px solid;"><a target="_blank" href="https://www.youtube.com/channel/UCliNaWbzPcOXvLnU2s15UpA"><img title="Youtube" src="https://pyheht.stripocdn.email/content/guids/CABINET_4a5c8221c34b17320fe962a93790c7c5/images/76271627931672135.png" alt="Yt" style="width:24px;height:24px;"></a></td> 
                                <td style="border:0px solid;"><a target="_blank" href="https://linkedin.com/company/tradersalloy"><img title="Linkedin" src="https://pyheht.stripocdn.email/content/guids/CABINET_4a5c8221c34b17320fe962a93790c7c5/images/28811627931681717.png" alt="In" style="width:24px;height:24px;"></a></td> 
                            </tr> 
                            <tr> 
                                <td colspan="5" style="text-align:center;padding-top:5px;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;font-size:16px;border:0px solid;"><u>Avregistrera</u></td> 
                            </tr> 
                            <tr> 
                                <td colspan="5" style="text-align:center;padding-top:20px;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:18px;font-size:12px;border:0px solid;">Copyright © 2021 TradersAlloy OÜ, All rights reserved</td> 
                            </tr> 
                        </table>
                    </td> 
                </tr> 
            </table>
        </div> 
    `;
};

exports.healthCheckEmail = async function(lines) {
    const platform = getPlatform();

    const emailSubject = `System Status: ${platform} : ${new Date().toISOString().slice(0, 10)}`;
    const sendTo = "AB <andrew.boddy.temp@gmail.com>";
    //    const sendTo = "AB <andrew.boddy.temp@gmail.com>";  // I really want this to be admin@tradersalloy.com

    let body = '';
    for (const line of lines) {
        body += `<tr><td> ${line} </td></tr>`;
    }
    const content = `${emailHeader}<table> ${body} </table> ${emailFooter}`;

    const response = await send(sendTo, emailSubject, content);
    console.log(JSON.stringify(response));

};

/*
Send this once a week
TODO: 1. corner cases when there is nothing to report
aaaa@gmail.com
    [{... IMMINENT ...}
    ,{... IMMINENT ...}
    ,{... PAST ...}]
bbbb@gmail.com
    [{}
    ,{}
    ,{}]
 */
exports.weeklyEmailTemplate = async function(emails) {
    const FRONTEND_URL = process.env.FRONTEND_URL;

    const emailSubject = "Traders Alloy Veckorapport";
    const weekNumber = moment().isoWeek();
    const logingAllSends = [];

    const groupOnEmailKeys = Object.keys(emails);

    for (const key of groupOnEmailKeys) {
        let emailContent = `
            ${emailHeaderNewDesign}
        `;

        const checkIfIminentExist = (typeof(emails[key].find((g) => g.time_group === 'IMMINENT'))) === 'object';
        const checkIfPastExist = (typeof(emails[key].find((g) => g.time_group === 'PAST'))) === 'object';

        emailContent += `
            <table> 
            <tr> 
                <td style="font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:19px;color:#222222;font-size:16px;border:0px solid;">
                    <div style="background-color:#ffffff; border-radius:5px; box-shadow:0 0 20px 5px rgba(0, 0, 0, 0.2);padding-left:10px;padding-right:10px;padding-top:3px;padding-bottom:5px;border:1px solid lightgrey;">
        `;

        const onlyEminents = emails[key].filter((g) => g.time_group === 'IMMINENT');

        emailContent += `
            <table style="width:100%; border:0px solid;">
        `;

        if (checkIfIminentExist) {
            emailContent += `
                    <tr>
                        <td colspan="5" style="font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:30px;color:#222222;font-size:20px;padding-bottom:5px;border:0px solid;">
                            <strong>Rapporterar nästa vecka</strong>
                        </td>
                    </tr>
            `;

            for (const item of onlyEminents) {
                const days = Math.round((Date.parse(item.date_report) - Date.now()) / (1000 * 60 * 60 * 24), 0);
                const color = (days < 0 ? 'grey' : days < 2 ? 'red' : days < 7 ? 'orange' : 'black');

                emailContent += `
                    <tr style="height:25px; font-size:0.7em; font-weight:bold;">
                        <td style="border:0px solid;">
                            <span style="font-size:0.8em;background-color:#556666; white-space:nowrap; font-weight:bold; padding:2px; color:white; width:40px; display: inline-block; min-width:30px; max-width:50px; line-height:0.8rem; text-align:center; margin:1px; border-radius:2px;">
                                ${item.ticker} 
                            </span>
                        </td>
                        <td style="font-size:11px; font-weight:400; border:0px solid;">
                            ${item.name}
                        </td>
                        <td colspan="3" style="font-size:11px; font-weight:400; color:${color}; border:0px solid;">
                            ${item.date_report}
                        </td>
                    </tr>
                `;
            }
        }

        if (checkIfPastExist) {
            const onlyPasts = emails[key].filter((g) => g.time_group === 'PAST');

            emailContent += `
                <tr>
                    <td colspan="5" style="vertical-align:bottom;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:30px;color:#222222;font-size:20px;border:0px solid;">
                        <strong>Rapporterat denna vecka</strong>
                    </td>
                </tr>
            `;

            for (const item of onlyPasts) {
                emailContent += `
                    <tr style="font-size:0.7em;height:25px;font-weight:bold;">
                        <td style="border:0px solid;">
                            <span style="font-size:0.8em;background:#556666; white-space:nowrap; font-weight:bold; padding:2px; color:white; width:40px; display: inline-block; min-width:30px; max-width:50px; line-height:0.8rem; text-align:center; margin:1px; border-radius:2px;">
                                ${item.ticker} 
                            </span>
                        </td>
                        <td style="font-size:11px; font-weight:400; border:0px solid;">
                            ${item.name}
                        </td>
                        <td style="font-size:11px; font-weight:400; border:0px solid;">
                            ${item.date_report}
                        </td>
                        <td style="font-size:11px; font-weight:400; text-align:right; padding-right:20px; border:0px solid;">
                            ${formatMillions(item.sales)}
                        </td>
                        <td style="font-size:11px; font-weight:400; text-align:right;border:0px solid;">
                            <a href="${FRONTEND_URL}/rapportkollen/stock/${item.stock_id}?tab=1">Läs rapporten</a>
                        </td>
                    </tr>
                `;
            }
        }
        emailContent += `
            </table> 
        `;

        emailContent += `
                    </div>
                </td> 
            </tr>
            <tr> 
                <td style="padding-left:40px;padding-right:40px;padding-top:30px;padding-bottom:10px;background-color:#fcfcfc;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#222222;font-size:16px;text-align:center;border:0px solid;">Redigera din bevakningslista och upptäck nya funktioner på Traders Alloy.</td> 
            </tr> 
            ${emailFooterNewDesign(FRONTEND_URL)}
        `;

        const response = await send(key, emailSubject, emailContent);

        logingAllSends.push(response);
    }

    return logingAllSends;
};

/**
 *      TODO: We will return to this template when it's time to implement it in
 *      dailyEmailTemplate and make unit tests on it
 * */
exports.insiderTradeEmail = function(records, insiders_array) {
    records.forEach(email => {
        insiders_array.forEach(insider => {
            if (email.isin === insider.isin) {
                // let emailContent = emailHeader;
                let emailContent = '';

                emailContent += '<table style="border:1px solid black; border-collapse: collapse" text-align:center;><thead><tr style="border:1px solid black;"><td style="border:1px solid black;">' +
                    'Instrument Name' + '</td><td style="border:1px solid black;">' +
                    'Person' + '</td><td style="border:1px solid black;">' +
                    'Person Title' + '</td><td style="border:1px solid black;">' +
                    'Action' + '</td><td style="border:1px solid black;">' +
                    'Transction Date' + '</td><td style="border:1px solid black;">' +
                    'Volumne' + '</td><td style="border:1px solid black;">' +
                    'Price' + '</td><td style="border:1px solid black;">' +
                    'VALUE' + '</td><td style="border:1px solid black;">' +
                    'Qty or Amount' + '</td><td style="border:1px solid black;">' +
                    'Currency' + '</td></tr></thead>';

                emailContent += '<tbody><tr style="border:1px solid black;"><td style="border:1px solid black;">' +
                    insider.instrument_name + '</td><td style="border:1px solid black;">' +
                    insider.person + '</td><td style="border:1px solid black;">' +
                    insider.person_title + '</td><td style="border:1px solid black;">' +
                    insider.transaction_nature + '</td><td style="border:1px solid black;">' +
                    insider.transaction_date + '</td><td style="border:1px solid black;">' +
                    insider.volumne + '</td><td style="border:1px solid black;">' +
                    insider.price + '</td><td style="border:1px solid black;">' +
                    (insider.volumne * insider.price) + '</td><td style="border:1px solid black;">' +
                    insider.qty_or_amount + '</td><td style="border:1px solid black;">' +
                    insider.transaction_currency + '</td></tr></tbody></table>';
                // emailContent += emailFooter;

                let temp = { email: email.email, content: emailContent };
                Insiders_PricesAlerts_array.push(temp);
                // send(email.email, 'InsiderTrade', emailContent)
            }
        });
    });
    mergeInsiderAndAlert(Insiders_PricesAlerts_array, 0);
};

/**
 *      email                       ticker  name                    reason      price   what_price_was_crossed  trade_plan_id
 *      ---------------------------------------------------------------------------------------------------------------------
 *      andrew.boddy.temp@gmail.com	INSR	Insr Insurance Group	TARGET	    23.3	0.1384678571428566	    14
 *      andrew.boddy.temp@gmail.com	STIL	Stille	                STOPLOSS	26.7	145.94107142857143	    15
 * */
exports.dailyEmailTemplate = async function(records) {
    const FRONTEND_URL = process.env.FRONTEND_URL;
    const modifiedRecords = JSON.parse(JSON.stringify(records));;

    for (const record of modifiedRecords) {
        for (const item of record.items) {
            if (item.reason === 'TARGET') {
                item.reason = 'EXIT';
            }
        }
    }

    const logingAllSends = [];
    const emailSubject = 'Kurslarm';

    for (const email of modifiedRecords) {
        let emailContent = `
            ${emailHeaderNewDesign}
        `;

        emailContent += `
            <tr> 
                <td style="font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:19px;border:0px solid;">
                    <div style="background-color:#ffffff; border-radius:5px; box-shadow:0 0 20px 5px rgba(0, 0, 0, 0.2);padding-left:10px;padding-right:10px;padding-top:3px;padding-bottom:5px;border:1px solid lightgrey;">
                        <table style="width:100%; border:0px solid;">
                            <tr style="font-size:0.7em;">
                                <td style="border:0px solid;"><strong>Ticker</strong></td>
                                <td style="border:0px solid;"><strong>Namn</strong></td>
                                <td style="border:0px solid;"><strong>Kurslarm</strong></td>
                                <td style="border:0px solid;"><strong>Din Kurs</strong></td>
                                <td style="border:0px solid;"><strong>Nuvarande kurs</strong></td>
                                <td style="border:0px solid;"><strong>Trade Plan</strong></td>
                            </tr>
        `;

        for (const row of email.items) {
            emailContent += `
                    <tr style="font-size:0.6em;">
                        <td style="padding:3px; border:0px solid;">
                            <span style="font-size:0.7em; background:#556666; white-space:nowrap; font-weight:bold; padding:2px; color:white; width:40px; display: inline-block; min-width:30px; max-width:50px; line-height:0.8rem; text-align:center; margin:1px; border-radius:2px;">
                                ${row.ticker}
                            </span>
                        </td>
                        <td style="border:0px solid;">${row.name}</td>
                        <td style="border:0px solid;">${row.reason}</td>
                        <td style="border:0px solid;">${row.what_price_was_crossed.toFixed(2)}</td>
                        <td style="border:0px solid;">${row.price_today}</td>
                        <td style="border:0px solid;"><a href="${FRONTEND_URL}/rapportkollen/watchlist/?stock_id=${row.stock_id}&tab=2">se Trade Plan</a></td>
                    </tr>
            `;
        }

        emailContent += `
                        </table>
                    </div>
                </td>
            </tr>
            <tr> 
                <td style="padding-left:40px;padding-right:40px;padding-top:30px;padding-bottom:10px;background-color:#fcfcfc;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#222222;font-size:16px;text-align:center;border:0px solid;">Redigera din bevakningslista och upptäck nya funktioner på Traders Alloy.</td> 
            </tr> 
            ${emailFooterNewDesign(FRONTEND_URL)}
        `;

        healthCheck.debug(email);

        const response = await send(email.email, emailSubject, emailContent);

        logingAllSends.push(response);
    }

    return logingAllSends;
};

const mergeInsiderAndAlert = async function(array, which) {
    const emailSubject = 'InsiderTrade && Kurslarm';

    if (which === 0) {
        is_insiders = true;
    }
    if (which === 1) {
        is_priceAlert = true;
    }

    // This is a temporary fix to exclude InsidersEmail to send mail, but will add it again later
    if (is_priceAlert) {
        // if (is_insiders && is_priceAlert) {
        let response;
        let final_array = [];
        for (let i = 0; i < array.length; i++) {
            let temp = {};
            temp.email = array[i].email;
            temp.content = array[i].content;
            for (let j = i + 1; j < array.length; j++) {
                if (array[i].email === array[j].email) {
                    temp.content += array[j].content;
                }
            }
            final_array.push(temp);
        }
        for (const item of final_array) {
            // console.log(item);
            response = await send(item.email, emailSubject, item.content);
        }
        Insiders_PricesAlerts_array = [];
        is_insiders = false;
        is_priceAlert = false;

        return response;
    }
};

exports.welcomeEmail = async function(user) {
    const FRONTEND_URL = process.env.FRONTEND_URL;
    // const SERVER_ADDRESS_PORT = process.env.SERVER_ADDR + ':' + process.env.PORT || '';

    const emailSubject = 'Välkommen till Traders Alloy';

    let emailContent = `
        ${emailHeaderNewDesign}
        <tr> 
            <td style="font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;border:0px solid;">
                <div style="background-color:#ffffff; border-radius:5px; box-shadow:0 0 20px 5px rgba(0, 0, 0, 0.2);padding-left:10px;padding-right:10px;padding-top:3px;padding-bottom:5px;border:1px solid lightgrey;">
                    <table style="width:100%; border:0px solid;">
                        <tr style="font-size:24px;">
                            <td style="text-align:center; padding-top:20px; padding-bottom:20px; border:0px solid;">
                                <div>
                                    Välkommen till Traders Alloy. Tryck på
                                </div>
                                <div>
                                    knappen nedan för att verifiera ditt konto.
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
        <tr> 
            <td align="center" style="padding-top:40px; padding-bottom:40px;border:0px solid;"> 
                <div style="display:table-cell;width:170px;height:40px;text-align:center;vertical-align:middle;background-color:#325d85;color:#FFFFFF;border-radius:4px;">
                    <a href="${FRONTEND_URL}/?verify_user=${user.user_id}" target="_blank" style="font-size:14px;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:17px;color:#FFFFFF;text-decoration:none;padding-left:19px;padding-right:19px;padding-top:10px;padding-bottom:9px;">Verifiera ditt konto</a>
                </div>
            </td> 
        </tr>
        ${emailFooterNewDesignWithoutButton(FRONTEND_URL)}
    `;

    await send(user.email, emailSubject, emailContent);
};

// TODO: This has a bug: request
exports.invitationEmail = async function(friendEmail, userEmail) {
    const FRONTEND_URL = process.env.FRONTEND_URL;

    let subject = 'Invitation from ' + userEmail;

    emailContent =
    `
    ${emailHeaderNewDesign}

    <!-- Body -->
    <tr style="width:450px;">
        <td>
            <!-- image -->
            <div style="width: 400px; height:210px; margin: auto;">
                <img src="https://pyheht.stripocdn.email/content/guids/CABINET_e8b5f5fac7556f8472c0bc7765c52dd6/images/37821627928982636.png" style="width: 100%; height: 100%;" alt="">
            </div>

    <!-- Tittle -->
            <div style="width: 270px; margin: auto;font-size: 16px; font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif; line-height:24px; text-align:center">
                <div style="color:#000000; text-decoration: none;">
                    ${userEmail} har bjudit in dig
                </div>
                <div style="color:#000000;">
                    till Traders Alloy
                </div>
            </div>

            
            <div style="width:354px; margin: auto;"">
                <hr style="border-top: 3px solid #3B81B0;">
            </div>

    <!-- subtittle -->
            <div style="margin: auto; width:365px; color:#000000; font-size: 16px; font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif; line-height:24px; text-align:center">
                <div style="margin: auto;">
                    Traders Alloy hjälper dig att ta mer genomtänkta 
                </div>
                <div style="width: 70%; margin: 0 auto;">
                    beslut och få kontroll över dina 
                </div>
                <div style="width: 40%; margin: 0 auto;">
                    aktieinvesteringar. 
                </div>
            </div>

    <!-- list -->
            <div style="width:355px; margin:auto; font-size: 14; font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif; line-height:24px; text-align:center">
                <div style="width:355px; margin-top: 20px;">
                    <div style="text-align:left; display: inline; float:left;">
                        >
                    </div>
                    <div style="margin-left:20px; color: #000000; text-align:left;">
                        Få kontroll över dina investeringar genom vår beslutsdrivande bevakningslista.
                    </div>
                </div>

                <div style="width:355px; margin-top: 20px;">
                    <div style="text-align:left; display: inline; float:left;">
                        >
                    </div>
                    <div style="margin-left:20px; color: #000000; text-align:left;">
                        Förstå vad du investerar i genom att du får tillgång till rapporter och data via vår plattform.
                    </div>
                </div>
                <div style="width:355px; margin-top: 20px;">
                    <div style="text-align:left; display: inline; float:left;">
                        >
                    </div>
                    <div style="margin-left:20px; color: #000000; text-align:left;">
                        Skapa handlingsplaner, så att du vet hur du ska agera.
                    </div>
                </div>
                <div style="width:355px; margin-top: 20px;">
                    <div style="text-align:left; display: inline; float:left;">
                        >
                    </div>
                    <div style="margin-bottom: 40px; margin-left:20px; color: #000000;text-align:left;">
                        Logga dina tankar i vår tradingdagbok.
                    </div>
                </div>
            </div>
        </td>
    </tr>
    ${emailFooterNewDesign(FRONTEND_URL)}
    `;

    await send(friendEmail, subject, emailContent);
};

exports.millistreamPricesComplete = async function(email) {
    const emailSubject = 'Completed the price data update';

    const emailContent = `
        ${emailHeader}
        <h2 style="color:#444455;">
            Completed the Getting Prices.
        </h2>
        <p style="font-size:2rem;"> 
            The stock price data update process was completed.
        </p>
        ${emailFooter}
    `;

    await send(email, emailSubject, emailContent);
};

exports.forgottenPasswordEmail = async function(email, confirm_code) {
    const FRONTEND_URL = process.env.FRONTEND_URL;

    const emailSubject = await i18n.t('reset_password');

    const emailContent = `
        ${emailHeaderNewDesign}
        <tr>
            <td style="font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:19px;border:0px solid;">
                <div style="background-color:#ffffff; border-radius:5px; box-shadow:0 0 20px 5px rgba(0, 0, 0, 0.2);padding-left:10px;padding-right:10px;padding-top:3px;padding-bottom:5px;border:1px solid lightgrey;">
                    <table style="width:100%; border:0px solid;">
                        <tr style="font-size:0.7em;">
                            <td style="text-align:center; padding-top:10px; padding-bottom:10px; border:0px solid;"><h2>Confirm code: ${confirm_code}</h2></td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
        ${emailFooterNewDesign(FRONTEND_URL)}}
    `;

    const response = await send(email, emailSubject, emailContent);

    return response;
};

const send = function(address, title, content) {
    return new Promise((resolve, reject) => {

        let emailObject = {
            from: 'Petter Hattenbach <me@samples.mailgun.org>',
            to: address,
            subject: title,
            html: content
        };

        mailgun.messages().send(emailObject, (error, body) => {
            if (error) {
                // console.log("got an error: ", error.message);
                return reject(error);
            }

            // console.log('*** MailGun: sent');
            // console.log(body);
            return resolve(body);
        });
    });
};
