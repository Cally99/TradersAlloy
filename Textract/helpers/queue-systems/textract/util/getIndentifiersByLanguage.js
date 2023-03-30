const fs = require('fs')
const { promisify } = require('util')
const read = promisify(fs.readFile)

module.exports = async (url, language) => {
    try {
        let json = await read(url)
        return JSON.parse(json)[language]

    } catch (err) {
        return err
    }
}