// Setup
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var request = require('request');
var cheerio = require('cheerio');

// Config
mongoose.connect('mongodb://shoeless-app:barefeet@ds145359.mlab.com:45359/shoeless-db');

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// Data models
var Schema = mongoose.Schema;

// Genral player info
var playerSchema = new Schema({
  _id   : String,   // FantasyPros player id
  name  : String,
  rank  : Number,   // Overall ranking according to FantasyPros concensus
  team  : String,
  pos   : String    // Comma delimited string of eligible positions
});

// Hitter projection stats
var hitterProjectionSchema = new Schema({
  _player      : {type : String, ref : "Player"},
  atBats      : Number,
  runs        : Number,
  homeRuns    : Number,
  rbi         : Number,
  steals      : Number,
  average     : Number,
  obp         : Number,
  hits        : Number,
  doubles     : Number,
  tripples    : Number,
  walks       : Number,
  strikeouts  : Number,
  slugging    : Number,
  ops         : Number
});

// Pitcher projection stats
var pitcherProjectionSchema = new Schema({
  _player       : {type : String, ref : "Player"},
  innings       : Number,
  strikeouts    : Number,
  wins          : Number,
  saves         : Number,
  era           : Number,
  whip          : Number,
  earnedRuns    : Number,
  hits          : Number,
  walks         : Number,
  homeRuns      : Number,
  games         : Number,
  starts        : Number,
  losses        : Number,
  completeGames : Number
});

// League info
var leagueSchema = new Schema({
  name    : String,
  teams   : [{type : Schema.Types.ObjectId, ref : "Team"}],
  players : [{type : Schema.Types.ObjectId, ref : "LeaguePlayer"}]
});

// Team info
var teamSchema = new Schema({
  _league : {type : Schema.Types.ObjectId, ref : "League"},
  name : String,
  players : [{type : Schema.Types.ObjectId, ref : "Player"}]
});

// Player mapping for leagues
var leaguePlayerSchema = new Schema({
  _league : {type : Schema.Types.ObjectId, ref : "League"},
  _player : {type: String, ref: "Player"},
  _team : {type : Schema.Types.ObjectId, ref : "Team"}
})

var Player = mongoose.model("Player", playerSchema);
var HitterProjection = mongoose.model("HitterProjection", hitterProjectionSchema);
var PitcherProjection = mongoose.model("PitcherProjection", pitcherProjectionSchema);
var League = mongoose.model("League", leagueSchema);
var Team = mongoose.model("Team", teamSchema);
var LeaguePlayer = mongoose.model("LeaguePlayer", leaguePlayerSchema);

// API
/*
Fetch all players sorted by rank
*/
app.get('/api/leagues', function(req, res) {
 getLeagues(req, res);
});

 /*
 Fetch all players sorted by rank
 */
app.get('/api/players', function(req, res) {
  Player.find().sort({rank : 'asc'}).exec(function(err, players) {
    if (err) res.send(err);
    res.json(players);
  });
});

 /*
 Fetch all hitters stats sorted by rank
 */
app.get('/api/hitters', function(req, res) {
  HitterProjection.find()
    .populate('_player')
    .exec(function(err, hitters) {
    if (err) res.send(err);
    res.json(hitters);
  });
});

/*
Fetch all pitchers stats sorted by rank
*/
app.get('/api/pitchers', function(req, res) {
 PitcherProjection.find()
   .populate('_player')
   .exec(function(err, hitters) {
   if (err) res.send(err);
   res.json(hitters);
 });
});

/*
Fetch all pitchers stats sorted by rank
*/
app.get('/api/teams', function(req, res) {
 Team.find()
   .exec(function(err, teams) {
   if (err) res.send(err);
   res.json(teams);
 });
});

/*
Draft a player
*/
app.post('/api/create/league', function(req, res) {
  var leagueName = req.body.name;
  var teamCount = req.body.count;
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
        teams.forEach(function(team, index, array) {
          league.teams.push(team._id);
          if (index == array.length - 1) {
            league.save(function(err, league) {
              // Return all leagues
              getLeagues(req, res);
            });
          }
        });
      });
    });
  }
});

