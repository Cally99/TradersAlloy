module.exports = (db, DataTypes) => {
    const StockExchange = db.define('StockExchange', {
            id: {
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            handle: DataTypes.STRING(10), // like a ticker
            name: DataTypes.STRING,
            country: DataTypes.STRING(2),
            city:  DataTypes.STRING(2)
        },
        {tableName: 'stock_exchange'}
    );

    // StockExchange.sync();

    return StockExchange;
};
