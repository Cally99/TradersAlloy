const chai = require('chai');
const expect = chai.expect;

const competitionService = require('./../../server/services/CompetitionService');

describe('CompetitionService . getCompetitionChartData', () => {
    it('should reformat 3 large arrays into 1 ', async () => {
        const averageHistory = [
            { day: '2022-02-02', avg: '103070' },
            { day: '2022-02-03', avg: '102870' },
            { day: '2022-02-04', avg: '103070' },
            { day: '2022-02-05', avg: '103270' },
            { day: '2022-02-06', avg: '103470' },
            { day: '2022-02-07', avg: '103870' },
            { day: '2022-02-08', avg: '104670' },
            { day: '2022-02-09', avg: '104970' },
            { day: '2022-02-10', avg: '105070' }];

        const leaderHistory  = [
              { account_name: 'Diam Icecream', day: '2022-02-05', balance: 103270 },
              { account_name: 'Diam Icecream', day: '2022-02-06', balance: 103470 },
              { account_name: 'Diam Icecream', day: '2022-02-07', balance: 103870 },
              { account_name: 'Diam Icecream', day: '2022-02-08', balance: 104670 },
              { account_name: 'Diam Icecream', day: '2022-02-09', balance: 104970 },
              { account_name: 'Diam Icecream', day: '2022-02-10', balance: 105070 }];

        const userHistory = [
            {user_id: 532,user_account_id: '532-3',day: '2022-02-01',balance: 100000, exposure: 10000},
            {user_id: 532,user_account_id: '532-3',day: '2022-02-02',balance: 100100, exposure: 20000},
            {user_id: 532,user_account_id: '532-3',day: '2022-02-03',balance: 100300, exposure: 30000},
            {user_id: 532,user_account_id: '532-3',day: '2022-02-04',balance: 100500, exposure: 30600},
            {user_id: 532,user_account_id: '532-3',day: '2022-02-05',balance: 100700, exposure: 40000},
            {user_id: 532,user_account_id: '532-3',day: '2022-02-06',balance: 100950, exposure: 40000},
            {user_id: 532,user_account_id: '532-3',day: '2022-02-07',balance: 101150, exposure: 40000},
            {user_id: 532,user_account_id: '532-3',day: '2022-02-08',balance: 100850, exposure: 40000},
            {user_id: 532,user_account_id: '532-3',day: '2022-02-09',balance: 100900, exposure: 40000},
            {user_id: 532,user_account_id: '532-3',day: '2022-02-10',balance: 101900, exposure: 40000},
            {user_id: 532,user_account_id: '532-3',day: '2022-02-11',balance: 103400, exposure: 40000},
            {user_id: 532,user_account_id: '532-3',day: '2022-02-12',balance: 103500, exposure: 40000},
            {user_id: 532,user_account_id: '532-3',day: '2022-02-13',balance: 103500, exposure: 40000},
            {user_id: 532,user_account_id: '532-3',day: '2022-02-14',balance: 103400, exposure: 60000},
            {user_id: 532,user_account_id: '532-3',day: '2022-02-15',balance: 103000, exposure: 55000},
        ];

        const chartData = await competitionService.restructureChartData(leaderHistory, averageHistory, userHistory);
        // console.table(chartData);
        expect(chartData.length).to.equal(15);
        expect(chartData).to.be.an('array');
        expect(chartData[0]).to.have.keys([
            'date',
            'leader',
            'average',
            'my_balance',
        ]);

    });
});
