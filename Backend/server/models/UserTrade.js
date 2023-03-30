module.exports = (db, DataTypes) => {
    const UserTrade = db.define('UserTrade', {
        trade_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        user_id: DataTypes.INTEGER,
        stock_id: DataTypes.INTEGER,
        ticker: DataTypes.STRING(10),
        instrument_type: DataTypes.STRING(30),
        entry_price: DataTypes.FLOAT,
        entry_date: DataTypes.DATE,
        entry_qty: DataTypes.FLOAT,
        exit_price: DataTypes.FLOAT,
        exit_date: DataTypes.DATE,
        exit_qty: DataTypes.FLOAT,
        entry_commission: DataTypes.FLOAT,
        pnl: DataTypes.FLOAT,
        notes: DataTypes.TEXT,
        user_account_id: DataTypes.STRING(30),
        exit_commission: DataTypes.FLOAT
    }, { tableName: 'user_trade' });

    // UserTrade.sync();

    return UserTrade;
};
