const axios = require('axios');
const fs = require('fs');
const stockManager = require("../managers/StockManager.js");
const millistreamManager = require("../managers/MillistreamManager.js");
const log4js = require('log4js');
const logger = log4js.getLogger("app_log");
const https = require("https");
const { json } = require('sequelize');


/**
 * This script is for recovering JSON files when it is corrupted.
 * We have PriceDataDaily.js in /crons directory, but it is needed when insert today_price everyday.
 * / */
const getAll = async () => {
    const stocks = await stockManager.list();

    let progressCounter = 0;
    
    for (const inx in stocks) {
        var stock = stocks[inx].dataValues;
        try {
            const res = await millistreamManager.getPrice_JSON(stock.insref);
            if (res.data.length > 0 ) {
                const prices = res.data[0].history;
                let array = {"ohlcv": []};
                let priceToday = 0;

                let fileName = 'server/Data/' + stock.ticker + '.json';

                for (let i=0; i<prices.length; i++) {
                if (prices[i].closeprice) {
                    const date = prices[i].date;
                    const date1 = new Date(date);
                    const temp = [date1.getTime(), prices[i].openprice, prices[i].closedayhighprice, prices[i].closedaylowprice, prices[i].closeprice, prices[i].closequantity];
                    array.ohlcv.push(temp);
                    if (i===prices.length-1) {
                        priceToday = prices[i].closeprice;
                    }
                }
                }
                let priceData = JSON.stringify(array);
                fs.writeFile(fileName, priceData, async function(err) {
                    console.log('----------- made ', stock.isin)
                });
                
                progressCounter++;
            }
        } catch(error) {
            console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$', error)
        } finally {
            console.log('//////////////////////// -- finally -- //////////////////////////////', progressCounter, stocks.length)
        }
    }

    console.log('&&&&&&&&&&&&&& DONE &&&&&&&&&&&&&&&&&&&&&')
}

// getAll();
