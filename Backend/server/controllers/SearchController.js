const searchService = require("../services/SearchService");
// const log4js = require('log4js');
// const logger = log4js.getLogger("app_log");

module.exports = {
    async getSearchResults(req, res) {
        const searchString = req.params.searchString;

        const response = (await searchService.getSearchResults(searchString)).data;

        res.status(200).send(response);
    }
};
