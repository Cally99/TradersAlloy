const _ = require('lodash')

module.exports.findMostAccurateTable = (tableSearchInformation) => {
    return _.maxBy(tableSearchInformation, details => {
        let counter = 0
        details.searchResult.forEach(isFound => { if (isFound) counter++})
        return counter
    })
}