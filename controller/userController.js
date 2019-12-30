const statusCode = require('../module/statusCode');
const resMsg = require('../module/resMsg');
const responseUtil = require('../module/responseUtil');
const User = require('../models/userModel');
const encrypt = require('../module/encryption');
const express = require('express');

module.exports = {
    //로그인
    signin  : async (req,res) =>{
        const {userId, userPw } = req.body;
        //아이디나 비번이 입력이 안됐다면
        if(!userId || !userPw){
            await res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(resMsg.NULL_VALUE)); 
        }
        try{
            const {code, json} = await User.signin(userId, userPw)
            res.status(code).send(json)
        } catch (err) {
            await res.status(statusCode.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(resMsg.INTERNAL_SERVER_ERROR));
        }
    },
    //회원가입
    signup : async (req,res) =>{
        const {userName, userId, userPw} = req.body;
        const missParameters = await Object.entries({userId, userPw}).filter(it=>it[1]==undefined).map(it=>it[0]).join(',');
        if(!userId || !userPw){
            await res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(`${resMsg.NULL_VALUE} ${missParameters}`))
        }
        // 비밀번호 암호화 
        try{
            const {hashed, salt} = await encrypt.encrypt(userPw)
            const {code, json} =await User.signup({userId, userName, salt, password:hashed})
            res.status(code).send(json);
        }catch(err) {
            await res.status(statusCode.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(resMsg.INTERNAL_SERVER_ERROR));
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
