var http = require('http');
var url = require('url');
var querystring = require('querystring');
var static = require('node-static');
var path = require('path');
var fs = require('fs');

var fileServer = new static.Server(path.join(__dirname, '../public'));

function accept(req, res) {
    var urlParsed = url.parse(req.url, true);
    console.log('[' + (new Date).toUTCString() + '] ' + urlParsed.path);
    if (urlParsed.pathname == '/') {
        fs.readFile(path.join(__dirname, '../index.html'), 'utf-8', function(err, data) {
            if (!err && data) {
                res.statusCode = 200;
                res.end(data);
            } else {
                console.log(data, err);
                res.statusCode = 500;
                res.end();
            }
        });
    } else {
        fileServer.serve(req, res, function(e) {
            res.statusCode = 400;
            res.end();
        });
    }
}

if (!module.parent) {
    http.createServer(accept).listen(3000, function() {
        console.log('Server is running on port 3000');
    });
} else {
    module.exports = accept;
}

