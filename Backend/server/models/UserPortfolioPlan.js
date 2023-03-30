
module.exports = (db, DataTypes) => {
    const UserPortfolioPlan = db.define('UserPortfolioPlan', {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        note: DataTypes.TEXT,
        account_value: DataTypes.INTEGER,
        monthly_add: DataTypes.INTEGER,
        position_size: DataTypes.INTEGER
    },
        { tableName: 'user_portfolio_plan' }
    );

    UserPortfolioPlan.associate = function (models) {
        UserPortfolioPlan.hasOne(models.User, {foreignKey: 'user_id' } );
    };

    // UserPortfolioPlan.sync();

    return UserPortfolioPlan;
};

