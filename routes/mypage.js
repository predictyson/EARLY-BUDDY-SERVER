const express = require('express');
const router = express.Router();
const myPageController = require('../controller/mypageController');

router.post('/changeNickName', myPageController.changeNickName);
router.post('/outputId', mypageController.outputId);
router.post('/changePw', mypageController.changePw);
router.post('/changeFavorite',mypageController.changeFavorite);
router.post('/withdrawal', mypageController.withdrawal);
