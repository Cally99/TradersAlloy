module.exports = (db, DataTypes) => {
    const Competition = db.define('Competition', {
        competition_id: {
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        short_code: DataTypes.STRING(10),
        title: DataTypes.STRING(30),
        svg_icon: DataTypes.TEXT,
        date_from: DataTypes.DATE,
        date_to: DataTypes.DATE,
        banner_image: DataTypes.TEXT,
        banner_color: DataTypes.TEXT,
        banner_background: DataTypes.TEXT,
        logo_image_url: DataTypes.TEXT,
        background_image_url: DataTypes.TEXT,
        is_public: DataTypes.BOOLEAN,
    }, { tableName: 'sys_competition' });

    return Competition;
};




