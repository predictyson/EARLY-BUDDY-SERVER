const request = require('request');
const ak = require('../config/appkey');

module.exports = {
    searchPubTransPath : (SX, SY, EX, EY) => {
        return new Promise((resolve,reject)=> {
            const options = {
                'uri' : 'https://api.odsay.com/v1/api/searchPubTransPathR', 
                'headers' : {
                    'Content-Type' : 'application/x-www-form-urlencoded'
                },
                'qs' : {
                    'apiKey' : `${ak.odsay}`,
                    'SX' : `${SX}`,
                    'SY' : `${SY}`,
                    'EX' : `${EX}`,
                    'EY' : `${EY}`
                }  
            }
    
            request(options, async (err, result)=>{
                console.log(result);
                // const jsonResult = JSON.parse(result.body);
                // console.log(jsonResult);
                // if(err) {
                //     console.log('request err : ' + err);
                //     reject(err)
                // }
                // else resolve(jsonResult);
            })
        })
    }
}