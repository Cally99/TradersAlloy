const UserResearch = require('../models').UserResearch;


module.exports = {

    async fetchContent(user_id, stock_id) {
        return await UserResearch.findOne({  where: { user_id, stock_id}});
    },

    async check_research_exist(user_id, stock_id) {
        return await UserResearch.findOne({ where: {stock_id, user_id }});
    },

    async writeContent(user_id, stock_id, ticker, content) {
        return await UserResearch.create({
            user_id,
            stock_id,
            ticker: ticker,
            content: content,
            last_update_date: new Date(),
            share: null,
            date_created: new Date()
        });
    },

    async updateContent(user_id, stock_id, content) {
        return await UserResearch.update({
                        content: content,
                        last_update_date: new Date()},
                        { where:  { stock_id, user_id },
                            returning: true})
    },

    async fetchResearchData(user_id) {
        return await UserResearch.findAll({where: { user_id }})
    },

    async setIsShared(user_id, stock_id) {
        return UserResearch.update(
                    {is_shared: true},
                    {where: { stock_id, user_id },
                        returning: true})
    },

};
