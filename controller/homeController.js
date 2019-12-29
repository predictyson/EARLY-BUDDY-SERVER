const resUtil = require('../module/responseUtil');
const resMsg = require('../module/resMsg');
const statusCode = require('../module/statusCode');
const schedules = require('../models/homeModel');

module.exports = {
    getHomeSchedule: async(req, res) => {
        let userIdx = req.query.userIdx;
        if(!userIdx){
            res.status(statusCode.BAD_REQUEST).send(resUtil.successFalse(resMsg.NULL_VALUE));
        }else{
            /** logic **
             * 보여줄 스케쥴 받아오기
             * 1. 스케쥴 startTime이 현재 시간보다 뒤에 있는 스케쥴 한개 가져오기
             *      - 없으면 return 값이 null (CHECK)
             *      - 있으면 return 값이 있음
             * 2. 1-2인 경우에, 스케쥴 startTime이 
             *      - 오늘이 아니면 ready = false로 설정하고, scheduleName, scheduleStartTime, endAddress, idx return (CHECK)
             *      - 오늘이면 해당 스케쥴에 달린 scheduleNotices의 noticeTime 값에 가져오기 (CHECK)
             * 3. 2-2 시간이,
             *      - 아직 지나지 않았으면, ready = false로 설정하고, scheduleName, scheduleStartTime, endAddress, idx return (CHECK)
             *      - 같거나 지났으면, ready = true로 설정하고, 아래와 같은 데이터를 return
             *          => 몇대 남았는지: scheduleNotices의 arriveTime 과 현재 시간으로 계산
             *          => 버스 도착 시간: scheduleNotices - arriveTime
             *          => details[1] (1로 fix 박거나 trafficType이 보도가 아닌 것) - trafficType, subwayLane || busNo, detailStartAddress
             *          => schedules - scheduleName, scheduleStartTime, endAddress, idx
             */

            // 현재시간
            var moment = require('moment');
            require('moment-timezone');
            moment.tz.setDefault("Asia/Seoul");
            console.log(moment().format('YYYY-MM-DD HH:mm:ss'));

            // user에게 할당된 스케쥴 받아오기
            var userSchedule = await schedules.getUserSchedules(userIdx, moment);
            var scheduleIdx;
            for(let i = 0; i<userSchedule.length; i++){
                let scheduleDate = new Date(userSchedule[i].scheduleStartTime);
                var currentDate = new Date(moment().format('YYYY-MM-DD HH:mm:ss'))
                var gap = scheduleDate.getTime() - currentDate.getTime();
                if(gap > 0){
                    scheduleIdx = userSchedule[i].scheduleIdx;
                    break;
                }
            }

            if(scheduleIdx == userSchedule.length)
                res.status(statusCode.OK).send(resUtil.successTrue(resMsg.GET_HOME_SCHEDULE_SUCCESS, null));
            else{
                var scheduleSummary = await schedules.getScheduleSummary(scheduleIdx);
                var scheduleNotice = await schedules.getScheduleNotice(scheduleIdx);
                var scheduleNoticeNum = scheduleNotice.length;
            
                
                for(var transCount = 0; transCount < scheduleNoticeNum; transCount++){
                    if(currentDate.getTime() - scheduleNotice[transCount].noticeTime > 0) break;
                }

                var currentTransIdx = scheduleNoticeNum - transCount - 1;
                if(transCount == scheduleNoticeNum)
                    currentTransIdx = transCount -1;
                
                    // notice 시간보다 더 전이면 ready는 false, schedule summary return 
                if(gap/1000/60/60 > 40 || transCount < 0){
                    var scheduleSummaryData = scheduleSummary[currentTransIdx];
                    var data = {
                        ready : false,
                        scheduleSummaryData
                    };
                    res.status(statusCode.OK).send(resUtil.successTrue(resMsg.GET_HOME_SCHEDULE_SUCCESS, data));
                }else {
                    var data = {
                        lastTransCount : transCount,
                        arriveTime : scheduleNotice[currentTransIdx].arriveTime
                    }
                    res.status(statusCode.OK).send(resUtil.successTrue(resMsg.GET_HOME_SCHEDULE_SUCCESS, data));
                }
            }
        }
        
    }
}