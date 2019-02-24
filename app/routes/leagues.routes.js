// To import => app.use('/leagues' require('./leagues.routes'))
var express = require('express'),
  router = express.Router()
  League = require('../models/league'),
  Team = require('../models/team'),
  LeaguePlayer = require('../models/leaguePlayer'),
  Player = require('../models/player'),
  controller = require('../controllers/main.controller');

// Middleware
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
  LeaguePlayer.findOne({_id : leaguePlayerId})
    .populate('_player _team')
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
  var leagueJSON = {};
  leagueJSON.name = req.body.name;
  var teamCount = req.body.teamCount;
  leagueJSON.rosterSize = req.body.rosterSize;
  var isAuction = req.body.isAuction;
  if (isAuction) {
    leagueJSON.budget = req.body.budget;
  }
  var hasMinors = req.body.hasMinors;
  if (hasMinors) {
    leagueJSON.minorsCount = req.body.minorsCount;
  }

  if (leagueJSON.name && teamCount && leagueJSON.rosterSize) {
    // Create a new league
    League.create(leagueJSON, function(err, league) {
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

router.route('/v2/')
.post(async (req, res) => { // Create a league
  if (!req.body.name || !req.body.teamCount || !req.body.rosterSize) {
    return res.status(400).json({msg: "Missing required params"})
  }

  const league = new League({
    name: req.body.name,
    budget: req.body.budget || 0,
    rosterSize: req.body.rosterSize,
    minorsCount: req.body.minorsCount,
    includeMinorsInCap: false,
  })

  try {
    var savedLeague = await league.save()

    var teams = [{name: "My Team"}]
    for (var i = 1; i < req.body.teamCount; i++) {
      teams.push({name: "Team " + i})
    }

    let savedTeams = await Team.insertMany(teams)
    var temp = savedLeague
    savedTeams.forEach(function(team, index, array) {
      console.log(team)
      temp.teams.push(team._id)
    });

    let players = await Player.find()
    .sort({rank : 'asc'})
    .populate('hittingProjections pitchingProjections')
    .exec();

    var playerJsons = [];
    players.forEach((player, index, array) => {
      playerJsons.push({_league: savedLeague._id, _player: player._id});
    });

    let leaguePlayers = await LeaguePlayer.insertMany(playerJsons)

    leaguePlayers.forEach(function(player, index, array) {
      savedLeague.players.push(player._id);
    });

    let finalLeague = await savedLeague.save()

    return res.status(200).json({league: finalLeague})
  } catch (err) {
    return res.status(400).json({error: err})
  }
});

// League specific routes
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

// League specific Players routes
router.route('/:leagueId/players')
.get((req, res) => {
  if (req.league) {
    LeaguePlayer.find({_league: req.league._id})
      .populate('_team')
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

// League Player specific routes
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

router.route('/add/:leaguePlayerId')
.put(async (req, res) => {
  if (req.leaguePlayer) {
    try {
      var player = req.leaguePlayer
      let teamId = req.body.teamId
      var team = await Team.findOne({_id: teamId}).exec();
      
      player._team = teamId;
      let _p = await player.save()
      
      team.players.push(player._id);
      let _t = await team.save()

      res.status(200).json({msg: "Player Drafted"})
    } catch (err) {
      res.status(400).send(err)
    }
  } else {
    res.status(404).send(new Error("Player not found to add"))
  }
});

router.route('/drop/:leaguePlayerId')
.post((req, res) => {
  if (req.leaguePlayer) {
    try {
      var player = req.leaguePlayer
      let teamId = player.teamId
      var team = await Team.findOne({_id: teamId}).exec();

      player._team = null;
      let _p = await player.save()

      team.players.remove(player._id);
      let _t = await team.save()
      
      res.status(200).json({msg: "Player Drafted"})
    } catch (err) {
      res.status(400).send(err)
    }
  } else {
    res.status(404).send(new Error("Player not found to drop"))
  }});

module.exports = router;