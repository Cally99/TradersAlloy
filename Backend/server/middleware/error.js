const log4js = require('log4js');
const logger = log4js.getLogger("app_log");

module.exports = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message;

    const errorObject = {
        status,
        message
    };

    console.error(message);
    logger.error(message);
	res.status(status).send(errorObject);
};
