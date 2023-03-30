//const db = require('sequelize');
const UserWatchlistJoin = require('./UserWatchlistJoin');

module.exports = (db, DataTypes) => {
    const UserWatchlist = db.define('UserWatchlist', {
        watchlist_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER
        },
        name: DataTypes.STRING(50),
        type: DataTypes.STRING(10),
    }, { tableName: 'user_watchlist' });

    UserWatchlist.associate = function(models) {
        UserWatchlist.hasMany(models.UserWatchlistJoin, { foreignKey: 'watchlist_id' })
    };

    // UserWatchlist.sync();

    return UserWatchlist;
};