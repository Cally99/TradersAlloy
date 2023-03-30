const exchange = require('../models').exchange;
var formidable = require('formidable');
var fs = require('fs');

let logPath = process.env.LOG_PATH||require("os").userInfo().homedir;

module.exports = {

    uploadImage(req, res) {
        let form = new formidable.IncomingForm();
        form.parse(req, (err, fields, files) => {
            files.imageFile;

            let oldpath = files.imageFile.path;
            let newFilename = Date.now();
            const filename = `${newFilename}-${files.imageFile.name}`;
            let newpath = __dirname + `/../../../froala_images/${filename}`;
            // var newpath = files.imageFile.name;
            fs.copyFile(oldpath, newpath, () => {
                const url = `${process.env.IMAGE_ADDR}/images/${filename}`;
                res.send(`{"link": "${url}" }`);
            });
        });
    }
};
