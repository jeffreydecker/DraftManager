// To import => app.use('/leagues' require('./leagues.routes'))
var express = require('express'),
  router = express.Router(),
  request = require('request'),
  cheerio = require('cheerio'),
  Player = require('../models/player'),
  HitterProjection = require('../models/hitterProjection'),
  PitcherProjection = require('../models/pitcherProjection'),
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

router.route('/rankings')
.get((req, res) => {
  scrapeRankings();
  res.send("Scraping Rankings...");
});

router.route('/hitters')
.get((req, res) => {
  scrapeHitterProjections();
  res.send("Scraping Hitters...");
});

router.route('/pitchers')
.get((req, res) => {
  scrapePitcherProjections();
  res.send("Scraping Pitchers...");
});

// TODO - make this useful
function scrapePlayers() {
  scrapeHitterProjections();
  scrapePitcherProjections();
  scrapeRankings();
};

function scrapeHitterProjections() {
  var url = 'https://www.fantasypros.com/mlb/projections/hitters.php';
  request(url, function(err, response, html) {
      if (err) console.log(`Error: ${err}`);
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
            // console.log(`hitterProjection: ${hitterProjection} for ${playerName}`);
            if (err) console.log(`Error: ${err}`);
            if (hitterProjection) {
              Player.findOneAndUpdate(
                { _id : hitterProjection._player },
                { _id : hitterProjection._player,
                  name : playerName,
                  team : team,
                  pos : positions,
                  rank : Number.MAX_SAFE_INTEGER,
                  hittingProjections: hitterProjection._id },
                { upsert : true },
                function(err, player) {
                  if (err) consolse.log(`Error : ${err}`);
                });
            } else {
              console.log(`Missing projection for ${playerName}:${hitterProjection}`);
            }
          });
      });
  });
};

function scrapePitcherProjections() {
  var url = 'https://www.fantasypros.com/mlb/projections/pitchers.php';
  request(url, function(err, response, html) {
      if (err) console.log(`Error: ${err}`);
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
          function(err, pitcherProjection) {
            if (err) console.log(`Error: ${err}`);
            if (pitcherProjection) {
              Player.findOneAndUpdate(
                { _id : pitcherProjection._player },
                { _id : pitcherProjection._player,
                  name : playerName,
                  team : team,
                  pos : positions,
                  rank : Number.MAX_SAFE_INTEGER,
                  pitchingProjections: pitcherProjection._id },
                { upsert : true },
                function(err, player) {
                  if (err) console.log(`Error: ${err}`);
                });
            } else {
                console.log(`Missing projection for ${playerName}:${pitcherProjection}`);
            }
          });
      });
  });
};

function scrapeRankings() {
  var url = 'https://www.fantasypros.com/mlb/rankings/overall.php';
  request(url, function(err, response, html) {
      if (err) console.log(`Error: ${err}`);
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
            if (err) console.log(`Error: ${err}`);
          });
      });
  });
};

module.exports = router;
