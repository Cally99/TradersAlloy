const _ = require('lodash')

module.exports.structureCellBlocksInto2DArray = (cellBlocks) => {
    // A table
    let table = []
    let i

    // Formats cell blocks into a table
    for (i = 1; i <= _.last(cellBlocks).RowIndex; i++) {
        let row = []
        for (let cellBlock of cellBlocks) {
            if (cellBlock.RowIndex === i) row.push(cellBlock)
        }
        if (!_.isEmpty(row)) table.push(row)
    }

    return table
}