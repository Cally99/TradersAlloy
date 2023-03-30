const News = require('../models').News;
const NewsCompany = require('../models').NewsCompany;
const DB = require('../helpers/DB');
const connection = DB.getConnection();


module.exports = {
    async getNews() {
        return await connection.query(
            `
                SELECT  NC.company_id, N.news_id, N.date, N.time,
                        N.tags, N.title, N.links, N.agency,
                        N.version, N.newstext, N.countries,
                        N.signature, N.language, N.type
                FROM    news N,
                        news_company NC
                WHERE   N.news_id = NC.news_id;
            `,
            {
                nest: false,
                type: connection.QueryTypes.SELECT
            }
        );
    },

    async getNewsWatched(user_id) {
        const watckedNews = await connection.query(`
                SELECT      NC.company_id, N.news_id, N.date, N.time,
                            N.tags, N.title, N.links, N.agency,
                            N.version, N.newstext, N.countries,
                            N.signature, N.language, N.type,
                            (SELECT to_json(array_agg(row_to_json(t)))
                            FROM (SELECT ticker, stock_id
                                FROM    news_company as NC,
                                        stock as S
                                WHERE   NC.news_id = N.news_id
                                AND     NC.company_id = WI.company_id
                                AND     NC.company_id = S.company_id) t) as tickers
                FROM        news  N,
                            news_company  NC,
                            user_watchlist_item  WI
                WHERE       N.news_id = NC.news_id
                AND         NC.company_id = WI.company_id
                AND         WI.user_id = :user_id
                ORDER BY    N.date DESC, N.time DESC;
            `,
            {
                nest: false,
                replacements: {
                    user_id: user_id
                },
                type: connection.QueryTypes.SELECT
            }
        );
        return watckedNews;
    },

    async getNews50() {
        const news = await connection.query(`
                SELECT      NC.company_id, N.news_id, N.date, N.time,
                            N.tags, N.title, N.links, N.agency,
                            N.version, N.newstext, N.countries,
                            N.signature, N.language, N.type,
                            (SELECT to_json(array_agg(row_to_json(t)))
                            FROM (SELECT ticker, stock_id
                                FROM    news_company as NC,
                                        stock as S
                                WHERE   NC.news_id = N.news_id
                                AND     NC.company_id = S.company_id) t) as tickers
                FROM        news N,
                            news_company NC
                WHERE       N.news_id = NC.news_id
                ORDER BY    N.date DESC, N.time DESC
                limit 50;
            `,
            {
                nest: false,
                type: connection.QueryTypes.SELECT
            }
        );
        return news;
    },

    async getNewsOnCompanyId(company_id) {
        return await connection.query(
            `
                SELECT      NC.company_id, N.news_id, N.date, N.time,
                            N.tags, N.title, N.links, N.agency,
                            N.version, N.newstext, N.countries,
                            N.signature, N.language, N.type,
						    (SELECT to_json(array_agg(row_to_json(t)))
                                FROM (SELECT S.ticker
                                    FROM    stock S
                                    WHERE   NC.news_id = N.news_id
                                    AND     NC.company_id = S.company_id) t) as tickers
                FROM        news  N,
                            news_company  NC
                WHERE       N.news_id = NC.news_id
                AND         NC.company_id = :company_id
                ORDER BY    N.date DESC, N.time DESC;
            `,
            {
                nest: false,
                replacements: {
                    company_id: company_id
                },
                type: connection.QueryTypes.SELECT
            }
        );
    },

    async getNewsOnNewsId(news_id) {
        return await connection.query(
            `
                SELECT  CNC.company_id, CN.news_id, CN.date,
                        CN.tags, CN.title, CN.links, CN.agency,
                        CN.version, CN.newstext, CN.countries,
                        CN.signature, CN.language, CN.type
                FROM    news CN,
                        news_company CNC
                WHERE   CN.news_id = CNC.news_id
                AND     CNC.news_id = :news_id;
            `,
            {
                nest: false,
                replacements: {
                    news_id: news_id
                },
                type: connection.QueryTypes.SELECT
            }
        );
    },

    async insertCompanyNews(newsItem) {
        // DB Transaction

        News.create({
            news_id: newsItem.news_id,
            date: newsItem.date,
            time: newsItem.time,
            agency: newsItem.agency,
            title: newsItem.title,
            newstext: newsItem.content[0],
            language: newsItem.language,
            tags: newsItem.tags,
            type: newsItem.type,

            countries: null,
            signature: null,
            version: null,
            links: null,
        });

        if (newsItem.isins) {
            if (newsItem.isins.length > 0) {
                // get the distinct companies for all the ISINs
                const companies = await connection.query(
                `
                    SELECT distinct company_id, 
                                    :news_id as news_id
                    FROM  stock S
                    WHERE S.isin in (:isins);
                `,
                {
                    nest: false,
                    replacements: { isins: newsItem.isins, news_id: newsItem.news_id },
                    type: connection.QueryTypes.SELECT
                });

                await NewsCompany.bulkCreate(companies);
            } else {
                // no companies identified so maybe market news
            }
        }

        // commit;
    }
};
