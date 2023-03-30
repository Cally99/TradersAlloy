const findPageNumbers = require('./findPageNumbers').findPageNumbers
const findTableBlocksByPageNumber = require('./findTableBlocksByPageNumber').findTableBlocksByPageNumber
const findCellBlocksOfTableBlock = require('./findCellBlocksOfTableBlock').findCellBlocksOfTableBlock
const structureCellBlocksInto2DArray = require('./structureCellBlocksInto2DArray').structureCellBlocksInto2DArray
const transformCellBlocksIntoText = require('./transformCellBlocksIntoText').transformCellBlocksIntoText
const getCurrentPeriod = require('./getCurrentPeriod').getCurrentPeriod
const findMostAccurateTable = require('./findMostAccurateTable').findMostAccurateTable

const {
    convertIndentifiersToSearchFlags,
    searchForFlags
} = require('./search-flags/flags')

module.exports = {
    findPageNumbers,
    findTableBlocksByPageNumber,
    findCellBlocksOfTableBlock,
    structureCellBlocksInto2DArray,
    transformCellBlocksIntoText,
    getCurrentPeriod,
    findMostAccurateTable,
    convertIndentifiersToSearchFlags,
    searchForFlags
}