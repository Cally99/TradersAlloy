const UserTx = require('../models').UserTx;

var formidable = require('formidable');
var fs = require('fs');
var parse = require('csv-parse');
const { match } = require('assert');

const userTxService = require('../services/UserTxService');

module.exports = {
    avanzaGenerate2FA(req, res) {
        return res.status(200).send('441150');
    },

    avanzaGetTransactions(req, res) {
        let username = req.body.username;
        let password = req.body.password;
        let secret_key = req.body.secret_key;
        // from username and password (MUST avoid keeping any log of this data !!! )
        // get user_account.secret_key

        // TODO: ...

        // should return
        const transactionsJSON = [{
            account: { id: '5351631', name: '5351631', type: 'Investeringssparkonto' },
            currency: 'SEK',
            description: 'Bought 2',
            orderbook: {
                isin: 'SE0000108656',
                currency: 'SEK',
                name: 'Ericsson B',
                flagCode: 'SE',
                id: '5240',
                type: 'STOCK'
            },
            price: 93.92,
            volume: 2,
            transactionType: 'BUY',
            verificationDate: '2021-11-04',
            sum: 187.84,
            id: 'DEAL-5351631-388347564'
        }];
        return res.status(200).send(transactionsJSON);
    },



    async save_UserTx(req, res) {
        const match_table = [];
        const form = formidable.IncomingForm();
        const files = [];
        const fields = [];

        match_table['Insättning'] = 'DEPOSIT';
        match_table['Köp'] = 'BUY';
        match_table['Räntor'] = 'INTEREST';
        match_table['Sälj'] = 'SELL';
        match_table['Split'] = 'SPLIT';
        match_table['Utdelning'] = 'DIVIDEND';
        match_table['Uttag'] = 'WITHDRAW';

        form.uploadDir = __dirname + `/../../upload/`;

        form.on('field', (field, value) => {
                fields.push([field, value]);
            })
            .on('file', (field, file) => {
                files.push([field, file]);
            })
            .on('end', () => {
                for (const index in files) {
                    const file = files[index];
                    const oldpath = file[1].path;
                    const newpath = form.uploadDir + file[1].name;

                    fs.rename(oldpath, newpath, function(err) {
                        const csvData = [];

                        fs.createReadStream(newpath).pipe(parse({ delimiter: '@' }))
                            .on('data', async function(csvrow) {
                                let type;
                                const temp_data = csvrow.join('').split(',').join('.').split(';');
                                const data = {
                                    "tx_date": temp_data[0],
                                    "user_id": parseInt(fields[0][1]),
                                    "account": temp_data[1],
                                    "price": isNaN(parseFloat(temp_data[5])) ? null : parseFloat(temp_data[5]),
                                    "tx_type": (type = match_table[temp_data[2]]) ? type : "UNKNOWN",
                                    "description": temp_data[3],
                                    "qty": isNaN(parseFloat(temp_data[4])) ? 0 : parseFloat(temp_data[4]),
                                    "exchange_rate": isNaN(parseFloat(temp_data[5])) ? 0 : parseFloat(temp_data[5]),
                                    "amount": isNaN(parseFloat(temp_data[6])) ? 0 : parseFloat(temp_data[6]),
                                    "commission": (temp_data[7] == '-') ? 0 : temp_data[7],
                                    "currency": temp_data[8],
                                    "isin": temp_data[9],
                                };

                                csvData.push(data);
                            })
                            .on('end', function() {
                                csvData.shift();
                                res.status(200).send(csvData);
                            });
                    });
                }
            });

        form.parse(req);
    },

    async save_json_UserTx(req, res) {
        const data = req.body;

        const response = await userTxService.save_json_UserTx(data);

        return res.status(200).send(response);
    },

    async insertOneTx(req, res) {
        const data = req.body;

        const tx = await userTxService.insertOneTx(data);
        return res.status(200).send(tx);
    },

    async fetchTx(req, res) {
        const user_id = req.params.user_id;

        const items = await UserTx.findAll({ where: { user_id } });
        return res.status(200).send(items);
    },

    async updateSpecUserTx(req, res) {
        const data = req.body;

        const response = await userTxService.updateSpecUserTx(data);
        return res.status(200).send(response);
    },

    async deleteSpecUserTx(req, res) {
        const data = req.body;

        const response = await userTxService.deleteSpecUserTx(data);
        return res.status(200).send(response);
    }
};