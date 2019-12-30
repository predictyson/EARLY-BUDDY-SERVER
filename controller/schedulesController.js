const resUtil = require('../module/responseUtil');
const resMsg = require('../module/resMsg');
const statCode = require('../module/statusCode');
const pool = require('../module/pool');
const schedules = require('../models/schedulesModel');

module.exports = {
    addSchedule: async (req, res) => {
        let body = req.body;
        let subPath = body.path.subPath;

        let addPathsResult = await schedules.addPaths(body.path.pathType, body.path.totalTime, body.path.totalPay);
        for (var i = 0; i < subPath.length; i++) {
            if (subPath[i].trafficType === 3) { //도보
                let addWalkDetailResult = await schedules.addWalkDetail(3, subPath[i].distance, subPath[i].sectionTime);
                await schedules.addPathsDetails(addPathsResult.insertId, addWalkDetailResult.insertId);
            }
            else if (subPath[i].trafficType === 2) { //버스
                let addBusDetailResult = await schedules.addBusDetail(2, subPath[i].distance, subPath[i].sectionTime, subPath[i].stationCount, subPath[i].startName, subPath[i].startX, subPath[i].startY, subPath[i].endName, subPath[i].endX, subPath[i].endY, subPath[i].lane[0].busNo);
                for (var j = 0; j < subPath[i].passStopList.stations.length; j++) {
                    let addBusStopsResult = await schedules.addBusStops(subPath[i].passStopList.stations[j].stationName);
                    let addBusDetailsStopsResult = await schedules.addBusDetailsStops(addBusDetailResult.insertId, addBusStopsResult.insertId);
                }
                await schedules.addPathsDetails(addPathsResult.insertId, addBusDetailResult.insertId);
            }
            else { //지하철
                let addSubwayDetailResult = await schedules.addSubwayDetail(1, subPath[i].distance, subPath[i].sectionTime, subPath[i].stationCount, subPath[i].lane[0].subwayCode, subPath[i].startName, subPath[i].startX, subPath[i].startY, subPath[i].endName, subPath[i].endX, subPath[i].endY)
                for (var l = 0; l < subPath[i].passStopList.stations.length; l++) {
                    let addSubwayStopsResult = await schedules.addSubwayStops(subPath[i].passStopList.stations[l].stationName);
                    let addSubwayDetailStopsResult = await schedules.addSubwayDetailsStops(addSubwayDetailResult.insertId, addSubwayStopsResult.insertId);
                }
                await schedules.addPathsDetails(addPathsResult.insertId, addSubwayDetailResult.insertId);
            }
        } //stops ~ paths 추가
        let addScheduleResult = await schedules.addSchedule(body.scheduleName, body.scheduleStartTime, body.startAddress, body.startLongitude, body.startLatitude, body.endAddress, body.endLongitude, body.endLatitude);
        if (body.weekdays !== undefined) {
            for (var i = 0; i < body.weekdays.length; i++) {
                await schedules.addWeekdays(body.weekdays[i], addScheduleResult.insertId);
            }
        }
        for (var j = 0; j < body.arriveTimes.length; j++) {
            await schedules.addSchedulesNotices(addScheduleResult.insertId, body.arriveTimes[j], body.noticeTimes[j]);
        }
        let addUsersSchedulesResult = await schedules.addUsersSchedules(body.userIdx, addScheduleResult.insertId);
        let addSchedulesPathsResult = await schedules.addSchedulesPaths(addScheduleResult.insertId, addPathsResult.insertId);
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