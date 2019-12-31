const odsayAPI = require('../module/odsayAPI');
const resUtil = require('../module/responseUtil');
const resMsg = require('../module/resMsg');
const statCode = require('../module/statusCode');
const pool = require('../module/pool');
const commonAPI = require('../module/commonAPI');
const seoulAPI = require('../module/seoulAPI');
var moment = require('moment');

module.exports = {
    addSchedule: async (scheduleName, scheduleStartTime, startAddress, startLongitude, startLatitude, endAddress, endLongitude, endLatitude) => {
        const addScheduleQuery = 'INSERT INTO schedules (scheduleName, scheduleStartTime, startAddress, startLongitude, startLatitude, endAddress, endLongitude, endLatitude) VALUES (?,?,?,?,?,?,?,?)';
        return await pool.queryParam_Arr(addScheduleQuery, [scheduleName, scheduleStartTime, startAddress, startLongitude, startLatitude, endAddress, endLongitude, endLatitude])
            .catch((err) => {
                console.log('addUsersSchedules err : ' + err);
            })
    },
    addPaths: async (pathType, totalTime, totalPay, totalWalkTime, transitCount) => {
        const addPathsQuery = 'INSERT INTO paths (pathType, totalTime, totalPay, totalWalkTime, transitCount) VALUES (?,?,?,?,?)';
        return await pool.queryParam_Arr(addPathsQuery, [pathType, totalTime, totalPay, totalWalkTime, transitCount])
            .catch((err) => {
                console.log('addPaths err : ' + err);

            })
    },
    addWalk: async (trafficType, distance, sectionTime, pathIdx) => {
        const addWalkDetailQuery = 'INSERT INTO details (trafficType, distance, sectionTime) VALUES (?,?,?)'; //walk = 3 subway = 1, bus = 2
        const addPathsDetailsQuery = 'INSERT INTO pathsDetails (pathIdx, detailIdx) VALUES (?,?)';//RT
        return await pool.Transaction(async (conn) => {
            let addWalkDetailResult = await conn.query(addWalkDetailQuery, [trafficType, distance, sectionTime]);
            let addWalkPathsDetailsResult=await conn.query(addPathsDetailsQuery, [pathIdx, addWalkDetailResult.insertId]);
        })
    },
    addBus: async (trafficType, distance, sectionTime, stationCount, detailStartAddress, detailStartLongitude, detailStartLatitude, detailEndAddress, detailEndLongitude, detailEndLatitude, busNo, busType, stopArray, pathIdx, startTime, scheduleIdx, noticeMin, arriveCount, isFirst) => {
        const addBusDetailQuery = 'INSERT INTO details (trafficType, distance, sectionTime, stationCount, detailStartAddress, detailStartLongitude, detailStartLatitude, detailEndAddress, detailEndLongitude, detailEndLatitude, busNo, busType) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';
        const addBusDetailsStopsQuery = 'INSERT INTO detailsStops (detailIdx, stopIdx) VALUES (?,?)';//RT
        const addBusStopsQuery = 'INSERT INTO stops (stopName) VALUES (?)';
        const addPathsDetailsQuery = 'INSERT INTO pathsDetails (pathIdx, detailIdx) VALUES (?,?)';//RT
        const addSchedulesNoticesQuery = 'INSERT INTO schedulesNotices (scheduleIdx, arriveTime, noticeTime) VALUES (?,?,?)';

        if (isFirst == 1) {
            console.log('BUS FIRST');
            let getBusRouteListResult = await commonAPI.getBusRouteList(Number(busNo));
            let busRouteId = 0;
            for (var k = 0; k < getBusRouteListResult.length; k++) {
                if (busNo == getBusRouteListResult[k].busRouteNm[0]) {
                    busRouteId = Number(getBusRouteListResult[k].busRouteId[0]);
                    break;
                }
            }
            let busRouteInfo = await commonAPI.getBusRouteInfo(busRouteId);
            let routeTerm = Number(busRouteInfo[0].term[0]);
            let getStationByNameResult = await commonAPI.getStationByName(stopArray[0].stationName);
            //console.log(getStationByNameResult);
            let getBusTimeByStationResult = await commonAPI.getBusTimeByStation(getStationByNameResult[0].arsId[0], busRouteId);
            //console.log(getBusTimeByStationResult);
            if (getBusTimeByStationResult === undefined) {
                return ({
                    code: statCode.BAD_REQUEST,
                    json: resMsg.FIND_BUS_TIME_FAILED
                })
            }
            let firstBusHour = Number((getBusTimeByStationResult[0].firstBusTm[0].split(''))[0] + (getBusTimeByStationResult[0].firstBusTm[0].split(''))[1]);
            let firstBusMin = Number(((getBusTimeByStationResult[0].firstBusTm[0]).split(''))[2] + ((getBusTimeByStationResult[0].firstBusTm[0]).split(''))[3]);
            let lastBusHour = Number(((getBusTimeByStationResult[0].lastBusTm[0]).split(''))[0] + ((getBusTimeByStationResult[0].lastBusTm[0]).split(''))[1]);
            //let lastBusMin = Number(((getBusTimeByStationResult[0].lastBusTm[0]).split(''))[2] + ((getBusTimeByStationResult[0].lastBusTm[0]).split(''))[3]);
            let startTm = moment().year(startTime[0]).month(startTime[1] - 1).date(startTime[2]).hour(startTime[3]).minute(startTime[4]);
            let leastTm = startTm.subtract(sectionTime, 'm').toString();
            let arriveArr = [];

            if (moment(leastTm).hour() < firstBusHour && moment(leastTm).hour() > lastBusHour) {
                console.log('새벽이라 차 없어요');
            }
            if (moment(leastTm).hour() > firstBusHour && moment(leastTm).hour() < lastBusHour) {
                let tempBusTime = moment().year(startTime[0]).month(startTime[1] - 1).date(startTime[2]).hour(firstBusHour).minute(firstBusMin);
                while (startTm.diff(tempBusTime, 'minutes') > routeTerm) {
                    let newTime = tempBusTime.add(routeTerm, "m");
                    arriveArr.push(newTime.toString());
                }
            }
            return await pool.Transaction(async (conn) => {
                for (var l = 1; l <= arriveCount; l++) {
                    await conn.query(addSchedulesNoticesQuery, [scheduleIdx, moment(arriveArr[(arriveArr.length) - l]).format('YYYY-MM-DD HH:mm:ss'), moment(arriveArr[(arriveArr.length) - l]).subtract(noticeMin, 'minutes').format('YYYY-MM-DD HH:mm:ss')])
                }
                let addBusDetailResult = await conn.query(addBusDetailQuery, [trafficType, distance, sectionTime, stationCount, detailStartAddress, detailStartLongitude, detailStartLatitude, detailEndAddress, detailEndLongitude, detailEndLatitude, busNo, busType]);
                for (var j = 0; j < stopArray.length; j++) {
                    let addBusStopsResult = await conn.query(addBusStopsQuery, [stopArray[j].stationName]);
                    let addBusDetailsStopsResult = await conn.query(addBusDetailsStopsQuery, [addBusDetailResult.insertId, addBusStopsResult.insertId]);
                }
                await conn.query(addPathsDetailsQuery, [pathIdx, addBusDetailResult.insertId])
            })
                .catch((err) => {
                    console.log('addBus err : ' + err);
                    return ({
                        code: statCode.BAD_REQUEST,
                        json: resUtil.successFalse(resMsg.NULL_VALUE)
                    })
                })
        }
        else {
            return await pool.Transaction(async (conn) => {
                let addBusDetailResult = await conn.query(addBusDetailQuery, [trafficType, distance, sectionTime, stationCount, detailStartAddress, detailStartLongitude, detailStartLatitude, detailEndAddress, detailEndLongitude, detailEndLatitude, busNo, busType]);
                for (var j = 0; j < stopArray.length; j++) {
                    let addBusStopsResult = await conn.query(addBusStopsQuery, [stopArray[j].stationName]);
                    let addBusDetailsStopsResult = await conn.query(addBusDetailsStopsQuery, [addBusDetailResult.insertId, addBusStopsResult.insertId]);
                }
                let addBusPathsDetailsResult = await conn.query(addPathsDetailsQuery, [pathIdx, addBusDetailResult.insertId]);
            })
                .catch((err) => {
                    console.log('addBus err : ' + err);
                    return ({
                        code: statCode.BAD_REQUEST,
                        json: resUtil.successFalse(resMsg.NULL_VALUE)
                    })
                })
        }
    },
    addSubway: async (trafficType, distance, sectionTime, stationCount, subwayLane, detailStartAddress, detailStartLongitude, detailStartLatitude, detailEndAddress, detailEndLongitude, detailEndLatitude, stopArray, pathIdx, stationID, wayCode, startTime, scheduleIdx, noticeMin, arriveCount, isFirst) => {
        const addSubwayDetailQuery = 'INSERT INTO details (trafficType, distance, sectionTime, stationCount, subwayLane, detailStartAddress, detailStartLongitude, detailStartLatitude, detailEndAddress, detailEndLongitude, detailEndLatitude) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
        const addSubwayStopsQuery = 'INSERT INTO stops (stopName) VALUES (?)';
        const addSubwayDetailsStopsQuery = 'INSERT INTO detailsStops (detailIdx, stopIdx) VALUES (?,?)';//RT
        const addPathsDetailsQuery = 'INSERT INTO pathsDetails (pathIdx, detailIdx) VALUES (?,?)';//RT
        const addSchedulesNoticesQuery = 'INSERT INTO schedulesNotices (scheduleIdx, arriveTime, noticeTime) VALUES (?,?,?)';

        if (isFirst == 1) {
            let startTm = moment().year(startTime[0]).month(startTime[1] - 1).date(startTime[2]).hour(startTime[3]).minute(startTime[4]);
            let leastTm = startTm.subtract(sectionTime, 'm').toString();
            let getSubwayArriveTimeResult = await odsayAPI.getSubwayArriveTime(stationID, wayCode);
            if(getSubwayArriveTimeResult === undefined) {
                return ({
                    code: statCode.BAD_REQUEST,
                    json: resUtil.successFalse(resMsg.FIND_SUBWAY_TIME_FAILED)
                })
            }
            let arriveArr = [];
            let noticeArr = [];
            let timeArray = [];
            console.log('SUBWAY FIRST');
            if (moment(leastTm).day() == 6) { //토요일
                if (getSubwayArriveTimeResult.SatList.down === undefined) {
                    timeArray = getSubwayArriveTimeResult.SatList.up.time;
                }
                else {
                    timeArray = getSubwayArriveTimeResult.SatList.down.time;
                }
            }
            else if (moment(leastTm) == 0) { //일요일
                if (getSubwayArriveTimeResult.SunList.down === undefined) {
                    timeArray = getSubwayArriveTimeResult.SunList.up.time;
                }
                else {
                    timeArray = getSubwayArriveTimeResult.SunList.down.time;
                }
            }
            else {
                if (getSubwayArriveTimeResult.OrdList.down === undefined) {
                    timeArray = getSubwayArriveTimeResult.OrdList.up.time;
                }
                else {
                    timeArray = getSubwayArriveTimeResult.OrdList.down.time;
                }
            }
            for (var k = 0; k < timeArray.length; k++) {
                //startTime 0 년도 1 월 2 일 3 몇시 4 몇분
                if (timeArray[k].Idx == moment(leastTm).hour()) {
                    let minArr = timeArray[k].list.split(' ');
                    for (var j = 0; j < minArr.length; j++) {
                        if (moment(leastTm).minute() > Number(minArr[j].split('(')[0])) {
                            arriveArr.push(moment(leastTm).minute(minArr[j].split('(')[0]).toString());
                            noticeArr.push((moment(leastTm).minute(minArr[j].split('(')[0]).subtract(noticeMin, 'minutes')).toString());
                        }
                    }
                    if (arriveArr.length < arriveCount) {
                        minArr = timeArray[k - 1].list.split(' ');
                        for (var l = minArr.length - 1; l > minArr.length - 1 - arriveCount; l--) {
                            arriveArr.push(moment(leastTm).subtract(1, 'hours').minute(minArr[l].split('(')[0]).toString());
                        }
                    }
                }
            } //시간 작업
            return await pool.Transaction(async (conn) => {
                for (var i = 0; i < arriveCount; i++) {
                    await conn.query(addSchedulesNoticesQuery, [scheduleIdx, moment(arriveArr[arriveArr.length - 1 - i]).format('YYYY-MM-DD HH:mm:ss'), moment(arriveArr[arriveArr.length - 1 - i]).subtract(noticeMin, 'minutes').format('YYYY-MM-DD HH:mm:ss')])
                }
                let addSubwayDetailResult = await conn.query(addSubwayDetailQuery, [trafficType, distance, sectionTime, stationCount, subwayLane, detailStartAddress, detailStartLongitude, detailStartLatitude, detailEndAddress, detailEndLongitude, detailEndLatitude]);
                for (var i = 0; i < stopArray.length; i++) {
                    let addSubwayStopsResult = await conn.query(addSubwayStopsQuery, [stopArray[i].stationName]);
                    let addSubwayDetailsStopsResult = await conn.query(addSubwayDetailsStopsQuery, [addSubwayDetailResult.insertId, addSubwayStopsResult.insertId]);
                }
                let addSubwayPathsDetailsResult = await conn.query(addPathsDetailsQuery, [pathIdx, addSubwayDetailResult.insertId]);
            })
        }
        else {
            return await pool.Transaction(async (conn) => {
                let addSubwayDetailResult = await conn.query(addSubwayDetailQuery, [trafficType, distance, sectionTime, stationCount, subwayLane, detailStartAddress, detailStartLongitude, detailStartLatitude, detailEndAddress, detailEndLongitude, detailEndLatitude]);
                for (var i = 0; i < stopArray.length; i++) {
                    let addSubwayStopsResult = await conn.query(addSubwayStopsQuery, [stopArray[i].stationName]);
                    let addSubwayDetailsStopsResult = await conn.query(addSubwayDetailsStopsQuery, [addSubwayDetailResult.insertId, addSubwayStopsResult.insertId]);
                }
                await conn.query(addPathsDetailsQuery, [pathIdx, addSubwayDetailResult.insertId]);
            })
        }
    },
    addSchedulesNotices: async (scheduleIdx, arriveTime, noticeTime) => {
        const addSchedulesNoticesQuery = 'INSERT INTO schedulesNotices (scheduleIdx, arriveTime, noticeTime) VALUES (?,?,?)';
        return await pool.queryParam_Arr(addSchedulesNoticesQuery, [scheduleIdx, arriveTime, noticeTime])
            .catch((err) => {
                console.log('addSchedulesNotices err : ' + err);

            })
    },
    addUsersSchedules: async (userIdx, scheduleIdx) => { //RT
        const addUsersSchedulesQuery = 'INSERT INTO usersSchedules (userIdx, scheduleIdx) VALUES (?,?)';
        return await pool.queryParam_Arr(addUsersSchedulesQuery, [userIdx, scheduleIdx])
            .catch((err) => {
                console.log('addUsersSchedules err : ' + err);

            })
    },
    addSchedulesPaths: async (scheduleIdx, pathIdx) => {
        const addSchedulesPathsQuery = 'INSERT INTO schedulesPaths (scheduleIdx, pathIdx) VALUES (?,?)'; //RT
        return await pool.queryParam_Arr(addSchedulesPathsQuery, [scheduleIdx, pathIdx])
            .catch((err) => {
                console.log('addPaths err : ' + err);

            })
    },

    addWeekdays: async (weekdayNum, scheduleIdx) => {
        const addWeekdaysQuery = 'INSERT INTO weekdays (weekdayNum, scheduleIdx) VALUES (?,?)';
        return await pool.queryParam_Arr(addWeekdaysQuery, [weekdayNum, scheduleIdx])
            .catch((err) => {
                console.log('addWeekdays err : ' + err);

            })
    },
    deleteSchedule: async (scheduleIdx) => {
        const deleteStopsQuery = `DELETE FROM stops WHERE stops.stopIdx IN ( 
            SELECT detailsStops.stopIdx FROM detailsStops WHERE detailsStops.detailIdx IN ( 
                SELECT detailIdx FROM pathsDetails WHERE pathsDetails.pathIdx IN (
                    SELECT scheduleIdx FROM schedulesPaths WHERE scheduleIdx = ? ) ) )`;
        const deleteDetailsStopsQuery = `DELETE FROM detailsStops WHERE detailsStops.detailIdx IN ( 
            SELECT pathsDetails.detailIdx FROM pathsDetails WHERE pathsDetails.pathIdx IN (
                SELECT pathIdx FROM schedulesPaths WHERE schedulesPaths.scheduleIdx = ?) )`;
        const deleteDetailQuery = `DELETE FROM details WHERE details.detailIdx IN (
            SELECT pathsDetails.detailIdx FROM pathsDetails WHERE pathsDetails.pathIdx IN (
                SELECT pathIdx FROM schedulesPaths WHERE schedulesPaths.scheduleIdx = ?) )`;
        const deletePathsDetailsQuery = `DELETE FROM pathsDetails WHERE pathsDetails.pathIdx IN (
            SELECT pathIdx FROM schedulesPaths WHERE schedulesPaths.scheduleIdx = ?)`;
        const deletePathsQuery = `DELETE FROM paths WHERE paths.pathIdx IN (
            SELECT pathIdx FROM schedulesPaths WHERE schedulesPaths.scheduleIdx = ?)`;
        const deleteSchedulesPathQuery = `DELETE FROM paths WHERE paths.pathIdx IN (
            SELECT pathIdx FROM schedulesPaths WHERE schedulesPaths.scheduleIdx = ?)`;
        const deleteSchedulesNoticesQuery = `DELETE FROM paths WHERE paths.pathIdx IN (
            SELECT pathIdx FROM schedulesPaths WHERE schedulesPaths.scheduleIdx = ?)`;
        const deleteWeekdaysQuery = `DELETE FROM weekdays WHERE weekdays.scheduleIdx IN (
            SELECT scheduleIdx FROM schedules WHERE schedules.scheduleIdx = ?)`;
        const deleteSchedulesQuery = `DELETE FROM schedules WHERE scheduleIdx = ?`;
        const deleteUserSchedulesQuery = `SELECT * FROM usersSchedules WHERE scheduleIdx = ?`;
        const queryResult = [];
        return await pool.Transaction(async (connection) => {
            queryResult.push(await connection.query(deleteStopsQuery, scheduleIdx));
            queryResult.push(await connection.query(deleteDetailsStopsQuery, scheduleIdx));
            queryResult.push(await connection.query(deleteDetailQuery, scheduleIdx));
            queryResult.push(await connection.query(deletePathsDetailsQuery, scheduleIdx));
            queryResult.push(await connection.query(deletePathsQuery, scheduleIdx));
            queryResult.push(await connection.query(deleteSchedulesPathQuery, scheduleIdx));
            queryResult.push(await connection.query(deleteSchedulesNoticesQuery, scheduleIdx));
            queryResult.push(await connection.query(deleteWeekdaysQuery, scheduleIdx));
            queryResult.push(await connection.query(deleteSchedulesQuery, scheduleIdx));
            queryResult.push(await connection.query(deleteUserSchedulesQuery, scheduleIdx));
        }).then(async (result) => {
            return queryResult;
        }).catch((err) => {
            console.log('delete err : ' + err);
            throw err;
        })
    },
    updateSchedule: async (scheduleIdx) => {

    },
    getSchedules: async (scheduleIdx) => {
        const getSchedulesQuery = `SELECT * FROM schedules LEFT JOIN schedulesPaths ON schedules.scheduleIdx = schedulesPaths.scheduleIdx
        LEFT JOIN paths ON paths.pathIdx = schedulesPaths.pathIdx WHERE schedules.scheduleIdx = ?`;
        return await pool.queryParam_Arr(getSchedulesQuery, [scheduleIdx])
            .catch((err) => {
                console.log('getSchedulesQuery err : ' + err);
            })
    }
}