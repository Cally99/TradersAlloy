const fs = require('fs');

const StockPrice = require('../models').StockPrice;
const stockService = require('../services/StockService');
const stockManager = require('../managers/StockManager');
const stockPriceManager = require('../managers/StockPriceManager');

const millistreamManager = require('../managers/MillistreamManager'); // How to use Sinon to Mock with MillistreamController.mock.js ??

const log4js = require('log4js');
const healthCheck = log4js.getLogger("health");
const moment = require('moment');

/**
 * Millistream prices to the Data files
 *
 * This is run every day and updates the prices from Millistream.
 *  When a new report comes in the financial results and the PDF are added to company_report and company_report_pdf.
 */
async function getClosePricesFromMillistream() {
    let stocks = await stockManager.list(true);

    let updatedCount = 0;
    for (let i = 0; i < stocks.length; i++) {
        let stock = stocks[i].dataValues;

        if (await loadAndSavePrices(stock.stock_id) === 1 ) {
            updatedCount++;
        }

        if (updatedCount%100===0){
            healthCheck.info('prices... ',updatedCount);
        }
    }

    return {stocksSelectedCount: stocks.length, stocksUpdatedCount: updatedCount} ;
}

async function loadAndSavePrices(stock_id) {
    async function getDateOfLastPrice() {
        let startDate = null;
        const response = await stockPriceManager.getLatestPriceLine(stock_id);
        if (response) {
            const lastPriceLine = JSON.parse(JSON.stringify(response));
            startDate = moment(lastPriceLine.datetime_ms / 1000).add(1, 'day').format('YYYY-MM-DD');
        } else {
            const today_ms = moment(new Date('2018-01-01')).milliseconds();
            startDate = '2018-01-01';
        }
        return startDate;
    }

    try {
        let startDate = await getDateOfLastPrice();
        const millistreamResponse  =await millistreamManager.getPriceFromStartDate(stock_id, startDate);
        if (!millistreamResponse) {
            healthCheck.info(`{message: 'No new prices', stock_id: ${stock_id}`);
            return;
        }
        const newPrices = JSON.parse(JSON.stringify(millistreamResponse));
        if (newPrices.length===0) {
            console.log(`NO new prices for ${stock_id},  ${startDate}`);
            return;
        }
        const insertPrices = newPrices.map(p => {
            return {
                stock_id: stock_id,
                datetime_ms: new Date(p.date).getTime(),
                open: p.openprice,
                high: p.closedayhighprice,
                low: p.closedaylowprice,
                close: p.closeprice,
                volume: p.closequantity,
            }
        });
        healthCheck.debug(`3. Inserted DB`);
        await StockPrice.bulkCreate(insertPrices, {ignoreDuplicates: true});

        healthCheck.debug(`4. updating DB`);
        const newestPriceLine = insertPrices[insertPrices.length-1];
        const priceUpdatedDate = moment(newestPriceLine.datetime_ms).format('YYYY-MM-DD');
        await updateDatabaseWithPriceToday(stock_id, newestPriceLine.close, priceUpdatedDate);

        return 1;

    } catch (error) {
        console.log('outer catch: ' + error.stack +  '   '+stock_id);
        return -1;
    }
}

async function loadAndSavePrices2018(stock_id) {
    try {
        const startDate = '2018-01-01';
        const newPrices = JSON.parse(JSON.stringify(await millistreamManager.getPriceFromStartDate(stock_id, startDate)));
        const insertPrices = newPrices.map(p => {
            return {
                stock_id: stock_id,
                datetime_ms: new Date(p.date).getTime(),
                open: p.openprice,
                high: p.closedayhighprice,
                low: p.closedaylowprice,
                close: p.closeprice,
                volume: p.closequantity,
            }
        });
        await StockPrice.bulkCreate(insertPrices);

        const lastPriceLine = newPrices[newPrices.length-1];
        await updateDatabaseWithPriceToday(stock_id, lastPriceLine.closeprice, lastPriceLine.date);
        return 1;

    } catch (error) {
        console.log('outer catch: ' + error.message +  '   '+stock_id);
        return -1;
    }
}

// TODO: delete after proving we are stable
async function loadAndSavePriceUsingFiles(stock) {
    try {
        let fileName = 'server/Data/' + stockService.getBaseFileName(stock) + '.json';

        if (!fs.existsSync(fileName)) {
            fs.writeFile(fileName, '{"ohlcv":[]}', error => {
                if (error) {
                    console.log('Error creating a new file: ' + fileName);
                    throw error;
                }
                //console.log('creating: ' + fileName);
            })
        }
        healthCheck.debug(` \n\n 1.${stock.stock_id} ${stock.name} `);
        let oldPrices = JSON.parse(fs.readFileSync(fileName, 'utf8') || { "ohlcv": [] });
        healthCheck.debug(`1.1 ${JSON.stringify(oldPrices)}`);

        const newPrices = await millistreamManager.getAllHistoricPrices(stock);
        healthCheck.debug(`2. ${JSON.stringify(newPrices) }` );
        if (newPrices.length > 0) {
            const allPrices = await concatenateOldAndNewPrices(oldPrices, newPrices);
            healthCheck.debug(`3.0 before extracting all prices`);
            healthCheck.debug(`3.1 ${JSON.stringify(allPrices)}`);

            fs.writeFileSync(fileName, JSON.stringify(allPrices), error => {
                if (error) {
                    console.log('Error writing prices to file: ' + JSON.stringify(stock) + ' ' + error.message);
                    throw error;
                }
            });

            healthCheck.debug(`4. updating DB`);
            await updateDatabaseWithPriceToday(stock.stock_id, newPrices);
            return 1;
        }
        return 0;

    } catch (error) {
        healthCheck.error('outer catch: ' + error.message);
        return -1;
    }
}
function checkPriceAnomaly(latestClosedPrice, prices, i, stock) {
    // if new close price is over 20 % than last close price then send email to a notify user
    if (latestClosedPrice && Math.abs(prices[i].closeprice - latestClosedPrice) > latestClosedPrice * 0.2) {
        healthCheck.error(`The price of the stock is changed by 20% and more. ${stock}`);
    }
}

async function updateDatabaseWithPriceToday(stock_id, latestPrice, latestPriceDate) {

    return JSON.parse(JSON.stringify(await stockManager.updatePrice(stock_id, latestPrice, latestPriceDate)));

}

async function concatenateOldAndNewPrices(array, prices) {
    //let latestClosedPrice = 0;
    //latestClosedPrice = array.ohlcv[array.ohlcv.length - 1][4];
    //checkPriceAnomaly(array, prices, i, stock);

    for (let i = 0; i < prices.length; i++) {

        if (prices[i].closeprice) {
            const dateTime = new Date(prices[i].date).getTime();
            const newPrice = [dateTime,
                prices[i].openprice,
                prices[i].closedayhighprice,
                prices[i].closedaylowprice,
                prices[i].closeprice,
                prices[i].closequantity
            ];

            array.ohlcv.push(newPrice);
        }
    }
    healthCheck.debug( JSON.stringify(array[0]), JSON.stringify(array[array.length-1]) );
    return array;
}


module.exports = {
    getClosePricesFromMillistream,
    loadAndSavePrices,
    loadAndSavePrices2018,
    updateDatabaseWithPriceToday,
    concatenateOldAndNewPrices,

}
