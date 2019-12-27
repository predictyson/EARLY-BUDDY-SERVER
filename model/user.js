const authUtil = require('../module/authUtil');
const statusCode = require('../module/statusCode');
const responseMessage = require('../module/responseMessage');
const pool = require('../module/poolAsync');
const encrypt = require('../module/encryption');

module.exports = {
    signin: async ({
        userId,
        userPw
    }) => {
        const table = 'users';
        const query = `SELECT * FROM ${table} WHERE id  ='${userid}'`;
        return pool.queryParam_None(query)
            .then(async (userResult) => {
                console.log(userResult);
                if (userResult.length == 0) {
                    return {
                        code: statusCode.BAD_REQUEST,
                        json: authUtil.successFalse(responseMessage.NO_USER)
                    };
                }
                const user = userResult[0];
                // 비밀번호 체크
                const {
                    hashed
                } = await encrypt.encryptWithSalt(password, user.salt);
                if (user.password != hashed) {
                    return {
                        code: statusCode.BAD_REQUEST,
                        json: authUtil.successFalse(responseMessage.MISS_MATCH_PW)
                    };
                }
                // 로그인 성공
                return {
                    code: statusCode.OK,
                    json: authUtil.successTrue(responseMessage.SIGN_IN_SUCCESS)
                }
            }).catch(err => {
                console.log(err);
                throw err;
            });
    },
    signup: async ({
        userId,
        userName,
        userBirth,
        salt,
        password
    }) => {
        const table = 'users';
        const fields = 'userName, userId, userPw, salt, userBirth'
        const questions = `?, ?, ?, ?, ?`;
        const values = [userId, userName, userBirth, salt, password];
        console.log("values : ", values);
        try {
            const result = await pool.queryParam_Parse(`INSERT INTO ${table}(${fields}) VALUES(${questions})`, values);
            if (result.code && result.json) return result;
            const userIdx = result.insertId;
            return {
                code: statusCode.OK,
                json: authUtil.successTrue(responseMessage.SIGN_UP_SUCCESS, userIdx)
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

/*
signin : async ({userId, userPw}).then(async (userResult) => {
                console.log(userResult);
                if (userResult.length == 0) {
                    return {
                        code: statusCode.BAD_REQUEST,
                        json: authUtil.successFalse(responseMessage.NO_USER)
                    };
                }
                const user = userResult[0];
                // 비밀번호 체크
                const {hashed} = await encrypt.encryptWithSalt(password, user.salt);
                if (user.password != hashed) {
                    return {
                        code: statusCode.BAD_REQUEST,
                        json: authUtil.successFalse(responseMessage.MISS_MATCH_PW)
                    };
                }
                // 로그인 성공
                return {
                    code: statusCode.OK,
                    json: authUtil.successTrue(responseMessage.SIGN_IN_SUCCESS)
                }
            })*/