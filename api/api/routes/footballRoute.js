const footballController = require('../controllers/footballController');
const express = require('express');
const router = express.Router();

router.get('/fixtures', footballController.getFixtures);
router.get('/fixtures/rounds', footballController.getFixtureRounds);
router.get('/leagues', footballController.getLeagues);
router.get('/standings', footballController.getStandings);
router.get('/players/topscorers', footballController.getTopScorers);
router.get('/odds', footballController.getOddsPrePlay);
router.get('/odds/bets', footballController.getOddsBets);
router.get('/odds/bookmakers', footballController.getOddsBookmakers);
router.get('/odds/live', footballController.getOddsLive);
router.get('/odds/live/bets', footballController.getOddsLiveBets);

module.exports = router;
