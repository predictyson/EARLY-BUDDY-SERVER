const ak = require('../config/appkey').common;
const request = require('request');
const convert = require('xml2js')

module.exports = {
    getBusArriveTime : (stId, busRouteId, ord) => {
        return new Promise((resolve, reject)=> {
            const options = {
                'uri' : `http://ws.bus.go.kr/api/rest/arrive/getArrInfoByRoute?ServiceKey=${ak}&stId=${stId}&busRouteId=${busRouteId}&ord=${ord}`
            }
            request(options, (err, result)=>{
                if(err) reject(err)
                else {
                    convert.parseString(result.body, (err, result)=>{
                        console.log(result)
                    })
                }
            })
        })
    },
    busRouteInfo : (busNo) => {
        return new Promise((resolve, reject)=>{
            const options  = {
                "uri" : `http://ws.bus.go.kr/api/rest/busRouteInfo/getBusRouteList?ServiceKey=${ak}&strSrch=${busNo}`
            }
            request(options, (err, result)=>{
                if(err) reject(err)
                else {
                    convert.parseString(result.body, (err, result)=>{
                        console.log(result.ServiceResult.msgBody[0].itemList);
                    })
                }
            })
        })
    }
}