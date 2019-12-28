
const resUtil = require('../module/responseUtil');
const resMsg = require('../module/resMsg');
const statCode = require('../module/statusCode');
const pool = require('../module/pool');
const schedules = require('../models/schedulesModel');
var moment = require('moment');


module.exports = {
    addSchedule: async (req, res) => {
        let body = req.body;
        let subPath = body.path.subPath;
        let startYear = Number(body.scheduleStartTime.split(' ')[0].split('-')[0]);
        let startMonth = Number(body.scheduleStartTime.split(' ')[0].split('-')[1]);
        let startDay = Number(body.scheduleStartTime.split(' ')[0].split('-')[2]);
        let startHour = Number(body.scheduleStartTime.split(' ')[1].split(':')[0]);
        let startMin = Number(body.scheduleStartTime.split(' ')[1].split(':')[1]);
        //let addPathsResult = await schedules.addPaths(body.path.pathType, body.path.totalTime, body.path.totalPay, body.path.totalWalkTime, body.path.transitCount);
        for (var i = 0; i < subPath.length; i++) {
            if (subPath[i].trafficType === 3) { //도보 
                // let addWalkDetailResult = await schedules.addWalkDetail(3, subPath[i].distance, subPath[i].sectionTime);
                // await schedules.addPathsDetails(addPathsResult.insertId, addWalkDetailResult.insertId);
            }
            else if (subPath[i].trafficType === 2) { //버스
                let result = await schedules.getBusArriveTime(105237, 500, 10);
                //let addBusDetailResult = await schedules.addBusDetail(2, subPath[i].distance, subPath[i].sectionTime, subPath[i].stationCount, subPath[i].startName, subPath[i].startX, subPath[i].startY, subPath[i].endName, subPath[i].endX, subPath[i].endY, subPath[i].lane[0].busNo, subPath[i].lane[0].type);
                // for (var j = 0; j < subPath[i].passStopList.stations.length; j++) {
                //     let addBusStopsResult = await schedules.addBusStops(subPath[i].passStopList.stations[j].stationName);
                //     let addBusDetailsStopsResult = await schedules.addBusDetailsStops(addBusDetailResult.insertId, addBusStopsResult.insertId);
                // }
                // await schedules.addPathsDetails(addPathsResult.insertId, addBusDetailResult.insertId);
            }
            else { //지하철
                // const getSubwayArriveTimeResult = await schedules.getSubwayArriveTime(subPath[i].passStopList.stations[0].stationID, subPath[i].wayCode);
                // let timeArray = getSubwayArriveTimeResult.OrdList.up.time;
                // for (var i = 0; i < timeArray.length; i++) {
                //     if (timeArray[i].Idx == startHour) {
                //         let minArr = timeArray[i].list.split(' ');
                //         for (var j = 0; j < minArr.length; j++) {
                //             if (startMin < Number(minArr[j].split('(')[0])) {
                //                 let arriveTime = (moment().year(startYear).month(startMonth).date(startDay).hour(startHour).minute(Number(minArr[j].split('(')[0])).format('YYYY-MM-DD HH:mm:ss'));
                //                 //await schedules.addSchedulesNotices(addScheduleResult.insertId, arriveTime);
                //                 body.arriveCount--;
                //             }
                //             if (body.arriveCount == 0) {
                //                 break;
                //             }
                //         }
                //     }
                // } //시간 작업

                // let addSubwayDetailResult = await schedules.addSubwayDetail(1, subPath[i].distance, subPath[i].sectionTime, subPath[i].stationCount, subPath[i].lane[0].subwayCode, subPath[i].startName, subPath[i].startX, subPath[i].startY, subPath[i].endName, subPath[i].endX, subPath[i].endY)
                // for (var l = 0; l < subPath[i].passStopList.stations.length; l++) {
                //     let addSubwayStopsResult = await schedules.addSubwayStops(subPath[i].passStopList.stations[l].stationName);
                //     let addSubwayDetailStopsResult = await schedules.addSubwayDetailsStops(addSubwayDetailResult.insertId, addSubwayStopsResult.insertId);
                // }
                // await schedules.addPathsDetails(addPathsResult.insertId, addSubwayDetailResult.insertId);
            }
        } //stops ~ paths 추가
        //let addScheduleResult = await schedules.addSchedule(body.scheduleName, body.scheduleStartTime, body.startAddress, body.startLongitude, body.startLatitude, body.endAddress, body.endLongitude, body.endLatitude);
        // if (body.weekdays !== undefined) {
        //     for (var i = 0; i < body.weekdays.length; i++) {
        //         await schedules.addWeekdays(body.weekdays[i], addScheduleResult.insertId);
        //     }
        // }
        // // for (var j = 0; j < body.arriveTimes.length; j++) {
        // //     await schedules.addSchedulesNotices(addScheduleResult.insertId, body.arriveTimes[j], body.noticeTimes[j]);
        // // }
        // let addUsersSchedulesResult = await schedules.addUsersSchedules(body.userIdx, addScheduleResult.insertId);
        // let addSchedulesPathsResult = await schedules.addSchedulesPaths(addScheduleResult.insertId, addPathsResult.insertId);
        console.log('add schedule complete!');
        res.status(statCode.OK).send(resUtil.successTrue(resMsg.ADD_SCHEDULE_SUCCESS));
    },
    deleteSchedule: async (req, res) => {

    },
    updateSchedule: async (req, res) => {

    },
    getSchedule: async (req, res) => {

    }
}