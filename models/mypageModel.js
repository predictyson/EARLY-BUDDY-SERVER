const responseUtil = require('../module/responseUtil');
const statusCode = require('../module/statusCode');
const resMsg = require('../module/resMsg');
const pool = require('../module/pool');
const encrypt = require('../module/encryption');
const jwt = require('../module/jwt');

module.exports = {
    changeNickname : async(user, changeName)=>{
        const table = 'users';
        const query = `UPDATE '${table}' SET userName = '${changeName} WHERE userIdx = '${user}'`;

    },
    outputId : async(user, printId)=>{
        const table = 'users';
        const query = `SELECT '${printId}' FROM '${table} WHERE userIdx = '${user}'`;
    },
    changePw : async (user, password) =>{
        const table = 'users';
        const query = `UPDATE '${table} SET userPw = '${password}'WHERE userIdx = '${user}'`;
    },
    changeFavorite : async (favorite) =>{
        const table = 'users';
        const query = `UPDATE '${table}' SET userFavorite = '${favorite}' WHERE userIdx = '${user}'`;
    },
    withdrawal : async (user) =>{
        const table = 'users';
        const query = `DELETE FROM'${table}'WHERE userIdx = '${user}' `;

    }

    
}