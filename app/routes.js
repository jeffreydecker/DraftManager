var express = require('express'),
  app = express(),
  mainController = require('./controllers/main.controller');

  module.exports = router;

  app.route('/api/leagues')
    .get(mainController.getLeagues);

  app.route('/api/league/:lid')
    .get(mainController.getLeague)
    .post(mainController.createLeague)
    .put(mainController.updateLeague)
    .delete(mainController.deleteLeague)
