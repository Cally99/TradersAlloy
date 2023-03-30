
module.exports = (db, DataTypes) => {
    const CompanyCalendar = db.define('CompanyCalendar', {
            company_id: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            period: {
                type: DataTypes.STRING(7),
                primaryKey: true,
            },
            date_report: DataTypes.DATE,
            type_report: DataTypes.INTEGER,
        },
        {tableName: 'company_calendar'}
    );

    return CompanyCalendar;
};
