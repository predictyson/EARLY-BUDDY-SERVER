/*const responseUtil = require('../module/responseUtil');
const statusCode = require('../module/statusCode');
const resMsg = require('../module/resMsg');
const pool = require('../module/pool');
const encrypt = require('../module/encryption');
const jwt = require('../module/jwt');
const table = 'users';

module.exports = {
    changeNickname : async(userIdx, changeName)=>{
       // const query = `UPDATE '${table}' SET userName = '${changeName} WHERE userIdx = '${userIdx}'`;
        const fields  = 'userIdx,userName';
        const questions =`?,?`;
        const values = [userIdx, userName];
        try{
            return await pool.queryParam_Arr( `UPDATE '${table}' SET userName = '${changeName} WHERE userIdx = '${userIdx}'`)
            if(result.code)
        }
    },
    getUserId : async(userIdx)=>{
        const query = `SELECT userId FROM '${table} WHERE userIdx = '${userIdx}'`;
    },
    changePw: async (userIdx, password) =>{
        // 기존 비밀번호, 바꿀 비밀번호 
        // 기존 비밀번호 - 사용자가 맞는지 -> 솔트, 해시 | 비밀번호 + 솔트 -> 저장된 해시랑 비교
        // 그 때 아래에 있는 쿼리를 사용 
        // transaction -> rollback()
        const query = `UPDATE '${table} SET userPw = '${password}'WHERE userIdx = '${userIdx}'`;
    },
    changeFavorite : async (favorite) =>{
        const table = 'users';
        const query = `UPDATE '${table}' SET userFavorite = '${favorite}' WHERE userIdx = '${userIdx}'`;
    },
    withdrawal : async (userIdx) =>{
        const table = 'users';
        const query = `DELETE FROM'${table}'WHERE userIdx = '${userIdx}' `;

    }
}
*/