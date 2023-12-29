const express = require('express');
const router = express.Router();
const countController = require('../controllers/countController');

router.post('/click-live', countController.countClickLive);
router.get('/click-live', countController.getCountClickLive);


module.exports = router;