const User = require('./../../server/models').User;
const UserTradePlan = require('./../../server/models').UserTradePlan;
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const moment = require('moment');

const stockManager = require('./../../server/managers/StockManager');
const userManager = require('./../../server/managers/userManager');
const userEmailDailyManager = require('./../../server/managers/UserEmailDailyManager');
const userTradePlanManager = require('./../../server/managers/UserTradePlanManager');

describe('UserEmailDailyManager.updateTarget', () => {
    it('simple', async () => {
        const rowCount = await userEmailDailyManager.updateTarget([1, 2, 3]);
        expect(rowCount).to.be.an('array');
    });
});

describe('UserEmailDailyManager.updateStoploss', () => {
    it('simple', async () => {
        const rowCount = await userEmailDailyManager.updateStoploss([1, 2, 3]);
        expect(rowCount).to.be.an('array');
    });
});

describe('UserEmailDailyManager.updateEntry', () => {
    it('simple', async () => {
        const rowCount = await userEmailDailyManager.updateEntry([1, 2, 3]);
        expect(rowCount).to.be.an('array');
    });
});

describe('UserEmailDailyManager', () => {
    let spyCreate;
    let stockId;
    let todaysDate;
    let futureDate;
    let user;
    let stock;
    let priceToday;

    beforeEach(async () => {
        spyCreate = sinon.spy(userManager, 'create');

        const email = 'test123123123@test123123123.com';
        const password = 'testing123123123';
        const settings = {settings: '{"language":"sv","settings":[]}'};

        await userManager.create(email, password, settings);

        for(const item of spyCreate.returnValues) {
            stockId = 2756;
            todaysDate = new Date(moment().format('YYYY-MM-DD')).getTime();
            futureDate = new Date(moment().add(2, 'weeks').format('YYYY-MM-DD')).getTime();
            user = await item;
            stock = await stockManager.fetch(stockId);
            priceToday = stock.price_today;
        }
    });

    afterEach(async () => {
        for (const item of spyCreate.returnValues) {
            const deleteUser = await item;

            // Use this sequelize command because there is no
            // endpoint for removal of users in the backend
            await User.destroy({ where: { user_id: deleteUser.user_id} });
            await UserTradePlan.destroy({ where: { user_id: deleteUser.user_id } });
        }

        spyCreate.restore();
    });

    it('should get trade plan alert TARGET', async () => {
        const targetPrice = priceToday * 0.9;
        const entryPrice = priceToday * 0.8;
        const stoplossPrice = priceToday * 0.7;

        await userTradePlanManager.insertUserTradePlan({
            user_id: user.user_id,
            stock_id: stockId,
            target_price: targetPrice,
            entry_price: entryPrice,
            stoploss_price: stoplossPrice,
            exit_date: todaysDate,
            entry_date: futureDate,
            long: true,
            entry_alert_status: 'on',
            stoploss_alert_status: 'on',
            target_alert_status: 'on'
        });

        const alerts = await userEmailDailyManager.getAllAlertsForAllUsers();
        const alert = alerts.find((a) => a.email === user.email);

        // Assertion
        expect(alert.reason).to.equal('TARGET');
    });

    it('should get trade plan alert STOPLOSS', async () => {
        const targetPrice = priceToday * 1.3;
        const entryPrice = priceToday * 1.2;
        const stoplossPrice = priceToday * 1.1;

        await userTradePlanManager.insertUserTradePlan({
            user_id: user.user_id,
            stock_id: stockId,
            target_price: targetPrice,
            entry_price: entryPrice,
            stoploss_price: stoplossPrice,
            exit_date: todaysDate,
            entry_date: futureDate,
            long: true,
            entry_alert_status: 'on',
            stoploss_alert_status: 'on',
            target_alert_status: 'on'
        });

        const alerts = await userEmailDailyManager.getAllAlertsForAllUsers();
        const alert = alerts.find((a) => a.email === user.email);

        // Assertion
        expect(alert.reason).to.equal('STOPLOSS');
    });

    it('should get trade plan alert ENTRY', async () => {
        const targetPrice = priceToday * 1.2;
        const entryPrice = priceToday * 1.1;
        const stoplossPrice = priceToday * 0.9;

        await userTradePlanManager.insertUserTradePlan({
            user_id: user.user_id,
            stock_id: stockId,
            target_price: targetPrice,
            entry_price: entryPrice,
            stoploss_price: stoplossPrice,
            exit_date: todaysDate,
            entry_date: futureDate,
            long: true,
            entry_alert_status: 'on',
            stoploss_alert_status: 'on',
            target_alert_status: 'on'
        });

        const alerts = await userEmailDailyManager.getAllAlertsForAllUsers();
        const alert = alerts.find((a) => a.email === user.email);

        // Assertion
        expect(alert.reason).to.equal('ENTRY');
    });

    it('should get no trade plan alerts', async () => {
        const targetPrice = priceToday * 1.1;
        const entryPrice = priceToday * 0.9;
        const stoplossPrice = priceToday * 0.8;

        await userTradePlanManager.insertUserTradePlan({
            user_id: user.user_id,
            stock_id: stockId,
            target_price: targetPrice,
            entry_price: entryPrice,
            stoploss_price: stoplossPrice,
            exit_date: todaysDate,
            entry_date: futureDate,
            long: true,
            entry_alert_status: 'on',
            stoploss_alert_status: 'on',
            target_alert_status: 'on'
        });

        const alerts = await userEmailDailyManager.getAllAlertsForAllUsers();
        const alert = alerts.find((a) => a.email === user.email);

        // Assertion
        expect(alert).to.equal(undefined);
    });

    it('should have following structure', async () => {
        const targetPrice = priceToday * 0.9;
        const entryPrice = priceToday * 0.8;
        const stoplossPrice = priceToday * 0.7;

        await userTradePlanManager.insertUserTradePlan({
            user_id: user.user_id,
            stock_id: stockId,
            target_price: targetPrice,
            entry_price: entryPrice,
            stoploss_price: stoplossPrice,
            exit_date: todaysDate,
            entry_date: futureDate,
            long: true,
            entry_alert_status: 'on',
            stoploss_alert_status: 'on',
            target_alert_status: 'on'
        });

        const alerts = await userEmailDailyManager.getAllAlertsForAllUsers();
        const alert = alerts.find((a) => a.email === user.email);

        // Assertion
        expect(alert).to.be.an('object');
        expect(alert).to.has.keys([
            'email',
            'ticker',
            'name',
            'reason',
            'price_today',
            'what_price_was_crossed',
            'trade_plan_id',
            'stock_id'
        ]);
    });
});
