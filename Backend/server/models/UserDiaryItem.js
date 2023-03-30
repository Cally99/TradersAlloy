
module.exports = (db, DataTypes) => {
    const UserDiaryItem = db.define('UserDiaryItem', {
        diary_item_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        user_id: DataTypes.INTEGER,
        stock_id: DataTypes.INTEGER,
        date_created: DataTypes.DATEONLY,
        note: DataTypes.STRING(160),
        background: DataTypes.STRING(10),
        color: DataTypes.STRING(10),
        y: DataTypes.INTEGER
    },
        { tableName: 'user_diary_item' }
    );

    // UserDiaryItem.sync();

    return UserDiaryItem;
};

