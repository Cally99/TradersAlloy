module.exports = (db, DataTypes) => {
    const CompanyInsiderTrade = db.define('StockInsiderTrade', {
            insider_trade_id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            isin: DataTypes.STRING(20),
            // instrument_name: DataTypes.STRING,
            person: DataTypes.STRING,
            person_title: DataTypes.STRING,
            volume: DataTypes.DOUBLE,
            qty_or_amount: DataTypes.STRING(10),
            price: DataTypes.DOUBLE,
            transaction_date: DataTypes.DATEONLY,
            transaction_currency: DataTypes.STRING(3),
            transaction_nature: DataTypes.STRING(100),
            stock_id: DataTypes.INTEGER, // Use the ISIN supplied by FI to match the id from Millistream
            company_id: DataTypes.INTEGER, // ... but show ALL trades relevant to a company
            instrument_name: DataTypes.STRING,
        },
        {tableName: 'stock_insider_trade'}
    );

    // CompanyInsiderTrade.sync();

    return CompanyInsiderTrade;
};
