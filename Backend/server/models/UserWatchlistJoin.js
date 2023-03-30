module.exports = (db, DataTypes) => {
    const UserWatchlistJoin = db.define('UserWatchlistJoin', {
        user_id: {
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        watchlist_id: {
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        stock_id: {
            primaryKey: true,
            type: DataTypes.INTEGER
        },
    }, { tableName: 'user_watchlist_join' });

    // UserWatchlistJoin.sync();

    return UserWatchlistJoin;
};