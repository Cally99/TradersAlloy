module.exports.findTableBlocksByPageNumber = (blocks, pageNumbers) => {
    // Filter for blocks that are tables, have a relationship array, and are on the same page of where phrases synonymous for income statement appears
    return blocks.filter(block => block.BlockType === "TABLE" && "Relationships" in block && pageNumbers.some((num) => block.Page === num))
}
