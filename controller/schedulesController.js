const resUtil = require('../module/responseUtil');
const resMsg = require('../module/resMsg');
const statCode = require('../module/statusCode');
const pool = require('../module/pool');
const schedules = require('../models/schedulesModel');

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
            if(i !== 1) {
                if(subPath[i].trafficType === 1) {
                    isSubwayFirst = 1;
                    stopArray = subPath[1].passStopList.stations; 
                    await schedules.addSubway(1, subPath[i].distance, subPath[i].sectionTime, subPath[i].stationCount, subPath[i].lane[0].subwayCode,subPath[i].startName, subPath[i].startX, subPath[i].startY, subPath[i].endName, subPath[i].endX, subPath[i].endY, stopArray,addPathsResult.insertId, stopArray[0].stationID, subPath[i].wayCode, startTime, addScheduleResult.insertId, body.noticeMin, body.arriveCount, isSubwayFirst);
                    continue;
                }
                else if (subPath[i].trafficType === 2){
                    isBusFirst = 1;
                    let stopArray = subPath[1].passStopList.stations;
                    await schedules.addBus(2, subPath[i].distance, subPath[i].sectionTime, subPath[i].stationCount, subPath[i].startName, subPath[i].startX, subPath[i].startY, subPath[i].endName, subPath[i].endX, subPath[i].endY, subPath[i].lane[0].busNo, subPath[i].lane[0].type, stopArray, addPathsResult.insertId, startTime, addScheduleResult.insertId, body.noticeMin, body.arriveCount, isBusFirst);
                    continue;
                }
                else {
                    await schedules.addWalk(3, subPath[i].distance, subPath[i].sectionTime, addPathsResult.insertId);
                    continue;
                }
            }
            else {
                if (subPath[i].trafficType === 3) { //도보 
                    await schedules.addWalk(3, subPath[i].distance, subPath[i].sectionTime, addPathsResult.insertId);
                }
                if (subPath[i].trafficType === 2) { //버스
                    let stopArray = subPath[i].passStopList.stations;
                    await schedules.addBus(2, subPath[i].distance, subPath[i].sectionTime, subPath[i].stationCount, subPath[i].startName, subPath[i].startX, subPath[i].startY, subPath[i].endName, subPath[i].endX, subPath[i].endY, subPath[i].lane[0].busNo, subPath[i].lane[0].type, stopArray, addPathsResult.insertId, startTime, addScheduleResult.insertId, body.noticeMin, body.arriveCount, 0);
                }
                else { //지하철
                    stopArray = subPath[i].passStopList.stations; 
                    await schedules.addSubway(1, subPath[i].distance, subPath[i].sectionTime, subPath[i].stationCount, subPath[i].lane[0].subwayCode,subPath[i].startName, subPath[i].startX, subPath[i].startY, subPath[i].endName, subPath[i].endX, subPath[i].endY, stopArray,addPathsResult.insertId, stopArray[0].stationID, subPath[i].wayCode, startTime, addScheduleResult.insertId, body.noticeMin, body.arriveCount, 0);
                }
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
    getSchedule: async (req, res) => {
        let scheduleIdx = req.query.scheduleIdx;
        if (!scheduleIdx){
            return res.status(statCode.BAD_REQUEST).send(resUtil.successFalse('scheduleIdx에 해당하는 '+resMsg.NULL_VALUE+'. 쿼리를 입력해주세요.'));
        }
        let getSchedulesResult = await schedules.getSchedules(scheduleIdx);
        console.log('get schedule complete!');
        if (getSchedulesResult.length == 0) {
            return res.status(statCode.BAD_REQUEST).send(resUtil.successFalse('scheduleIdx에 해당하는 '+resMsg.INVALID_VALUE+' scheduleIdx값을 확인해주세요.'));
        }
        res.status(statCode.OK).send(resUtil.successTrue(resMsg.GET_SCHEDULE_SUCCESS, getSchedulesResult));
    },
    deleteSchedule: async (req, res) => {
        let scheduleIdx = req.query.scheduleIdx;
        if (!scheduleIdx) {
            return res.status(statCode.BAD_REQUEST).send(resUtil.successFalse('scheduleIdx에 해당하는 '+resMsg.NULL_VALUE+'. 쿼리를 입력해주세요.'));
        }
        const result = await schedules.deleteSchedule(scheduleIdx);
        console.log('delete schedule complete!');
        if (result[0].affectedRows == 0 ){
            res.status(statCode.BAD_REQUEST).send(resUtil.successFalse(resMsg.NO_CHANGE));
        } else {
            res.status(statCode.OK).send(resUtil.successTrue(resMsg.DELETE_SCHEDULE_SUCCESS));
        }
    },
    updateSchedule: async (req, res) => {
        let scheduleIdx = req.query.scheduleIdx;
        if (!scheduleIdx){
            return res.status(statCode.BAD_REQUEST).send(resUtil.successFalse('scheduleIdx에 해당하는 '+resMsg.NULL_VALUE+'. 쿼리를 입력해주세요.'));
        }
         

    }
}