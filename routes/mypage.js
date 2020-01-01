const express = require('express');
const router = express.Router();
const myPageController = require('../controller/myPageController');

router.post('/changeNickName', myPageController.changeNickName);
router.post('/getUserId', myPageController.outputId);
router.post('/changePw', myPageController.changePw);
router.post('/changeFavorite',myPageController.changeFavorite);
router.post('/withdrawal', myPageController.withdrawal);
