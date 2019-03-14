// To import => app.use('/teams' require('./teams.routes'))
var express = require('express'),
  router = express.Router(),
  Team = require('../models/team');

// Fetches team for teamId param
router.param('teamId', (req, res, next, teamId) => {
  Team.findOne({_id : teamId})
    .populate('_league players')
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

// Genereal teams route
router.route('/')
.all((req, res, next) => {
  next();
})
.post((req, res) => { // Create a team
  var name = req.body.name;
  var league = req.body.league;
  if (league && team) {
    // TODO : add a team to a league
  }
})
.get((req, res) => { // Get all teams
  Team.find((err, teams) => {
    if (err) res.send(err);
    res.json(teams);
  });
});

// Team specific route
router.route('/:teamId')
.all((req, res, next) => {
  next();
})
.get((req, res) => { // Get a team
  res.json(req.team);
})
.put(async (req, res) => { // Update a team
  if (req.team) {
    req.team.name = req.body.team.name ? req.body.team.name : req.team.name
    try {
      let updatedTeam = await req.team.save()
      return res.json(updatedTeam)
    } catch (err) {
      return res.status(400).send(err)
    }
  } else {
    return res.status(400).send('Team not found')
  }
})
.delete((req, res) => { // Delete a team
  if (req.team) {
    // TODO - remove team from league
    team.delete((err, team) => {
      if (err) res.send(err);
      res.json();
    });
  }
});

module.exports = router;
