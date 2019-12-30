const odsayAPI = require('../module/odsayAPI');
const ak = require('../config/appkey');
const resUtil = require('../module/responseUtil');
const resMsg = require('../module/resMsg');
const statCode = require('../module/statusCode');
const pool = require('../module/pool');

module.exports = {
    searchPath: async (SX, SY, EX, EY) => {
        let result = await odsayAPI.searchPubTransPath(SX, SY, EX, EY);
        if (result === undefined) {
            return({
                code: statCode.BAD_REQUEST,
                json: resUtil.successFalse(resMsg.FIND_PATH_FAILED)
            })
        }
        let path = result.path;
        let totalWalkTime = 0;
        for (var i = 0; i < path.length; i++) {
            for (var j = 0; j < path[i].subPath.length; j++) {
                if (path[i].subPath[j].trafficType === 3) {
                    totalWalkTime += path[i].subPath[j].sectionTime;
                }
                path[i].subPath[j].clicked = false;
            }
            path[i] = {
                pathType: path[i].pathType,
                totalTime: path[i].info.totalTime,
                totalPay: path[i].info.payment,
                transitCount: path[i].info.busTransitCount + path[i].info.subwayTransitCount - 1,
                totalWalkTime: totalWalkTime,
                subPath: path[i].subPath
            }
        }
        result = {
            subwayCount: result.subwayCount,
            subwayBusCount: result.subwayBusCount,
            path: path
        }
        return({
            code: statCode.OK,
            json: resUtil.successTrue(resMsg.FIND_PATH_COMPLETE, result)
        });
        


    }
}