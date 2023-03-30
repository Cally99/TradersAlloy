const millistreamManager = require('../managers/MillistreamManager'); // How to use Sinon to Mock with MillistreamController.mock.js ??
const CompanyNewsManager = require('../managers/CompanyNewsManager');

const log4js = require('log4js');
const xmlParser = require('xml2json');
const healthCheck = log4js.getLogger("health");

/**
 *     from the CRON job
 * */

/* example
{
,"time":"07:59:54"
,"newsid":"045c4f0c-4380-58d6-9788-85176d0a4d01"
,"newstype":"1"
,"subject":"0"
,"text":"<NewsItem><NewsEnvelope><TransmissionId>FWM006AB99<\/TransmissionId><DateAndTime>20211203T075954+0000<\/DateAndTime><SentFrom><Party FormalName=\"FinWire News\"\/><\/SentFrom><\/NewsEnvelope><ContentItem><MimeType FormalName=\"text\/vnd.Millistream\"\/><DataContent><head><hedline><hl1>Kelloggs strejk avstyrd<\/hl1><\/hedline><distributor>FinWire News<\/distributor><\/head><body>Frukostspecialisten Kellogg har nått en överenskommelse med sina 1 400 anställda som strejkat. Avtalet innebär att lönerna höjs med 3 procent och en två månader lång strejk avslutas, rapporterar New York Post. Det hela avgörs dock först formellt på söndag. <br\/><br\/>Det nya avtalet är femårigt och ingått med Bakery, Confectionary, Tobacco Workers and Grain Millers International Union. Arbetarna, som alltså strejkat sedan den 5 oktober, kommer att rösta om förslaget nu på söndag. Avtalet rör anställda vid frukostflingfabrikerna i Battle Creek, Michigan; Omaha, Nebraska; Lancaster, Pennsylvania; och Memphis, Tennessee.<\/body><tagline>newsroom@finwire.se<br\/>Nyhetsbyrån Finwire<\/tagline><\/DataContent><\/ContentItem><ContentItem Href=\"https:\/\/nypost.com\/2021\/12\/02\/kelloggs-workers-strike-deal-to-end-2-month-walkout\/\"><MimeType FormalName=\"text\/html\"\/><\/ContentItem><\/NewsItem>"
}
* */
async function getNewsByCompany(isins) {

    const newsItems = (await millistreamManager.getNewsByCompany(isins)).data;
    let newsItemImproved = null;
    let newItemsReformed = [];

    for (const newsItem of newsItems) {
        const textAttr = JSON.parse(xmlParser.toJson(newsItem.text) );

        newsItemImproved = {
            news_id: textAttr.NewsItem.NewsEnvelope.TransmissionId,
            title: newsItem.headline,
            date: newsItem.date,
            // time: newsItem.time,   need to add this
            contents: [],
            language: newsItem.language,
            tags: newsItem.tags,
        }

        //* Furure media goes here *
        if (false) {//textAttr.NewsItem.ContentItem.constructor == Array ) {
        } else {
            // Need to use RegEx because the XML parser gets confused with HTML in XML (bad FinWire modelling).
            const regex = /(?<=<body>).*?(?=<\/body>)/;
            const matches = newsItem.text.match(regex);
            const content = matches[0];

            newsItemImproved.contents.push(content);
        }
        newItemsReformed.push(newsItemImproved)
    }


    return newItemsReformed;
}

async function extractAndSaveEachNewsItem(newsItem) {
    try {
        const textAttr = JSON.parse(xmlParser.toJson(newsItem.text));
        //const news_id = ; //textAttr.NewsItem.NewsEnvelope.TransmissionId;
        let newsItemImproved;

        /*
                    news_id:
                    language: DataTypes.STRING(2),
                    tags: DataTypes.ARRAY(DataTypes.STRING(20)),
                    links: DataTypes.ARRAY(DataTypes.TEXT),
                    title: DataTypes.STRING(100),
                    agency: DataTypes.STRING(3),
                    date: DataTypes.DATEONLY,
                    version: DataTypes.STRING(10),
                    newstext: DataTypes.TEXT,
                    countries: DataTypes.ARRAY(DataTypes.STRING(2)),
                    signature: DataTypes.TEXT


                NEWS TYPE (newstype)
                    0 "Flash"
                    1 "News"
                    2 "Announcement"
                    3 "Financial Calendar"
                    4 "Report"

                SUBJECT
                    0 "Press Release"
                    1 "Products"
                    2 "Annual Report"
                    3 "Quarterly Report"
                    4 "Corporate Events"
                    5 "IPO"
                    6 "Marketing"
                    7 "Earnings"
                    8 "Personelle Changes"
                    9 "stock Activities"

                 AGENCY (newsref)
                    8212,8213 supplied by Finwire (articles) ...
                    8195, 8196, 8197, 8199, 8201, 8224, 8225, 8226 Press Releases

                */
        newsItemImproved = {
            news_id: newsItem.newsid,
            date: newsItem.date,
            time: newsItem.time,
            agency: newsItem.newsref,
            type: newsItem.newstype,
            title: newsItem.headline.substring(0,199),
            content: [],
            language: newsItem.language,
            isins: newsItem.isin,
            tags: newsItem.tags,
        };

        // Need to use RegEx because the XML parser gets confused with HTML in XML (bad FinWire modelling).
        const regex = /(?<=<body>).*?(?=<\/body>)/;
        const matches = newsItem.text.match(regex);
        const content = matches[0];   // TODO: change here to get videos and multiple contents

        newsItemImproved.content.push(content);

        await CompanyNewsManager.insertCompanyNews(newsItemImproved);
    } catch (error) {

        console.log(error.message, newsItem.newsid, newsItem.language );
    }
}

async function getNewsBySource() {
    const today = new Date().toISOString().substring(0, 10);
    const newsItems = (await millistreamManager.getNewsBySource(today, today)).data;

    for (const newsItem of newsItems) {
        await extractAndSaveEachNewsItem(newsItem);
    }

    return {newsItemsCount: newsItems.length};
}


module.exports = {
    getNewsByCompany,
    getNewsBySource
}
