const http = require('http');
const fs = require('fs');
const path = require('path');

exports.newServer = port => {
    http.createServer((req, res) => {
        let url = req.url;
        let file = path.resolve(__dirname, '..', '..') + url;

        fs.readFile(file, (err, data) => {
            let type = file.substr(file.lastIndexOf(".") + 1, path.length);
            if (err) {
                res.writeHead(404, {
                    'content-type' : `text/${type};charset="utf-8"`
                });
            } else {
                res.writeHead(200, {
                    'content-type' : `text/${type};charset="utf-8"`
                });
                res.write(data);
            }
            res.end();
        })
    }).listen(port);
}
