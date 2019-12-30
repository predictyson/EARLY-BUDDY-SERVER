const statusCode = require('../module/statusCode');
const responseMessage = require('../module/responseMessage');
const authUtil = require('../module/authUtil');
const User = require('../model/mypage');
const express = require('express');

module.exports = {
    // 1. 닉네임 수정
    changeNickName  : async (req,res) =>{
        const {userIdx,userName} = req.body;
        if(!userIdx|| !userName){
            await res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage.NULL_VALUE)); 
        }
        try{
            const {code, json} = await mypage.changeNickName(userId)
            res.status(code).send(json)
        } catch (err) {
            await res.status(statusCode.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR));
        }
    },
    // 2. 아이디 출력
    outputId : async (req,res) =>{
        const {userIdx, userId} = req.body;
        if(!userIdx || !userId){
            await res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage.NULL_VALUE));
        }
        try{
            const {code, json} = await mypage.outputId(userId)
            res.status(code).send(json)
        } catch (err){
            await res.status(statusCode.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR));
        }
    },
    // 3. 비밀번호 바꾸기
    changePw : async (req, res) =>{
        const { userIdx, userPw} = req.body;
        if(!userIdx || ! userPw){
            await res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage.NULL_VALUE));
        }
        try{
            const {code, json} = await mypage.changePw(userPw)
            res.status(code).send(json)
        } catch(err){
            await res.status(status.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR));
        }
    },
    // 4. 자주가는 장소 수정
    changeFavorite : async (req, res) =>{
        const {userFavoriteIdx} = req.body;
        if(! userFavoriteIdx){
            await res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage.NULL_VALUE));
        }
        try{
            const {code, json} =  await mypage.chngFavorite(favoriteIdx)
            res.status(code).send(json)
        } catch (err){
            await res.status(status.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR));
        }
    },
    // 5. 회원 탈퇴
    withdrawal: async (req, res) =>{
        const {userIdx} =req.body;
        if(!userIdx){
            await res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage));
        }
        try{
            const {code, json} = await mypage.withdrawal(userIdx)
            res.status(code).send(json)
        } catch(err){
            await res.status(status.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR));
        }
    }

};

/* 
mypage 기능 구현
1. 닉네임 
2. 아이디 출력
3. 비번 밖기
4. 자주가는 장소 수정
5. 회원탈퇴*/