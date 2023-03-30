const User = require('./../../server/models').User;
const UserWatchlist = require('./../../server/models').UserWatchlist;
const UserWatchlistItem = require('./../../server/models').UserWatchlistItem;
const DB = require('./../../server/helpers/DB');
const connection = DB.getConnection();
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const emailer = require('./../../server/helpers/emailer');
const userManager = require('./../../server/managers/userManager');
const UserWatchlistManager = require('./../../server/managers/UserWatchlistManager');

/*
   petter.hattenbach@gmail.com	    PAST    2022-02-17	2598207	EMBRAC B	814791	Embracer Group B	-0.46	2168100000
   roumi_92@hotmail.com	            PAST    2022-02-17	2598207	EMBRAC B	814791	Embracer Group B	-0.46	2168100000
   sijoh006@gmail.com	        IMMINENT	2021-10-11	   4317	ORES	     32944	Öresund
   svampsson@gmail.com	        IMMINENT	2021-10-08	2724898	STW	        814813	SeaTwirl
*/
//TODO: This unit test isn't working so will skip it until it is fixed.
//Getting error message: 'TypeError: emails[key].find is not a function'
describe.skip('emailer.weeklyEmailTemplate', () => {
    it('simple case', async () => {
        const emails = [
            {email: 'andrew.boddy.temp@gmail.com',
                items: [
                    {time_group:'PAST',
                        date_report: '2022-02-17',
                        stock_id: 2598207,
                        ticker: 'EMBRAC B',
                        company_id: 814791,
                        name: 'Embracer Group B',
                        eps: -0.46,
                        sales: 2168100000},
                    {time_group:'PAST',
                        date_report: '2021-09-28',
                        stock_id: 4637808,
                        ticker: 'DIVIO B',
                        company_id: 4635215,
                        name: 'Divio Technologies B',
                        eps: 0.24,
                        sales: 6290000},
                    {time_group:'IMMINENT',
                        date_report: '2021-10-11',
                        stock_id: 4317,
                        ticker: 'ORES',
                        company_id: 32944,
                        name: 'Öresund',
                        eps: null,
                        sales: null},
                    {time_group:'IMMINENT',
                        date_report: '2021-10-08',
                        stock_id: 2724898,
                        ticker: 'STW',
                        company_id: 814813,
                        name: 'SeaTwirl',
                        eps: null,
                        sales: null},
                ]}];

        await emailer.weeklyEmailTemplate(emails);

        //TODO: Add assertions here
    });
});
