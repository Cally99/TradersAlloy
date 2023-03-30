const Sequelize = require('sequelize');
const UserWatchlistItem = require('./UserWatchlistItem');

module.exports = (db, DataTypes) => {
    const User = db.define('User', {
        user_id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        email: DataTypes.STRING(100),
        password: DataTypes.STRING(100),
        type: DataTypes.STRING(10),
        settings: DataTypes.JSONB,
        account: DataTypes.STRING(50),
        screen: DataTypes.TEXT,
        created_date: DataTypes.DATEONLY,
        last_login_date: DataTypes.DATEONLY,
        membership_year: DataTypes.BOOLEAN,
        membership_date: DataTypes.DATEONLY,
        subscription_id: DataTypes.STRING(100),
        tabs: DataTypes.INTEGER,
        email_weekly: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        email_newsletter: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        customer_id: DataTypes.STRING(100),
        card_id: DataTypes.STRING(100),
        access: DataTypes.STRING(10)
    }, { tableName: 'users' });

    /*    User.associate = function (models) {
            User.hasMany(models.UserWatchlistItem, {foreignKey: 'user_id'});
        };
    */
    // User.sync();

    return User;
};