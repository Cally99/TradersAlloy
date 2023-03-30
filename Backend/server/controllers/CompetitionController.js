const competitionService = require('./../services/CompetitionService');

module.exports = {
    async getCompetitions(req, res) {
        try {
            const competitionResponse = await competitionService.getCompetitions();
            res.status(200).send(competitionResponse);

        } catch (e) {
            console.log(e);
        }
    },

    async getUserCompetitions(req, res) {
        const user_id = req.params.user_id;

        const userCompetitions =  await competitionService.getUserCompetitions(user_id);
        res.status(200).send(userCompetitions);
    },

};
