import chai from 'chai';
import ApiService from "@/Services/ApiService";
import dotenv from 'dotenv';
dotenv.config();

import testing from './../helpers/testing';

const expect = chai.expect;
// const Firefox = require('selenium-webdriver/firefox');
const Chrome = require('selenium-webdriver/chrome');
// const options = new Firefox.Options();
const options = new Chrome.Options();
const { Builder, By, Key, until } = require('selenium-webdriver');

options.addArguments('--headless');
options.addArguments('--no-sandbox');
options.addArguments('--disable-dev-shm-usage');

// require('geckodriver');
require('chromedriver');

describe('SeleniumUserLogin', () => {
    const FRONTEND_URL = process.env.VUE_APP_FRONTEND_URL;
    // const FRONTEND_URL = process.env.VUE_APP_FRONTEND_URL || 'https://dev-frontend.tradersalloy.com';

    const userMock = {
        email: 'test1234@test1234.com',
        password: 'Test1234',
        type: 'new',
        settings: '',
        account: '{}',
        screen: '{}',
        created_date: '2021-08-12',
        last_login_date: '2021-08-12',
        membership_year: null,
        membership_date: null,
        subscription_id: null,
        tabs: '{3561,5664,42953}'
    };

    let driver = null;

    beforeEach(async() => {
        jest.setTimeout(60000);

        // driver = await new Builder().forBrowser('firefox').withCapabilities(options).build();
        driver = await new Builder().forBrowser('chrome').withCapabilities(options).build();

        await driver.manage().window().maximize();

        await testing.deleteUserProcedure(userMock);
        await ApiService.addUser(userMock);
    });

    afterEach(async() => {
        await driver.quit();
        await testing.deleteUserProcedure(userMock);
    });

    afterAll(async() => {
        jest.clearAllTimers();
    });

    it('login', async() => {
        await driver.get(FRONTEND_URL);

        const emailElement = await driver.findElement(By.name('email'));
        const passwordElement = await driver.findElement(By.name('userpassword'));
        const loginButtonElement = await driver.findElement(By.id('logginBtn'));

        await emailElement.sendKeys(userMock.email);
        await passwordElement.sendKeys(userMock.password);
        await loginButtonElement.click();

        const firstPageElement = await driver.wait(until.elementLocated(By.id('firstPageElement')));
        const allWatchlistHeadlineText = await firstPageElement.getText();

        expect(allWatchlistHeadlineText).to.be.not.equal(null);
    }, 60000);
});
