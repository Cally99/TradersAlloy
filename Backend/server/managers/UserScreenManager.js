const UserScreen = require('../models').UserScreen;

module.exports = {

    async selectScreens(user_id) {
        return await UserScreen.findAll({where: { user_id }});
    },

    async insertScreen(screen) {
        return await UserScreen.create( screen );
    },

    async updateScreen(name, screen_id) {
        return await UserScreen.update(
                            { name },
                            { where: { screen_id },
                                returning: true} );
    },

    async updateScreenFilter(name, screen_id, filter) {
        return UserScreen.update(
                            { name, filter },
                            { where: { screen_id }} );
    },

    async deleteScreen(screen_id) {
        await UserScreen.destroy({ where: { screen_id }});
    },

}

