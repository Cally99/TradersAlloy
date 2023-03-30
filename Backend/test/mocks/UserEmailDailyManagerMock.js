/* -- STOPLOSS example
 This is for Saxlund Group (ISIN: SE0008966014 )     
 stock.price_today should be 0.43 (less than 0.44)
*/
exports.getAllAlertsForAllUsers = () => {
    return [
        {
            email: 'ulmezz@hotmail.com',
            ticker: 'GENO',
            name: 'Genovis',
            reason: 'TARGET',
            price_today: 43.59,
            what_price_was_crossed: 39.23,
            trade_plan_id: 151,
            stock_id: 2756
        },
        {
            email: 'ulmezz@hotmail.com',
            ticker: 'NET B',
            name: 'NetEnt B',
            reason: 'STOPLOSS',
            price_today: 84.57,
            what_price_was_crossed: 90.12,
            trade_plan_id: 42,
            stock_id: 3938
        },
        {
            email: 'ulmezz@hotmail.com',
            ticker: 'FNOX',
            name: 'Fortnox',
            reason: 'ENTRY',
            price_today: 441.45,
            what_price_was_crossed: 450.78,
            trade_plan_id: 11,
            stock_id: 42953
        },
        {
            email: 'ulmezz@gmail.com',
            ticker: 'GENO',
            name: 'Genovis',
            reason: 'TARGET',
            price_today: 43.59,
            what_price_was_crossed: 39.23,
            trade_plan_id: 151,
            stock_id: 2756
        },
        {
            email: 'ulmezz@gmail.com',
            ticker: 'NET B',
            name: 'NetEnt B',
            reason: 'STOPLOSS',
            price_today: 84.57,
            what_price_was_crossed: 90.12,
            trade_plan_id: 42,
            stock_id: 3938
        },
        {
            email: 'ulmezz@gmail.com',
            ticker: 'FNOX',
            name: 'Fortnox',
            reason: 'ENTRY',
            price_today: 441.45,
            what_price_was_crossed: 450.78,
            trade_plan_id: 11,
            stock_id: 42953
        },
    ];
};
