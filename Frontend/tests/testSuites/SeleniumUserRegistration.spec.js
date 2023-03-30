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

describe('SeleniumUserRegistration', () => {
    const FRONTEND_URL = process.env.VUE_APP_FRONTEND_URL;
    // const FRONTEND_URL = process.env.FRONTEND_URL || 'https://dev-frontend.tradersalloy.com';

    const userMock = {
        email: 'test1234@test1234.com',
        password: 'Test1234',
        type: 'new',
        settings: '{"tabs":[{"i":0,"name":"Watchlist","path":"/watchlist"},{"i":1,"name":"FNOX","path":"/stocks","stock_id":42953},{"i":2,"name":"ERIC B","path":"/stocks","stock_id":772},{"i":3,"name":"SWMA","path":"/stocks","stock_id":5664}]}',
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
    });

    afterEach(async() => {
        await driver.quit();
        await testing.deleteUserProcedure(userMock);
    });

    afterAll(async() => {
        jest.clearAllTimers();
    });

    it('registration', async() => {
        await driver.get(FRONTEND_URL);

        const createAccountButtonElement = await driver.findElement(By.id('registerBtn'));

        await driver.executeScript("arguments[0].scrollIntoView()", createAccountButtonElement);

        await createAccountButtonElement.click();

        const submitRegistrationButtonElement = await driver.wait(until.elementLocated(By.id('submitRegistrationBtn')));

        expect(submitRegistrationButtonElement).to.be.not.equal(null);

        const emailRegistrationElement = await driver.findElement(By.id('email'));
        const passwordRegistrationElement = await driver.findElement(By.id('input-27'));

        await emailRegistrationElement.sendKeys(userMock.email);
        await passwordRegistrationElement.sendKeys(userMock.password);

        await submitRegistrationButtonElement.click();

        const firstPageElement = await driver.wait(until.elementLocated(By.id('firstPageElement')));
        const allWatchlistHeadlineText = await firstPageElement.getText();

        expect(allWatchlistHeadlineText).to.be.not.equal(null);
    }, 60000);
});