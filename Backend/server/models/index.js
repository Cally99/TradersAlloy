require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(module.filename);
const env = process.env.NODE_ENV || 'development';
console.log("process.env." + process.env.DB_database);
// const config = require(`${__dirname}/../config/config.json`)[env];
const db = {};
// if (config.use_env_variable) {
//     sequelize = new Sequelize(process.env[config.use_env_variable]);
// } else {

const log4js = require('log4js');
const logger = log4js.getLogger("app_log");

let sequelize = new Sequelize(process.env.DB_database, process.env.DB_username, process.env.DB_password, {
    host: 'localhost',
    dialect: 'postgres',
    pool: {
        max: 5,
        min: 0,
        idle: 20000,
        acquire: 20000
    },
    define: {
        timestamps: false,   // We just do not need
        underscored: false,  // use camelCase
        freezeTableName: true  // do not make plural - Andrew must learn the Model and TABLE have identiocal names
    },
    logging: (...msg) => logger.debug(msg),
//    logging: (...msg) => console.log(msg[0]) ,  // [0] just outputs the SQL

});

fs.readdirSync(__dirname)
    .filter(file =>
        (file.indexOf('.') !== 0) &&
        (file !== basename) &&
        (file.slice(-3) === '.js'))
    .forEach(file => {
        const model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
        console.log("modelName:", modelName);
    }
});


db.sequelize = sequelize;

module.exports = db;
