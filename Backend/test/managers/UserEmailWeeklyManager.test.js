const User = require('./../../server/models').User;
const UserWatchlist = require('./../../server/models').UserWatchlist;
const UserWatchlistItem = require('./../../server/models').UserWatchlistItem;
const DB = require('./../../server/helpers/DB');
const connection = DB.getConnection();

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const userManager = require('./../../server/managers/userManager');
const userEmailWeeklyManager = require('./../../server/managers/UserEmailWeeklyManager');
const UserWatchlistManager = require('./../../server/managers/UserWatchlistManager');

// find a company that has reported in 10 days or will report in 10 days
async function findStockForWatchlist() {
    const futureReports = await connection.query(`
                    select  S.company_id, S.stock_id, S.ticker, S.isin, S.name, S.price_today, CC.date_report
                    from company_calendar CC, stock S
                    where  CC.date_report BETWEEN CURRENT_DATE AND CURRENT_DATE + 10
                    and CC.company_id = S.company_id
                    and S.primary_listing = true
            `, {nest: false, type: connection.QueryTypes.SELECT});
    if (futureReports.length > 0) {
        return futureReports[0];
    }

    const pastReports = await connection.query(`
                    select  S.company_id, S.stock_id, S.ticker, S.isin, S.name, S.price_today, CC.date_report
                    from company_calendar CC, stock S
                    where  CC.date_report BETWEEN CURRENT_DATE - INTERVAL '10 days' AND CURRENT_DATE
                    and CC.company_id = S.company_id
                    and S.primary_listing = true
            `, {nest: false, type: connection.QueryTypes.SELECT});

    if (pastReports.length > 0) {
        return pastReports[0];
    }

    return null;
}

describe('UserEmailWeeklyManager.getEarningsForAllUsers -- but not unsubscribed from email', () => {
    let spyCreate;
    let user;

    beforeEach(async () => {
        spyCreate = sinon.spy(userManager, 'create');

        const email = 'test123@test123.com';
        const password = 'testing123';
        const settings = {settings: '{"language":"sv","settings":[]}'};

        await userManager.create(email, password, settings);

        for(const item of spyCreate.returnValues) {
            user = await item;
        }

        let stock = await findStockForWatchlist();
        
        if (stock === null) {
            expect.fail();  // could not find any suitable test data
        }
        const watchlist = UserWatchlistManager.insertWatchlist({
            user_id: user.user_id,
            name: 'test',
        });

        const item = UserWatchlistManager.insertItem({
            watchlist_id: watchlist.watchlist_id,
            user_id: user.user_id,
            company_id: stock.company_id,
            stock_id: stock.stock_id,
            ticker: stock.ticker,
            isin: stock.isin,
            name: stock.name,
            conviction: 0,
            watched_since: new Date().toISOString().substring(0, 10),
            watched_since_price: stock.price_today
        });
    });

    afterEach(async () => {
        for (const item of spyCreate.returnValues) {
            const deleteUser = await item;
            await User.destroy({ where: { user_id: deleteUser.user_id} });
            await UserWatchlist.destroy({ where: { user_id: deleteUser.user_id } });
            await UserWatchlistItem.destroy({ where: { user_id: deleteUser.user_id } });
        }

        spyCreate.restore();
    });

    it('Test true and false in one test', async () => {
        const rows = await userEmailWeeklyManager.getEarningsForAllUsers();

        // After a complicated setup confirm that the User will get an email
        const emailUserWithEarningsDateAlert = rows.find( x => x.email === 'test123@test123.com');
        expect(emailUserWithEarningsDateAlert.email).to.equal('test123@test123.com');


        // After setting to false , found === -1
        await User.update({
            email_weekly: false,
        },{
            where: { user_id: user.user_id }
        });

        const u2 = await User.find({where: { user_id: user.user_id }});
        //console.log(u2);

        const usersWhoWantWeeklyEmail = await userEmailWeeklyManager.getEarningsForAllUsers();

        const foundNot = usersWhoWantWeeklyEmail.find( x => x.email === 'test123@test123.com');
        expect(foundNot).to.be.undefined;
    });
});

describe('UserEmailWeeklyManager.getEarningsForAllUsers', () => {
    let rows;

    beforeEach(async () => {
        rows = await userEmailWeeklyManager.getEarningsForAllUsers();
    });

    it('Simple case', async () => {
        expect(rows.length).to.be.greaterThan(1);
    });

    it.skip('Simple case - check PAST reports', async () => {
        const PASTExists = rows.find( x => x.time_group === 'PAST');
        expect(PASTExists.time_group).to.not.be.undefined;
    });

    it('Simple case - check IMMINENT reports', async () => {
        const IMMINENTExists = rows.find( x => x.time_group === 'IMMINENT');
        expect(IMMINENTExists).to.not.be.undefined;
    });
});
