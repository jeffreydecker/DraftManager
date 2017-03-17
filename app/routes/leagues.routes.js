// To import => app.use('/leagues' require('./leagues.routes'))
var express = require('express'),
  router = express.Router()
  League = require('../models/league'),
  Team = require('../models/team'),
  LeaguePlayer = require('../models/leaguePlayer'),
  Player = require('../models/player'),
  controller = require('../controllers/main.controller');

// Fetches legaue for leagueId param
router.param('leagueId', (req, res, next, leagueId) => {
  League.findOne({_id : leagueId})
    .populate('teams')
    .populate({
      path: 'players',
      populate: {
        path: '_player',
        populate: {
          path: 'hittingProjections pitchingProjections'
        }
      }
    })
    .exec((err, league) => {
      if (err) {
        res.send(err)
      } else if (league) {
        req.league = league;
        next();
      } else {
        res.send(new Error(`No league found for ${leagueId}`));
      }
    });
});

router.param('leaguePlayerId', (req, res, next, leaguePlayerId) => {
  League.findOne({_id : leaguePlayerId})
    .populate('_player _league _team')
    .exec((err, leaguePlayer) => {
      if (err) {
        res.send(err)
      } else if (leaguePlayer) {
        req.leaguePlayer = leaguePlayer;
        next();
      } else {
        res.send(new Error(`No leaguePlayer found for ${leaguePlayerId}`));
      }
    });
});

// General leagues route
router.route('/')
.post((req, res) => { // Create a league
  var leagueName = req.body.name;
  var teamCount = req.body.teamCount;
  if (leagueName && teamCount) {
    // Create a new league
    League.create({name : leagueName}, function(err, league) {
      if (err) return;
      // Create teams for the league
      var teamJsons = [{_league : league._id, name : ("My Team")}];

      for (var i = 1; i < teamCount; i++) {
        teamJsons.push({_league : league._id, name : ("Team " + i)});
      }

      Team.insertMany(teamJsons, function(err, teams) {
        // Add teams to league
        league.addTeams(teams, (err, league) => {
          if (err) console.log("Error adding teams to league: " + err);
          controller.getLeagues(req, res);
        });
      });

      Player.find()
      .sort({rank : 'asc'})
      .populate('hittingProjections pitchingProjections')
      .exec(function(err, players) {
        if (err) res.send(err);

        var playerJsons = [];
        var playerIdJsons = [];

        players.forEach((player, index, array) => {
          playerJsons.push({_league: league._id, _player: player._id});
        });

        LeaguePlayer.insertMany(playerJsons, (err, players) => {
          if (err) console.log(`Error league players: ${err}`);
          league.addPlayers(players);
        });
      });
    });
  }
})
.get((req, res) => { // Get all leagues
  controller.getLeagues(req, res);
});

// League specific route
router.route('/:leagueId')
.get((req, res) => { // Get a league
  res.json(req.league);
})
.put((req, res) => { // Update a league

})
.delete((req, res) => { // Delete a league
  if (req.league) {
    req.league.teams.forEach(function(team, index, array){
      if (team) {
        team.remove(function(err, team) {
          if (err) {
            console.log(`Error Deleting Team in League: ${err}`);
          }
        });
      }
    });

    req.league.remove(function(err, league) {
      if (err) {
        console.log(`Error Deleting League: ${err}`);
      }
      controller.getLeagues(req, res);
    });
  } else {
    res.send(new Error(`No league found for ${req.params.leagueId}`));
  }
});

// League specific route
router.route('/:leagueId/players')
.get((req, res) => {
  if (req.league) {
    LeaguePlayer.find({_league: req.league._id})
      .populate('_league _team')
      .populate({
        path: '_player',
        populate: {
          path: 'hittingProjections pitchingProjections'
        }
      })
      .exec((err, players) => {
        if (err) res.send(err);
        res.json(players);
      });
  } else {
    res.send(new Error("No league found"));
  }
});

router.route('/players/:leaguePlayerId/draft')
.post((req, res) => {
  if (req.leaguePlayer) {
    var teamId = req.body.teamId;
    req.leaguePlayer._team = teamId;
    req.leaguePlayer.save((err, leaguePlayer) => {
      if (err) res.send(new Error(`Error saving league player: ${error}`));
      req.json(leaguePlayer);
    });
  } else {
    res.send(new Error(`No league player found for ${req.params.leaguePlayerId}`));
  }
});

module.exports = router;
