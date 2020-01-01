const responseUtil = require('../module/responseUtil');
const statusCode = require('../module/statusCode');
const resMsg = require('../module/resMsg');
const pool = require('../module/pool');
const encrypt = require('../module/encryption');
const jwt = require('../module/jwt');

module.exports = {
    signin: async (id,password) => {
        const table = 'users';
        const query = `SELECT * FROM ${table} WHERE userId ='${id}'`;
        return await pool.queryParam_None(query)
            .then(async (userResult) => {
                console.log("userResult : ", userResult);
                if (userResult.length == 0) {
                    return {
                        code: statusCode.BAD_REQUEST,
                        json: responseUtil.successFalse(resMsg.NO_USER)
                    };
                }
                const user = userResult[0];
                const { hashed } = await encrypt.encryptWithSalt(password, user.salt);
                const {token, refreshToken}= jwt.sign(userResult[0].userPw);
                if (user.userPw != hashed) {
                    return {
                        code: statusCode.BAD_REQUEST,
                        json: responseUtil.successFalse(resMsg.MISS_MATCH_PW)
                    };
                }
                return{
                    code: statusCode.OK,
                    json:responseUtil.successTrue(resMsg.SIGN_IN_SUCCESS, {jwt: token}),
                }
            })
            .catch(err => {
                console.log(err);
                throw err;
            });            
    },
    checkId: async (id) => {
        const table = 'users';
        const query = `SELECT * FROM ${table} WHERE userId = '${id}'`;
        return await pool.queryParam_None(query)
        .then(async (userResult) => {
            if (userResult.length == 0) return true;
            else return false;
        })
        .catch(err => {
            console.log(err);
            throw err;
        });            
    }
    ,
    signup: async (userId,password,salt) => {
        const table = 'users';
        const fields = 'userId, userPw, salt'
        const questions = `?, ?, ?`;
        const values = [userId, password , salt];
        try {
            const result = await pool.queryParam_Arr(`INSERT INTO ${table}(${fields}) VALUES (${questions})`, values);
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
    },
    setUserName : async(userName)=>{
        const table ='users';
        const fields = 'userName';
        const questions =`?`;
        const values=  [userName];
        try{
            const result = await pool.queryParam_Arr(`INSERT INTO ${table}(${fields}) VALUES(${questions})`, values)
            if (result.code && result.json) return result;
            const userName = result.insertId;
            return {
                code: statusCode.OK,
                json: responseUtil.successTrue(resMsg.SET_NAME_SUCCESS, userName)
            };
        } catch (err) {
            if (err.errno == 1062) {
                console.log(err.errno, err.code);
                return {
                    code: statusCode.BAD_REQUEST,
                    json: responseUtil.successFalse(resMsg.ALREADY_NAME)
                };
            }
            console.log(err);
            throw err;
        }
    },
    setDeviceToken: async (userId, deviceToken) => {
        const table ='users';
        try{
            const result = await pool.queryParam_None(`UPDATE ${table} SET deviceToken = '${deviceToken}' WHERE userId = '${userId}'`)
            if (result.code && result.json) return result;
            const userName = result.insertId;
            return {
                code: statusCode.OK,
                json: responseUtil.successTrue(resMsg.SET_NAME_SUCCESS, userName)
            };
        } catch (err) {
            if (err.errno == 1062) {
                console.log(err.errno, err.code);
                return {
                    code: statusCode.BAD_REQUEST,
                    json: responseUtil.successFalse(resMsg.ALREADY_NAME)
                };
            }
            console.log(err);
            throw err;
        }
    }
}

