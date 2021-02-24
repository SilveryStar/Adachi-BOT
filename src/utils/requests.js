const request = require('request');

module.exports = requests = options => {
    return new Promise(( resolve, reject ) => {
       request(options, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                resolve(body);
            }
       })
    })
        .catch(error => {
            console.error(error);
        })
};