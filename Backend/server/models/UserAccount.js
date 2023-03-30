// DROP TABLE IF EXISTS user_account;

// CREATE TABLE user_account (
// user_id   integer,
// user_account_id     varchar(30),
// account_name varchar(30),
// account_type varchar(20),
// balance    integer,
// scale    integer,
// currency   char(3),
// hide boolean,
// broker varchar(20),
// order_preference integer,
// nominal_position_size integer,
// secret_key varchar(30),  -- 2FA WebSocket
// last_import_date date,
//  PRIMARY KEY (user_id, user_account_id)
// );

module.exports = (db, DataTypes) => {
    const UserAccount = db.define('UserAccount', {
        user_id: {
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        user_account_id: {
            primaryKey: true,
            type: DataTypes.STRING(30)
        },
        account_name: DataTypes.STRING(30),
        account_type: DataTypes.STRING(20),
        cash: DataTypes.FLOAT,
        scale: DataTypes.INTEGER,
        currency: DataTypes.STRING(3),
        is_ignored: DataTypes.BOOLEAN,
        is_selected: DataTypes.BOOLEAN,
        broker: DataTypes.STRING(20),
        order_preference: DataTypes.INTEGER,
        nominal_position_size: DataTypes.INTEGER,
        secret_key: DataTypes.STRING(30),
        last_import_date: DataTypes.DATEONLY,
        competition_id:  DataTypes.INTEGER,
    }, { tableName: 'user_account' });

    // UserAccount.sync();

    return UserAccount;

};
