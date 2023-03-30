
module.exports = (db, DataTypes) => {
    const CompanyAnalysis = db.define('CompanyAnalysis', {
        company_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        analyst_name: {
            type: DataTypes.STRING(20), //  eg. "Penser"
            primaryKey: true,
        },
        publish_date: {
            type: DataTypes.DATE,
            primaryKey: true,
        },
        pdf_link: DataTypes.STRING(255),
        period: DataTypes.STRING(7),
    }, { tableName: 'company_analysis' });

    return CompanyAnalysis;
};
