var express = require('express');
var router = express.Router();
const schedulesController = require('../controller/schedulesController');

router.post('/', schedulesController.addSchedule);
router.put('/', schedulesController.updateSchedule);
router.get('/', schedulesController.getSchedule);
router.delete('/', schedulesController.deleteSchedule);

module.exports = router;