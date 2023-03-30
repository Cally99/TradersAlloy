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

describe.skip('SeleniumPositions', () => {
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

        await testing.deleteUserProcedure(userMock);
        testUser = (await ApiService.addUser(userMock)).data;

        for(const userAccountMockObject of testing.userAccountMockSeleniumObjects(testUser)) {
            await ApiService.createUserAccount(userAccountMockObject);
        }

        for(const userTradeMockObject of testing.userTradeMockObjects(testUser)) {
            await ApiService.insertUserTrade(userTradeMockObject);
        }
    });

    afterEach(async() => {
        await driver.quit();
        await testing.deleteUserProcedure(userMock);
    });

    afterAll(async() => {
        jest.clearAllTimers();
    });

    it('positions', async() => {
        await driver.get(FRONTEND_URL);

        await driver.executeScript("localStorage.setItem(arguments[0],arguments[1])", "user", JSON.stringify(testing.localStorageAdminUser(testUser)));
        await driver.executeScript("window.location.href = '/rapportkollen'");

        const positionsElement = await driver.wait(until.elementLocated(By.id('positions')));

        await driver.executeScript("arguments[0].scrollIntoView()", positionsElement);

        await positionsElement.click();

        const agIconTreeClosedElement = await driver.wait(until.elementLocated(By.className('ag-group-contracted')));

        const agGroupChildCountText = await driver.executeScript("return document.querySelector('.ag-group-child-count').innerHTML");

        expect(agGroupChildCountText).to.be.equal('(3)');

        const tickerElements = await driver.findElement(By.xpath("//*[text()='NOKIA']")); //driver.executeScript("return document.querySelector('.ticker').innerHTML");//wait(until.elementsLocated(By.className('ticker blue1 mt-1 mr-1')));

        const tickerText = await tickerElements.getAttribute('innerHTML');

        expect(tickerText).to.be.equal('NOKIA');

        await driver.executeScript("arguments[0].click()", agIconTreeClosedElement);

        const agCellWrapperElements = await driver.wait(until.elementsLocated(By.className('ag-cell-wrapper')));

        expect(agCellWrapperElements.length).to.be.equal(4);
    }, 60000);
});
