const StockPrice = require('../models').StockPrice;
const stockService = require('../services/StockService');
const stockManager = require('../managers/StockManager');

const log4js = require('log4js');
const logger = log4js.getLogger("app_log");


module.exports = {

    /**
     * */
    async migrateFromFilesToDatabase() {
        let stocks = await stockManager.list(true);
        let updatedCount = 0;
        for (let i = 0; i < stocks.length; i++) {
            let stock = stocks[i].dataValues;
            if (await this.loadAndSavePriceToDB(stock) === 1 ) {
                updatedCount++;
            }
        }

        return {stocksSelectedCount: stocks.length, stocksUpdatedCount: updatedCount} ;
    },

    /**
     Read from all our files... into the database
     */
    async loadAndSavePriceToDB(stock) {
        try {
            let fileName = 'server/Data/' + stockService.getBaseFileName(stock) + '.json';
            console.log(`${stock.stock_id} ${stock.name}  ${fileName}`);
            let oldPrices = JSON.parse(fs.readFileSync(fileName, 'utf8'));

            const insertPrices = oldPrices.ohlcv.map( p => {
                return {
                    stock_id: stock.stock_id,
                    datetime_ms: p[0],
                    open: p[1],
                    high: p[2],
                    low:  p[3],
                    close: p[4],
                    volume: p[5],
                }
            });

            await StockPrice.bulkCreate(insertPrices, {ignoreDuplicates: true} );
            return 1;

        } catch (error) {
            console.log('outer catch: ' + error.stack);
            return -1;
        }
    }


};
