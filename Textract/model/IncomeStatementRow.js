module.exports = (db, DataTypes) => {
    const IncomeStatementRow = db.define('IncomeStatementRow', {
        income_statement_row_id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false
        },
        income_statement_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'income_statement',
                key: 'income_statement_id'
            }
        },
        text: {
            type: DataTypes.STRING,
            allowNull: false
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, { tableName: 'income_statement_row' });
    return IncomeStatementRow;
}


