const userDiaryManager = require('../managers/UserDiaryManager');

module.exports = {

    async selectDiaryItems(user_id) {
        const data = await userDiaryManager.selectDiaryItems(user_id);
        return data
    },

    async insertDiaryItem(diary_item) {
        const data = await userDiaryManager.insertDiaryItem(diary_item);
        return data
    },

    async updateDiaryItem(diary_item, diary_item_id) {
        const data = await userDiaryManager.updateDiaryItem(diary_item, diary_item_id);
        return data
    },

    async deleteDiaryItem(diary_item_id) {
        const data = await userDiaryManager.deleteDiaryItem(diary_item_id);
        return data;
    },

}

