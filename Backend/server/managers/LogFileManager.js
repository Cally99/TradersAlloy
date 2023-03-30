const fs = require('fs');
const path = require('path');
const readline = require('readline');
const DB = require('../helpers/DB');
const connection = DB.getConnection();

const log4js = require('log4js');
const logger = log4js.getLogger("health");
const logPath = process.env.LOG_PATH||require("os").userInfo().homedir;  // eg /home/trader or /Users/andrew

/** get the price according to the currency for a single stock
 * for the database and the /Data files used for the charts
 * example:
 * https://mws.millistream.com/mws.fcgi?usr=tradersalloy&pwd=zBaly0kTcfneORknIjvnK1kMIj1eO0iJTmdxKEkR&cmd=history&insref=2187&fields=insref,date,closeprice,closequantity,closeturnover,closedayhighprice,closedaylowprice,openprice&startdate=2021-01-20&enddate=2100-01-01&filetype=json
 * */

module.exports = {

    async getTodaysEntries () {
        try {
            let logContent = [];

            const fileStream = fs.createReadStream(logPath + '/healthcheck.log');
            const lines = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });

            for await (const line of lines) {
                logContent.push( this.cleanLine(line) );
            }
            return logContent;

        } catch (error) {
            console.log(error);
        }
    },

    cleanLine (line) {
        const output = line.substring(12, 17)+ ' ' + line.substring( line.indexOf(' - ')+3);
        return output;
    },

    async getDataLoadScheduled() {
        return await connection.query(`
                    select date_report, count(*) as events
                    from company_calendar
                    where  date_report > CURRENT_DATE -INTERVAL '30 days'
                    and    date_report <= CURRENT_DATE
                    group by date_report
                    order by 1
                `, {nest: false, type: connection.QueryTypes.SELECT});

    },

    async getDataLoad() {
        return await connection.query(`
                select date_report, count(*) as reports
                from company_report
                where  date_report > CURRENT_DATE -INTERVAL '30 days'
                group by date_report
            `, {nest: false, type: connection.QueryTypes.SELECT});

        /*
                    select DATE(timestamp) as date_report, sum(value) as reports
                    from _log
                    where key = 'REPORTS'
                    group by DATE(timestamp)
                    order by DATE(timestamp)
*/
    }

}
