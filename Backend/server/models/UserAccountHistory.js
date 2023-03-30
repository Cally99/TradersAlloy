module.exports = (db, DataTypes) => {
    const UserAccountHistory = db.define('UserAccountHistory', {
        user_id: {
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        user_account_id: {
            primaryKey: true,
            type: DataTypes.STRING(30)
        },
        day: DataTypes.DATE,
        balance: DataTypes.INTEGER,
        exposure: DataTypes.INTEGER,
    }, { tableName: 'user_account_history' });



    return UserAccountHistory;

};
