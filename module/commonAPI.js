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
                        //console.log(result.ServiceResult.msgBody[0].itemList)
                        resolve(result.ServiceResult.msgBody[0].itemList);
                    })
                }
            })
        })
    },
    getBusRouteList : (busNo) => {
        return new Promise((resolve, reject)=>{
            const options  = {
                "uri" : `http://ws.bus.go.kr/api/rest/busRouteInfo/getBusRouteList?ServiceKey=${ak}&strSrch=${busNo}`
            }
            request(options, (err, result)=>{
                if(err) reject(err)
                else {
                    convert.parseString(result.body, (err, result)=>{
                        //console.log(result.ServiceResult.msgBody[0].itemList);
                        resolve(result.ServiceResult.msgBody[0].itemList);
                    })
                }
            })
        })
    },
    getBusRouteInfo : (busRouteId) => {
        return new Promise((resolve, reject)=>{
            const options  = {
                "uri" : `http://ws.bus.go.kr/api/rest/busRouteInfo/getRouteInfo?ServiceKey=${ak}&busRouteId=${busRouteId}`
            }
            request(options, (err, result)=>{
                if(err) reject(err)
                else {
                    convert.parseString(result.body, (err, result)=>{
                        //console.log(result.ServiceResult.msgBody[0].itemList);
                        resolve(result.ServiceResult.msgBody[0].itemList);
                    })
                }
            })
        })
    },
    getStationByRoute : (busRouteId) => { //노선 경로 목록 조회
        return new Promise((resolve,reject)=>{
            const options = {
                "uri" : `http://ws.bus.go.kr/api/rest/busRouteInfo/getStaionByRoute?ServiceKey=${ak}&busRouteId=${busRouteId}`
            }
            request(options, (err, result)=>{
                if(err) reject(err)
                else {
                    convert.parseString(result.body, (err, result)=>{
                        resolve(result.ServiceResult.msgBody[0].itemList);
                    })
                }
            })
        })
    },

    
}