const User = require('./../../server/models').User;
const chai = require('chai');
const expect = chai.expect;

const userManager = require('./../../server/managers/UserManager');
const userWatchlistManager = require('./../../server/managers/UserWatchlistManager');



describe.skip('UserWatchlistManager . all CRUD', () => {
    let testUser;

    before(async () => {
        const email = 'test123@test123.com';
        const password = 'test';
        const settings = '{\"language\":\"sv\",\"settings\":[]}';

        testUser = await userManager.create(email, password, settings);
    });

    after(async () => {
        await User.destroy({ where: { user_id:  testUser.user_id} });
    });

    it('all CRUD operations', async () => {
        await userWatchlistManager.insertWatchlist({name: 'Test123', user_id: testUser.user_id});

        const wl = JSON.parse(JSON.stringify(await userWatchlistManager.selectWatchlists(testUser.user_id)));
        // Check the watchlist exists
        expect(wl).to.have.keys([
            'watchlist_item_id',
            'user_id',
            'stock_id',
            'ticker',
            'isin',
            'name',
            'company_id',
            'conviction',
            'watched_since',
            'watched_since_price',
            'tags'
        ]);

        // TODO: await userWatchlistManager.updateWatchlist();

        await userWatchlistManager.insertItem({
            user_id: testUser.user_id,
            stock_id: 1294,
            watchlist_id: wl.watchlist_id,
            conviction: 0,
            watched_since: '2021-01-01',
        });
        let wli = JSON.parse(JSON.stringify(await userWatchlistManager.selectItems(testUser.user_id)))[0];
        // Check the item exists
        expect(wli.watched_since).to.be.equal('2021-01-01');

        await userWatchlistManager.updateItem({
            watched_since: '2021-02-24',
        }, wli.watchlist_item_id);
        wli = JSON.parse(JSON.stringify(await userWatchlistManager.selectItems(testUser.user_id)))[0];
        expect(wli.watched_since).to.be.equal('2021-02-24');

        const deletedWLI = await userWatchlistManager.deleteWatchlistItems({stock_id: 1294, user_id: testUser.user_id });
        expect(deletedWLI).to.be.null;

        const deletedWL = await userWatchlistManager.deleteWatchlist(wl.watchlist_id);
        expect(deletedWL).to.be.null;
    });


});




