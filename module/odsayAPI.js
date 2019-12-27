const request = require('request');
const ak = require('../config/appkey');

module.exports = {
    searchPubTransPath: (SX, SY, EX, EY) => {
        return new Promise((resolve, reject) => {
            const options = {
                'uri': `https://api.odsay.com/v1/api/searchPubTransPathR?apiKey=${ak.odsay}&SX=${SX}&SY=${SY}&EX=${EX}&EY=${EY}`,
            }
            request(options, (err, result) => {
                if (err) reject (err);
                else {
                    resolve(JSON.parse(result.body).result);
                }
            })
        })
    }
}