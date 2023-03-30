const _ = require('lodash');
const companyIR = require('../models').CompanyIR;
const companyIRManager = require("../managers/CompanyIRManager.js");

const request = require('request');


const companyManager = require("../managers/CompanyManager.js");

const companyCalendarManager = require("../managers/CompanyCalendarManager.js");

const log4js = require('log4js');
const logger = log4js.getLogger("app_log");
const healthCheck = log4js.getLogger("health");
const moment = require('moment');

module.exports = {


/*

Investor Relations page

Calendar Page

Reports Page
===

get the HTML of the reports page
array of PDFs

Check Each day if the calendar has changes

Check Each hour of




*/
    //
    async searchForIRPage(company) {
        for( c of await companyManager.list()) {

            const searchString = 'http://google.com/?'+company.name+' '+'Investor Relations';

            request(encodeURI(searchString), function(error, response, body ) {
                console.log(body);
            };
        }
    },


    async crawl() {
        for( c of await companyManager.list()) {
            this.crawl(c);
        }
    },


    async crawl(company) {
        let calendar_page  = '';
        let reports_page  = '';

        request({company.ir_page}, function(error, response, body ) {


            // find structures
            console.log(body);
        };

        companyIRManager.update(company_id, calendar_page, reports_page );
    },

};
