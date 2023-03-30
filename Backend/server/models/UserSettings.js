const db = require('sequelize');

module.exports = (db, DataTypes) => {
    const UserSettings = db.define('UserSettings', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            user_id: DataTypes.INTEGER,
            feature: DataTypes.STRING(20),
            content: DataTypes.TEXT
        },
        {tableName: 'user_settings'}
    );

    // UserSettings.sync();

    return UserSettings;
};
