const DiaryItem = require('../models').UserDiaryItem;

module.exports = {

    async selectDiaryItems(user_id) {
        return await DiaryItem.findAll({where: { user_id }});
    },

    async insertDiaryItem(diaryItem) {
        return await DiaryItem.create( diaryItem );
    },

    async updateDiaryItem(diaryItem, diary_item_id) {
        return await DiaryItem.update( diaryItem, {where: { diary_item_id }} );
    },

    async deleteDiaryItem(diary_item_id) {
        return await DiaryItem.destroy({ where: { diary_item_id } });
    },

}

