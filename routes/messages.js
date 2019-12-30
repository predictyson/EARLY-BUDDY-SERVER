var express = require('express');
var router = express.Router();
const messageController = require('../controller/message/messageController');

router.post('/', messageController.send);

module.exports = router;