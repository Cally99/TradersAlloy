const companyManager = require('./server/managers/CompanyManager.js');
const CompanyWebcastManager = require('./server/managers/CompanyWebcastManager.js');

let companies = [];
let webcasts = [];
let scrapped_array = [];

const puppeteer = require('puppeteer');
process.setMaxListeners(0);

async function start() {
    console.log('**************')
    companies = [];
    webcasts = [];
    scrapped_array = [];
    companies = await companyManager.list();
    webcasts = await CompanyWebcastManager.list();


    const browser = await puppeteer.launch({
        headless: false, // open browser
        ignoreHTTPSErrors: true,
        args: [`--window-size=1500,1080`], // size of browser
        defaultViewport: {
            width: 1500,
            height: 1080
        }
    })
    const page = await browser.newPage()
    await page.setViewport({ width: 1535, height: 756 })
    await page.setDefaultNavigationTimeout(0); // prevent timeout bug
    await page.goto('https://financialhearings.com/')

    for (let i = 0; i < 1000000000; i++) {
        if (await page.$('.calendar-app > .tab-content > #library > .event-calender-load > .button--load-more--alt') !== null) {
            console.log('Load Moer Events Button clicked=====', i)
            await page.waitForSelector('.calendar-app > .tab-content > #library > .event-calender-load > .button--load-more--alt')
            await page.click('.calendar-app > .tab-content > #library > .event-calender-load > .button--load-more--alt')
            for (let j = 1; j <= 10; j++) {
                let inx = i * 10 + j;
                let expandableSelector = '.event-calendar--library > .ng-scope:nth-child(' + inx + ') > .event > .event__toggle > span'

                let titleClass = '.event-calendar--library > .ng-scope:nth-child(' + inx + ') > .event > .event__always-visible > .event__title'
                let titleSelector = await page.waitForSelector(titleClass);
                let title_string = await page.evaluate(el => el.textContent, titleSelector);
                let title_splited_array = title_string.split(/[\s,]+/);
                page.waitForNavigation() //prevent timeout bug

                let company = companies.find(item => item.name.includes(title_splited_array[0]));
                if (company) {
                    if (await page.waitForSelector(expandableSelector) !== null) {
                        await page.waitForSelector(expandableSelector)
                        await page.click(expandableSelector);
                        page.waitForNavigation()

                        let time_month_class = '.event-calendar--library > .ng-scope:nth-child(' + inx + ') > .event > .event__date > time > .ng-binding:nth-child(1)'
                        let time_month_selector = await page.$(time_month_class);
                        let time_month = await page.evaluate(el => el.textContent, time_month_selector);
                        page.waitForNavigation()

                        let time_date_class = '.event-calendar--library > .ng-scope:nth-child(' + inx + ') > .event > .event__date > time > .ng-binding:nth-child(2)'
                        let time_date_selector = await page.$(time_date_class);
                        let time_date = await page.evaluate(el => el.textContent, time_date_selector);
                        page.waitForNavigation()

                        let time_year_class = '.event-calendar--library > .ng-scope:nth-child(' + inx + ') > .event > .event__date > time > .ng-binding:nth-child(3)'
                        let time_year_selector = await page.$(time_year_class);
                        let time_year = await page.evaluate(el => el.textContent, time_year_selector);
                        page.waitForNavigation()

                        //month is getting as String... so that we need to convert it to number
                        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                        const month_number = months.findIndex(item => item == time_month);

                        let date = time_year + '-' + parseInt(month_number + 1) + '-' + time_date;



                        // webcast is in 2th to 9th position. (actually, almost 5th, some 4th and 7th)
                        let webcast = null;
                        for (let k = 2; k < 10; k++) {
                            let webcast_class = '.event-calendar--library > .ng-scope:nth-child(' + inx + ') > .event > .event__expandable > ul > .ng-scope:nth-child(' + k + ') > a'
                            let webcast_selector = await page.$(webcast_class);
                            if (webcast_selector) {
                                webcast = await page.evaluate(el => el.getAttribute('href'), webcast_selector);
                                break;
                            }
                        }


                        let language = 'en';
                        let language_class = '.event-calendar--library > .ng-scope:nth-child(' + inx + ') > .event > .event__always-visible > .flag--English'
                        let language_selector = await page.$(language_class);
                        if (!language_selector) {
                            language = 'sv';
                        }

                        const recall = function(number) {
                            let nth_today = number;
                            let inx = scrapped_array.findIndex(item => item.company_id == company.company_id && item.publish_date == date && item.nth_today == nth_today);
                            if (inx < 0) {
                                return nth_today;
                            } else {
                                return recall(nth_today + 1);
                            }
                        }
                        const final_nthToday = recall(1);


                        let final_data = {
                            company_id: company.company_id,
                            publish_date: date,
                            nth_today: final_nthToday,
                            title: title_string,
                            media_link: webcast,
                            source: 'FH',
                            language_code: language
                        }


                        for (let x = 0; x < webcasts.length; x++) {
                            if (webcasts[x].company_id == company.company_id && webcasts[x].publish_date == date && webcasts[x].nth_today == nth_today) {
                                console.log('Exist ====== DONE ==========')
                                return;
                            }
                        }
                        console.log('data=======', company.company_id, date, webcast, language, final_nthToday);
                        if (webcast) {
                            await CompanyWebcastManager.insertOneWebcast(final_data);
                            scrapped_array.push(final_data);
                            console.log('added ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++', scrapped_array.length);
                        }
                    }
                }

            }
        }
    }

    // await browser.close()
    console.log('DONE')
}


start()