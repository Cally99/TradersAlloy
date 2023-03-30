const {
    findPageNumbers,
    findTableBlocksByPageNumber,
    findCellBlocksOfTableBlock,
    structureCellBlocksInto2DArray,
    transformCellBlocksIntoText,
    findMostAccurateTable,
    getCurrentPeriod,
    convertIndentifiersToSearchFlags,
    searchForFlags
} = require('./helpers')


module.exports = async (blocks, { page_identifiers, table_identifiers }) => {
    let tableSearchInformation = []
    let cellBlocks
    let cellBlocks2DArray
    let tableBlock
    let table
    let searchResult

    let pageFlags = convertIndentifiersToSearchFlags(page_identifiers)
    let tableFlags = convertIndentifiersToSearchFlags(table_identifiers)   
    let pageNumbers = findPageNumbers(blocks, pageFlags)
    let tableBlocks = findTableBlocksByPageNumber(blocks, pageNumbers)

    for (tableBlock of tableBlocks) {

        cellBlocks = findCellBlocksOfTableBlock(tableBlock, blocks)
        cellBlocks2DArray = structureCellBlocksInto2DArray(cellBlocks)
        table = transformCellBlocksIntoText(cellBlocks2DArray, blocks, tableBlock.Page)
        searchResult = searchForFlags(tableFlags, table)
        tableSearchInformation.push({ searchResult, table, page: tableBlock.Page })

    }

    let accurateTable = findMostAccurateTable(tableSearchInformation);
 
    if (accurateTable.table.length === 0) {
        return new Error("Income Statement has not been found.");
    } else if (accurateTable.table[0].length < 2) {
        return new Error("Table only has one column.");
    } else {
        return getCurrentPeriod(accurateTable.table);
    } 
}
