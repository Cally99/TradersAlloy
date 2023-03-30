const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const companyNewsService = require('../../server/services/CompanyNewsService');

describe('CompanyNewsService', () => {
    it('getNews', async () => {
        const news = JSON.parse(JSON.stringify(await companyNewsService.getNews()));

        expect(news).to.be.an('array');
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

    it('should get News Item for a given company_id', async () => {
        const newsOnCompanyId = JSON.parse(JSON.stringify(await companyNewsService.getNewsOnCompanyId(39947)));

        expect(newsOnCompanyId).to.be.an('array');
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

    it('should get News Item for a given a single news_id', async () => {
        const newsOnNewsId = JSON.parse(JSON.stringify(await companyNewsService.getNewsOnNewsId('FTV0046A7E')));

        // console.log(newsOnNewsId);

        expect(newsOnNewsId).to.be.an('array');
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

    it.skip('should getNewsWatched', async () => {
        const newsOnNewsId = JSON.parse(JSON.stringify(await companyNewsService.getNewsWatched(98)));

        console.log(newsOnNewsId);
    });
});
