const responseUtil = require('../module/responseUtil');
const statusCode = require('../module/statusCode');
const resMsg = require('../module/resMsg');
const pool = require('../module/pool');
const encrypt = require('../module/encryption');
const jwt = require('../module/jwt');

module.exports = {
    signin: async (id,password) => {
        const table = 'users';
        const query = `SELECT * FROM ${table} WHERE userId  ='${id}'`;
        return await pool.queryParam_None(query)
            .then(async (userResult) => {
                if (userResult.length == 0) {
                    return {
                        code: statusCode.BAD_REQUEST,
                        json: responseUtil.successFalse(resMsg.NO_USER)
                    };
                }
                const user = userResult[0];
                const {
                    hashed
                } = await encrypt.encryptWithSalt(  password, user.salt);
                if (user.userPw != hashed) {
                    return {
                        code: statusCode.BAD_REQUEST,
                        json: responseUtil.successFalse(resMsg.MISS_MATCH_PW)
                    };
                }
                const {token, refreshToken}= jwt.sign(userResult[0].userPw);
                return{
                    code: statusCode.OK,
                    json:responseUtil.successTrue(resMsg.SIGN_IN_SUCCESS),
                }
            })
            .catch(err => {
                console.log(err);
                throw err;
            });            

    },
    signup: async ({userId,userName,userBirth,salt,password}) => {
        const table = 'users';
        const fields = 'userName, userId, userPw, salt'
        const questions = `?, ?, ?, ?`;
        const values = [userName, userId, password , salt ];
        try {
            const result = await pool.queryParam_Arr(`INSERT INTO ${table}(${fields}) VALUES(${questions})`, values);
            if (result.code && result.json) return result;
            const userId = result.insertId;
            return {
                code: statusCode.OK,
                json: responseUtil.successTrue(resMsg.SIGN_UP_SUCCESS, userId)
            };
        } catch (err) {
            if (err.errno == 1062) {
                console.log(err.errno, err.code);
                return {
                    code: statusCode.BAD_REQUEST,
                    json: responseUtil.successFalse(resMsg.ALREADY_ID)
                };
            }
            console.log(err);
            throw err;
        }
    }
}

