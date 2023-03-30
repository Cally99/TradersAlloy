const Sequelize = require('sequelize');
const User = require('./User.js');

module.exports = (db, DataTypes) => {
    const UserFriend = db.define('UserFriend', {
        user_id: {
            type: DataTypes.INTEGER
        },
        status: DataTypes.STRING,
        friend_email: DataTypes.STRING,
        last_update_date: DataTypes.DATEONLY,
    }, {
        tableName: 'user_friend',
        classMethods: {
            associate: function (models) {
                UserFriend.belongsTo(models.User, { foreignKey: 'user_id' });
            }
        }
    }
    );

    UserFriend.associate = function (models) {
        //       UserFriend.belongsTo(models.User, {foreignKey: 'user_id',});
    };

    // UserFriend.sync();



    return UserFriend;
};
