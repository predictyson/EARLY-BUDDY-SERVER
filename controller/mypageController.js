const statusCode = require('../module/statusCode');
const resMsg = require('../module/resMsg');
const responseUtil = require('../module/responseUtil');
const User = require('../model/myPage');
const express = require('express');

module.exports = {
    // 1. 닉네임 수정
    changeNickName  : async (req,res) =>{
        const {userIdx,userName} = req.body;
        if(!userIdx|| !userName){
            await res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(resMsg.NULL_VALUE)); 
        }
        try{
            const {code, json} = await myPage.changeNickName(userId)
            res.status(code).send(json)
        } catch (err) {
            await res.status(statusCode.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(resMsg.INTERNAL_SERVER_ERROR));
        }
    },
    // 2. 아이디 출력
    outputId : async (req,res) =>{
        const {userIdx} = req.body;
        if(!userIdx || !userId){
            await res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(resMsg.NULL_VALUE));
        }
        try{
            const {code, json} = await myPage.outputId(userId)
            res.status(code).send(json)
        } catch (err){
            await res.status(statusCode.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(resMsg.INTERNAL_SERVER_ERROR));
        }
    },
    // 3. 비밀번호 바꾸기
    changePw : async (req, res) =>{
        const { userIdx, userPw} = req.body;
        if(!userIdx || ! userPw){
            await res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(resMsg.NULL_VALUE));
        }
        try{
            const {code, json} = await myPage.changePw(userPw)
            res.status(code).send(json)
        } catch(err){
            await res.status(status.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(resMsg.INTERNAL_SERVER_ERROR));
        }
    },
    // 4. 자주가는 장소 수정
    // 술먹기 -> 책 읽기
    changeFavorite : async (req, res) =>{
        const {userIdx, userFavoriteIdx} = req.body;
        if(! userFavoriteIdx){
            await res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(resMsg.NULL_VALUE));
        }
        try{
            const {code, json} =  await myPage.changeFavorite(favoriteIdx)
            res.status(code).send(json)
        } catch (err){
            await res.status(status.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(resMsg.INTERNAL_SERVER_ERROR));
        }
    },
    // 5. 회원 탈퇴
    withdrawal: async (req, res) =>{
        const {userIdx} =req.body;
        if(!userIdx){
            await res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(resMsg));
        }
        try{
            const {code, json} = await myPage.withdrawal(userIdx)
            res.status(code).send(json)
        } catch(err){
            await res.status(status.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(resMsg.INTERNAL_SERVER_ERROR));
        }
    }

};

