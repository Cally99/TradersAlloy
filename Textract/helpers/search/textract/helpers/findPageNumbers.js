const _ = require('lodash')

module.exports.findPageNumbers = (blocks, flags) => {
    let pageNumbers = []

    for (let block of blocks) {
        if (block.BlockType === 'LINE') {
            for (let flag of flags[0]) {
                if (flag.test(block.Text)) {
                    pageNumbers.push(block.Page)
                    break;
                } 
            }    
        }
    }
    // Make unique
    return _.uniq(pageNumbers)
}