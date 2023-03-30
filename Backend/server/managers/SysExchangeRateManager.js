

const DB = require('../helpers/DB');
const connection = DB.getConnection();

module.exports = {
    async getExchangeRates() {
        const today = new Date().toISOString().substring(0,10);

        return await connection.query(`
                SELECT  date, nok, eur, dkk
                FROM    sys_currency_sek C
                WHERE   C.date <= :today
                ORDER BY C.date
                LIMIT 1                  
            `, { replacements: {today}, nest: false, type: connection.QueryTypes.SELECT});
        },
};



