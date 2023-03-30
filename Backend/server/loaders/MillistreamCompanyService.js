const companyManager = require('../managers/CompanyManager');
const stockManager = require('../managers/StockManager');
const stockPriceManager = require('../managers/StockPriceManager');

const millistreamManager = require('../managers/MillistreamManager'); // How to use Sinon to Mock with MillistreamController.mock.js ??

const log4js = require('log4js');
const healthCheck = log4js.getLogger("health");
const moment = require('moment');

async function getMillistreamTotalSet() {
    const millistreamStockObjects = await millistreamManager.getAllStockIdsFromMillistream();
    // console.log(millistreamStockObjects.data);
    const millistreamStockIds = millistreamStockObjects.data
            .filter(x => ( x.list.match(/33620/)   ? false : true  ))   // exclude First North Stockholm traded in NOK
            .map( a => a.insref); // stock.insref is what Millistream calls stock_id.
    return millistreamStockIds;
}

async function getDetailsFromMillistreamAndInsert(stockId) {
    try {
        const response = await millistreamManager.loadStock(stockId);
        const stock = response.data;
        healthCheck.info('\t *** New Stock for our Database! ' + stock[0].company + '\t' + stock[0].insref + '\t' + stock[0].name + '\t' + stock[0].marketplace + '\t' + stock[0].list + '\t' + stock[0].tradecurrency);
        await insertStock(stock[0]);

    } catch (error) {
        healthCheck.error(JSON.stringify(error) );
    }
}

/**
 *     from the CRON job
 *
 * */
async function discoverNewStocksAndCompanies() {
    const millistreamStockIds = await getMillistreamTotalSet();

    const stocks = await stockManager.getAllStocks();
    const stockIds = stocks.map(x => x.stock_id);


    const companiesDelisted = await companyManager.getCompaniesDelisted();
    const delistedIds = companiesDelisted.map(x => x.stock_id);

    const newStockIds = await difMillistreamAndDatabase(millistreamStockIds, stockIds, delistedIds);

    for (const stockId of newStockIds) {
        await getDetailsFromMillistreamAndInsert(stockId);
    }

    return {
        tradersAlloyStockCount: stockIds.length,
        tradersAlloyDelistedCount: companiesDelisted.length,
        millistreamStockCount: millistreamStockIds.length,
        companiesAdded: newStockIds.length
    };
}

async function insertStock(s) {
    try {
        let primaryListing;

        const existingCompany = await companyManager.get(s.company);
        if (!existingCompany) {
            primaryListing = true;

            const company = {
                company_id: s.company,
                name: s.name,
                description: null,
                market_cap: null,
                last_report_date: null,
                last_eps_ttm: null,
                last_sales: null,
                last_pe: null,
                last_np: null,
                ceo_comments: null,
                next_report_date: null,
                status_flag: null,
                last_np: null,
                insider_trade_isins: null
            };
            await companyManager.insert(company);
        } else {
            primaryListing = false;
        }

        const priceLine = await stockPriceManager.getLatestPriceLine(s.insref);
        const priceToday = ( priceLine ? priceLine.close : null);
        const priceUpdated = ( priceLine ? moment(priceLine.datetime_ms/1000).format('YYYY-MM-DD') : null );

        const stock = {
            company_id: s.company,
            stock_id: s.insref,
            isin: s.isin,
            ticker: s.symbol,
            name: s.name,
            stock_exchange_id: s.marketplace,
            sector_id: 0, // the root
            currency_trade: s.tradecurrency,
            price_today: priceToday,
            price_updated: priceUpdated,
            primary_listing: primaryListing,
            status_flag: null,
        };

        await stockManager.insert(stock);
    } catch (e) {
        console.log(s);
        console.log(e.message);
    }

}


async function difMillistreamAndDatabase (millistreamStocks, stockIds, delistedIds) {
    console.log('CHECK FORMAT: ', millistreamStocks[0], stockIds[0], delistedIds[0]);

    millistreamStocks.map( x => {

    });

    let newCompanies = millistreamStocks.filter(x => {
            return !stockIds.includes(x)
        }
    );

    newCompanies = newCompanies.filter(x => {
            return !delistedIds.includes(x.company_id)
        }
    );

    return newCompanies;
}


module.exports = {
    discoverNewStocksAndCompanies,
    insertStock ,
    difMillistreamAndDatabase,
    getMillistreamTotalSet,
};
