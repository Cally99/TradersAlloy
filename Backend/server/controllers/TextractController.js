const _ = require('lodash');

const DB = require('../config/DB.js');
let connection = DB.getConnection();

module.exports = {
    ingestFiles(req, res) {
        return sequelizeModel.findAll({"user_id": req.params.user_id})
            .then(response => {
                //  res.status(200).send(response)  for the Vue frontend we respond with raw data
                app.get('/backend', (req, res) => { res.render('index')});  // for backend service -> ../views/*.ejs

            })
            .catch(err => {
                res.status(400).send(err)
            })
    },

}
