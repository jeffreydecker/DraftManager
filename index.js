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

// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
//   console.log("db connected");
// });

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
  _player      : {type: String, ref: "Player"},
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
  _player        : {type: String, ref: "Player"},
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
  name  : String,
  teams : [{type : Schema.Types.ObjectId, ref : "Team"}]
})

// Team info
var teamSchema = new Schema({
  name : String,
  players : [{type : Schema.Types.ObjectId, ref : "Player"}]
})

var Player = mongoose.model("Player", playerSchema);
var HitterProjection = mongoose.model("HitterProjection", hitterProjectionSchema);
var PitcherProjection = mongoose.model("PitcherProjection", pitcherProjectionSchema);
var League = mongoose.model("League", leagueSchema);
var Team = mongoose.model("Team", teamSchema);

// API
 /*
 Fetch all players sorted by rank
 */
app.get('/api/players', function(req, res) {
  Player.find().sort({rank : 1}).exec(function(err, players) {
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
Draft a player
*/
app.post('/api/draft', function(req, res) {
  var league = req.body.league;
  var team = req.body.team;
  var player = req.body.player;
  if (league && team) {
    // TODO : add a player to a team in a league
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
        var projections = $(this).find('td');
        // TODO : Not all hitters will have player documents if they aren't ranked.
        // We'll need to grab player info and insert them if they don't exist
        // Player.create({
        //   _id : playerId,
        //   name :
        //   team :
        //   pos :
        // }, function(err, player) {
        //   if (err) res.send(err);
        // });
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

      var output = "";
      $('#data tbody tr').each(function (index, element) {
        $(this).find('td').each(function (index, element) {
          output += $(this).text() + " ";
        });
      });
      res.send(output);
  });
});

// Listen
app.listen(8080);
console.log("Listening on 8080");
