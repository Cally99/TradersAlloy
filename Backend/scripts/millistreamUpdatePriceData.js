require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const stockManager = require("../server/managers/StockManager.js");
const stockService = require("../server/services/StockService");
const log4js = require('log4js');
const logger = log4js.getLogger("app_log");

/**
 * Paul 2021-05-01
 * This script is for getting price data from millistream.
 * We have getClosePriceFromMillistream() in /services/StockService.js, But the data only for a day.
 * This script fetch the price data from 2021-01-01 to today.
 * Copy the logic of getClosePriceFromMillistream().
 * / */
async function getClosePriceFromMillistream () {

    const stocks = await stockManager.list();
    // const stocks = await stockManager.getPartList();
    logger.info(`*** Selected ${stocks.length} Stock records to update price `);

    let progressCounter = 0;

    // console.log(stocks.length);

    // return false;

    for (const inx in stocks) {
        var stock = stocks[inx].dataValues;
        
        console.log('stock-number',inx);
        // if (inx > 1466) {
        try {
            let baseName = stockService.getBaseFileName(stock);

            let array = {"ohlcv": []};
            let priceToday = 0;

            console.log('--->File-name', baseName);

            let fileName = '../server/Data/' + baseName + '.json';

            let lastDateTime = 0;
            let lastDate = "2015-01-01";

            // we should check if JSON file with stock.ticker name already or not. If there is existed JSON file already, we should insert the today_price into the existing ohclv array
            if (fs.existsSync(fileName)) {
                let chart_data = fs.readFileSync(fileName, 'utf8')
                if (chart_data) {
                    array = JSON.parse(chart_data)
                }
                lastDateTime = array.ohlcv[array.ohlcv.length - 1][0];
                lastDate = new Date(lastDateTime).toISOString().substring(0,10);
                priceToday = array.ohlcv[array.ohlcv.length - 1][4];
            }

            // we should get missing data from latest got date.
            const res = await getPrice(stock.stock_id, lastDate);

            if (res.data.length > 0 ) {
                const prices = res.data[0].history;

                // for loop is not essential because there is only one item in prices array. but for loop is not a bug now. I leave it for future features.
                for (let i = 0; i < prices.length; i++) {
                    const dateTime = new Date(prices[i].date).getTime();

                    if (prices[i].closeprice && lastDateTime !== dateTime) {
                        const temp = [dateTime, prices[i].openprice, prices[i].closedayhighprice, prices[i].closedaylowprice, prices[i].closeprice, prices[i].closequantity];
                        array.ohlcv.push(temp);
                        if (i === prices.length-1) {
                            priceToday = prices[i].closeprice;
                        }
                    }
                }
                console.log('--->added prices count', prices.length);
                let priceData = JSON.stringify(array);
                fs.writeFile(fileName, priceData, function(err) {
                    const id = stock.stock_id;
                    console.log("--- saved stock id ---", id, err);
                });

                progressCounter++;
            }
            await stockManager.updatePrice( stock.stock_id, priceToday, stock.currency_trade);
        } catch(error) {
            console.log(error.message);
            logger.error(`*** Updating prices: Error: ${JSON.stringify(stock)} ... ${error.message} `);
        } finally {
            if (progressCounter % 100 === 0) {
                logger.info(`*** Updating prices: ${progressCounter} : ${stock.ticker} `);
            }
        }
        // }
    }
    logger.info(`Ended daily stock prices: updated: ${progressCounter} stocks`);
    console.log(`Ended daily stock prices: updated: ${progressCounter} stocks`)
    return 'completed update prices';
}

async function getPrice(stock_id, startDate) {

  return await axios.get('https://mws.millistream.com/mws.fcgi',
      {
        params: {
            usr: 'tradersalloy',
            pwd:process.env.MILLISTREAM_PWD,
            cmd:'history',
            insref: stock_id,
            fields: 'insref,date,closeprice,closequantity,closeturnover,closedayhighprice,closedaylowprice,openprice',
            startdate: startDate,
            enddate: '2100-01-01',
            filetype: 'json'
        }
      });
}

getClosePriceFromMillistream();