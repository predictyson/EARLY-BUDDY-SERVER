var express = require('express');
var router = express.Router();
const schedulesController = require('../controller/schedulesController');

router.post('/', schedulesController.addSchedule);
router.get('/', schedulesController.getSchedule);

module.exports = router;