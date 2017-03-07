var express = require('express'),
  router = express.Router(),
  Player = require('../models/player'),
  Hitter = require('../models/hitterProjection'),
  Pitcher = require('../models/pitcherProjection');

router.get('/', (req, res) => {
  Player.find()
  .sort({rank : 'asc'})
  .populate('hittingProjections pitchingProjections')
  .exec(function(err, players) {
    if (err) res.send(err);
    res.json(players);
  });
});

router.get('/hitters/', (req, res) => {
  Hitter.find()
    .populate('_player')
    .sort({'_player.rank' : 'asc'}) // TODO - this doesn't work so we need to find something that does
    .exec(function(err, hitters) {
    if (err) res.send(err);
    res.json(hitters);
  });
});

router.get('/pitchers/', (req, res) => {
  Pitcher.find()
    .populate('_player')
    .sort({'_player.rank' : 'asc'}) // TODO - this doesn't work so we need to find something that does
    .exec(function(err, hitters) {
    if (err) res.send(err);
    res.json(hitters);
  });
});

module.exports = router;
