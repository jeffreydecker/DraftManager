var mongoose = require('mongoose'),
  League = require('../models/league'),
  Player = require('../models/player');

module.exports = {
  getLeagues: (req, res) => {
    League.find((err, leagues) => {
      if (err) res.send(err);
      res.json(leagues);
    });
  },
  getPlayers: (req, res) => {
    Player.find()
    .sort({rank : 'asc'})
    .populate('hittingProjections pitchingProjections')
    .exec(function(err, players) {
      if (err) res.send(err);
      res.json(players);
    });
  }
};