app.delete('/api/league/:lid', function(req, res) {
  League.findOne({_id : req.params.lid})
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

/*
Draft a player
*/
app.post('/api/create/team', function(req, res) {
  var name = req.body.name;
  var league = req.body.league;
  if (league && team && player) {
    // TODO : add a team to a league
  }
});

/*
Draft a player
*/
app.post('/api/draft', function(req, res) {
  var league = req.body.league;
  var team = req.body.team;
  var player = req.body.player;
  var cost = req.body.cost;
  if (league && team && player) {
    // TODO : add a player to a team in a league
  }
});

/*
Drop a player
*/
app.post('/api/drop', function(req, res) {
  var league = req.body.league;
  var team = req.body.team;
  var player = req.body.player;
  if (league && team && player) {
    // TODO : drop a player from a team in a league
  }
});

/*
Scrape overall player rankings
*/
app.get('/scrape/rankings', function(req, res) {
  var url = 'https://www.fantasypros.com/mlb/rankings/overall.php';
  request(url, function(err, response, html) {
      if (err) res.send(err);
      var $ = cheerio.load(html);
      $('#data tbody tr').each(function (index, element) { // For each row in the player table
        // Kind of sketchy way to get the fantasypros playerId from the dom for each row.
        // These have a second class fp-id-<id> so we are grabbing the id part from that.
        var playerId = $($(this).find('.fp-player-link').get(0)).attr('class').split('-').pop();
        Player.findOneAndUpdate(
          {_id : playerId}, // Find existing player by id
          {
            _id : playerId,
            name : $(this).find('.player-name').text(),
            rank : $(this).find('.rank-cell').text(),
            team : $(this).attr('data-team'),
            pos : $(this).attr('data-pos')
          },
          {upsert : true}, // If not found, create a new one
          function(err, player) {
            if (err) res.send(err);
          });
      });
      res.send("Player rankings updated.");
  });
});

/*
Scrape hitter projections
*/
app.get('/scrape/hitter/projections', function(req, res) {
  var url = 'https://www.fantasypros.com/mlb/projections/hitters.php';
  request(url, function(err, response, html) {
      if (err) res.send(err);
      var $ = cheerio.load(html);
      $('#data tbody tr').each(function (index, element) {
        // Kind of sketchy way to get the fantasypros playerId from the dom for each row.
        // These have a second class fp-id-<id> so we are grabbing the id part from that.
        var playerId = $($(this).find('.fp-player-link').get(0)).attr('class').split('-').pop();
        var playerName = $(this).find('.player-name').text();
        var team = $(this).find('small a').text();
        var positions = $(this).find('small').text().split(' - ').pop().replace(')', '');
        var projections = $(this).find('td');
        // TODO : This really isn't the best way to go about this because it overwrites
        // existing entries, which resets the rank. We could not set it and use a
        // default for rank but then the sort option always puts the defaul ranked
        // players at the top when sorting. Long term there should just be a scrape
        // task that scrapes projections then rankings
        Player.findOneAndUpdate(
          { _id : playerId },
          { _id : playerId,
            name : playerName,
            team : team,
            pos : positions,
            rank : Number.MAX_SAFE_INTEGER },
          { upsert : true },
          function(err, player) {
            if (err) res.send(err);
          });
        HitterProjection.findOneAndUpdate(
          {_player : playerId}, { // Find existing player by id
            _player : playerId,
            atBats : $(projections.get(1)).text(),
            runs : $(projections.get(2)).text(),
            homeRuns : $(projections.get(3)).text(),
            rbi : $(projections.get(4)).text(),
            steals : $(projections.get(5)).text(),
            average : $(projections.get(6)).text(),
            obp : $(projections.get(7)).text(),
            hits : $(projections.get(8)).text(),
            doubles : $(projections.get(9)).text(),
            tripples : $(projections.get(10)).text(),
            walk : $(projections.get(11)).text(),
            strikeouts : $(projections.get(12)).text(),
            slugging : $(projections.get(13)).text(),
            ops : $(projections.get(14)).text(),
          }, {upsert : true}, // If not found, create a new one
          function(err, hitterProjection) {
            if (err) res.send(err);
          });
      });
      res.send("Batting projections updated");
  });
});

app.get('/scrape/pitcher/projections', function(req, res) {
  var url = 'https://www.fantasypros.com/mlb/projections/pitchers.php';
  request(url, function(err, response, html) {
      if (err) res.send(err);
      var $ = cheerio.load(html);
      $('#data tbody tr').each(function (index, element) {
        var playerId = $($(this).find('.fp-player-link').get(0)).attr('class').split('-').pop();
        var playerName = $(this).find('.player-name').text();
        var team = $(this).find('small a').text();
        var positions = $(this).find('small').text().split(' - ').pop().replace(')', '');
        var projections = $(this).find('td');
        // TODO : This really isn't the best way to go about this because it overwrites
        // existing entries, which resets the rank. We could not set it and use a
        // default for rank but then the sort option always puts the defaul ranked
        // players at the top when sorting. Long term there should just be a scrape
        // task that scrapes projections then rankings
        Player.findOneAndUpdate(
          { _id : playerId },
          { _id : playerId,
            name : playerName,
            team : team,
            pos : positions,
            rank : Number.MAX_SAFE_INTEGER },
          { upsert : true },
          function(err, player) {
            if (err) res.send(err);
          });
        PitcherProjection.findOneAndUpdate(
          {_player : playerId}, { // Find existing player by id
            _player : playerId,
            innings : $(projections.get(1)).text(),
            strikeouts : $(projections.get(2)).text(),
            wins : $(projections.get(3)).text(),
            saves : $(projections.get(4)).text(),
            era : $(projections.get(5)).text(),
            whip : $(projections.get(6)).text(),
            earnedRuns : $(projections.get(7)).text(),
            hits : $(projections.get(8)).text(),
            walks : $(projections.get(9)).text(),
            homeRuns : $(projections.get(10)).text(),
            games : $(projections.get(11)).text(),
            starts : $(projections.get(12)).text(),
            losses : $(projections.get(13)).text(),
            completeGames : $(projections.get(14)).text(),
          }, {upsert : true}, // If not found, create a new one
          function(err, hitterProjection) {
            if (err) res.send(err);
          });
      });
      res.send("Pitcher projections updated");
  });
});

app.get('/', function(req, res) {
  res.sendFile('./public/index.html');
});

app.get('/league/:lid', function(req, res) {
  // TODO : go to a league page
});

// Helper functions
function getLeagues(req, res) {
  League.find(function(err, leagues) {
    if (err) res.send(err);
    res.json(leagues);
  });
};

// Listen
app.listen(8080);
console.log("Listening on 8080");
