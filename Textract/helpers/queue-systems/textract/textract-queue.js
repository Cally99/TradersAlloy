const {
    getResource,
    putObject,
    startDocumentAnalysis,
    waitAndGetAnalysis,
    storeIncomeStatement,
    storeIncomeStatementRow,
    storeError,
    deleteObject
} = require('./queues')
const {
    findIncomeStatementFromTextractResult
} = require('./../../search')
const {
    createRandomFile,
    getIndentifiersByLanguage
} = require('./util')

const path = require('path')

module.exports = async function queueTextractRequest(request) {
    let file
    try {

       let resource = await getResource(request.url)
       file = createRandomFile(process.env.AWS_dirname, '.txt')
       await putObject(resource, file) 
       let { JobId } = await startDocumentAnalysis(file, ['TABLES'])
       let textractResult = await waitAndGetAnalysis(JobId) 
       let indentifiers = await getIndentifiersByLanguage(path.join(__dirname, '/json/incomeStatementIdentifiers.json'), 'en')
       let incomeStatement = await findIncomeStatementFromTextractResult(textractResult, indentifiers)
       let databaseObject = await storeIncomeStatement(request.record)
       await storeIncomeStatementRow(databaseObject, incomeStatement)

    } catch (err) {
       await storeError(err, request.uuid)
        
    } finally {
        if (file) await deleteObject(file)
    }
}

