const { default: PQueue } = require('p-queue')
const getResourceQueue = new PQueue({ concurrency: 10 })
const httpsAdapter = require('./../../../adapters').HTTPSAdapter()

module.exports = function getResource(url) { return getResourceQueue.add(() => httpsAdapter.get(url) ) }