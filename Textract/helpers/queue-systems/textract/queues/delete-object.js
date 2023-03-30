const { default: PQueue } = require('p-queue')
const deleteObjectQueue = new PQueue({ concurrency: 2 })

const s3Adapter = require('./../../../adapters').S3Adapter

module.exports = async function deleteObject(fileName) {
    let DeleteDataObject = deleteObjectQueue.add(async function () { return s3Adapter().delete(process.env.AWS_bucketname, fileName) })
    if (DeleteDataObject) return DeleteDataObject
    throw new Error('Deletion Failed.')
}