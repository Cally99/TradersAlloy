const { default: PQueue } = require('p-queue')
const startDocumentAnalysisQueue = new PQueue({ concurrency: 2 })

const textractAdapter = require('./../../../adapters').TextractAdapter

module.exports = async function analyze(fileName, featureTypes) {
    let jobId = await startDocumentAnalysisQueue.add(() => textractAdapter().analyze(process.env.AWS_bucketname, fileName, featureTypes))

    if (jobId) return jobId
    throw new Error('Analysis failed to start.')
}