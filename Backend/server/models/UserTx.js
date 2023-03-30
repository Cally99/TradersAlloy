
module.exports = (db, DataTypes) => {
    const UserTx = db.define('UserTx', {
            tx_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            user_id: DataTypes.INTEGER,
            stock_id: DataTypes.INTEGER,
            account: DataTypes.STRING(10),
            tx_date: DataTypes.DATEONLY,
            tx_type: DataTypes.TEXT,
            isin: DataTypes.STRING(20),
            description: {
                allowNull: true,
                type: DataTypes.TEXT
            },
            qty: DataTypes.FLOAT,
            price: {
                allowNull: true,
                type: DataTypes.FLOAT
            },
            amount: DataTypes.FLOAT,
            commission: DataTypes.FLOAT,
            currency: DataTypes.STRING(3),
            exchange_rate: DataTypes.FLOAT,
            user_account_id: DataTypes.STRING(30)
        },
        {tableName: 'user_tx'}
    );

    // UserTx.sync();

    return UserTx;
};
