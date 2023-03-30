module.exports = (db, DataTypes) => {
    const IncomeStatement = db.define('IncomeStatement', {
        income_statement_id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false
        },
        isin: {
            type: DataTypes.STRING,
            allowNull: false
        },
        period: {
            type: DataTypes.STRING,
            allowNull: false
        },
        uuid: {
            type: DataTypes.STRING,
            allowNull: false
        },
        page_found_on: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        is_accurate: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, { tableName: 'income_statement' });

    return IncomeStatement;
};

