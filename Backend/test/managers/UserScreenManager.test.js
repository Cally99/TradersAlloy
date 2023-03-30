const chai = require('chai');
const expect = chai.expect;

const userScreenManager = require('./../../server/managers/UserScreenManager');
const testing = require('./../../server/helpers/testing');
const userMock = require('./../mocks/UserMock');

describe('UserScreenManager', () => {
    let testUser;

    const userMockObject = userMock.getUserMockObject();

    beforeEach(async () => {
        await testing.deleteTestUserOnEmail(userMockObject.email);

        testUser = await testing.createTestUser(userMockObject);

        const screenMock1 = {
            user_id: testUser.user_id,
            name: 'test screen 1'
        };

        const screenMock2 = {
            user_id: testUser.user_id,
            name: 'test screen 2'
        };

        const screenMock3 = {
            user_id: testUser.user_id,
            name: 'test screen 3'
        };

        await testing.createTestScreener(screenMock1);
        await testing.createTestScreener(screenMock2);
        await testing.createTestScreener(screenMock3);
    });

    afterEach(async () => {
        await testing.deleteTestScreeners(testUser.user_id);
        await testing.deleteTestUser(testUser.user_id);
    });

    it('selectScreens', async () => {
        const screens = JSON.parse(JSON.stringify(await userScreenManager.selectScreens(testUser.user_id)));

        expect(screens).to.be.an('array');
        for(const screen of screens) {
            expect(screen).to.be.an('object');
            expect(screen).to.have.keys([
                'screen_id',
                'user_id',
                'name',
                'filter',
                'date_updated',
                'known_items'
            ]);
        }
    });

    it('insertScreen', async () => {
        const screenMock = {
            user_id: testUser.user_id,
            name: 'test screen 4'
        };

        const screen = JSON.parse(JSON.stringify(await userScreenManager.insertScreen(screenMock)));

        expect(screen.user_id).to.be.equal(testUser.user_id);
        expect(screen.name).to.be.equal(screenMock.name);
        expect(screen.filter).to.be.equal(null);
        expect(screen.date_updated).to.be.equal(null);
        expect(screen.known_items).to.be.equal(null);
    });

    it('updateScreen', async () => {
        const screens = await testing.selectTestScreeners(testUser.user_id);

        const screen_id = screens[0].screen_id;
        const name = 'test screen 10';

        const screen = JSON.parse(JSON.stringify(await userScreenManager.updateScreen(name, screen_id)));

        expect(screen[0]).to.be.equal(1);
        expect(screen[1][0].user_id).to.be.equal(testUser.user_id);
        expect(screen[1][0].name).to.be.equal(name);
    });

    it('updateScreenFilter', async () => {
        const screens = await testing.selectTestScreeners(testUser.user_id);

        const screen_id = screens[0].screen_id;
        const name = 'test screen 20';
        const filter = '{"market_cap":{"filterType":"number"}}';

        await userScreenManager.updateScreenFilter(name, screen_id, filter);

        const screen = (await testing.selectTestScreeners(testUser.user_id)).find((s) => s.screen_id === screen_id);

        expect(screen.screen_id).to.be.equal(screen_id);
        expect(screen.user_id).to.be.equal(testUser.user_id);
        expect(screen.name).to.be.equal(name);
        expect(screen.filter).to.be.equal(filter);
    });

    it('deleteScreen', async () => {
        const screensBeforeDelete = await testing.selectTestScreeners(testUser.user_id);

        const screen_id = screensBeforeDelete[0].screen_id;

        await userScreenManager.deleteScreen(screen_id);

        const screensAfterDelete = await testing.selectTestScreeners(testUser.user_id);

        const doesScreenExist = screensAfterDelete.find((s) => s.screen_id === screen_id);

        expect(screensBeforeDelete.length).to.be.equal(3);
        expect(screensAfterDelete.length).to.be.equal(2);
        expect(doesScreenExist).to.be.equal(undefined);
    });
});
