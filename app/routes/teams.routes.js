// To import => app.use('/teams' require('./teams.routes'))
var express = require('express'),
  router = express.Router(),
  Team = require('../models/team');

router.param('teamId', (req, res, next, teamId) => {
  Team.findOne({_id : teamId})
    .populate('league players')
    .exec((err, team) => {
      if (err) {
        next(err);
      } else if (team) {
        req.team = team;
        next();
      } else {
        next(new Error(`No team found for ${teamId}`));
      }
    })
});

// Create a team
router.route('/')
.all((req, res, next) => {
  next();
})
.post((req, res) => {
  var name = req.body.name;
  var league = req.body.league;
  if (league && team) {
    // TODO : add a team to a league
  }
})
.get((req, res) => {
  Team.find((err, teams) => {
    if (err) res.send(err);
    res.json(teams);
  });
});

// Get a team or all teams
router.route('/:teamId')
.all((req, res, next) => {
  next();
})
.get((req, res) => {
  res.json(req.team);
})
.put((req, res) => {
  if (req.team) {

  }
})
.delete((req, res) => {
  if (req.team) {
    team.delete((err, team) => {
      if (err) res.send(err);
      res.json();
    });
  }
});

module.exports = router;
