const Stock = require('./Stock.js');
//const User = require('./User');
const UserWatchlist = require('./UserWatchlist');

module.exports = (db, DataTypes) => {
    const UserWatchlistItem = db.define('UserWatchlistItem', {
        watchlist_item_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        stock_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        ticker: DataTypes.STRING(10),
        isin: DataTypes.STRING(20),
        name: DataTypes.STRING(30),
        company_id: DataTypes.INTEGER,
        conviction: DataTypes.INTEGER,
        watched_since: DataTypes.DATEONLY,
        watched_since_price: DataTypes.FLOAT,
        tags: DataTypes.TEXT,
    }, { tableName: 'user_watchlist_item' });


    // UserWatchlistItem.associate = function(models) {
    //     UserWatchlistItem.belongsTo(models.UserWatchlist, { foreignKey: 'user_id' })
    // };

    // UserWatchlistItem.sync();


    return UserWatchlistItem;
};