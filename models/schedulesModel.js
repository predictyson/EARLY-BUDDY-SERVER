const odsayAPI = require('../module/odsayAPI');
const resUtil = require('../module/responseUtil');
const resMsg = require('../module/resMsg');
const statCode = require('../module/statusCode');
const pool = require('../module/pool');
const commonAPI = require('../module/commonAPI');
const seoulAPI = require('../module/seoulAPI');
var moment = require('moment');

module.exports = {
    addSchedule : async (scheduleName, scheduleStartTime, startAddress, startLongitude, startLatitude, endAddress, endLongitude, endLatitude) => {
        const addScheduleQuery = 'INSERT INTO schedules (scheduleName, scheduleStartTime, startAddress, startLongitude, startLatitude, endAddress, endLongitude, endLatitude) VALUES (?,?,?,?,?,?,?,?)';
        return await pool.queryParam_Arr(addScheduleQuery, [scheduleName, scheduleStartTime, startAddress, startLongitude, startLatitude, endAddress, endLongitude, endLatitude])
        .catch((err)=>{
            console.log('addUsersSchedules err : ' + err);
        })
    },
    addPaths : async (pathType, totalTime, totalPay, totalWalkTime, transitCount) => {
        const addPathsQuery = 'INSERT INTO paths (pathType, totalTime, totalPay, totalWalkTime, transitCount) VALUES (?,?,?,?,?)';
        return await pool.queryParam_Arr(addPathsQuery, [pathType, totalTime, totalPay, totalWalkTime, transitCount])
        .catch((err)=> {
            console.log('addPaths err : ' + err);
            
        })
    },
    addWalk : async (trafficType ,distance, sectionTime, pathIdx) => {
        const addWalkDetailQuery = 'INSERT INTO details (trafficType, distance, sectionTime) VALUES (?,?,?)'; //walk = 3 subway = 1, bus = 2
        const addPathsDetailsQuery = 'INSERT INTO pathsDetails (pathIdx, detailIdx) VALUES (?,?)';//RT
        let result = await pool.queryParam_Arr(addWalkDetailQuery, [trafficType, distance, sectionTime]);
        return await pool.Transaction(async(conn)=>{
            let addWalkDetailResult = await conn.query(addWalkDetailQuery, [trafficType, distance, sectionTime]);
            await conn.query(addPathsDetailsQuery, [pathIdx, addWalkDetailResult.insertId]);
            console.log('걷기 경로 추가 성공!')
        })
    },
    addBus : async (trafficType, distance, sectionTime, stationCount, detailStartAddress, detailStartLongitude, detailStartLatitude, detailEndAddress, detailEndLongitude, detailEndLatitude, busNo, busType, stopArray, pathIdx) => {
        const addBusDetailQuery = 'INSERT INTO details (trafficType, distance, sectionTime, stationCount, detailStartAddress, detailStartLongitude, detailStartLatitude, detailEndAddress, detailEndLongitude, detailEndLatitude, busNo, busType) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';
        const addBusDetailsStopsQuery = 'INSERT INTO detailsStops (detailIdx, stopIdx) VALUES (?,?)';//RT
        const addBusStopsQuery = 'INSERT INTO stops (stopName) VALUES (?)';
        const addPathsDetailsQuery = 'INSERT INTO pathsDetails (pathIdx, detailIdx) VALUES (?,?)';//RT
                
        return await pool.Transaction(async (conn)=>{
            let addBusDetailResult = await conn.query(addBusDetailQuery, [trafficType, distance, sectionTime, stationCount, detailStartAddress, detailStartLongitude, detailStartLatitude, detailEndAddress, detailEndLongitude, detailEndLatitude, busNo, busType]);
            let getBusRouteListResult = await commonAPI.getBusRouteList(Number(busNo));
            for (var j = 0; j < getBusRouteListResult.length; j++) {
                if (busNo == getBusRouteListResult[j].busRouteNm[0]) {
                    let busRouteId = Number(getBusRouteListResult[j].busRouteId[0]);
                    let busRouteInfo = await commonAPI.getBusRouteInfo(busRouteId);
                    let routeTerm = Number(busRouteInfo[0].term[0]);
                    console.log(busRouteInfo);
                    let getStationByRouteResult = await commonAPI.getStationByRoute(busRouteId);
                    for (var k = 0; k < getStationByRouteResult.length; k++) {
                        if (getStationByRouteResult[k].stationNm[0] === stopArray[0].stationName) {
                            let getBusArrTimeResult = await commonAPI.getBusArriveTime(getStationByRouteResult[k].station[0], busRouteId, getStationByRouteResult[k].seq);
                            // console.log(getBusArrTimeResult);
                            // console.log('================================arr========================');
                        }
                    }
                }
            }
            for (var j = 0; j < stopArray.length; j++) {
                let addBusStopsResult = await conn.query(addBusStopsQuery, [stopArray[j].stationName]);
                let addBusDetailsStopsResult = await conn.query(addBusDetailsStopsQuery,[addBusDetailResult.insertId, addBusStopsResult.insertId]);
            }
            await conn.query(addPathsDetailsQuery, [pathIdx, addBusDetailResult.insertId])
            console.log('버스 경로 추가 성공!')
        })
        .catch((err)=>{
            console.log('addBus err : ' + err);
            return({
                code : statCode.BAD_REQUEST,
                json : resUtil.successFalse(resMsg.NULL_VALUE)
            })
        })

        
    },
    addSubway : async (trafficType, distance, sectionTime, stationCount, subwayLane, detailStartAddress, detailStartLongitude, detailStartLatitude, detailEndAddress, detailEndLongitude, detailEndLatitude, stopArray, pathIdx, stationID, wayCode, startTime, scheduleIdx ,noticeMin, arriveCount) => {
        const addSubwayDetailQuery = 'INSERT INTO details (trafficType, distance, sectionTime, stationCount, subwayLane, detailStartAddress, detailStartLongitude, detailStartLatitude, detailEndAddress, detailEndLongitude, detailEndLatitude) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
        const addSubwayStopsQuery = 'INSERT INTO stops (stopName) VALUES (?)';
        const addSubwayDetailsStopsQuery = 'INSERT INTO detailsStops (detailIdx, stopIdx) VALUES (?,?)';//RT
        const addPathsDetailsQuery = 'INSERT INTO pathsDetails (pathIdx, detailIdx) VALUES (?,?)';//RT
        const addSchedulesNoticesQuery = 'INSERT INTO schedulesNotices (scheduleIdx, arriveTime, noticeTime) VALUES (?,?,?)';

        return await pool.Transaction(async(conn)=>{
            let getSubwayArriveTimeResult =  await odsayAPI.getSubwayArriveTime(stationID, wayCode);
            let timeArray = getSubwayArriveTimeResult.OrdList.up.time;
            for (var k = 0; k < timeArray.length; k++) {
                //startTime 0 년도 1 월 2 일 3 몇시 4 몇분
                if (timeArray[k].Idx == startTime[3]) {
                    let minArr = timeArray[k].list.split(' ');
                        for (var j = 0; j < minArr.length; j++) {
                            if (startTime[4] < Number(minArr[j].split('(')[0])) {
                                let arriveTime = (moment().year(startTime[0]).month(startTime[1]).date(startTime[2]).hour(startTime[3]).minute(Number(minArr[j].split('(')[0])).format('YYYY-MM-DD HH:mm:ss'));
                                let noticeTime = (moment().year(startTime[0]).month(startTime[1]).date(startTime[2]).hour(startTime[3]).minute(Number(minArr[j].split('(')[0]) -noticeMin).format('YYYY-MM-DD HH:mm:ss'));
                                await conn.query(addSchedulesNoticesQuery, [scheduleIdx, arriveTime, noticeTime]);
                                arriveCount--;
                                if(arriveCount == 0) break;
                            }
                        }
                }
            } //시간 작업
            //await seoulAPI.realtimeStArr(stopArray[0].stationName);
            let addSubwayDetailResult = await conn.query(addSubwayDetailQuery, [trafficType, distance, sectionTime, stationCount, subwayLane, detailStartAddress, detailStartLongitude, detailStartLatitude, detailEndAddress, detailEndLongitude, detailEndLatitude]);
            for(var i = 0 ; i < stopArray.length ; i++) {
                let addSubwayStopsResult = await conn.query(addSubwayStopsQuery, [stopArray[i].stationName]);
                let addSubwayDetailsStopsResult = await conn.query(addSubwayDetailsStopsQuery, [addSubwayDetailResult.insertId, addSubwayStopsResult.insertId]);
            }
            await conn.query(addPathsDetailsQuery, [pathIdx, addSubwayDetailResult.insertId]);
            console.log('지하철 경로 추가 완료!')
        })
    },
    addPathsDetails : async (pathIdx, detailIdx) => {
        const addPathsDetailsQuery = 'INSERT INTO pathsDetails (pathIdx, detailIdx) VALUES (?,?)';//RT
        return await pool.queryParam_Arr(addPathsDetailsQuery, [pathIdx, detailIdx])
        .catch((err)=> {
            console.log('addPathsDetail err : ' + err);
            
        })
    },
    addSchedulesNotices : async(scheduleIdx, arriveTime, noticeTime)=> {
        const addSchedulesNoticesQuery = 'INSERT INTO schedulesNotices (scheduleIdx, arriveTime, noticeTime) VALUES (?,?,?)';
        return await pool.queryParam_Arr(addSchedulesNoticesQuery, [scheduleIdx, arriveTime, noticeTime])
        .catch((err)=>{
            console.log('addSchedulesNotices err : ' + err);
            
        })
    },
    addUsersSchedules : async (userIdx, scheduleIdx) => { //RT
        const addUsersSchedulesQuery = 'INSERT INTO usersSchedules (userIdx, scheduleIdx) VALUES (?,?)';
        return await pool.queryParam_Arr(addUsersSchedulesQuery, [userIdx, scheduleIdx])
        .catch((err)=> {
            console.log('addUsersSchedules err : ' + err);
            
        })
    },
    addSchedulesPaths : async (scheduleIdx, pathIdx) => {
        const addSchedulesPathsQuery = 'INSERT INTO schedulesPaths (scheduleIdx, pathIdx) VALUES (?,?)'; //RT
        return await pool.queryParam_Arr(addSchedulesPathsQuery, [scheduleIdx, pathIdx])
        .catch((err)=> {
            console.log('addPaths err : ' + err);
            
        })
    },
    
    addWeekdays : async (weekdayNum, scheduleIdx) => {
        const addWeekdaysQuery = 'INSERT INTO weekdays (weekdayNum, scheduleIdx) VALUES (?,?)';
        return await pool.queryParam_Arr(addWeekdaysQuery, [weekdayNum, scheduleIdx])
        .catch((err)=> {
            console.log('addWeekdays err : ' + err);
            
        })
    },
    
    deleteSchedule : async (req, res) => {
        
    },
    updateSchedule : async (req, res) => {
        
    },
    getSchedules : async (scheduleIdx) => {
        const getSchedulesQuery = 'SELECT * FROM schedules WHERE scheduleIdx = ?';
        const getSchedulesNoticesQuery = 'SELECT * FROM schedulesNotices WHERE scheduleIdx = ?';
        const getSchedulesPathsQuery = 'SELECT * FROM schedulesPaths WHERE scheduleIdx=?';
        const getPathsQuery = 'SELECT * FROM paths WHERE pathIdx = ?'
        const getPathsDetailsQuery = 'SELECT * FROM pathsDetails WHERE pathIdx=?';
        const getDetailsQuery = 'SELECT * FROM details WHERE '
    },
}