var express = require('express');
var router = express.Router();
const homeController = require('../controller/homeController');

router.get('/', homeController.getHomeSchedule);

module.exports = router;