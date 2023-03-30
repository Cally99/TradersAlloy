const xmlParser = require('xml2json');
const fs = require('fs');
const FolderPath = process.env.FINWIRE_PATH;

const News = require('../models').News;
const companyNewsService = require("../services/CompanyNewsService");

const moment = require('moment');
const emailer = require('../helpers/emailer');
const log4js = require('log4js');
const logger = log4js.getLogger("app_log");

let isSendDailyEmails  = process.env.SEND_USER_EMAILS || false;

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


var final_array = []

//cron.schedule('* 30 * * * *', () => {
    // DISABLED getFiles()
//});

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
    async getNews(req, res) {
        const news = await companyNewsService.getNews();
        res.status(200).send(news);
    },
    async getNews50(req, res) {
        const news = await companyNewsService.getNews50();
        res.status(200).send(news);
    },
    async getNewsWatched(req, res) {
        const user_id = req.params.user_id;
        const news = await companyNewsService.getNewsWatched(user_id);
        res.status(200).send(news);
    },

    async getNewsOnCompanyId(req, res) {
        const company_id = req.params.company_id;
        const news = await companyNewsService.getNewsOnCompanyId(company_id);
        res.status(200).send(news);
    },
    async getNewsOnNewsId(req, res) {
        const news_id = req.params.news_id;
        const news = await companyNewsService.getNewsOnNewsId(news_id);
        res.status(200).send(news);
    }
};


// sequelize = new Sequelize(process.env.DB_database, process.env.DB_username, process.env.DB_password, {
//     host: 'localhost',
//     dialect: 'postgres',
//     pool: {
//         max: 5,
//         min: 0,
//         idle: 10000,
//     },
//     define: {
//         timestamps: false,   // We just do not need
//         underscored: false,  // use camelCase
//         freezeTableName: true  // do not make plural - Andrew must learn the Model and TABLE have identiocal names
//     },
//     // sync: { force: true },   // drops and inserts ALL the data ... too often COMMENT WHEN NOT NEEDED
// });

