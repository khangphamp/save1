const express = require('express');
const router = express.Router();
const leagueController = require('../controllers/leagueController');
const middlewares = require('./middlewares');

router.post('/insert', middlewares.authorize, leagueController.createLeague);
router.put('/update/:id', middlewares.authorize, leagueController.updateLeague);
router.delete('/delete/:id', middlewares.authorize, leagueController.deleteLeague);
router.get('/getById/:id', leagueController.getLeagueById);
router.get('/getBySlug/:slug', leagueController.getLeagueBySlug);
router.get('/getPaging', leagueController.getPagingLeagues);

module.exports = router;