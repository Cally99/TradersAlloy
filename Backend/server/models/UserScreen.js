
module.exports = (db, DataTypes) => {
    const UserScreen = db.define('UserScreen', {
            screen_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            user_id: DataTypes.INTEGER,
            name: DataTypes.STRING(160),
            filter: DataTypes.TEXT,
            date_updated: DataTypes.DATEONLY,
            known_items: DataTypes.ARRAY(DataTypes.STRING(20)),
        },
        {tableName: 'user_screen'}
    );

    // UserScreen.sync();

    return UserScreen;
};

