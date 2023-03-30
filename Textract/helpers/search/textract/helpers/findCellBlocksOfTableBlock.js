module.exports.findCellBlocksOfTableBlock = (table, blocks) => {
    // Retrieves cell blocks (cells of table that may have words) that is on the same page of the table
    // There may be more than one table on page 
    let cell_blocks = blocks.filter((block) => table.Page === block.Page && block.BlockType === "CELL")
    // Will hold cell blocks of specific table from for loop
    let cellBlocks = []

    // A table will have ids for the cells that it contains
    // Finds the cells of the specific table from the for loop
    table.Relationships[0].Ids.forEach((cell_id) => {
        cellBlocks.push(cell_blocks.find((cell_block) => cell_block.Id === cell_id))
    })

    return cellBlocks
}