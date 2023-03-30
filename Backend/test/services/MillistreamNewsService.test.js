const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const test = require("sinon-test")(sinon, { useFakeTimers: false });

const millistreamNewsService = require('./../../server/loaders/millistreamNewsService');

describe('MillistreamNewsService . getNews', () => {
    it('simple case', test( async function () {
        const isins = ['SE0000108656'];
        const newsItems = await millistreamNewsService.getNewsByCompany(isins);

        expect(newsItems).to.be.an('array');
    }));

    it.skip('simple case', test( async function () {
        const newsItems = await millistreamNewsService.getNewsBySource('2021-12-07', '2021-12-07');

        expect(newsItems).to.be.an('array');
    }));
});
