const getResource = require('./get-resource')
const putObject = require('./put-object')
const startDocumentAnalysis = require('./analyze')
const waitAndGetAnalysis = require('./get-analysis')
const deleteObject = require('./delete-object')
const storeIncomeStatement = require('./store-income-statement')
const storeIncomeStatementRow = require('./store-income-statement-row')
const storeError = require('./store-error')

module.exports = {
    getResource,
    putObject,
    startDocumentAnalysis,
    waitAndGetAnalysis,
    deleteObject,
    storeIncomeStatement,
    storeIncomeStatementRow, 
    storeError
}