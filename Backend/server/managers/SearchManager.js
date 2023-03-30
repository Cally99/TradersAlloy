const axios = require('axios');
const log4js = require('log4js');
const logger = log4js.getLogger("app_log");

const moment = require('moment');
const healthCheck = log4js.getLogger("health");

exports.getSearchResults = async function(searchString) {
    return await axios.get('https://68z66rnxvf.execute-api.us-east-1.amazonaws.com/opensearch-api-test/opensearch-lambda?search=' + searchString);
};