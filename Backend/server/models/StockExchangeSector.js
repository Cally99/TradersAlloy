const Stock = require('./Stock.js');


module.exports = (db, DataTypes) => {
    const StockExchangeSector = db.define('StockExchangeSector', {
            sector_id: {
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            sector_name: DataTypes.STRING,
            parent_sector_id: DataTypes.INTEGER,
            insref: DataTypes.STRING  // Millistream insref - meaningless
        },
        {tableName: 'stock_exchange_sector'}
    );

    StockExchangeSector.associate = function (models) {
        StockExchangeSector.hasMany(models.Stock, {as: 'children', foreignKey: 'sector_id' } );
    };

    // StockExchangeSector.sync();

    return StockExchangeSector;

};
