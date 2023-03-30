const Sequelize = require('sequelize');

const log4js = require('log4js');
const logger = log4js.getLogger("app_log");

module.exports = {
    getConnection() {
        return new Sequelize(
            process.env.DB_database,
            process.env.DB_username,
            process.env.DB_password,
            {
                host: 'localhost',
                dialect: 'postgres',
                pool: {
                    max: 5,
                    min: 0,
                    idle: 10000
                },
                define: {
                    timestamps: false,      // We just do not need
                    underscored: false,     // use camelCase
                    freezeTableName: true   // do not make plural
                },
                logging: (...msg) => logger.debug(msg[0]),
            });
    }
}
