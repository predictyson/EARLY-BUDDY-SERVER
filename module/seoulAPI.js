const request = require('request');
const ak = require('../config/appkey');

module.exports = {
    nearStation : (x,y) => {
        return new Promise((resolve)=>{
            const options = {
                uri : `http://swopenAPI.seoul.go.kr/api/subway/${ak.seoul}/json/nearBy/0/5/${x}/${y}`
            }
            request(options, (err, result)=>{
                if(err) {
                    console.log('request err : ' + err);
                }
                else {
                    resolve(JSON.parse(result.body));
                }
            })
        })
    }
}