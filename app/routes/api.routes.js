var express = require('express'),
  router = express.Router();

router.use('/leagues', require('./leagues.routes'));
router.use('/teams', require('./teams.routes'));
router.use('/players', require('./players.routes'));

module.exports = router;
