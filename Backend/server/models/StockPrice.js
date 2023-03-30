const Sequelize = require('sequelize');
const Stock = require('./Stock.js');

module.exports = (db, DataTypes) => {
    const StockPrice = db.define('StockPrice', {
        stock_id: {
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        datetime_ms: {
            primaryKey: true,
            type: DataTypes.BIGINT
        },
        open: DataTypes.DOUBLE,
        high: DataTypes.DOUBLE,
        low: DataTypes.DOUBLE,
        close: DataTypes.DOUBLE,
        volume: DataTypes.BIGINT,
    },
        { tableName: 'stock_price' }
    );

    Stock.associate = function (models) {
        StockPrice.belongsTo(models.Stock, {foreignKey: 'stock_id'});
    };


    return StockPrice;
};
