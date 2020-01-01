var express = require('express');
var router = express.Router();
const UserController = require('../controller/userController');

router.post('/signup', UserController.signup);
router.post('/signin', UserController.signin);
router.post('/setUserName', UserController.setUserName);


module.exports = router;