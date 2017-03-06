// To import => app.use('/leagues' require('./leagues.routes'))
var express = require('express'),
  router = express.Router()
  League = require('../models/league'),
  Team = require('../models/team'),
  LeaguePlayer = require('../models/leaguePlayer'),
  controller = require('../controllers/main.controller');

// Fetches legaue for leagueId param
router.param('leagueId', (req, res, next, leagueId) => {
  League.findOne({_id : leagueId})
    .populate('teams players')
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

module.exports = router;
