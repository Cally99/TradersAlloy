

/**
 * */
exports.list = () => {
    return [{
        stock_id: 733968,
        stock_exchange_id: '35181',
        isin: 'SE0005504347',
        ticker: 'DELARK',
        name: 'Delarka Holding',
        sector_id: 68205,
        currency_trade: 'SEK',
        price_today: 63
    },
    {
        stock_id: 908443,
        stock_exchange_id: '35181',
        isin: 'SE0006143103',
        ticker: 'ITAL SDB',
        name: 'Italeaf SDB',
        sector_id: 68193,
        currency_trade: 'EUR',
        price_today: 0.09
    },
    {
        stock_id: 988551,
        stock_exchange_id: '35181',
        isin: 'SE0006504163',
        ticker: 'SAPIAB',
        name: 'Saltängen Property Invest',
        sector_id: 68205,
        currency_trade: 'SEK',
        price_today: null
    },
    {
        stock_id: 4529,
        stock_exchange_id: '35181',
        isin: 'SE0008966014',
        ticker: 'SAXG',
        name: 'Saxlund Group',
        sector_id: 68193,
        currency_trade: 'SEK',
        price_today: 0.435
    }];
};

/**
 * */
exports.listByCompany = () => {
    return [
        {
            stock_id: 1294,
            ticker: 'AZA',
            name: 'Avanza Bank Holding',
            company_id: 32875,
            sector_id: 68206,
            currency_trade: 'SEK',
            earnings_date_next: null,
            stock_exchange_id: 35201,
            price_today: 249.8
        }];
};

/**
 * example of one company traded on multiple exchanges/countries each with a 'stock'
 * */
exports.listByCompany_NOKIA = () => {
    return [
        {
            stock_id: 469,
            ticker: 'NOKIA',
            name: 'Nokia Corporation',
            company_id: 39502,
            sector_id: 68207,
            currency_trade: 'EUR',
            earnings_date_next: null,
            stock_exchange_id: 35235,
            price_today: 3.3525
        },
        {
            stock_id: 2187,
            ticker: 'NOKIA SEK',
            name: 'Nokia Corporation',
            isin: 'FI0009000681',
            company_id: 39502,
            sector_id: 68207,
            currency_trade: 'SEK',
            earnings_date_next: null,
            stock_exchange_id: 35201,
            price_today: 3.3525
        },
    ];
};

/**
 * */
exports.listByCompany_AZA = () => {
    return [
        {
            stock_id: 1294,
            ticker: 'AZA',
            name: 'Avanza Bank Holding',
            isin: 'SE0012454072',
            stock_exchange_id: '35201',
            sector_id: 68206,
            currency_trade: 'SEK',
            price_today: 250.4
        }
    ];
};

/**
 * */
exports.listByCompany_SAND = () => {
    return [
        {
            stock_id: 2956,
            ticker: 'SAND',
            name: 'Sandvik',
            isin: 'SE0000667891',
            stock_exchange_id: '35201',
            sector_id: 68193,
            currency_trade: 'SEK',
            price_today: 217.6
        }
    ];
};
