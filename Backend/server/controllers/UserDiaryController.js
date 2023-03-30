const DiaryItem = require('../models').UserDiaryItem;
const userDiaryService = require('../services/UserDiaryService');

module.exports = {

    async selectDiaryItems(req, res) {
        const user_id = req.params.user_id;

        const diaryData = await userDiaryService.selectDiaryItems(user_id);
        res.status(200).send(diaryData);
    },

    async insertDiaryItem(req, res) {
        const diary_item = req.body;

        const diaryData = await userDiaryService.insertDiaryItem(diary_item);
        res.status(200).send(diaryData);
    },

    async updateDiaryItem(req, res) {
        const diary_item = req.body;
        const diary_item_id = req.body.diary_item_id;

        const diaryData = await userDiaryService.updateDiaryItem(diary_item, diary_item_id);
        res.status(200).send(diaryData.data);
    },

    async deleteDiaryItem(req, res) {
        const diary_item_id = req.params.diary_item_id;

        const diaryData = await userDiaryService.deleteDiaryItem(diary_item_id);
        res.status(200).json(diaryData);
    },

}

