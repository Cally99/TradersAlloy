const { default: PQueue } = require('p-queue')
const storeIncomeStatementQueue = new PQueue({ concurrency: 1 })

const { getConnection } = require('./../../../../config/DB')

const IncomeStatementRow = require('./../../../../models').IncomeStatementRow

module.exports = async function storeIncomeStatementRow({ income_statement_id, transaction }, incomeStatement) {
    let rows = incomeStatement.map(row => {
        return {
            income_statement_id,
            text: `${row[0]}`,
            value: `${row[1]}`
        }
    })

    let success = await storeIncomeStatementQueue.add(() => IncomeStatementRow.bulkCreate(rows, { transaction } ))

    if (success) {
        await transaction.commit()
        return { income_statement_id, transaction }
    } else {
        await transaction.rollback();
        throw new Error('Failure to store income statement rows.')
    }

}