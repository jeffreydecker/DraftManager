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
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("db connected");
});

var Schema = mongoose.Schema;

var todoSchema = new Schema({
  text : String
});

var Todo = mongoose.model('Todo', todoSchema);

// Genral player info
var playerSchema = new Schema({
  _id   : String,   // FantasyPros player id
  name  : String,
  rank  : Number,  // Overall ranking according to FantasyPros concensus
  team  : String,
  pos   : String    // Comma delimited string of eligible positions
});

// Hitter projection stats
var hitterProjectionSchema = new Schema({
  player      : {type: String, ref: "Player"},
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
  player        : {type: String, ref: "Player"},
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

var Player = mongoose.model("Player", playerSchema);
var HitterProjection = mongoose.model("HitterProjection", hitterProjectionSchema);
var PitcherProjection = mongoose.model("PitcherProjection", pitcherProjectionSchema);

// API
 /*
 Fetch all todos
 */
app.get('/api/todos', function(req, res) {
  Todo.find(function(err, todos) {
    if (err) res.send(err);
    console.log("Todos: " + todos);
    res.json(todos);
  });
});

/*
Add a new todo
*/
app.post('/api/todos', function(req, res) {
  Todo.create({
    text : req.body.text,
    done : false
  }, function(err, todo) {
    if (err) res.send(err);
    Todo.find(function(res, todos) {
      if (err) res.send(err);
      res.json(todos);
    });
  });
});

/*
Delete a todo
*/
app.delete('/api/todos/:todo_id', function(req, res) {
  Todo.remove({
    _id : req.params.todo_id
  }, function(err, todo) {
    if (err) res.send(err);
    Todo.find(function(res, todos) {
      if (err) res.send(err);
      res.json(todos);
    });
  });
});

app.get('/scrape/rankings', function(req, res) {
  var url = 'https://www.fantasypros.com/mlb/rankings/overall.php';
  request(url, function(err, response, html) {
      if (err) res.send(err);
      var $ = cheerio.load(html);
      var output = "";
      $('#data tbody tr').each(function (index, element) { // For each row in the table
        // Kind of sketchy way to get the fantasypros playerId from the dom for each row.
        // These have a second class fp-id-<id> so we are grabbing the id part from that.
        var playerId = $($(this).find('.fp-player-link').get(0)).attr('class').split('-').pop();
        output += "(Player ID: " + playerId + ") "
        $(this).find('td').each(function (index, element) { // For each cell in the row
          // TODO: start saving info here based on intex
          // on index 1 (hitter name) we need to do some extra
          // work to extract the fpid for use in our db to link
          // each player with his stats, projections, etc.
          output += $(this).text() + " ";
        });
      });
      res.send(output);
  });
});

app.get('/scrape/hitter/projections', function(req, res) {
  var url = 'https://www.fantasypros.com/mlb/projections/hitters.php';
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
