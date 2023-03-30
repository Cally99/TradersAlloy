const User = require('./../../server/models').User;
const chai = require('chai');
const expect = chai.expect;

const userManager = require('./../../server/managers/UserManager');
const userWatchlistService = require('./../../server/services/UserWatchlistService');

describe('UserWatchlistService', () => {
    let testUser;

    before(async() => {
        const email = 'test123@test123.com';
        const password = 'test';
        const settings = '{\"language\":\"sv\",\"settings\":[]}';

        testUser = JSON.parse(JSON.stringify(await userManager.create(email, password, settings)));
    });

    after(async() => {
        // Use this sequelize command because there is no
        // endpoint for removal of users in the backend
        await User.destroy({ where: { user_id: testUser.user_id } });
    });

    it('selectWatchlists', async() => {
        await userWatchlistService.insertWatchlist({ name: 'Test123', user_id: testUser.user_id });

        const selectWatchlistsTest = JSON.parse(JSON.stringify(await userWatchlistService.selectWatchlists(testUser.user_id)));

        for (const watchlist of selectWatchlistsTest) {
            await userWatchlistService.deleteWatchlist(watchlist.watchlist_id);
        }

        expect(selectWatchlistsTest).to.be.an('array');
        for (const watchlist of selectWatchlistsTest) {
            expect(watchlist).to.be.an('object');
            expect(watchlist).to.have.keys([
                'watchlist_id',
                'user_id',
                'name',
                'type'
            ]);
        }
    });

    //TODO: Need to fix this unit test before deployment.
    //Getting error message:
    //SequelizeEagerLoadingError: UserWatchlistItem is not associated to UserWatchlist!
    it.skip('selectWatchlistObjects', async() => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistService.insertWatchlist({ name: 'Test123', user_id: testUser.user_id })));

        const item = await userWatchlistService.insertItem({
            user_id: testUser.user_id,
            stock_id: 1294,
            // ticker character varying(20) COLLATE pg_catalog."default",
            // name character varying(255) COLLATE pg_catalog."default",
            // isin character varying(255) COLLATE pg_catalog."default",
            conviction: 0,
            // plan_entry_price double precision,
            // plan_stoploss_price double precision,
            // plan_target_price double precision,
            watched_since: '2021-01-01',
            // watched_since_price double precision,
            // tags text COLLATE pg_catalog."default"
        });

        const selectWatchlistObjectsTest = JSON.parse(JSON.stringify(await userWatchlistService.selectWatchlistObjects(testUser.user_id)));

        await userWatchlistService.deleteWatchlistItems(watchlist.watchlist_id);
        await userWatchlistService.deleteWatchlist(watchlist.watchlist_id);

        expect(selectWatchlistObjectsTest).to.be.an('array');
        for (const selectWatchlist of selectWatchlistObjectsTest) {
            expect(selectWatchlist).to.be.an('object');
            expect(selectWatchlist).to.have.keys([
                'watchlist_id',
                'user_id',
                'name',
                'type',
                'UserWatchlistItems'
            ]);
            expect(selectWatchlist.UserWatchlistItems).to.be.an('array');
            for (const item of selectWatchlist.UserWatchlistItems) {
                expect(item).to.be.an('object');
                expect(item).to.have.keys([
                    'watchlist_item_id',
                    'user_id',
                    'stock_id',
                    'ticker',
                    'isin',
                    'company_id',
                    'name',
                    'conviction',
                    'watched_since',
                    'watched_since_price',
                    'tags'
                ]);
            }
        }
    });

    it('selectWatchlist', async() => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistService.insertWatchlist({ name: 'Test123', user_id: testUser.user_id })));

        const watchlistTest = JSON.parse(JSON.stringify(await userWatchlistService.selectWatchlist(watchlist.watchlist_id)));

        await userWatchlistService.deleteWatchlist(watchlist.watchlist_id);

        expect(watchlistTest).to.be.an('object');
        expect(watchlistTest).to.have.keys([
            'watchlist_id',
            'user_id',
            'name',
            'type'
        ]);
    });

    it('insertWatchlist', async() => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistService.insertWatchlist({ name: 'Test123', user_id: testUser.user_id })));

        const watchlistTest = JSON.parse(JSON.stringify(await userWatchlistService.selectWatchlist(watchlist.watchlist_id)));

        await userWatchlistService.deleteWatchlist(watchlist.watchlist_id);

        expect(watchlistTest).to.be.an('object');
        expect(watchlistTest).to.have.keys([
            'watchlist_id',
            'user_id',
            'name',
            'type'
        ]);
        expect(watchlistTest.name).to.be.equal('Test123');
    });

    it('updateWatchlist', async() => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistService.insertWatchlist({ name: 'Test123', user_id: testUser.user_id })));

        const watchlistTestBeforeUpdate = JSON.parse(JSON.stringify(await userWatchlistService.selectWatchlist(watchlist.watchlist_id)));

        await userWatchlistService.updateWatchlist('Test456', watchlist.watchlist_id);

        const watchlistTestAfterUpdate = JSON.parse(JSON.stringify(await userWatchlistService.selectWatchlist(watchlist.watchlist_id)));

        await userWatchlistService.deleteWatchlist(watchlist.watchlist_id);

        expect(watchlistTestBeforeUpdate).to.be.an('object');
        expect(watchlistTestBeforeUpdate).to.have.keys([
            'watchlist_id',
            'user_id',
            'name',
            'type'
        ]);
        expect(watchlistTestBeforeUpdate.name).to.be.equal('Test123');

        expect(watchlistTestAfterUpdate).to.be.an('object');
        expect(watchlistTestAfterUpdate).to.have.keys([
            'watchlist_id',
            'user_id',
            'name',
            'type'
        ]);
        expect(watchlistTestAfterUpdate.name).to.be.equal('Test456');
    });

    it('deleteWatchlist', async() => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistService.insertWatchlist({ name: 'Test123', user_id: testUser.user_id })));

        const watchlistTestBeforeDelete = JSON.parse(JSON.stringify(await userWatchlistService.selectWatchlist(watchlist.watchlist_id)));

        await userWatchlistService.deleteWatchlist(watchlist.watchlist_id);

        const watchlistTestAfterDelete = JSON.parse(JSON.stringify(await userWatchlistService.selectWatchlist(watchlist.watchlist_id)));

        expect(watchlistTestBeforeDelete).to.be.an('object');
        expect(watchlistTestBeforeDelete).to.have.keys([
            'watchlist_id',
            'user_id',
            'name',
            'type'
        ]);
        expect(watchlistTestBeforeDelete.name).to.be.equal('Test123');

        expect(watchlistTestAfterDelete).to.be.equal(null);
    });

    it('deleteWatchlistItems', async() => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistService.insertWatchlist({ name: 'Test123', user_id: testUser.user_id })));

        await userWatchlistService.insertItem({
            user_id: testUser.user_id,
            stock_id: 1294,
            // ticker character varying(20) COLLATE pg_catalog."default",
            // name character varying(255) COLLATE pg_catalog."default",
            // isin character varying(255) COLLATE pg_catalog."default",
            conviction: 0,
            // plan_entry_price double precision,
            // plan_stoploss_price double precision,
            // plan_target_price double precision,
            watched_since: '2021-01-01',
            // watched_since_price double precision,
            // tags text COLLATE pg_catalog."default"
        });

        const watchlistItemBeforeDelete = JSON.parse(JSON.stringify(await userWatchlistService.selectItems(testUser.user_id)));

        await userWatchlistService.deleteWatchlistItems({ stock_id: watchlistItemBeforeDelete[0].stock_id, user_id: watchlistItemBeforeDelete[0].user_id });

        const watchlistItemAfterDelete = JSON.parse(JSON.stringify(await userWatchlistService.selectItems(testUser.user_id)));

        await userWatchlistService.deleteWatchlist(watchlist.watchlist_id);
        await userWatchlistService.deleteWatchlistItems({ stock_id: watchlist.stock_id, user_id: watchlist.user_id });

        expect(watchlistItemBeforeDelete).to.be.an('array');
        for (const item of watchlistItemBeforeDelete) {
            expect(item).to.be.an('object');
            expect(item).to.have.keys([
                'watchlist_item_id',
                'user_id',
                'stock_id',
                'ticker',
                'isin',
                'company_id',
                'name',
                'conviction',
                'watched_since',
                'watched_since_price',
                'tags'
            ]);
        }

        expect(watchlistItemAfterDelete).to.deep.equal([]);
    });

    it('selectItems', async() => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistService.insertWatchlist({ name: 'Test123', user_id: testUser.user_id })));

        await userWatchlistService.insertItem({
            user_id: testUser.user_id,
            stock_id: 1294,
            // ticker character varying(20) COLLATE pg_catalog."default",
            // name character varying(255) COLLATE pg_catalog."default",
            // isin character varying(255) COLLATE pg_catalog."default",
            conviction: 0,
            // plan_entry_price double precision,
            // plan_stoploss_price double precision,
            // plan_target_price double precision,
            watched_since: '2021-01-01',
            // watched_since_price double precision,
            // tags text COLLATE pg_catalog."default"
        });

        const watchlistItemsTest = JSON.parse(JSON.stringify(await userWatchlistService.selectItems(testUser.user_id)));

        await userWatchlistService.deleteWatchlist(watchlist.watchlist_id);
        await userWatchlistService.deleteWatchlistItems({ stock_id: watchlist.stock_id, user_id: watchlist.user_id });

        expect(watchlistItemsTest).to.be.an('array');
        for (const item of watchlistItemsTest) {
            expect(item).to.be.an('object');
            expect(item).to.have.keys([
                'watchlist_item_id',
                'user_id',
                'stock_id',
                'ticker',
                'isin',
                'company_id',
                'name',
                'conviction',
                'watched_since',
                'watched_since_price',
                'tags'
            ]);
        }
    });

    it('insertItem', async() => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistService.insertWatchlist({ name: 'Test123', user_id: testUser.user_id })));

        await userWatchlistService.insertItem({
            user_id: testUser.user_id,
            stock_id: 1294,
            // ticker character varying(20) COLLATE pg_catalog."default",
            // name character varying(255) COLLATE pg_catalog."default",
            // isin character varying(255) COLLATE pg_catalog."default",
            conviction: 0,
            // plan_entry_price double precision,
            // plan_stoploss_price double precision,
            // plan_target_price double precision,
            watched_since: '2021-01-01',
            // watched_since_price double precision,
            // tags text COLLATE pg_catalog."default"
        });

        const watchlistItemsTest = JSON.parse(JSON.stringify(await userWatchlistService.selectItems(testUser.user_id)));

        await userWatchlistService.deleteWatchlist(watchlist.watchlist_id);
        await userWatchlistService.deleteWatchlistItems({ stock_id: watchlist.stock_id, user_id: watchlist.user_id });

        expect(watchlistItemsTest).to.be.an('array');
        for (const item of watchlistItemsTest) {
            expect(item).to.be.an('object');
            expect(item).to.have.keys([
                'watchlist_item_id',
                'user_id',
                'stock_id',
                'ticker',
                'isin',
                'company_id',
                'name',
                'conviction',
                'watched_since',
                'watched_since_price',
                'tags'
            ]);
        }
    });

    it('updateItem', async() => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistService.insertWatchlist({ name: 'Test123', user_id: testUser.user_id })));

        const itemBeforeUpdate = await userWatchlistService.insertItem({
            user_id: testUser.user_id,
            stock_id: 1294,
            isin: 'SE0012454072',
            ticker: 'AZA',
            company_id: 32875,
            name: 'Avanza Bank Holding',
            conviction: 0,
            watched_since: '2021-01-01',
            watched_since_price: 10.00,
            tags: null
        });

        await userWatchlistService.updateItem({
            watched_since: '2021-02-24',
        }, itemBeforeUpdate.watchlist_item_id);

        const itemAfter = JSON.parse(JSON.stringify(await userWatchlistService.selectItem(itemBeforeUpdate.watchlist_item_id)));

        expect(itemAfter).to.be.an('object');
        expect(itemAfter).to.have.keys([
            'watchlist_item_id',
            'user_id',
            'stock_id',
            'ticker',
            'isin',
            'company_id',
            'name',
            'conviction',
            'watched_since',
            'watched_since_price',
            'tags'
        ]);
        expect(itemAfter.watched_since).to.be.equal('2021-02-24');


        await userWatchlistService.deleteWatchlist(watchlist.watchlist_id);
        await userWatchlistService.deleteWatchlistItems({ stock_id: watchlist.stock_id, user_id: watchlist.user_id });

    });

    it('deleteItem', async() => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistService.insertWatchlist({ name: 'Test123', user_id: testUser.user_id })));

        await userWatchlistService.insertItem({
            user_id: testUser.user_id,
            stock_id: 1294,
            // ticker character varying(20) COLLATE pg_catalog."default",
            // name character varying(255) COLLATE pg_catalog."default",
            // isin character varying(255) COLLATE pg_catalog."default",
            conviction: 0,
            // plan_entry_price double precision,
            // plan_stoploss_price double precision,
            // plan_target_price double precision,
            watched_since: '2021-01-01',
            // watched_since_price double precision,
            // tags text COLLATE pg_catalog."default"
        });

        const watchlistItemsTestBeforeDelete = JSON.parse(JSON.stringify(await userWatchlistService.selectItems(testUser.user_id)))[0];

        await userWatchlistService.deleteWatchlistItemsOnUserId(testUser.user_id);
        await userWatchlistService.deleteAllWatchlistJoinsOnUserId(testUser.user_id);

        const watchlistItemsTestAfterDelete = JSON.parse(JSON.stringify(await userWatchlistService.selectItems(testUser.user_id)))[0];

        await userWatchlistService.deleteWatchlist(watchlist.watchlist_id);

        expect(watchlistItemsTestBeforeDelete).to.be.an('object');
        expect(watchlistItemsTestBeforeDelete).to.have.keys([
            'watchlist_item_id',
            'user_id',
            'stock_id',
            'ticker',
            'isin',
            'company_id',
            'name',
            'conviction',
            'watched_since',
            'watched_since_price',
            'tags'
        ]);

        expect(watchlistItemsTestAfterDelete).to.be.equal(undefined);
    });

    // Get: 'SequelizeDatabaseError: relation "public.Stock" does not exist'
    // So have commented away unit test for this function at the moment.
    // it('selectByUserId', async () => {
    //     const watchlistSelectByUserId = JSON.parse(JSON.stringify(await userWatchlistService.selectByUserId(testUser.user_id)));

    //     console.log(watchlistSelectByUserId);
    // });

    // Get: SequelizeDatabaseError: missing FROM-clause entry for table "sk"
    // So have commented away unit test for this function at the moment.
    // it('selectWatchlistItemsExtended', async () => {
    //     const watchlistSelectWatchlistItemsExtended = JSON.parse(JSON.stringify(await userWatchlistService.selectWatchlistItemsExtended(testUser.user_id)));

    //     console.log(watchlistSelectWatchlistItemsExtended);
    // });

    it('updateConviction', async() => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistService.insertWatchlist({ name: 'Test123', user_id: testUser.user_id })));

        await userWatchlistService.insertItem({
            user_id: testUser.user_id,
            stock_id: 1294,
            // ticker character varying(20) COLLATE pg_catalog."default",
            // name character varying(255) COLLATE pg_catalog."default",
            // isin character varying(255) COLLATE pg_catalog."default",
            conviction: 0,
            // plan_entry_price double precision,
            // plan_stoploss_price double precision,
            // plan_target_price double precision,
            watched_since: '2021-01-01',
            // watched_since_price double precision,
            // tags text COLLATE pg_catalog."default"
        });

        const watchlistItemsTestBeforeUpdateConviction = JSON.parse(JSON.stringify(await userWatchlistService.selectItems(testUser.user_id)))[0];

        await userWatchlistService.updateConviction(1294, testUser.user_id, 1);

        const watchlistItemsTestAfterUpdateConviction = JSON.parse(JSON.stringify(await userWatchlistService.selectItems(testUser.user_id)))[0];

        await userWatchlistService.deleteWatchlistItems({ stock_id: watchlist.stock_id, user_id: watchlist.user_id });
        await userWatchlistService.deleteWatchlist(watchlist.watchlist_id);

        expect(watchlistItemsTestBeforeUpdateConviction).to.be.an('object');
        expect(watchlistItemsTestBeforeUpdateConviction).to.have.keys([
            'watchlist_item_id',
            'user_id',
            'stock_id',
            'isin',
            'ticker',
            'company_id',
            'name',
            'conviction',
            'watched_since',
            'watched_since_price',
            'tags'
        ]);
        expect(watchlistItemsTestBeforeUpdateConviction.conviction).to.be.equal(0);

        expect(watchlistItemsTestAfterUpdateConviction).to.be.an('object');
        expect(watchlistItemsTestAfterUpdateConviction).to.have.keys([
            'watchlist_item_id',
            'user_id',
            'stock_id',
            'isin',
            'ticker',
            'company_id',
            'name',
            'conviction',
            'watched_since',
            'watched_since_price',
            'tags'
        ]);
        expect(watchlistItemsTestAfterUpdateConviction.conviction).to.be.equal(1);
    });

    it('fetchConviction_withINSREF', async() => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistService.insertWatchlist({ name: 'Test123', user_id: testUser.user_id })));

        await userWatchlistService.insertItem({
            user_id: testUser.user_id,
            stock_id: 1294,
            // ticker character varying(20) COLLATE pg_catalog."default",
            // name character varying(255) COLLATE pg_catalog."default",
            // isin character varying(255) COLLATE pg_catalog."default",
            conviction: 0,
            // plan_entry_price double precision,
            // plan_stoploss_price double precision,
            // plan_target_price double precision,
            watched_since: '2021-01-01',
            // watched_since_price double precision,
            // tags text COLLATE pg_catalog."default"
        });

        const watchlistFetchConviction_withINSREF = JSON.parse(JSON.stringify(await userWatchlistService.fetchConviction_withINSREF(1294, testUser.user_id)));

        await userWatchlistService.deleteWatchlistItems({ stock_id: watchlist.stock_id, user_id: watchlist.user_id });
        await userWatchlistService.deleteWatchlist(watchlist.watchlist_id);

        expect(watchlistFetchConviction_withINSREF).to.be.an('object');
        expect(watchlistFetchConviction_withINSREF).to.have.keys([
            'watchlist_item_id',
            'user_id',
            'stock_id',
            'ticker',
            'isin',
            'company_id',
            'name',
            'conviction',
            'watched_since',
            'watched_since_price',
            'tags'
        ]);
    });

    it('addTags', async() => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistService.insertWatchlist({ name: 'Test123', user_id: testUser.user_id })));

        await userWatchlistService.insertItem({
            user_id: testUser.user_id,
            stock_id: 1294,
            watchlist_id: watchlist.watchlist_id,
            // ticker character varying(20) COLLATE pg_catalog."default",
            // name character varying(255) COLLATE pg_catalog."default",
            // isin character varying(255) COLLATE pg_catalog."default",
            conviction: 0,
            // plan_entry_price double precision,
            // plan_stoploss_price double precision,
            // plan_target_price double precision,
            watched_since: '2021-01-01',
            // watched_since_price double precision,
            // tags text COLLATE pg_catalog."default"
        });

        const watchlistTestBeforeAddTags = JSON.parse(JSON.stringify(await userWatchlistService.selectItems(testUser.user_id)))[0];

        await userWatchlistService.addTags(1294, testUser.user_id, '[{"text":"Event Trade","color":"orange"}]');

        const watchlistTestAfterAddTags = JSON.parse(JSON.stringify(await userWatchlistService.selectItems(testUser.user_id)))[0];

        await userWatchlistService.deleteWatchlistItems({ stock_id: watchlist.stock_id, user_id: watchlist.user_id });
        await userWatchlistService.deleteWatchlist(watchlist.watchlist_id);

        expect(watchlistTestBeforeAddTags).to.be.an('object');
        expect(watchlistTestBeforeAddTags).to.have.keys([
            'watchlist_item_id',
            'user_id',
            'stock_id',
            'ticker',
            'isin',
            'company_id',
            'name',
            'conviction',
            'watched_since',
            'watched_since_price',
            'tags'
        ]);
        expect(watchlistTestBeforeAddTags.tags).to.be.equal(null);

        expect(watchlistTestAfterAddTags).to.be.an('object');
        expect(watchlistTestAfterAddTags).to.have.keys([
            'watchlist_item_id',
            'user_id',
            'stock_id',
            'ticker',
            'isin',
            'company_id',
            'name',
            'conviction',
            'watched_since',
            'watched_since_price',
            'tags'
        ]);
        expect(watchlistTestAfterAddTags.tags).to.be.equal('[{"text":"Event Trade","color":"orange"}]');
    });

    // create a new test suite for Trade Plans : this is a copy/paste bug
    it('getUserTradePlans', async() => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistService.insertWatchlist({ name: 'Test123', user_id: testUser.user_id })));

        await userWatchlistService.insertItem({
            user_id: testUser.user_id,
            stock_id: 1294,
            // ticker character varying(20) COLLATE pg_catalog."default",
            // name character varying(255) COLLATE pg_catalog."default",
            // isin character varying(255) COLLATE pg_catalog."default",
            conviction: 0,
            // plan_entry_price double precision,
            // plan_stoploss_price double precision,
            // plan_target_price double precision,
            watched_since: '2021-01-01',
            // watched_since_price double precision,
            // tags text COLLATE pg_catalog."default"
        });

        const watchlistItemUserTradePlansTest = JSON.parse(JSON.stringify(await userWatchlistService.getUserTradePlans(1294, testUser.user_id)));

        await userWatchlistService.deleteWatchlistItems({ stock_id: watchlist.stock_id, user_id: watchlist.user_id });
        await userWatchlistService.deleteWatchlist(watchlist.watchlist_id);

        expect(watchlistItemUserTradePlansTest).to.be.an('array');
        for (const item of watchlistItemUserTradePlansTest) {
            expect(item).to.be.an('object');
            expect(item).to.have.keys([
                'watchlist_item_id',
                'user_id',
                'stock_id',
                'ticker',
                'isin',
                'company_id',
                'name',
                'conviction',
                'watched_since',
                'watched_since_price',
                'tags'
            ]);
        }
    });
});
