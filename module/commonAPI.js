const ak = require('../config/appkey').common;
const request = require('request');
const convert = require('xml-js')

module.exports = {
    getBusArriveTime : (stId, busRouteId, ord) => {
        return new Promise((resolve, reject)=> {
            const options = {
                'uri' : `http://ws.bus.go.kr/api/rest/arrive/getArrInfoByRoute?ServiceKey=${ak}&stId=${stId}&busRouteId=${busRouteId}&ord=${ord}`
            }
            request(options, (err, result)=>{
                if(err) reject(err)
                else {
                    let jsonResult = convert.xml2json(result.body, {compact:true, spaces:4});
                    console.log(jsonResult);
                    console.log(jsonResult.ServiceResult);
                }
            })
        })
    }
}