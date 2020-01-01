const statusCode = require('../module/statusCode');
const resMsg = require('../module/resMsg');
const responseUtil = require('../module/responseUtil');
const User = require('../models/userModel');
const encrypt = require('../module/encryption');
const express = require('express');

module.exports = {
    //로그인
    signin : async (req,res) =>{
        const {userId, userPw, deviceToken} = req.body;
        //아이디나 비번이 입력이 안됐다면
        if(!userId || !userPw || !deviceToken){
            return await res.status(statusCode.BAD_REQUEST).send(responseUtil.successFalse(resMsg.NULL_VALUE)); 
        }
        try{
            const {code, json} = await User.signin(userId, userPw)
            await User.setDeviceToken(userId, deviceToken);
            res.status(code).send(json)
        } catch (err) {
            await res.status(statusCode.INTERNAL_SERVER_ERROR).send(responseUtil.successFalse(resMsg.INTERNAL_SERVER_ERROR));
        }
    },
    setUserName : async (req,res) =>{
        const {userName}= req.body;
        const  missParameters = await Object.entries({userName}).filter(it=>it[1]==undefined).map(it=>it[0]).join(',');
        if(!userName){
            await res.status(statusCode.BAD_REQUEST).send(responseUtil.successFalse(`${resMsg.NULL_VALUE} ${missParameters}`))
        }

    },
    signup : async (req,res) =>{
        const {userId, userPw} = req.body;
        const missParameters = await Object.entries({userId, userPw}).filter(it=>it[1]==undefined).map(it=>it[0]).join(',');
        if(!userId || !userPw){
            return await res.status(statusCode.BAD_REQUEST).send(responseUtil.successFalse(`${resMsg.NULL_VALUE} ${missParameters}`));
        }
        // 아이디 중복 체크
        const checkIdResult = await User.checkId(userId);
        if (!checkIdResult ){
            return await res.status(statusCode.BAD_REQUEST).send(responseUtil.successFalse(resMsg.ALREADY_ID)); 
        } 
        // 비밀번호 암호화 
        try{
            const {hashed, salt} = await encrypt.encrypt(userPw)
            const {code, json} =await User.signup(userId, hashed, salt)
            res.status(code).send(json);
        }catch(err) {
            await res.status(statusCode.INTERNAL_SERVER_ERROR).send(responseUtil.successFalse(resMsg.INTERNAL_SERVER_ERROR));
        }
    }
}

