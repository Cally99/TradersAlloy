const CompanyReport = require('./CompanyReport.js');


module.exports = (db, DataTypes) => {
    const Company = db.define('Company', {
        company_id: {
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        name: DataTypes.STRING,
        description: DataTypes.TEXT,
        market_cap: DataTypes.INTEGER,
        last_report_date: DataTypes.DATEONLY,
        next_report_date: DataTypes.DATEONLY,
        last_eps_ttm: DataTypes.DOUBLE,
        last_sales: DataTypes.DOUBLE,
        last_pe: DataTypes.DOUBLE,
        ceo_comments: DataTypes.TEXT,
        status_flag: DataTypes.STRING,
        last_np: DataTypes.DOUBLE,
        insider_trade_isins: DataTypes.TEXT
    }, { tableName: 'company' });


    Company.associate = function(models) {
        Company.hasMany(models.CompanyReport, { foreignKey: 'company_id' });
        Company.hasMany(models.CompanyCalendar, { foreignKey: 'company_id' });
        Company.hasMany(models.Stock, { foreignKey: 'company_id' });
    };

    // Company.sync();


    return Company;
};
