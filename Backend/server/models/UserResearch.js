module.exports = (db, DataTypes) => {
    const UserResearch = db.define('UserResearch', {
            user_id: {
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            stock_id: {
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            ticker: DataTypes.STRING(10),
            content: DataTypes.TEXT,
            last_update_date: DataTypes.DATE,
            is_shared: {type: DataTypes.BOOLEAN, default: null},
            date_created: DataTypes.DATE,
        },
        {tableName: 'user_research'}
    );

    UserResearch.associate = function (models) {
//        UserResearch.hasMany(models.UserWatchlistItem, {foreignKey: 'user_id'});
    };

    // UserResearch.sync();

    return UserResearch;
};
