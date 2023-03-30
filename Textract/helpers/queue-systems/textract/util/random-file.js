function createUUID() {
    return Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9)
}

module.exports = (directory, extension) => {
    return directory + createUUID() + extension
}