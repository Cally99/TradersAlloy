const { default: PQueue } = require('p-queue')
const putObjectQueue = new PQueue({ concurrency: 5 })

const s3Adapter = require('./../../../adapters').S3Adapter

module.exports = function putObject(resource, file) { return putObjectQueue.add(() => s3Adapter().store(resource, process.env.AWS_bucketname, file)) }