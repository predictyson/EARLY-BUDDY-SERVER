const resUtil = require('../module/responseUtil');
const resMsg = require('../module/resMsg');
const statCode = require('../module/statusCode');
const pool = require('../module/pool');
const schedules = require('../models/schedulesModel');
var moment = require('moment');
const alarm = require('../module/alarm');

module.exports = {
    addSchedule: async (req, res) => {
        let body = req.body;
        let subPath = body.path.subPath;
        let startYear = Number(body.scheduleStartTime.split(' ')[0].split('-')[0]);
        let startMonth = Number(body.scheduleStartTime.split(' ')[0].split('-')[1]);
        let startDay = Number(body.scheduleStartTime.split(' ')[0].split('-')[2]);
        let startHour = Number(body.scheduleStartTime.split(' ')[1].split(':')[0]);
        let startMin = Number(body.scheduleStartTime.split(' ')[1].split(':')[1]);
        let startTime = [startYear, startMonth, startDay, startHour, startMin];
        let isBusFirst = 0;
        let isSubwayFirst = 0;
        try {
            let addScheduleResult = await schedules.addSchedule(body.scheduleName, body.scheduleStartTime, body.startAddress, body.startLongitude, body.startLatitude, body.endAddress, body.endLongitude, body.endLatitude);
            let addPathsResult = await schedules.addPaths(body.path.pathType, body.path.totalTime, body.path.totalPay, body.path.totalWalkTime, body.path.transitCount);
            
            for (var i = 0; i < subPath.length; i++) {
                if (subPath[i].trafficType === 1) {
                    let stopArray = subPath[i].passStopList.stations;
                    if (i !== 1) {
                        let addSubwayResult = await schedules.addSubway(1, subPath[i].distance, subPath[i].sectionTime, subPath[i].stationCount, subPath[i].lane[0].subwayCode, subPath[i].startName, subPath[i].startX, subPath[i].startY, subPath[i].endName, subPath[i].endX, subPath[i].endY, stopArray, addPathsResult.insertId, stopArray[0].stationID, subPath[i].wayCode, startTime, addScheduleResult.insertId, body.noticeMin, body.arriveCount, isSubwayFirst);
                        if (addSubwayResult != true) {
                            throw ({ code: addSubwayResult.code, json: addSubwayResult.json });
                        }
                        else {
                            console.log('지하철 경로 추가 완료')
                        }
                    }
                    else {
                        isSubwayFirst = 1;
                        let addSubwayResult = await schedules.addSubway(1, subPath[i].distance, subPath[i].sectionTime, subPath[i].stationCount, subPath[i].lane[0].subwayCode, subPath[i].startName, subPath[i].startX, subPath[i].startY, subPath[i].endName, subPath[i].endX, subPath[i].endY, stopArray, addPathsResult.insertId, stopArray[0].stationID, subPath[i].wayCode, startTime, addScheduleResult.insertId, body.noticeMin, body.arriveCount, isSubwayFirst);
                        if (addSubwayResult != true) {
                            throw ({ code: addSubwayResult.code, json: addSubwayResult.json });
                        }
                        console.log('지하철 경로+알림 추가 완료')
                    }
                }
                else if (subPath[i].trafficType === 2) {
                    let stopArray = subPath[i].passStopList.stations;
                    if (i !== 1) {
                        let addBusResult = await schedules.addBus(2, subPath[i].distance, subPath[i].sectionTime, subPath[i].stationCount, subPath[i].startName, subPath[i].startX, subPath[i].startY, subPath[i].endName, subPath[i].endX, subPath[i].endY, subPath[i].lane[0].busNo, subPath[i].lane[0].type, stopArray, addPathsResult.insertId, startTime, addScheduleResult.insertId, body.noticeMin, body.arriveCount, isBusFirst);
                        if (addBusResult != true) {
                            throw ({ code: addBusResult.code, json: addBusResult.json });
                        }
                        else {
                            console.log('버스 경로 추가 완료')
                        }
                        
                    }
                    else {
                        isBusFirst = 1;
                        let addBusResult = await schedules.addBus(2, subPath[i].distance, subPath[i].sectionTime, subPath[i].stationCount, subPath[i].startName, subPath[i].startX, subPath[i].startY, subPath[i].endName, subPath[i].endX, subPath[i].endY, subPath[i].lane[0].busNo, subPath[i].lane[0].type, stopArray, addPathsResult.insertId, startTime, addScheduleResult.insertId, body.noticeMin, body.arriveCount, isBusFirst);
                        if (addBusResult != true) {
                            throw ({ code: addBusResult.code, json: addBusResult.json });
                        }
                        else {
                            console.log('버스 경로+알림 추가 완료')
                        }
                    }
                }
                else {
                    let addWalkResult = await schedules.addWalk(3, subPath[i].distance, subPath[i].sectionTime, addPathsResult.insertId);
                    if (addWalkResult != true) {
                        throw ({ code: addWalkResult.code, json: addWalkResult.json });
                    }
                    console.log('걷기 경로 추가 완료')
                }
            } //stops ~ paths 추가
            if (body.weekdays !== undefined) {
                for (var i = 0; i < body.weekdays.length; i++) {
                    await schedules.addWeekdays(body.weekdays[i], addScheduleResult.insertId);
                }
            }
            await schedules.addUsersSchedules(body.userIdx, addScheduleResult.insertId);
            await schedules.addSchedulesPaths(addScheduleResult.insertId, addPathsResult.insertId);
            const deviceToken = await schedules.getDeviceToken(body.userIdx);
            // noticeTime = moment(arriveArr[(arriveArr.length) - l]).subtract(noticeMin, 'minutes').format('YYYY-MM-DD HH:mm:ss')
            // alarm.setSchedule(deviceToken, );
            res.status(statCode.OK).send(resUtil.successTrue(resMsg.ADD_SCHEDULE_SUCCESS));
        }
        catch (exception) {
            console.log(exception);
            res.status(exception.code).send(exception.json);
        }
    },
    getSchedule: async (req, res) => {
        let scheduleIdx = req.query.scheduleIdx;
        if (!scheduleIdx) {
            return res.status(statCode.BAD_REQUEST).send(resUtil.successFalse('scheduleIdx에 해당하는 ' + resMsg.NULL_VALUE + '. 쿼리를 입력해주세요.'));
        }
        let getSchedulesResult = await schedules.getSchedules(scheduleIdx);
        console.log('get schedule complete!');
        if (getSchedulesResult.length == 0) {
            return res.status(statCode.BAD_REQUEST).send(resUtil.successFalse('scheduleIdx에 해당하는 ' + resMsg.INVALID_VALUE + ' scheduleIdx값을 확인해주세요.'));
        }
        res.status(statCode.OK).send(resUtil.successTrue(resMsg.GET_SCHEDULE_SUCCESS, getSchedulesResult));
    },
    deleteSchedule: async (req, res) => {
        let scheduleIdx = req.query.scheduleIdx;
        if (!scheduleIdx) {
            return res.status(statCode.BAD_REQUEST).send(resUtil.successFalse('scheduleIdx에 해당하는 ' + resMsg.NULL_VALUE + '. 쿼리를 입력해주세요.'));
        }
        const result = await schedules.deleteSchedule(scheduleIdx);
        console.log('delete schedule complete!');
        if (result[0].affectedRows == 0) {
            res.status(statCode.BAD_REQUEST).send(resUtil.successFalse(resMsg.NO_CHANGE));
        } else {
            res.status(statCode.OK).send(resUtil.successTrue(resMsg.DELETE_SCHEDULE_SUCCESS));
        }
    },
    updateSchedule: async (req, res) => {
        let scheduleIdx = req.query.scheduleIdx;
        if (!scheduleIdx) {
            return res.status(statCode.BAD_REQUEST).send(resUtil.successFalse('scheduleIdx에 해당하는 ' + resMsg.NULL_VALUE + '. 쿼리를 입력해주세요.'));
        }
        let getSchedulesResult = await schedules.getSchedules(scheduleIdx);
        console.log('get schedule complete!');
        if (getSchedulesResult.length == 0) {
            return res.status(statCode.BAD_REQUEST).send(resUtil.successFalse('scheduleIdx에 해당하는 ' + resMsg.INVALID_VALUE + ' scheduleIdx값을 확인해주세요.'));
        }
        // add 코드 -> return insertId
        // delete 코드
        // delete 에서 에러 나면 add 해서 반환한 idx 찾아 삭제하기
    }
}