
module.exports = (db, DataTypes) => {
    const CompanyWebcast = db.define('CompanyWebcast', {
        company_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        publish_date: {
            type: DataTypes.DATE,
            primaryKey: true,
        },
        nth_today: {
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        title: DataTypes.STRING(100),
        media_link: DataTypes.STRING(255),
        source: DataTypes.STRING(10),
        language_code: DataTypes.STRING(2),
    }, { tableName: 'company_webcast' });

    return CompanyWebcast;
};


// create table company_webcast (
//     company_id   integer,
//     publish_date date,
//     title varchar(50),
//     media_link varchar (255),
//     source varchar(10),  -- 'FWTV', 'FH'
//     language varchar(2),  -- 'en' or 'sv'
//     PRIMARY KEY (company_id, publish_date)
//     );

