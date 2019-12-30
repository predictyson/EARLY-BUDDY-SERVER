const authUtil = require('../module/authUtil');
const statusCode = require('../module/statusCode');
const responseMessage = require('../module/responseMessage');
const pool = require('../module/poolAsync');
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
                        json: authUtil.successFalse(responseMessage.NO_USER)
                    };
                }
                const user = userResult[0];
                const {
                    hashed
                } = await encrypt.encryptWithSalt(  password, user.salt);
                if (user.userPw != hashed) {
                    return {
                        code: statusCode.BAD_REQUEST,
                        json: authUtil.successFalse(responseMessage.MISS_MATCH_PW)
                    };
                }
                const {token, refreshToken}= jwt.sign(userResult[0].userPw);
                console.log("token : " +token);
                return{
                    code: statusCode.OK,
                    json:authUtil.successTrue(responseMessage.SIGN_IN_SUCCESS),
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
        const questions = `?, ?, ?, ?, ?`;
        const values = [userName, userId, password , salt ];
        try {
            const result = await pool.queryParam_Parse(`INSERT INTO ${table}(${fields}) VALUES(${questions})`, values);
            if (result.code && result.json) return result;
            const userId = result.insertId;
            return {
                code: statusCode.OK,
                json: authUtil.successTrue(responseMessage.SIGN_UP_SUCCESS, userId)
            };
        } catch (err) {
            if (err.errno == 1062) {
                console.log(err.errno, err.code);
                return {
                    code: statusCode.BAD_REQUEST,
                    json: authUtil.successFalse(responseMessage.ALREADY_ID)
                };
            }
            console.log(err);
            throw err;
        }
    }
}

