const UserTx = require('../models').UserTx;

var formidable = require('formidable');
var fs = require('fs');
var parse = require('csv-parse');
const { match } = require('assert');

const UserTxManager = require('../managers/UserTxManager');

module.exports = {
    async deleteSpecUserTx(data) {
        return await UserTxManager.deleteSpecUserTx(data);
    },

    async updateSpecUserTx(data) {
        return await UserTxManager.updateSpecUserTx(data);
    },

    async insertOneTx(data) {
        return await UserTxManager.insertOneTx(data);
    },

    save_UserTx(req, res) {
        let match_table = [];
        match_table['Insättning'] = 'DEPOSIT';
        match_table['Köp'] = 'BUY';
        match_table['Räntor'] = 'INTEREST';
        match_table['Sälj'] = 'SELL';
        match_table['Split'] = 'SPLIT';
        match_table['Utdelning'] = 'DIVIDEND';
        match_table['Uttag'] = 'WITHDRAW';

        let form = formidable.IncomingForm(),
            files = [],
            fields = [];
        form.uploadDir=  __dirname + `/../../upload/`
        form.on('field', (field, value)=>{
            fields.push([field, value])
        })
        .on('file', (field, file)=>{
            files.push([field, file])
        })
        .on('end', ()=> {
            for (index in files) {
                var file = files[index];
                var oldpath = file[1].path;
                var newpath = form.uploadDir + file[1].name;
                fs.rename(oldpath, newpath, function(err) {
                    var csvData = [];
                    fs.createReadStream(newpath).pipe(parse({delimiter: '@'}))
                    .on('data', async function(csvrow) {
                        let temp_data = csvrow.join('').split(',').join('.').split(';');
                        let type;
                        let data = {
                            "tx_date" : temp_data[0],
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
                        }
                        csvData.push(data);
                        // if (data.tx_date != 'Datum') {
                        //     await UserTx
                        //         .create(data)
                        // }
                    })
                    .on('end', function() {
                        // console.log('xxxxxx');
                        // console.log('xxxxxx');
                        // console.log(csvData);
                        // console.log('xxxxxx');
                        // console.log('xxxxxx');
                        csvData.shift();
                        res.status(200).send(csvData)
                        // return UserTx
                        //     .bulkCreate(csvData)
                        //     .then(() => res.status(200).send(csvData))
                        //     .catch(error => res.status(400).send(error))
                        // console.log('-----------------',csvData);
                        // console.log('-----------------', fields[0][1]);
                    })
                })
            }
        })
        form.parse(req);
    },

    async save_json_UserTx(data) {
        return await UserTxManager.save_json_UserTx(data);
    },

    fetchTx(req, res) {  // TODO: What is this doing here ?
        return UserTx.findAll({where: { user_id: req.params.user_id }})
            .then(items => res.status(200).send(items))
            .catch(error => {
                res.status(400).send(error)
            })
    }
};
