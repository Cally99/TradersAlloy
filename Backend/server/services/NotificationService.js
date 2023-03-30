

module.exports = {
/**

 This service is where the notifications of different types will be checked, formatted and sent to either HTTP calls or
 initiated by crons to be sent by emails (as we have now).

 * */

    async getNotifications() {
        return [
            {type: 'NEWS',      datetime:'2022-02-08 20:10', stock_id: 5500234,  ticker: 'TH1NG',json: {news_id: 'FWS006E31D',company_id: 5478048, title: 'Th1ng tecknar ramavtal med Kungälv Energi', }},
            {type: 'REPORT',    datetime:'2022-02-08 15:01', stock_id: 730,      ticker: 'ABB',  json: {company_id: 32380, period: '2021-Q4'}},
            {type: 'REPORTED',  datetime:'2022-02-07 07:00', stock_id: 903716,   ticker: 'ABI',  json: {company_id: 68353, period: '2021-Q4'}},
            {type: 'STOPLOSS',  datetime:'2022-02-05 19:01', stock_id: 3752738,  ticker: 'AFRI', json: {stoploss_price: 400,}},
            {type: 'TARGET',    datetime:'2022-02-05 19:01', stock_id: 3008542,  ticker: 'ACOS', json: {target_price: 22}},
        ]
    },


};
