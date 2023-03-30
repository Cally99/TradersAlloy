module.exports = (db, DataTypes) => {
    const SysExchangeRate = db.define('SysExchangeRate', {
        date: {
            primaryKey: true,
            type: DataTypes.DATE
        },
        eur: DataTypes.FLOAT,
        nok: DataTypes.FLOAT,
        dkk: DataTypes.FLOAT,
    }, { tableName: 'sys_currency_sek' });

    return SysExchangeRate;
};




