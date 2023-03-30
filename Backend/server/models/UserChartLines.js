module.exports = (db, DataTypes) => {
    const UserChartLines = db.define('UserChartLines', {
            user_id: {
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            stock_id: {
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            content: DataTypes.TEXT
        },
        {tableName: 'user_chart_lines'},
    );

    // UserChartLines.sync();

    return UserChartLines;
};
