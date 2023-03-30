module.exports = function HttpsAdapter() {
    const https = require('https');

    // Implementation is wrong
    let get = (url) => {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = []

                res.on('data', chunk => data.push(chunk))
                res.on('error', err => reject(err))
                res.on('end', () => resolve(Buffer.concat(data)))

            }).on('error', err => reject(err))
        });
    }

    return {
        get
    }
}
