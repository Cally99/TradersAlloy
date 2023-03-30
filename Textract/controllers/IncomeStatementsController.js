const { CompanyReportPDF, IncomeStatement, IncomeStatementRow, ErrorLog } = require('../models'); // Models

const db = require('./../config/DB').getConnection();
const { Op } = require('sequelize');
const configs = require('../config/aws-config');

db.authenticate()
    .then(() => {
        console.log('Database connected..');

    })
    .catch(err => console.log('Error: ' + err));


const queueTextractRequest = require('./../helpers/queue-systems/textract/textract-queue')

// Swedish Documents are possible: Check '8be99256-9752-4582-b77d-d63135940349'

// Exports -- TEST ALL

async function getRecords(model, options) {
     let records = await model.findAll(options)

     if (records) return records
     throw new Error('Records not found!')      
}

module.exports = {
    async startExtractIncomeStatement(req, res) {  
        try {
            let records = await getRecords(CompanyReportPDF, configs.mode.test_en)
            records.forEach(record => queueTextractRequest({ record, url: `https://documents.millistream.com/${record.uuid}` }))
        } catch (err) {
            console.error(`Error propogated: ${err.message}`)
        }
        res.json({ redirect: '/api/dummy' })
    },
    fetchIncomeStatements(req, res) {
        const limit = req.body.limit || req.params.limit || 400;
        const offset = req.body.offset || req.params.offset || 0;
        IncomeStatement.findAll({
            raw: true,
            limit,
            offset
        }).then(income_statement => {
            IncomeStatementRow.findAll({
                raw: true,
                where: {
                    income_statement_id: {
                        [Op.and]: {
                            [Op.lte]: limit,
                            [Op.gte]: offset
                        }
                    }
                }
            })
                .then(income_statement_row => {
                    console.log(income_statement_row);
                    let data = [];
                    console.log('Data', income_statement_row);
                    for (let obj1 of income_statement) {
                        let statement = [];
                        for (let obj2 of income_statement_row.filter(obj => obj.income_statement_id === obj1.income_statement_id)) {
                            statement.push([obj2.text, obj2.value]);
                        }
                        data.push({
                            income_statement: statement,
                            uuid: obj1.uuid,
                            page_found_on: obj1.page_found_on
                        });
                    }
                    res.json(data);
                });
        });
    },
    displayIncomeStatements(req, res) {
        //IncomeStatementRow.sync({ force: true });
        
        //ErrorLog.sync({ force:true });
        res.render('incomeStatement');
    },
    checkIncomeStatements(req, res) {

        res.render('checkIncomeStatements');
    },
    checkPageFoundStatus(req, res) {
        let found = req.query.checkValue;
        found = new Boolean((found === 'true') ? found : false);
        let uuid = req.query.uuid;
        IncomeStatement.update({ is_accurate: `${found}` }, { where: { uuid } }).then(() => { res.json({ found, uuid }); });

    }
}



