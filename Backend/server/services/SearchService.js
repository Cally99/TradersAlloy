const searchManager = require('../managers/SearchManager');

async function getSearchResults(searchString) {
    return await searchManager.getSearchResults(searchString);
}

module.exports = {
    getSearchResults,
};
