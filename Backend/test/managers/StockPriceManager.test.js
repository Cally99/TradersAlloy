const chai = require('chai');
const expect = chai.expect;

const stockPriceManager = require('./../../server/managers/StockPriceManager');

//

describe('StockPriceManager . getHistoricPriceLine', () => {
    it('getHistoricPrice', async () => {
        const priceLine = await stockPriceManager.getHistoricPrice(5828 , '2019-12-07');
        expect(priceLine.close).to.equal(171);
    });


});
