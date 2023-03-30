const _ = require('lodash')


let convertIndentifiersToSearchFlags = (indentifiers) => {
    return indentifiers.map(indentifier => indentifier.map(phrase => new RegExp(phrase.toLowerCase().replace(/e/g, '[ef]'))))
}

// Work on NEXT

let searchForFlags = (flags, texts) => {
    let isFlagFound = Array(flags.length).fill(false)
    texts = _.flatten(texts)
    for (let [key, flag] of flags.entries()) {
        for (let synonym of flag) {
            for (let text of texts) {
                
                if (synonym.test(text)) {
                    isFlagFound[key] = true
                    break
                }
            }
        }

    }
    return isFlagFound
} 


module.exports = {
    convertIndentifiersToSearchFlags,
    searchForFlags
}