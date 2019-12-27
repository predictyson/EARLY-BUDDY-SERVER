const odsayAPI = require('../module/odsayAPI');
const ak = require('../config/appkey');
const resUtil = require('../module/responseUtil');
const resMsg = require('../module/resMsg');
const statCode = require('../module/statusCode');
const pool = require('../module/pool');

module.exports = {
    addSchedule : async (scheduleName, scheduleStartTime, startAddress, startLongitude, startLatitude, endAddress, endLongitude, endLatitude) => {
        const addScheduleQuery = 'INSERT INTO schedules (scheduleName, scheduleStartTime, startAddress, startLongitude, startLatitude, endAddress, endLongitude, endLatitude) VALUES (?,?,?,?,?,?,?,?)';
        return await pool.queryParam_Arr(addScheduleQuery, [scheduleName, scheduleStartTime, startAddress, startLongitude, startLatitude, endAddress, endLongitude, endLatitude])
        .catch((err)=>{
            console.log('addUsersSchedules err : ' + err);
            
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
    addPaths : async (pathType, totalTime, totalPay) => {
        const addPathsQuery = 'INSERT INTO paths (pathType, totalTime, totalPay) VALUES (?,?,?)';
        return await pool.queryParam_Arr(addPathsQuery, [pathType, totalTime, totalPay])
        .catch((err)=> {
            console.log('addPaths err : ' + err);
            
        })
    },
    addSchedulesPaths : async (scheduleIdx, pathIdx) => {
        const addSchedulesPathsQuery = 'INSERT INTO schedulesPaths (scheduleIdx, pathIdx) VALUES (?,?)'; //RT
        return await pool.queryParam_Arr(addSchedulesPathsQuery, [scheduleIdx, pathIdx])
        .catch((err)=> {
            console.log('addPaths err : ' + err);
            
        })
    },
    addPathsDetails : async (pathIdx, detailIdx) => {
        const addPathsDetailsQuery = 'INSERT INTO pathsDetails (pathIdx, detailIdx) VALUES (?,?)';//RT
        return await pool.queryParam_Arr(addPathsDetailsQuery, [pathIdx, detailIdx])
        .catch((err)=> {
            console.log('addPathsDetail err : ' + err);
            
        })
    },
    addWeekdays : async (weekdayNum, scheduleIdx) => {
        const addWeekdaysQuery = 'INSERT INTO weekdays (weekdayNum, scheduleIdx) VALUES (?,?)';
        return await pool.queryParam_Arr(addWeekdaysQuery, [weekdayNum, scheduleIdx])
        .catch((err)=> {
            console.log('addWeekdays err : ' + err);
            
        })
    },
    addWalkDetail : async (trafficType ,distance, sectionTime) => {
        const addWalkDetailQuery = 'INSERT INTO details (trafficType, distance, sectionTime) VALUES (?,?,?)'; //walk = 3 subway = 1, bus = 2
        return await pool.queryParam_Arr(addWalkDetailQuery, [trafficType, distance, sectionTime])
        .catch((err)=> {
            console.log('addWalkDetail err : ' + err);
        })
    },
    addSubwayDetail : async(trafficType, distance, sectionTime, stationCount, subwayLane, detailStartAddress, detailStartLongitude, detailStartLatitude, detailEndAddress, detailEndLongitude, detailEndLatitude)=> {
        const addSubwayDetailQuery = 'INSERT INTO details (trafficType, distance, sectionTime, stationCount, subwayLane, detailStartAddress, detailStartLongitude, detailStartLatitude, detailEndAddress, detailEndLongitude, detailEndLatitude) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
        return await pool.queryParam_Arr(addSubwayDetailQuery, [trafficType, distance, sectionTime, stationCount, subwayLane, detailStartAddress, detailStartLongitude, detailStartLatitude, detailEndAddress, detailEndLongitude, detailEndLatitude])
        .catch((err)=>{
            console.log('addSubwayDetail err : ' + err);
        })

    },
    addSubwayDetailsStops : async (detailIdx, stopIdx) => {
        const addSubwayDetailsStopsQuery = 'INSERT INTO detailsStops (detailIdx, stopIdx) VALUES (?,?)';//RT
        return await pool.queryParam_Arr(addSubwayDetailsStopsQuery, [detailIdx, stopIdx])
        .catch((err)=>{
            console.log('addSubwaydetailsStops err : ' + err);
            
        })
    },
    addSubwayStops : async (stopName) => {
        const addSubwayStopsQuery = 'INSERT INTO stops (stopName) VALUES (?)';
        return await pool.queryParam_Arr(addSubwayStopsQuery, [stopName])
        .catch((err)=>{
            console.log('addSubwayStops err : ' + err);
            
        })
    }
    ,
    addBusDetail : async(trafficType, distance, sectionTime, stationCount, detailStartAddress, detailStartLongitude, detailStartLatitude, detailEndAddress, detailEndLongitude, detailEndLatitude, busNo)=>{
        const addBusDetailQuery = 'INSERT INTO details (trafficType, distance, sectionTime, stationCount, detailStartAddress, detailStartLongitude, detailStartLatitude, detailEndAddress, detailEndLongitude, detailEndLatitude, busNo) VALUES (?,?,?,?,?,?,?,?,?,?,?)'; 
        return await pool.queryParam_Arr(addBusDetailQuery, [trafficType, distance, sectionTime, stationCount, detailStartAddress, detailStartLongitude, detailStartLatitude, detailEndAddress, detailEndLongitude, detailEndLatitude, busNo])
        .catch((err)=>{
            console.log('addBusDetail err : ' + err);
            
        })
    },
    addBusDetailsStops : async (detailIdx, stopIdx)=> {
        const addBusDetailsStopsQuery = 'INSERT INTO detailsStops (detailIdx, stopIdx) VALUES (?,?)';//RT
        return await pool.queryParam_Arr(addBusDetailsStopsQuery, [detailIdx, stopIdx])
        .catch((err)=>{
            console.log('addBusdetailsStops err : ' + err);
            
        })
    },
    addBusStops : async (stopName) => {
        const addBusStopsQuery = 'INSERT INTO stops (stopName) VALUES (?)';
        return await pool.queryParam_Arr(addBusStopsQuery, [stopName])
        .catch((err)=>{
            console.log('addBusStops err : ' + err);
            
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
        //make develop
        //make feature
    }
}