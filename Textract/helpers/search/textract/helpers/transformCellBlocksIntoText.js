const _ = require('lodash')

module.exports.transformCellBlocksIntoText = (cellBlocks, blocks, pageNumber) => {
    // Finds word blocks from table specified by for loop
    let wordBlocks = blocks.filter(block => pageNumber === block.Page && block.BlockType === "WORD")
    return cellBlocks.map(cell_arr => cell_arr.map(cell => {
        if ('Relationships' in cell) {

            // Retrieve words from each cell and joins them into a line. A word constitues as text seperated by spaces
            let str = _.join(cell.Relationships[0].Ids.map((word_id) => {
                let word = wordBlocks.find(word => word.Id === word_id)
                word = (_.isUndefined(word)) ? '' : word.Text
                return (_.isUndefined(word)) ? '' : word
            }), ' ')

            return str.trim()
        } else {
            return ' '
        }
    }))
}