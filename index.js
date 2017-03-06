// Setup
var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  request = require('request'),
  cheerio = require('cheerio'),
  db = require('./config/db'),
  port = process.env.PORT || 8080,
  mongoose = require('mongoose'),
  morgan = require('morgan');

// Config
mongoose.connect(db.url);

app.use(express.static(__dirname + '/public'));
app.use('/scripts', express.static(__dirname + '/node_modules/angular/'));
app.use('/scripts', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/scripts', express.static(__dirname + '/node_modules/angular-route/'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(require('./app/routes/')); // Use our routes index.js

// Data models
var Player = require('./app/models/player');
var HitterProjection = require('./app/models/hitterProjection');
var PitcherProjection = require('./app/models/pitcherProjection');

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

app.get('*', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

// Listen
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
