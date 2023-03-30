const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const companyNewsManager = require('../../server/managers/CompanyNewsManager');
const DB = require('../../server/helpers/DB');
const connection = DB.getConnection();

describe.skip ('CompanyNewsManager.insertCompanyNews', () => {
    it('simple case', async () => {
        const today = new Date().toISOString().substring(0,10);
        const newsItem =  {
            news_id: 'TEST000001',
            title: 'Test headline',
            date: today,
            content: [ 'balh blah blah'],
            language: 'sv',
            isins: [ 'SE0005992419' ],
            tags: [
                'automotive',
                'exx',
                'FWN:consumergoods',
                'FWN:consumerservices',
                'industrials',
                'leisure'
            ]
        };
        await companyNewsManager.insertCompanyNews(newsItem);


        const checkInsert =  await connection.query(`
                select * 
                from company_news CN
                where CN.date = :today
                and   CN.company_id = 39524
            `,
            {
                nest: false,
                replacements: {
                    today: today,
                },
                type: connection.QueryTypes.SELECT
            }
        );

        console.log("Check Insert... ", checkInsert.data);

    });

});

describe ('CompanyNewsManager', () => {
    it('getNews', async () => {
        const news = JSON.parse(JSON.stringify(await companyNewsManager.getNews()));

        expect(news).to.be.an('array')
        for(const one of news) {
            expect(one).to.be.an('object');
            expect(one).to.contain.keys([
                'company_id',
                'news_id',
                'date',
                'tags',
                'title',
                'links',
                'agency',
                'version',
                'newstext',
                'countries',
                'signature',
                'language'
            ]);
        }
    });

    it('getNewsOnCompanyId', async () => {
        const newsOnCompanyId = JSON.parse(JSON.stringify(await companyNewsManager.getNewsOnCompanyId(39947)));

        expect(newsOnCompanyId).to.be.an('array')
        for(const one of newsOnCompanyId) {
            expect(one).to.be.an('object');
            expect(one).to.contain.keys([
                'company_id',
                'news_id',
                'date',
                'tags',
                'title',
                'links',
                'agency',
                'version',
                'newstext',
                'countries',
                'signature',
                'language'
            ]);
        }
    });

    it('getNewsOnNewsId', async () => {
        const newsOnNewsId = JSON.parse(JSON.stringify(await companyNewsManager.getNewsOnNewsId('FTV0046A7E')));

        expect(newsOnNewsId).to.be.an('array')
        for(const one of newsOnNewsId) {
            expect(one).to.be.an('object');
            expect(one).to.contain.keys([
                'company_id',
                'news_id',
                'date',
                'tags',
                'title',
                'links',
                'agency',
                'version',
                'newstext',
                'countries',
                'signature',
                'language'
            ]);
        }
    });

    it.skip('getNewsWatched', async () => {
        const newsOnNewsId = JSON.parse(JSON.stringify(await companyNewsManager.getNewsWatched(98)));

        console.log(newsOnNewsId);
    });
});
