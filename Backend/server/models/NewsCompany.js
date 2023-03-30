const Stock = require('./Stock.js');

module.exports = (db, DataTypes) => {
    const NewsCompany = db.define('NewsCompany', {
            company_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            news_id: {
                type: DataTypes.STRING(36),
                primaryKey: true,
            }
        },
        {tableName: 'news_company'}
    );

    NewsCompany.associate = function(models) {
        NewsCompany.hasMany(models.Stock, {foreignKey: 'company_id'});
    };

    return NewsCompany;
};