// let xmlString = `<?xml version="1.0" encoding="UTF-8"?>
// <item>
// <version>12</version>
// <type>ARTICLE</type>
// <title>Öhman Företagsobligationsfond A ökade 0,47 procent i januari - investerat i laxodlingsbolaget Mowi</title>
// <guid>FWF0045F56</guid>
// <clientHash>d524449e300101e1887d86f5053c9e7d3a02112e6fdfa4b7dff9da00af4eaa171fd853c328d25194095c071a4ed1c99dd3a0ce1a2336ad9f0055372c12150a3c</clientHash>
// <pubDate>Mon, 24 Feb 2020 15:18:08 GMT</pubDate>
// <isoDate>2020-02-24T15:18:08+00:00</isoDate>
// <links>
// </links>
// <newstext><![CDATA[Fonden Öhman Företagsobligationsfond A steg 0,47 procent i januari, vilket var sämre än fondens jämförelseindex som steg 0,49 procent. Det framgår av en månadsrapport.<br/><br/>Fondens kreditinvesteringar vägde upp mot en viss undervikt i duration vilket gjorde att totalavkastningen för januari ändå slutade i linje med index. <br/><br/>Under månaden har fonden investerat i det norska laxodlingsbolaget Mowi samt gjort mindre förändringar i krediter som närmat sig förfall. Durationen ökades vid månadens slut och fonden ligger nu med neutral ränterisk mot index.<br/><br/>Fondens förvaltare, Tobias Kaminsky, kommenterar utsikterna. <br/><br/>&quot;Långräntor är nu låga men det är samtidigt inte många goda argument för att långräntor ska stiga kraftigt i tiden som kommer. Konjunktursignalerna har på vissa håll förbättrats, men vi behöver bevaka hur stora ekonomiska konsekvenser det blir av det nya Coronaviruset. Låga kreditpremier och allt flackare kreditkurvor ger risk för isärspreadning från idag mycket låga nivåer. Fonden har därför en neutral ställning till ränteduration och är försiktig med löptid och kreditrisk.&quot;]]></newstext>
// <htmltext><![CDATA[Fonden Öhman Företagsobligationsfond A steg 0,47 procent i januari, vilket var sämre än fondens jämförelseindex som steg 0,49 procent. Det framgår av en månadsrapport.<br><br>Fondens kreditinvesteringar vägde upp mot en viss undervikt i duration vilket gjorde att totalavkastningen för januari ändå slutade i linje med index. <br><br>Under månaden har fonden investerat i det norska laxodlingsbolaget Mowi samt gjort mindre förändringar i krediter som närmat sig förfall. Durationen ökades vid månadens slut och fonden ligger nu med neutral ränterisk mot index.<br><br>Fondens förvaltare, Tobias Kaminsky, kommenterar utsikterna. <br><br>"Långräntor är nu låga men det är samtidigt inte många goda argument för att långräntor ska stiga kraftigt i tiden som kommer. Konjunktursignalerna har på vissa håll förbättrats, men vi behöver bevaka hur stora ekonomiska konsekvenser det blir av det nya Coronaviruset. Låga kreditpremier och allt flackare kreditkurvor ger risk för isärspreadning från idag mycket låga nivåer. Fonden har därför en neutral ställning till ränteduration och är försiktig med löptid och kreditrisk."]]></htmltext>
// <signature><![CDATA[Erik Cassel<br/>Nyhetsbyrån Finwire<br/><br/>Fonden Öhman Företagsobligationsfond A steg 0,47 procent i januari, vilket var sämre än fondens jämförelseindex som steg 0,49 procent. Det framgår av en månadsrapport.<br/><br/>Fondens kreditinvesteringar vägde upp mot en viss undervikt i duration vilket gjorde att totalavkastningen för januari ändå slutade i linje med index. <br/><br/>Under månaden har fonden investerat i det norska laxodlingsbolaget Mowi samt gjort mindre förändringar i krediter som närmat sig förfall. Durationen ökades vid månadens slut och fonden ligger nu neutralt ränterisk mot index.<br/><br/>Fondens förvaltare, Tobias Kaminsky, kommenterar utsikterna. <br/><br/>&quot;Långräntor är nu låga men det är samtidigt inte många goda argument för att långräntor ska stiga kraftigt i tiden som kommer. Konjunktursignalerna har på vissa håll förbättrats, men vi behöver bevaka hur stora ekonomiska konsekvenser det blir av det nya Coronaviruset. Låga kreditpremier och allt flackare kreditkurvor ger risk för isärspreadning från idag mycket låga nivåer. Fonden har därför en neutral ställning till ränteduration och är försiktig med löptid och kreditrisk.&quot;]]></signature>
// <language>sv</language>
// <countries>
// <country>SE</country>
// </countries>
// <agency>FWF</agency>
// <companies>
// <company name="Öhman Företagsobligationsfond A" fwid="2518">
// <instrument isin="SE0001095506" market="FUNDS" msid="F0GBR04FT1" mscategory="EUCA000905">OHM-CORP</instrument>
// </company>
// </companies>
// <socialtags>
// <socialtag>mutualfunds</socialtag>
// </socialtags>
// </item>
// `;

// let item = xmlParser.toJson(xmlString);

// sequelize.query(
//     `INSERT into public.company_news (content)
//             values (:data)`,
//     {nest: false, replacements: {data: item},type: sequelize.QueryTypes.INSERT})
//     .then(records => {
//         console.log('JSON output', xmlParser.toJson(xmlString));
//     })
//     .catch(error => {
//         console.log(error);
//         res.status(400).send('*** Inserting FinWire :-( ... ' + error)
//     });


// function load() {
//     // Node packages for file system
//     var fs = require('fs');
//     var path = require('path');

//     fs.readFile( '/static/FinWire/'+'FWM004621B.xml', (err, data) =>{
//         var json = xmlParser.toJson(data);
//         console.log("to json ->", json);
//     });

// }


// This is ONE way to access the JSONB... but I think it is better to: create table News (isin, news_id) ... I think ISIN is the only thing we need to query often.
// BUT; the counter-argument is that JSONB is very efficient at searching so we should not over complicate if we are able to keep it simple (one table called News)
// select content#>'{item,newstext}' from public.company_news where content#>'{item,companies,company,instrument,isin}' = '"SE0001095506"'


