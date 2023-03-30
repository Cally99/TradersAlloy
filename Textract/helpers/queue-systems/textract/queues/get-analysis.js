const { default: PQueue } = require('p-queue')
const getAnalysisQueue = new PQueue({ concurrency: 1 })

const textractAdapter = require('./../../../adapters').TextractAdapter()

module.exports = function (jobId) { return getAnalysisQueue.add(() => textractAdapter.waitAndGetAnalysis(jobId)) }