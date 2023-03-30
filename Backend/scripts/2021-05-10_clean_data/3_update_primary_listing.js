const Stock = require('../../server/models').Stock;
const StockExchange = require('../../server/models').StockExchange;
const CompanyManager = require('../../server/managers/CompanyManager');
const StockManager = require('../../server/managers/StockManager');

let Sequelize    = require('sequelize');

Sequelize = new Sequelize(process.env.DB_database, process.env.DB_username, process.env.DB_password, {
    host: 'localhost',
    dialect: 'postgres',
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
    },
    define: {
        timestamps: false,
        underscored: false,
        freezeTableName: true
    },
});

/**
 *   Update the new column stock.primary_listing
 *
 *   This is used to show which stock to use for a Company (when 1 stock is preferred).
 *
 * */
let resultObject = updateStockPrimaryListing();
process.exitCode = 0;

/**
 *
 *
 * */
async function test() {
    try {
        let passed = 0;
        let failed  = 0;
        /// before
        const updateResult = await Sequelize.query(`
                UPDATE stock 
                SET primary_listing = null
            `,
            { nest: false, type: Sequelize.QueryTypes.SELECT })

        /// exercise
        await updateStockPrimaryListing();

        // assert after
        console.log('checking');
        t1: {
            const actual1 = await Sequelize.query(`
                    select  stock_id, name, primary_listing
                    from    stock
                    WHERE   stock_id = '3101734'
            `, {nest: false, type: Sequelize.QueryTypes.SELECT});

            //console.log(actual1);
            const stock = actual1[0];

            if ( stock.primary_listing === true ) {
                passed++;
            } else {
                failed++;
                console.log('expected true: got ??? ');
            }
        }

        t2: {
            const actual2 = await Sequelize.query(`
                select  primary_listing, count(*)
                from    stock
                GROUP BY primary_listing
            `, {nest: false, type: Sequelize.QueryTypes.SELECT});
            //console.log();
            actual2.forEach ( row =>  {
                console.log(row);
            });
            if ( actual2[0] > 100 ) {
                passed++;
            } else {
                failed++;
            }
        }

        console.log('-----------------------------');
        console.log('Passed: '+ passed);
        console.log('Failed: '+ failed);

    } catch (error) {
        console.log(error);

    }
}

/**
 *    calcualte based on ISIN
 *   if solely traded
 * */

async function updateStockPrimaryListing() {

    //const company = JSON.parse(JSON.stringify(await CompanyManager.get( 39898  )));
    //const companies = [company];
    const companies = JSON.parse(JSON.stringify(await CompanyManager.list()));

    let progress = 0;
    next_company:
    for (const c of companies) {
        progress++;

        const stocks = JSON.parse(JSON.stringify(await Stock.findAll({where: {company_id: c.company_id}})));

        if ((progress % 100) === 0 ) {
            console.log(` ${progress} ${c.name}  ..... ${stocks.length} stocks`);
        }

        if (stocks.length === 1) {
            await StockManager.update({primary_listing: true}, {where: {stock_id: stocks[0].stock_id}});
            continue;  /// completed the task for this loop
        }

        if (c.company_id === 33364) {
            let stock_id = (stocks.find(s => s.currency_trade === 'NOK')).stock_id;
            await StockManager.update({primary_listing: true}, {where: { stock_id }});
            continue;
        } else if (c.company_id === 39649) {
            let stock_id = (stocks.find(s => s.currency_trade === 'DKK')).stock_id;
            await StockManager.update({primary_listing: true}, {where: { stock_id }});
            continue;
        } else if (c.company_id === 40108) {
            let stock_id = (stocks.find(s => s.currency_trade === 'SEK')).stock_id;
            await StockManager.update({primary_listing: true}, {where: { stock_id }});
            continue;
        }

        // fix messy Norwegian data
        for (const s of stocks ) {
            if ( s.stock_exchange_id == '39890' || s.stock_exchange_id == '33187' ) {
                await StockManager.update({primary_listing: true}, {where: {stock_id: s.stock_id}});
                continue next_company;
            }
        }


        // Map the ISIN to the currency to infer the primary listing
        const fxMap = new Map();
        fxMap.set('SEK' , 'SE');
        fxMap.set('NOK' , 'NO');
        fxMap.set('DKK' , 'DK');
        fxMap.set('EUR' , 'FI');

        const homeTraded = stocks.filter( s => {
            if (c.company_id === 68419) {
//                console.log(s);
                console.log(s.isin.substring(0,2) +' / '+ s.currency_trade);
            }
            return s.isin.substring(0,2) === fxMap.get(s.currency_trade)}
        );
        if (homeTraded.length === 1) {
            let s = homeTraded[0];
            await StockManager.update({primary_listing: true}, {where: {stock_id: s.stock_id}});
            continue next_company;
        } else {
            let s = stocks.find( s => {
//                console.log('--------------------'+s.name);
//                console.log( (s.name.trim() ).endsWith(' B') );
                return s.name.trim().endsWith(' B')
            } );
            if (s) {
                await StockManager.update({primary_listing: true}, {where: {stock_id: s.stock_id}});
                continue next_company;
            }

            s = stocks.find( s => {
                return ( s.name.trim().endsWith(' PREF') || s.name.trim().endsWith(' Pref')   )
            } );
            if (s) {
                await StockManager.update({primary_listing: true}, {where: {stock_id: s.stock_id}});
                continue next_company;
            }

            // if not "B shares ... sort and make the first ONE and continue next_company:


        }

        console.log('did not find a rule for company: '+ c.company_id);
        for (s of stocks) {
            console.log( ` ${s.company_id}   ${s.stock_id}  ${s.isin}    ${s.ticker}   ${s.currency_trade}       ${s.name}    `);
        }
        console.log('--------------------------------------------- ');
        await StockManager.update({primary_listing: true}, {where: {stock_id: 5521}});
        await StockManager.update({primary_listing: true}, {where: {stock_id: 3268}});
        await StockManager.update({primary_listing: true}, {where: {stock_id: 4803}});
        await StockManager.update({primary_listing: true}, {where: {stock_id: 3275}});
        await StockManager.update({primary_listing: true}, {where: {stock_id: 4560}});

        const updateResult = await Sequelize.query(`
                UPDATE stock 
                SET primary_listing = FALSE
                WHERE primary_listing is null
            `,
            { nest: false, type: Sequelize.QueryTypes.SELECT });
    }

    //console.log('----------- what to do with these ?');
    //for( s1 of stocks) {
    //    console.log(s1);
    //}

    console.log('----------- SUMMARY ');
    const actual2 = await Sequelize.query(`
                select  primary_listing, count(*)
                from    stock
                GROUP BY primary_listing
            `, {nest: false, type: Sequelize.QueryTypes.SELECT});
    actual2.forEach ( row =>  {
        console.log(row);
    });
    console.log('----------- END ');

}



module.exports = {

};
