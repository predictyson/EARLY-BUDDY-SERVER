
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
        let startTime = [startYear,startMonth,startDay,startHour,startMin];
        let isBusFirst = 0;
        let isSubwayFirst = 0;
        let addScheduleResult = await schedules.addSchedule(body.scheduleName, body.scheduleStartTime, body.startAddress, body.startLongitude, body.startLatitude, body.endAddress, body.endLongitude, body.endLatitude);
        let addPathsResult = await schedules.addPaths(body.path.pathType, body.path.totalTime, body.path.totalPay, body.path.totalWalkTime, body.path.transitCount);
        for (var i = 0; i < subPath.length; i++) {
            if(subPath[1].trafficType === 1) {
                isSubwayFirst = 1;
            }
            else {
                isBusFirst = 1;
            }
            if (subPath[i].trafficType === 3) { //도보 
                await schedules.addWalk(3, subPath[i].distance, subPath[i].sectionTime, addPathsResult.insertId);
            }
            else if (subPath[i].trafficType === 2) { //버스
                let stopArray = subPath[i].passStopList.stations;
                await schedules.addBus(2, subPath[i].distance, subPath[i].sectionTime, subPath[i].stationCount, subPath[i].startName, subPath[i].startX, subPath[i].startY, subPath[i].endName, subPath[i].endX, subPath[i].endY, subPath[i].lane[0].busNo, subPath[i].lane[0].type, stopArray, addPathsResult.insertId, startTime, addScheduleResult.insertId, body.noticeMin, body.arriveCount, isBusFirst);
            }
            else { //지하철
                stopArray = subPath[i].passStopList.stations; 
                await schedules.addSubway(1, subPath[i].distance, subPath[i].sectionTime, subPath[i].stationCount, subPath[i].lane[0].subwayCode,subPath[i].startName, subPath[i].startX, subPath[i].startY, subPath[i].endName, subPath[i].endX, subPath[i].endY, stopArray,addPathsResult.insertId, stopArray[0].stationID, subPath[i].wayCode, startTime, addScheduleResult.insertId, body.noticeMin, body.arriveCount, isSubwayFirst);
            }
        } //stops ~ paths 추가
        if (body.weekdays !== undefined) {
            for (var i = 0; i < body.weekdays.length; i++) {
                await schedules.addWeekdays(body.weekdays[i], addScheduleResult.insertId);
            }
        }
        await schedules.addUsersSchedules(body.userIdx, addScheduleResult.insertId);
        await schedules.addSchedulesPaths(addScheduleResult.insertId, addPathsResult.insertId);
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