const { default: PQueue } = require('p-queue')
const storeErrorLogQueue = new PQueue({ concurrency: 1 })


const ErrorLog = require('./../../../../models').ErrorLog

module.exports = function storeError({ stack }, uuid) {

    let data = storeErrorLogQueue.add(() => { ErrorLog.create({ stack, uuid }) })

    if (data) return data
    else {
        throw new Error('Error Logging Failed')
    }
}