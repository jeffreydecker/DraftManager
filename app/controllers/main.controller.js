var mongoose = require('mongoose'),
  League = require('../models/league');

module.exports = {
  getLeagues: (req, res) => {
    League.find((err, leagues) => {
      if (err) res.send(err);
      res.json(leagues);
    });
  }
}
