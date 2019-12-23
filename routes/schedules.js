var express = require('express');
var router = express.Router();
const odsayAPI = require('../module/odsayAPI');
const ak = require('../config/appkey');
const resUtil = require('../module/responseUtil');
const resMsg = require('../module/resMsg');
const statCode = require('../module/statusCode');

router.post('/', async (req,res)=> {
    const result = await odsayAPI.searchPubTransPath(127.08282465301149, 37.62072502768881, 127.03746391719882, 37.4720040276288);
    await res.status(200).send(resUtil.successTrue(statCode.OK, resMsg.GET_PATH_COMPLETE, result));
})

module.exports = router;