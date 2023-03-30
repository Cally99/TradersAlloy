const winston = require('winston');

module.exports = function(err, req, res, next) {
    // winston.log();

    winston.debug();
    winston.info('message');
    winston.warn();
    winston.error();
    winston.verbose();
    winston.silly();


    //log the exception
    res.status(500).send('something failed');
}


