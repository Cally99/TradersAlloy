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

describe.skip('SeleniumScreener', () => {
    const FRONTEND_URL = process.env.VUE_APP_FRONTEND_URL;
    // const FRONTEND_URL = process.env.VUE_APP_FRONTEND_URL || 'https://dev-frontend.tradersalloy.com';

    let userMock = {
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
    let testUser = null;

    beforeEach(async() => {
        jest.setTimeout(60000);

        // driver = await new Builder().forBrowser('firefox').withCapabilities(options).build();
        driver = await new Builder().forBrowser('chrome').withCapabilities(options).build();
        

        await driver.manage().window().maximize();

        // await testing.deleteUserProcedure(userMock);
        // testUser = (await ApiService.addUser(userMock)).data;

        // for(const userAccountMockObject of testing.userAccountMockSeleniumObjects(testUser)) {
        //     await ApiService.createUserAccount(userAccountMockObject);
        // }

        // for(const userTradeMockObject of testing.userTradeMockObjects(testUser)) {
        //     await ApiService.insertUserTrade(userTradeMockObject);
        // }
    });

    afterEach(async() => {
        await driver.quit();
        // await testing.deleteUserProcedure(userMock);
    });

    afterAll(async() => {
        jest.clearAllTimers();
    });

    it('screener', async() => {
        await driver.get(FRONTEND_URL);

        await driver.executeScript("localStorage.setItem(arguments[0],arguments[1])", "user", JSON.stringify(testing.localStorageAdminUser(testUser)));
        await driver.executeScript("window.location.href = '/rapportkollen'");

        const positionsElement = await driver.wait(until.elementLocated(By.id('screener')));

        await driver.executeScript("arguments[0].scrollIntoView()", positionsElement);

        await positionsElement.click();

        const clickableElements = await driver.wait(until.elementLocated(By.className('blue3')));
        const addColumeButton = clickableElements[5];

        await driver.executeScript("arguments[0].click()", addColumeButton);

        const agMenuAddColumn = await driver.wait(until.elementsLocated(By.className('ag-menu')));

        expect(agMenuAddColumn.length).to.be.equal(1);
    }, 60000);
});
