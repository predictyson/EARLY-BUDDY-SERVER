const resUtil = require('../module/responseUtil');
const resMsg = require('../module/resMsg');
const statCode = require('../module/statusCode');
const pool = require('../module/pool');
const searchPath = require('../models/searchPathModel');

module.exports = {
    searchPath: async (req, res) => {
        if (!req.query.SX || !req.query.EX || !req.query.SY || !req.query.EY) {
            res.status(statCode.BAD_REQUEST).send(resUtil.successFalse(resMsg.NULL_VALUE));
        }
        else {
            try {
                let result = await searchPath.searchPath(req.query.SX, req.query.SY, req.query.EX, req.query.EY)
                if (result.code == statCode.BAD_REQUEST) {
                    res.status(result.code).send(result.json);
                }
                else {
                    res.status(result.code).send(result.json);
                }

            }
            catch (err) {
                console.log('controller err ');
                console.log(err);
            }
                
            
        }
    }
}