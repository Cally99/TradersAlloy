const { default: PQueue } = require('p-queue')
const storeIncomeStatementQueue = new PQueue({ concurrency: 1 })
const { getConnection } = require('./../../../../config/DB')

const IncomeStatement = require('./../../../../models').IncomeStatement

module.exports = async function storeIncomeStatement({ period, isin, uuid }) {

    let transaction = await getConnection().transaction()
    let { income_statement_id } = await storeIncomeStatementQueue.add(() => IncomeStatement.create({ isin, period, uuid }, { transaction }))

    if (income_statement_id) return { income_statement_id, transaction }
    else {
        await transaction.rollback();
        throw new Error('Failure to store income statement.')
    }
}