const UserTx = require('../models').UserTx;
const UserTrade = require('../models').UserTrade;
const UserAccount = require('../models').UserAccount;

const DB = require('../helpers/DB');
const connection = DB.getConnection();

let formidable = require('formidable');
let fs = require('fs');
let parse = require('csv-parse');
const { match } = require('assert');




module.exports = {
    async deleteSpecUserTx(data) {
        const tx_id = data.tx_id;
        const user_id = data.user_id;
        const stock_id = data.stock_id;
        const uts = data.uts;

        const t = await connection.transaction();

        try {
            await UserTx.destroy({ where: { tx_id } }, { transaction: t });

            await UserTrade.destroy({ where: { user_id, stock_id } }, { transaction: t });

            for (const ut of uts) {
                await UserTrade.create(ut, { transaction: t });
            }

            await t.commit();

            const message = { message: 'Deleted successfully' };

            console.log(JSON.stringify(message));

            return message;
        } catch (error) {
            console.log(error.message);

            await t.rollback();

            return { errorMessage: error.message };
        }
    },

    async updateSpecUserTx(data) {
        const tx_id = data.tx_id;
        const user_id = data.user_id;
        const stock_id = data.stock_id;
        const tx = data.tx;
        const uts = data.uts;

        const t = await connection.transaction();

        try {
            await UserTrade.destroy({ where: { user_id, stock_id } }, { transaction: t });

            await UserTx.update(tx, { where: { tx_id } }, { transaction: t });

            for (const ut of uts) {
                await UserTrade.create(ut, { transaction: t });
            }

            await t.commit();

            const message = { message: 'Updated successfully' };

            console.log(JSON.stringify(message));

            return message;
        } catch (error) {
            console.log(error.message);

            await t.rollback();

            return { errorMessage: error.message };
        }
    },



    /*
user_id:
stock_id: this.stock.stock_id,
isin: this.stock.isin,
currency: this.stock.currency_trade,
price:
tx_type: this.buySell,
tx_date: ,
qty: this.qty,
amount: this.totalValue,
user_account_id: this.userCompetitionAccount.user_account_id,
exchange_rate: 1,
commission: 0,
* */
    /* data = {"user_id":532,
        "account":"",
        "stock_id":5160367,
        "user_account_id":"532-2",
        "tx_date":"2022-02-09",
        "tx_type":"BUY",
        "description":"",
        "qty":1,
        "price":"100","amount":-100,
        "commission":"0",
        "currency":"SEK",
        "exchange_rate":"100"}
*/

    /**
     * This has the DB transaction and all the business logic
     *
     * */
    async insertOneTx(tx) {
        //TODO: wrap in a DB transaction

        try {
            let newTx = null;
            let affectedUserTrades = [];
            let userAccount = null;
//            console.table(tx);

            if (tx.tx_type === 'BUY') {
                newTx = (await UserTx.create(tx)).toJSON();
                let updatedPosition = await this.privateInsertUserTrade(tx);
                affectedUserTrades.push( updatedPosition);
                userAccount = await this.privateAccountBalanceReduceCash(tx);

            } else if (tx.tx_type === 'SELL') {
                newTx = (await UserTx.create(tx)).toJSON();
                affectedUserTrades = await this.privateUpsertUserTrades(tx);
                userAccount = await this.privateAccountBalanceReturnCash(tx);
            }

            return {
                userTx: newTx,
                userTrade: affectedUserTrades,
                userAccount: userAccount,
            };

        } catch(e) {
            console.log(e);
        }
    },

    async privateInsertUserTrade(tx) {
        const newUserTrade = {
            trade_id: null,
            user_id: tx.user_id,
            user_account_id:  tx.user_account_id,                   // ?
            stock_id: tx.stock_id,
            ticker: tx.ticker,                                      // TODO, add ticker to user_tx
            instrument_type: 'stock',
            entry_price: tx.price,
            entry_date: new Date().toISOString().substring(0,10),
            entry_qty: tx.qty,                                      // ?
            entry_commission: tx.commission,
            exit_price:  tx.price,
            exit_date: null,
            exit_qty : null,
            exit_commission: null,
            pnl: null,                                               //?  null until closed ???
            notes: null,                                             //?  not used ?
        };

        const userTrade = (await UserTrade.create(newUserTrade)).toJSON();
        return userTrade;
    },

    async privateUpsertUserTrades(tx) {
        let affectedUserTrades=[];
        const sequelizeResponse = await UserTrade.findAll({where:
                                                                {user_id: tx.user_id,
                                                                user_account_id: tx.user_account_id,
                                                                stock_id: tx.stock_id,
                                                                exit_date: null},
                                                           order: [['entry_date'], ['trade_id']]});
        const positions = JSON.parse(JSON.stringify(sequelizeResponse));
        let quantityToAbsorb = tx.qty;
        let exit_commission = tx.commission;

        let updatedPosition = null;

        // console.table(positions);
        for (const p of positions) {

            const quantityAvailable = p.entry_qty;
            const reduceByQty = Math.min(quantityToAbsorb , quantityAvailable);

            await connection.query(`    
                                update user_trade
                                set exit_qty = :reduceByQty,
                                    entry_qty = :reduceByQty,
                                    exit_date = CURRENT_DATE,
                                    exit_price = :exit_price,
                                    exit_commission = :exit_commission,
                                    pnl = ((exit_price-entry_price) * :reduceByQty) - entry_commission - :exit_commission
                                where  trade_id = :trade_id
                    `, { replacements: { trade_id: p.trade_id,
                                                reduceByQty,
                                                exit_price: tx.price,
                                                exit_commission},
                                                type: connection.QueryTypes.SELECT});
            // I could not get update to return the rows... so must select.
            updatedPosition = (await UserTrade.findOne({where:{trade_id: p.trade_id}})).toJSON();
            affectedUserTrades.push(updatedPosition);
            exit_commission = 0;// only apply the commission of (both) transactions one time.


            quantityToAbsorb = quantityToAbsorb - reduceByQty;
            if (quantityToAbsorb === 0) {
                let quantityRemaining = quantityAvailable - reduceByQty;
                if (quantityRemaining > 0) {
                    await UserTrade.create({
                        user_id: p.user_id,
                        user_account_id: p.user_account_id,
                        stock_id: p.stock_id,
                        ticker: p.ticker,
                        instrument_type: p.instrument_type,
                        entry_price: p.entry_price,
                        entry_date: p.entry_date,
                        entry_qty: quantityRemaining,
                        entry_commission: 0,  // this is the remainder of another trade so commission has been counted there.
                        exit_price: p.exit_price,
                        exit_date: null,
                        exit_qty: null,
                        exit_commission: null,
                        pnl: (p.exit_price-p.entry_price) * p.entry_qty,
                        notes: null,
                    });
                }
                break;
            }
        }
        if (quantityToAbsorb > 0) {
            let leftOversPosition = updatedPosition;
            leftOversPosition.trade_id = null;
            leftOversPosition.exit_qty = null;
            leftOversPosition.exit_date = null;
            leftOversPosition.entry_qty = quantityToAbsorb;
            leftOversPosition = await UserTrade.create(leftOversPosition);

            affectedUserTrades.push(leftOversPosition);
        }


            return affectedUserTrades;
    },

    async privateAccountBalanceReduceCash(tx){
        const amount = (tx.price * tx.qty) + tx.commission;
        const ua =  await UserAccount.increment('cash',  {
                                    by : amount * -1,
                                    where: {user_id: tx.user_id,
                                            user_account_id: tx.user_account_id},
                                    returning: true,
                                    plain: true});
        return ua[0][0];  // TODO: CHECK THIS
    },
    async privateAccountBalanceReturnCash(tx){
        const amount = (tx.price * tx.qty) - tx.commission;
        return await UserAccount.increment('cash',  {
                                    by : amount,
                                    where: {user_id: tx.user_id,
                                            user_account_id: tx.user_account_id},
                                    returning: true,
                                    plain: true});

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
        form.uploadDir = __dirname + `/../../upload/`
        form.on('field', (field, value) => {
                fields.push([field, value])
            })
            .on('file', (field, file) => {
                files.push([field, file])
            })
            .on('end', () => {
                for (index in files) {
                    var file = files[index];
                    var oldpath = file[1].path;
                    var newpath = form.uploadDir + file[1].name;
                    fs.rename(oldpath, newpath, function(err) {
                        var csvData = [];
                        fs.createReadStream(newpath).pipe(parse({ delimiter: '@' }))
                            .on('data', async function(csvrow) {
                                let temp_data = csvrow.join('').split(',').join('.').split(';');

                                console.log(temp_data);

                                let type;
                                let data = {
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
                                }
                                csvData.push(data);
                                // if (data.tx_date != 'Datum') {
                                //     await UserTx
                                //         .create(data)
                                // }
                            })
                            .on('end', function() {
                                // console.log(csvData);

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
            });
        form.parse(req);
    },

    async save_json_UserTx(data) {
        const txs = data.txs;
        const uts = data.uts;
        const user_id = data.user_id;
        const stock_ids = data.stock_ids;

        const returnedTxs = [];
        const returnedUts = [];

        const t = await connection.transaction();

        try {
            for (const stock_id of stock_ids) {
                await UserTrade.destroy({ where: { user_id, stock_id } }, { transaction: t });
            }

            for (const tx of txs) {
                const response = await UserTx.create(tx, { transaction: t });
                returnedTxs.push(response);
            }

            for (const ut of uts) {
                const response = await UserTrade.create(ut, { transaction: t });
                returnedUts.push(response);
            }

            await t.commit();

            const message = 'Saved successfully';

            const returnObject = {
                returnedTxs,
                returnedUts,
                message
            };

            console.log(JSON.stringify(returnObject));

            return returnObject;
        } catch (error) {
            console.log(error.message);

            await t.rollback();

            return { errorMessage: error.message };
        }
    },

    async fetchTx(req, res) { // TODO: why is this HTTP in the manager ?
        const tx = await UserTx.findAll({ where: { user_id: req.params.user_id } });
        res.status(200).send(tx);
    }

};
