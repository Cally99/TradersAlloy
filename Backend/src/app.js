const error = require('../server/middleware/error');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Cross-Origin Resource Sharing
const morgan = require('morgan'); // HTTP is logged automatically
const path = require('path');
require('dotenv').config();

const app = express();
app.use(morgan('dev')); // dev mode logging
// app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '10mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))


app.use(cors({ origin: true }));
app.use("/images", express.static(path.join(__dirname + '/../../froala_images')));
app.use(express.static(path.join(__dirname + '/../../Frontend/dist')));

//const errorHandler = require('../server/controllers/ErrorHandler');
//app.use( errorHandler );


// logging
const log4js = require('log4js');
let logPath = process.env.LOG_PATH || require("os").userInfo().homedir; // eg /home/trader or /Users/andrew

log4js.configure({
    appenders: {
        app_log: { type: "file", filename: logPath + "/application.log" },
        health_log: { type: "dateFile", filename: logPath + "/healthcheck.log", pattern: '.yyyy-MM-dd', compress: true },
    },
    categories: {
        default: { appenders: ["app_log"], level: 'INFO' },
        health: { appenders: ["health_log"], level: 'INFO' },
    }
})

// crons
require('../server/crons/hourly/NewsCheckHourly');

require('../server/crons/daily/CompanyReportsDaily');
require('../server/crons/daily/CompanyIPODaily');        //  consolidate these
require('../server/crons/daily/CompanyWebcastDaily');    //
require('../server/crons/daily/StockInsidersDaily');     //
require('../server/crons/daily/PriceDataDaily');
require('../server/crons/daily/HealthCheckDaily');

require('../server/crons/weekly/CompanyCalendarWeekly');
require('../server/crons/weekly/UserEmailWeekly');

//require('../server/crons/UserEmailDaily');
//require('../server/crons/UserAccountDaily');
//require('../server/crons/CompanyReportsDaily2018.js');   // temporary



// require('../server/controllers/StockNewsController');  // todo: refactor, move into Daily email
require('../server/controllers/StockInsiderController'); // todo: refactor, move into Daily email

require('../server/router')(app);
// require('../server/router/cron');
// require('../server/controllers/UpdateCompanyReportMillistream');
// require('../server/controllers/CronEmailTradePlanController');
require('../server/controllers/CompanyReportFinancialsController'); // Screener page. I made this file to get initial data when server starts.

// const db = require('sequelize');
app.use(error);

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');


app.get('*', (req, res) => { res.sendFile(path.join(__dirname + '/../../Frontend/dist/index.html')) });

let port = process.env.PORT || 8080;
app.listen(port, (err) => {
    console.log('Server is running at port ...' + port);
});
