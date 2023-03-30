const S3 = require('aws-sdk').S3;
const s3 = new S3();

module.exports = function S3Adapter() {
    return {
        store: (pdf, bucketName, fileName) => {
            return new Promise((resolve, reject) => {
                let params = {
                    Body: pdf,
                    Bucket: bucketName,
                    Key: fileName
                }

                s3.putObject(params, function (err, data) {
                    if (err) reject(err)
                    else resolve(data)
                })
            })
        },
        delete: (bucketName, fileName) => {
            return new Promise((resolve, reject) => {
                let params = {
                    Bucket: bucketName,
                    Key: fileName
                }

                s3.deleteObject(params, function (err, data) {
                    if (err) reject(err)
                    else resolve(data)
                })
            })    
        }
    }
}
