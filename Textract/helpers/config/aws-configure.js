let { Config, config } = require('aws-sdk')
let aKey, sKey

config.getCredentials(function (err) {
    if (err) 
        console.log('Credentials not loaded!', err.stack)
    else {
        console.log('Credentials loaded!')
        aKey = config.credentials.accessKeyId
        sKey = config.credentials.secretAccessKey
    }
})

module.exports = () => {
    let cf = new Config({
        credentials: {
            accessKeyId: aKey,
            secretAccessKey: sKey
        },
        region: process.env.AWS_region
    })
    return cf
}
