module.exports = (db, DataTypes) => {
    const ErrorLog = db.define('ErrorLog', {
        error_id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: true
        },
        stack: {
            type: DataTypes.TEXT
        },
        uuid: {
            type: DataTypes.STRING
        }
    }, {tableName: 'error_log'});

    return ErrorLog;
};