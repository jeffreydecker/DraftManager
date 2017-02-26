// To import => app.use('/leagues' require('./leagues.routes'))
var express = require('express'),
  router = express.Router()
  League = require('../models/league'),
  Team = require('../models/team')
  controller = require('../controllers/main.controller');

// Create a league
router.post('/', (req, res) => {
  var leagueName = req.body.name;
  var teamCount = req.body.teams;
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
});

// Get a league or all leagues
router.get('/', (req, res) => {
  controller.getLeagues(req, res);
});

// Update a league
router.put('/', (req, res) => {

});

// Delete a league
router.delete('/:leagueId', (req, res) => {
  League.findOne({_id : req.params.leagueId})
    .populate('teams')
    .exec(function(err, league) {
      if (league) {
        league.teams.forEach(function(team, index, array){
          if (team) {
            team.remove(function(err, team) {
              if (err) {
                console.log('Error Deleting Team in League: ' + err);
              }
            });
          }
        });
        league.remove(function(err, league) {
          if (err) {
            console.log('Error Deleting League: ' + err);
          }
          getLeagues(req, res);
        });
      }
  });
});

module.exports = router;
