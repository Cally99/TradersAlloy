const userResearchManager = require('../managers/UserResearchManager');


module.exports = {

    async fetchContent(user_id, stock_id) {
        const data = await userResearchManager.fetchContent(user_id, stock_id);
        return data;
    },

    async writeContent(user_id, stock_id, ticker, content) {  // TODO move to manager
        const is_exist = await userResearchManager.check_research_exist(user_id, stock_id);
        if (is_exist) {
            const data = await userResearchManager.updateContent(user_id, stock_id, content);
            return data;
        } else {
            const data = await userResearchManager.writeContent(user_id, stock_id, ticker, content);
            return data;
        }
    },

    async fetchResearchData(user_id) {
        return await userResearchManager.fetchResearchData(user_id);
    },

    async setIsShared(user_id, stock_id) {
        const data = await userResearchManager.setIsShared(user_id, stock_id);
        return data;
    },

};
