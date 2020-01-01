const kakaoAPI = require('../module/kakaoAPI');
const resUtil = require('../module/responseUtil');
const resMsg = require('../module/resMsg');
const statCode = require('../module/statusCode');

module.exports = {
    searchAddress : async (req,res) => {
        let result = await kakaoAPI.find(req.query.addr);
        console.log(result);
        res.status(statCode.OK).send(resUtil.successTrue(resMsg.FIND_ADDRESS_COMPLETE, result));        
    }
}