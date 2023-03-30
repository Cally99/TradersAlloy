const fs = require('fs');

const stockService = require('../services/StockService');
const stockManager = require('../managers/StockManager');
const millistreamManager = require('../managers/MillistreamManager'); // How to use Sinon to Mock with MillistreamController.mock.js ??

const log4js = require('log4js');
const healthCheck = log4js.getLogger("health");


/**
 * Millistream prices to the Data files
 *
 * This is run every day and updates the prices from Millistream.
 *  When a new report comes in the financial results and the PDF are added to company_report and company_report_pdf.
 */
async function getClosePricesFromMillistream() {
    const stocks = await stockManager.list();
    healthCheck.info(` - updating ${stocks.length} stock prices `);
    console.log('--- Updating', stocks.length);
    let progressCounter = 0;

    for (var inx = 0; inx < stocks.length; inx++) {
        let stock = stocks[inx].dataValues;
        await loadAndSavePrice(stock);

        progressCounter++;
        if (progressCounter % 100 === 0) {
            console.log(`*** Updating prices: ${progressCounter}/1600, ${stock.ticker} `);
            healthCheck.info(`*** Updating prices: ${progressCounter}/1600, ${stock.ticker} `);
        }
    }

    return 'completed update prices';
}

async function loadAndSavePrice(stock) {
    try {
        let fileName = 'server/Data/' + stockService.getBaseFileName(stock) + '.json';
        if (!fs.existsSync(fileName)) {
            fs.writeFile(fileName, '{"ohlcv":[]}', error => {
                if (error) {
                    console.log('Error creating a new file: ' + fileName);
                    throw error;
                }
                console.log('creating: ' + fileName);
            })
        }

        let oldPrices = JSON.parse(fs.readFileSync(fileName, 'utf8') || { "ohlcv": [] });
        const newPrices = await millistreamManager.getAllHistoricPricesSinceJune1(stock);

        console.log(stock.ticker, newPrices.length);

        if (newPrices.length > 0) {
            const allPrices = await patchPricesSinceJune1(oldPrices, newPrices);

            const allPricesString = '{"ohlcv":'+JSON.stringify(allPrices)+'}';
            fs.writeFileSync(fileName, allPricesString, error => {
                if (error) {
                    console.log('Error writing prices to file: ' + JSON.stringify(stock) + ' ' + error.message);
                    throw error;
                }
            });

            await updateDatabaseWithPriceToday(stock, newPrices);
        }
        return 1;

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

async function updateDatabaseWithPriceToday(stock, prices) {
    let priceToday = prices[prices.length - 1].closeprice;
    let dateToday = prices[prices.length - 1].date;
    return JSON.parse(JSON.stringify(await stockManager.updatePrice(stock.stock_id, priceToday, dateToday)));
}

async function patchPricesSinceJune1(allPrices, newPricesJSON) {
    const preJunePrices = allPrices.ohlcv;
    const sliceFrom = preJunePrices.find( day => {return day[0] === 1622505600000});  // June 1
    const index = preJunePrices.indexOf(sliceFrom);
    preJunePrices.splice(index);

    const newPrices = newPricesJSON.map(data => {
        return [
                new Date(data.date).getTime(),
                data.openprice,
                data.closedayhighprice,
                data.closedaylowprice,
                data.closeprice,
                data.closequantity
        ];
    });

    return preJunePrices.concat(newPrices);
}


module.exports = {
    getClosePricesFromMillistream,
    loadAndSavePrice,
    updateDatabaseWithPriceToday,
    patchPricesSinceJune1,
}
