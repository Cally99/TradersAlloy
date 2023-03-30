const Sequelize = require('sequelize');
const StockExchange = require('./StockExchange.js');

module.exports = (db, DataTypes) => {
    const Stock = db.define('Stock', {
        stock_id: {
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        isin: DataTypes.STRING(20),
        ticker: DataTypes.STRING(10),
        name: DataTypes.STRING(50),
        company_id:  DataTypes.INTEGER,
        stock_exchange_id: DataTypes.INTEGER,
        sector_id: DataTypes.INTEGER,
        currency_trade: DataTypes.STRING(3),
        price_today: DataTypes.FLOAT,
        primary_listing: DataTypes.BOOLEAN,
        price_updated: DataTypes.DATE,
        status_flag: DataTypes.STRING,
    },
        { tableName: 'stock' }
    );

    Stock.associate = function (models) {
        Stock.belongsTo(models.StockExchange, {foreignKey: 'stock_exchange_id'});
    };

    // Stock.sync();


    return Stock;
};
