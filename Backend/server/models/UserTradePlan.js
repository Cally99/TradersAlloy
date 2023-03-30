
module.exports = (db, DataTypes) => {
    const UserTradePlan = db.define('UserTradePlan', {
        trade_plan_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        user_id: DataTypes.INTEGER,
        stock_id: DataTypes.INTEGER,
        entry_price: DataTypes.FLOAT,
        stoploss_price: DataTypes.FLOAT,
        target_price: DataTypes.FLOAT,
        entry_date: DataTypes.NUMERIC,
        exit_date: DataTypes.NUMERIC,
        long: DataTypes.BOOLEAN,
        entry_alert_status: DataTypes.STRING(10),
        stoploss_alert_status: DataTypes.STRING(10),
        target_alert_status: DataTypes.STRING(10),
    },
        { tableName: 'user_trade_plan' }
    );

    // UserTradePlan.sync();

    return UserTradePlan;
};

