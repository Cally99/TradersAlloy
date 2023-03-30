var https   = require('https');
var fs      = require('fs');
var options = {
    hostname  : 'finance.yahoo.com',
    port      : 443,
    path      : '/q?uhb=uhb2&fr=uh3_finance_vert_gs&type=2button&s=fb',
    method    : 'GET'
};

var file = fs.createWriteStream("table1.csv");

var req = https.request(options, function(res) {
    console.log("statusCode: ", res.statusCode);
    console.log("headers: ", res.headers);
    res.on('data', function(d) {
        file.write(d);
    });
});
req.end();

req.on('error', function(e) {
    console.error(e);
});
