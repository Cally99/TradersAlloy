module.exports = (db, DataTypes) => {
  const News = db.define('News', {
          news_id: {
              type: DataTypes.STRING(36),
              primaryKey: true
          },
          date: DataTypes.DATEONLY,
          time: DataTypes.TIME,
          agency: DataTypes.INTEGER,
          title: DataTypes.STRING(200),
          type:  DataTypes.INTEGER,
          language: DataTypes.STRING(2),
          tags: DataTypes.ARRAY(DataTypes.STRING(20)),
          links: DataTypes.ARRAY(DataTypes.TEXT),
          version: DataTypes.STRING(10),
          newstext: DataTypes.TEXT,
          countries: DataTypes.ARRAY(DataTypes.STRING(2)),
          signature: DataTypes.TEXT,
      },
      {tableName: 'news'}
  );

  News.associate = function(models) {
      News.hasMany(models.NewsCompany, { as: 'joinForTicker', foreignKey: 'news_id' });
  };

  return News;
};
