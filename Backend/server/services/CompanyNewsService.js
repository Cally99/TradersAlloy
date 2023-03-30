const source_data_file = '/static/FinWire/';
const _ = require('lodash');
const xmlParser = require('xml2json');


const cron = require('node-cron');
const fs = require('fs');
const FolderPath = process.env.FINWIRE_PATH;
const News = require('../models').News;

var moment = require('moment');
const emailer = require('../helpers/emailer');

let isSendDailyEmails  = process.env.SEND_USER_EMAILS || false;

const companyNewsManager = require("../managers/CompanyNewsManager.js");

const Sequelize = require('sequelize');
let sequelize;

sequelize = new Sequelize(process.env.DB_database, process.env.DB_username, process.env.DB_password, {
    host: 'localhost',
    dialect: 'postgres',
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
    },
    define: {
        timestamps: false,   // We just do not need
        underscored: false,  // use camelCase
        freezeTableName: true  // do not make plural - Andrew must learn the Model and TABLE have identiocal names
    },
    // sync: { force: true },   // drops and inserts ALL the data ... too often COMMENT WHEN NOT NEEDED
});

/*
 FTP Server on Digital Ocean for FinWIre

Used vsftpd FTP server. Created specific finwire ftp user for uploads:
host = 198.211.109.6
user = finwire-ftp
password = thoh3iecohze3Wee

Uploaded files could be found in the /home/finwire-ftp/ directory
*/

// TODO: move the cron out of FinWire News Service
var final_array = []

cron.schedule('* 30 * * * *', () => {
    // DISABLED getFiles()
});

// getFiles()
/*   TODO : fix this error ... its spews out error logs every 30 minutes
(node:13895) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 57)
(node:13895) UnhandledPromiseRejectionWarning: Error: ENOENT: no such file or directory, scandir 'undefined'
at Object.readdirSync (fs.js:854:3)
at getFiles (/Users/andrew/node/reskill/t5/t3/Backend/server/controllers/FinWireController.js:64:22)
 */


// async function getFiles() {
const getFiles = async () => {
    const finwirePath = String(FolderPath);
    const files = fs.readdirSync(finwirePath );
    // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', files)
    for (var m=0; m<files.length; m++) {
        const file = files [m];
        if (file == '.bash_logout' || file == '.bash_history' || file == '.listing' || file == '.bashrc' || file == '.cloud-locale-test.skip' || file == '.profile' || file =='test.txt' || file == 'index.html') continue
        var fileName = process.env.FINWIRE_PATH + '\\' + file
        // var fileName = process.env.FINWIRE_PATH + '/' + file
        await change_func(fileName)
        fs.unlinkSync(fileName)
    }


    // News.destroy({
    //     where: {},
    //     truncate: true
    // })
    News.bulkCreate(final_array)

    // console.log('AAAAAAAAAAAAAAAA', final_array.length)
}

function check_interim(data) {
    if (!isSendDailyEmails) return;

    for (var x=0; x<data.content.length; x++) {
        if (data.content[x].item.socialtags.socialtag) {
            if (typeof (data.content[x].item.socialtags.socialtag) == "string") {
                if (data.content[x].item.socialtags.socialtag == "interim") {
                    emailInterimSummary(data)
                }
            } else {
                for (var y=0; y<data.content[x].item.socialtags.socialtag.length; y++) {
                    if (data.content[x].item.socialtags.socialtag[y] == "interim") {
                        emailInterimSummary(data)
                    }
                }
            }
        }
    }
}

function emailInterimSummary(data) {

    sequelize.query(
        `  SELECT  U."email",          
                        I."isin"           
                FROM    public.user_watchlist_item as I, 
                        public.users as U 
                WHERE   U."user_id" = I."user_id"
                AND     I."isin" = :isin`,
        {nest: false, replacements: { isin: data.isin }, type: sequelize.QueryTypes.SELECT },)
        .then(records => {
            emailer.newsEmail(records, data);
        })
        .catch(
            error => console.log(error)
        );


}


// getFiles()

function change_func(fileName) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, (err, data) => {
            if (err){
                console.log(err)
            }

            var json = xmlParser.toJson(data);
            var data = JSON.parse(json)

            if (data.item.companies.company) {
                var company_temp = data.item.companies.company
                if (company_temp.length) {
                    for (var i=0; i<company_temp.length; i++) {
                        update_table(data, company_temp[i])
                    }
                } else {
                    update_table(data, company_temp)
                }
            }

            resolve()
        });

    })
}
function update_table(data, company_temp) {
    if (company_temp.instrument) {
        if (company_temp.instrument.length) {
            for (var j=0; j<company_temp.instrument.length; j++) {
                if (final_array.length == 0) {
                    var temp_content_array = []
                    temp_content_array.push(data)
                    var temp = {
                        isin: company_temp.instrument[j].isin,
                        content: temp_content_array,
                        timestamp : moment(data.item.isoDate).format('YYYY-MM-DD HH:MM:SS')
                    }
                    final_array.push(temp)

                    check_interim(temp)

                } else {
                    for (var k=0; k<final_array.length; k++) {
                        if (final_array[k].isin == company_temp.instrument[j].isin) {
                            final_array[k].content.push(data);
                            return;
                        }
                    }
                    var temp_content_array = []
                    temp_content_array.push(data)
                    var temp = {
                        isin: company_temp.instrument[j].isin,
                        content: temp_content_array,
                        timestamp : moment(data.item.isoDate).format('YYYY-MM-DD HH:MM:SS')
                    }
                    final_array.push(temp)
                    check_interim(temp)
                }
            }
        } else {
            if (final_array.length == 0) {
                var temp_content_array = []
                temp_content_array.push(data)
                var temp = {
                    isin: company_temp.instrument.isin,
                    content: temp_content_array,
                    timestamp : moment(data.item.isoDate).format('YYYY-MM-DD HH:MM:SS')
                }
                final_array.push(temp)
                check_interim(temp)
            } else {
                for (var k=0; k<final_array.length; k++) {
                    if (final_array[k].isin == company_temp.instrument.isin) {
                        final_array[k].content.push(data);
                        return
                    }
                }
                var temp_content_array = []
                temp_content_array.push(data)
                var temp = {
                    isin: company_temp.instrument.isin,
                    content: temp_content_array,
                    timestamp : moment(data.item.isoDate).format('YYYY-MM-DD HH:MM:SS')
                }
                final_array.push(temp)
                check_interim(temp)
            }
        }
    }
}


module.exports = {
    getNews() {
        return companyNewsManager.getNews();
    },
    getNews50() {
        return companyNewsManager.getNews50();
    },
    getNewsWatched(user_id) {
        return companyNewsManager.getNewsWatched(user_id);
    },
    getNewsOnCompanyId(company_id) {
        return companyNewsManager.getNewsOnCompanyId(company_id);
    },
    getNewsOnNewsId(news_id) {
        return companyNewsManager.getNewsOnNewsId(news_id);
    }
};

