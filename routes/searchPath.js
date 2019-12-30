var express = require('express');
var router = express.Router();
const searchPathController = require('../controller/searchPathController');

router.get('/',searchPathController.searchPath);

module.exports = router;