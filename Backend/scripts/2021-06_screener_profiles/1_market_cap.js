const companyManager = require('./../../server/managers/CompanyManager');


/**
 *   get profiles once a 'year' for the screener filters
 *
 * */
//let resultObject = runx();
process.exitCode = 0;

async function runx() {

    const companies = JSON.parse(JSON.stringify(await companyManager.list()));

    let profile = [
            {from:  5000, count: 0},
            {from: 10000, count: 0},
            {from: 20000, count: 0},
            {from: 30000, count: 0},
            {from: 40000, count: 0},
            {from: 50000, count: 0},
            {from: 60000, count: 0},
            {from: 70000, count: 0},
            {from: 80000, count: 0},
            {from: 90000, count: 0},
        ];

    for (const c of companies) {

        profile.forEach( (x, i) => {
            if (c.market_cap > x.from && c.market_cap < profile[i+1].from) {
                x.count++;
            }
        });

    }

    for (const p of profile) {

        console.log(`${p.from}    ${p.count}`);


    }
    console.log();
}



module.exports = {
    runx,
};
