const Sequelize = require('sequelize');
const Company = require('./Company');

module.exports = (db, DataTypes) => {
    const CompanyReport = db.define('CompanyReport', {
            company_id: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            period: {                           // row 2 when pivoted in StocksFinancials
                primaryKey: true,
                type: DataTypes.STRING(7)
            },
            date_report: DataTypes.STRING,
            type_report: DataTypes.STRING,


            totalnumberofshares: DataTypes.DOUBLE,
            eps: DataTypes.DOUBLE,
            eps_ttm: DataTypes.DOUBLE,
            pe: DataTypes.FLOAT,
            ps: DataTypes.FLOAT,
            gp: DataTypes.DOUBLE,               // row 8 when pivoted in StocksFinancials
            costofgoodssold:  DataTypes.DOUBLE, // calculated
            ebitda: DataTypes.DOUBLE,
            ebit: DataTypes.DOUBLE,
            ptp: DataTypes.DOUBLE,
            sales: DataTypes.DOUBLE,            // row 7 when pivoted in StocksFinancials
            profit: DataTypes.DOUBLE,
            intangibleasset: DataTypes.DOUBLE,
            fixedasset: DataTypes.DOUBLE,
            financialasset: DataTypes.DOUBLE,
            noncurrentasset: DataTypes.DOUBLE,
            cce: DataTypes.DOUBLE,
            currentassets: DataTypes.DOUBLE,        // calculated
            totalassets: DataTypes.DOUBLE,
            shequity: DataTypes.DOUBLE,             // row 23 when pivoted in StocksFinancials
            ltliabilities: DataTypes.DOUBLE,
            curliabilities: DataTypes.DOUBLE,
            totalliabilities: DataTypes.DOUBLE,     // calculated
            totalequityandliabilities: DataTypes.DOUBLE,// calculated
            currency:  DataTypes.STRING(3),
            price: DataTypes.DOUBLE,
            pdf_link: DataTypes.STRING(255),
            pdf_language: DataTypes.STRING(2),
            ibl: DataTypes.DOUBLE,
    }, { tableName: 'company_report' });

    return CompanyReport;
};
