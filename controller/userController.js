const statusCode = require('../module/statusCode');
const responseMessage = require('../module/responseMessage');
const authUtil = require('../module/authUtil');
const User = require('../model/user');
const encrypt = require('../module/encryption');

module.exports = {
    //로그인
    signin  : async (req,res) =>{
        const {userId, userPw } = req.body;
        //아이디나 비번이 입력이 안됐다면
        if(!userId || !userPW){
            res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage.NULL_VALUE));
        }
        try{
            const {code, json} = User.signin({userId, userPw})
            res.status(code).send(json)
            // return await User.signin({userId, userPw})
        } catch (err) {
            res.status(statusCode.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR));
        }
    },
    //회원가입
    signup : async (req,res) =>{
        const {userName, userId, userPw, userBirth} = req.body;
        const missParameters = await Object.entries({userId, userPw}).filter(it=>it[1]==undefined).map(it=>it[0]).join(',');
        if(!userId || !userPw){
            await res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(`${responseMessage.NULL_VALUE} ${missParameters}`))
        }
        // 비밀번호 암호화 
        try{
            const {hashed, salt} = await encrypt.encrypt(userPw)
            console.log("1");
            const {code, json} =await User.signup({userId, userName, userBirth, salt, password:hashed})
            console.log("2");
            res.status(code).send(json);
            console.log("3");
        }catch(err) {
            res.status(statusCode.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR));
        }
    }

}


            /*
            //Object.entries() 는 [key, value]쌍의 배열을 반환
            const missParameters = Object.entries({userId, userPw})
            //filter() 인자로 제공되는 함수 test통과한 모든 요소를 새로운 array로 
            .filter(it=>it[1]==undefined)
            //map item만 반환
            .map(it=>it[0])
            .join(',');*/
/* 
1. async  await, 현재 코드 분석 바꾸기
2. jwt파일 만들기
3. 마이페이지 아웃라인만 짜기
*/