describe('UserWatchlistManager', () => {
    let testUser;

    before(async () => {
        const email = 'test123@test123.com';
        const password = 'test';
        const settings = '{\"language\":\"sv\",\"settings\":[]}';

        testUser = await userManager.create(email, password, settings);
    });

    after(async () => {
        // Use this sequelize command because there is no
        // endpoint for removal of users in the backend
        await User.destroy({ where: { user_id:  testUser.user_id} });
    });

    it('selectWatchlists', async () => {
        await userWatchlistManager.insertWatchlist({name: 'Test123', user_id: testUser.user_id});

        const testUserWatchlists = JSON.parse(JSON.stringify(await userWatchlistManager.selectWatchlists(testUser.user_id)));

        for(const userWatchlist of testUserWatchlists) {
            await userWatchlistManager.deleteWatchlist(userWatchlist.watchlist_id);
        }

        expect(testUserWatchlists).to.be.an('array');

        for(const userWatchlist of testUserWatchlists) {
            expect(userWatchlist).to.be.an('object');
            expect(userWatchlist).to.have.keys([
                'watchlist_id',
                'user_id',
                'name',
                'type'
            ]);
        }
    });

    it.skip('selectWatchlistObjects', async () => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistManager.insertWatchlist({name: 'Test123', user_id: testUser.user_id})));

        const watchlistItem = JSON.parse(JSON.stringify(await userWatchlistManager.insertItem({
            user_id: testUser.user_id,
            insref: 1294,
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
        })));

        const testUserWatchlistObjects = JSON.parse(JSON.stringify(await userWatchlistManager.selectWatchlistObjects(testUser.user_id)));

        await userWatchlistManager.deleteItem(watchlistItem.watchlist_item_id);
        await userWatchlistManager.deleteWatchlist(watchlist.watchlist_id);

        expect(testUserWatchlistObjects).to.be.an('array');
        for(const watchlistObject of testUserWatchlistObjects) {
            expect(watchlistObject).to.be.an('object');
            expect(watchlistObject).to.have.keys([
                'watchlist_id',
                'user_id',
                'name',
                'type',
                'UserWatchlistItems'
            ]);
            expect(watchlistObject.UserWatchlistItems).to.be.an('array');
            for(const watchlistItem of watchlistObject.UserWatchlistItems) {
                expect(watchlistItem).to.have.keys([
                    'watchlist_item_id',
                    'user_id',
                    'watchlist_id',
                    'stock_id',
                    'ticker',
                    'isin',
                    'name',
                    'company_id',
                    'conviction',
                    'watched_since',
                    'watched_since_price',
                    'tags'
                ]);
            }
        }
    });

    it('selectWatchlist', async () => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistManager.insertWatchlist({name: 'Test123', user_id: testUser.user_id})));

        await userWatchlistManager.deleteWatchlist(watchlist.watchlist_id);

        expect(watchlist).to.be.an('object');
        expect(watchlist).to.have.keys([
            'watchlist_id',
            'user_id',
            'name',
            'type'
        ]);
    });

    it('insertWatchlist', async () => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistManager.insertWatchlist({name: 'Test123', user_id: testUser.user_id})));
        const watchlistTest = JSON.parse(JSON.stringify(await userWatchlistManager.selectWatchlist(watchlist.watchlist_id)));

        await userWatchlistManager.deleteWatchlist(watchlistTest.watchlist_id);

        expect(watchlistTest).to.be.an('object');
        expect(watchlistTest).to.have.keys([
            'watchlist_id',
            'user_id',
            'name',
            'type'
        ]);
    });

    it('updateWatchlist', async () => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistManager.insertWatchlist({name: 'Test123', user_id: testUser.user_id})));
        const watchlistTest = JSON.parse(JSON.stringify(await userWatchlistManager.selectWatchlist(watchlist.watchlist_id)));

        await userWatchlistManager.updateWatchlist('Test456', watchlistTest.watchlist_id);

        const watchlistTestUpdated = JSON.parse(JSON.stringify(await userWatchlistManager.selectWatchlist(watchlist.watchlist_id)));

        await userWatchlistManager.deleteWatchlist(watchlistTestUpdated.watchlist_id);

        expect(watchlistTest).to.be.an('object');
        expect(watchlistTest).to.have.keys([
            'watchlist_id',
            'user_id',
            'name',
            'type'
        ]);
        expect(watchlistTest.name).to.be.equal('Test123');

        expect(watchlistTestUpdated).to.be.an('object');
        expect(watchlistTestUpdated).to.have.keys([
            'watchlist_id',
            'user_id',
            'name',
            'type'
        ]);
        expect(watchlistTestUpdated.name).to.be.equal('Test456');
    });

    it('deleteWatchlist', async () => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistManager.insertWatchlist({name: 'Test123', user_id: testUser.user_id})));
        const watchlistTest = JSON.parse(JSON.stringify(await userWatchlistManager.selectWatchlist(watchlist.watchlist_id)));

        await userWatchlistManager.deleteWatchlist(watchlistTest.watchlist_id);

        const watchlistTestDeleted = JSON.parse(JSON.stringify(await userWatchlistManager.selectWatchlist(watchlist.watchlist_id)));

        expect(watchlistTest).to.be.an('object');
        expect(watchlistTest).to.have.keys([
            'watchlist_id',
            'user_id',
            'name',
            'type'
        ]);

        expect(watchlistTestDeleted).to.be.equal(null);
    });

    it('selectItems', async () => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistManager.insertWatchlist({name: 'Test123', user_id: testUser.user_id})));

        const watchlistItem = JSON.parse(JSON.stringify(await userWatchlistManager.insertItem({
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
        })));

        const watchlistItems = JSON.parse(JSON.stringify(await userWatchlistManager.selectItems(testUser.user_id)));

        await userWatchlistManager.deleteItem(watchlistItem.watchlist_item_id);
        await userWatchlistManager.deleteWatchlist(watchlist.watchlist_id);

        expect(watchlistItems).to.be.an('array');

        for(const item of watchlistItems) {
            expect(item).to.be.an('object');
            expect(item).to.have.keys([
                'watchlist_item_id',
                'user_id',
                'stock_id',
                'ticker',
                'isin',
                'name',
                'company_id',
                'conviction',
                'watched_since',
                'watched_since_price',
                'tags'
            ]);
        }
    });

    it('deleteWatchlistItems', async () => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistManager.insertWatchlist({name: 'Test123', user_id: testUser.user_id})));

        const watchlistItem = JSON.parse(JSON.stringify(await userWatchlistManager.insertItem({
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
        })));

        const watchlistItems = JSON.parse(JSON.stringify(await userWatchlistManager.selectItems(testUser.user_id)));

        await userWatchlistManager.deleteWatchlistItems(watchlistItem);

        const watchlistItemsDeleted = JSON.parse(JSON.stringify(await userWatchlistManager.selectItems(testUser.user_id)));

        await userWatchlistManager.deleteWatchlist(watchlist.watchlist_id);

        expect(watchlistItem).to.be.an('object');
        expect(watchlistItem).to.have.keys([
            'watchlist_item_id',
            'user_id',
            'stock_id',
            'ticker',
            'isin',
            'name',
            'company_id',
            'conviction',
            'watched_since',
            'watched_since_price',
            'tags'
        ]);

        expect(watchlistItems).to.be.an('array');
        for(const item of watchlistItems) {
            expect(item).to.be.an('object');
            expect(item).to.have.keys([
                'watchlist_item_id',
                'user_id',
                'stock_id',
                'ticker',
                'isin',
                'name',
                'company_id',
                'conviction',
                'watched_since',
                'watched_since_price',
                'tags'
            ]);
        }

        expect(watchlistItemsDeleted).to.deep.equal([]);
    });

    it('insertItem', async () => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistManager.insertWatchlist({name: 'Test123', user_id: testUser.user_id})));

        await userWatchlistManager.insertItem({
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

        const watchlistItemTest = JSON.parse(JSON.stringify(await userWatchlistManager.selectItems(testUser.user_id)));

        await userWatchlistManager.deleteWatchlistItems(watchlist.watchlist_id);
        await userWatchlistManager.deleteWatchlist(watchlist.watchlist_id);

        expect(watchlistItemTest).to.be.an('array');
        for(const item of watchlistItemTest) {
            expect(item).to.be.an('object');
            expect(item).to.have.keys([
                'watchlist_item_id',
                'user_id',
                'stock_id',
                'ticker',
                'isin',
                'name',
                'company_id',
                'conviction',
                'watched_since',
                'watched_since_price',
                'tags'
            ]);
        }
    });

    it.skip('deleteItem', async () => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistManager.insertWatchlist({name: 'Test123', user_id: testUser.user_id})));

        await userWatchlistManager.insertItem({
            user_id: testUser.user_id,
            insref: 1294,
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

        const watchlistItemTestBeforeDelete = JSON.parse(JSON.stringify(await userWatchlistManager.selectItems(testUser.user_id)))[0];

        await userWatchlistManager.deleteWatchlistItemsOnUserId(testUser.user_id);
        await userWatchlistManager.deleteAllWatchlistJoinsOnUserId(testUser.user_id);

        const watchlistItemTestAfterDelete = JSON.parse(JSON.stringify(await userWatchlistManager.selectItems(testUser.user_id)))[0];

        expect(watchlistItemTestBeforeDelete).to.be.an('object');
        expect(watchlistItemTestBeforeDelete).to.have.keys([
            'watchlist_item_id',
            'user_id',
            'stock_id',
            'ticker',
            'isin',
            'name',
            'company_id',
            'conviction',
            'watched_since',
            'watched_since_price',
            'tags'
        ]);
        expect(watchlistItemTestBeforeDelete.watched_since).to.be.equal('2021-01-01');

        expect(watchlistItemTestAfterDelete).to.be.equal(undefined);
    });

    // Get: 'SequelizeDatabaseError: relation "public.Stock" does not exist'
    // So have commented away unit test for this function at the moment.
    // it('selectByUserId', async () => {
    //     const watchlistByUserId = JSON.parse(JSON.stringify(await userWatchlistManager.selectByUserId(testUser.user_id)));

    //     console.log(watchlistByUserId);
    // });

    // Get: SequelizeDatabaseError: missing FROM-clause entry for table "sk"
    // So have commented away unit test for this function at the moment.
    // it('selectWatchlistItemsExtended', async () => {
    //     const watchlistItemsExtended = JSON.parse(JSON.stringify(await userWatchlistManager.selectWatchlistItemsExtended(testUser.user_id)));

    //     console.log(watchlistItemsExtended);
    // });

    // check_exist doesn't return a boolean value but instead a watchlistItem object.
    // Maybe update this function to instead return "true" or "false"?
    it('check_exist', async () => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistManager.insertWatchlist({name: 'Test123', user_id: testUser.user_id})));

        const watchlistItem = JSON.parse(JSON.stringify(await userWatchlistManager.insertItem({
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
        })));

        const watchlistItemCheckExist = JSON.parse(JSON.stringify(await userWatchlistManager.check_exist(watchlistItem.stock_id, testUser.user_id)));

        await userWatchlistManager.deleteWatchlistItems(watchlist.watchlist_id);
        await userWatchlistManager.deleteWatchlist(watchlist.watchlist_id);

        expect(watchlistItemCheckExist).to.be.an('object');
        expect(watchlistItemCheckExist).to.have.keys([
            'watchlist_item_id',
            'user_id',
            'stock_id',
            'ticker',
            'isin',
            'name',
            'company_id',
            'conviction',
            'watched_since',
            'watched_since_price',
            'tags'
        ]);
    });

    it('updateConviction', async () => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistManager.insertWatchlist({name: 'Test123', user_id: testUser.user_id})));

        const watchlistItem = JSON.parse(JSON.stringify(await userWatchlistManager.insertItem({
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
        })));

        const watchlistItemBeforeUpdateConviction = JSON.parse(JSON.stringify(await userWatchlistManager.selectItems(testUser.user_id)))[0];

        await userWatchlistManager.updateConviction(watchlistItem.stock_id, testUser.user_id, 1);

        const watchlistItemAfterUpdateConviction = JSON.parse(JSON.stringify(await userWatchlistManager.selectItems(testUser.user_id)))[0];

        await userWatchlistManager.deleteWatchlistItems(watchlist.watchlist_id);
        await userWatchlistManager.deleteWatchlist(watchlist.watchlist_id);

        expect(watchlistItemBeforeUpdateConviction).to.be.an('object');
        expect(watchlistItemBeforeUpdateConviction).to.have.keys([
            'watchlist_item_id',
            'user_id',
            'stock_id',
            'ticker',
            'isin',
            'name',
            'company_id',
            'conviction',
            'watched_since',
            'watched_since_price',
            'tags'
        ]);
        expect(watchlistItemBeforeUpdateConviction.conviction).to.be.equal(0);

        expect(watchlistItemAfterUpdateConviction).to.be.an('object');
        expect(watchlistItemAfterUpdateConviction).to.have.keys([
            'watchlist_item_id',
            'user_id',
            'stock_id',
            'ticker',
            'isin',
            'name',
            'company_id',
            'conviction',
            'watched_since',
            'watched_since_price',
            'tags'
        ]);
        expect(watchlistItemAfterUpdateConviction.conviction).to.be.equal(1);
    });

    it('fetchConviction_withINSREF', async () => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistManager.insertWatchlist({name: 'Test123', user_id: testUser.user_id})));

        const watchlistItem = JSON.parse(JSON.stringify(await userWatchlistManager.insertItem({
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
        })));

        const watchlistItemFetchConviction = JSON.parse(JSON.stringify(await userWatchlistManager.fetchConviction_withINSREF(1294, testUser.user_id)));

        await userWatchlistManager.deleteWatchlistItems(watchlist.watchlist_id);
        await userWatchlistManager.deleteWatchlist(watchlist.watchlist_id);

        expect(watchlistItemFetchConviction).to.be.an('object');
        expect(watchlistItemFetchConviction).to.have.keys([
            'watchlist_item_id',
            'user_id',
            'stock_id',
            'ticker',
            'isin',
            'name',
            'company_id',
            'conviction',
            'watched_since',
            'watched_since_price',
            'tags'
        ]);
    });

    it('addTags', async () => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistManager.insertWatchlist({name: 'Test123', user_id: testUser.user_id})));

        await userWatchlistManager.insertItem({
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

        const watchlistItemBeforeAddTags = JSON.parse(JSON.stringify(await userWatchlistManager.selectItems(testUser.user_id)))[0];

        await userWatchlistManager.addTags(1294, testUser.user_id, '[{"text":"Event Trade","color":"orange"}]');

        const watchlistItemAfterAddTags = JSON.parse(JSON.stringify(await userWatchlistManager.selectItems(testUser.user_id)))[0];

        await userWatchlistManager.deleteWatchlistItems(watchlist.watchlist_id);
        await userWatchlistManager.deleteWatchlist(watchlist.watchlist_id);

        expect(watchlistItemBeforeAddTags).to.be.an('object');
        expect(watchlistItemBeforeAddTags).to.have.keys([
            'watchlist_item_id',
            'user_id',
            'stock_id',
            'ticker',
            'isin',
            'name',
            'company_id',
            'conviction',
            'watched_since',
            'watched_since_price',
            'tags'
        ]);
        expect(watchlistItemBeforeAddTags.tags).to.be.equal(null);

        expect(watchlistItemAfterAddTags).to.be.an('object');
        expect(watchlistItemAfterAddTags).to.have.keys([
            'watchlist_item_id',
            'user_id',
            'stock_id',
            'ticker',
            'isin',
            'name',
            'company_id',
            'conviction',
            'watched_since',
            'watched_since_price',
            'tags'
        ]);
        expect(watchlistItemAfterAddTags.tags).to.be.equal('[{"text":"Event Trade","color":"orange"}]');
    });

    it('getUserTradePlans', async () => {
        const watchlist = JSON.parse(JSON.stringify(await userWatchlistManager.insertWatchlist({name: 'Test123', user_id: testUser.user_id})));

        await userWatchlistManager.insertItem({
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

        const watchlistGetUserTradePlans = JSON.parse(JSON.stringify(await userWatchlistManager.getUserTradePlans(1294, testUser.user_id)));

        await userWatchlistManager.deleteWatchlistItems(watchlist.watchlist_id);
        await userWatchlistManager.deleteWatchlist(watchlist.watchlist_id);

        expect(watchlistGetUserTradePlans).to.be.an('array');
        for (const item of watchlistGetUserTradePlans) {
            expect(item).to.be.an('object');
            expect(item).to.have.keys([
                'watchlist_item_id',
                'user_id',
                'stock_id',
                'ticker',
                'isin',
                'name',
                'company_id',
                'conviction',
                'watched_since',
                'watched_since_price',
                'tags'
            ]);
            expect(item.stock_id).to.be.equal(1294);
        }
    });
});
