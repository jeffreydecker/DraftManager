// To import => app.use('/leagues' require('./leagues.routes'))
var express = require('express'),
  router = express.Router(),
  request = require('request'),
  rp = require('request-promise'),
  cheerio = require('cheerio'),
  Player = require('../models/player'),
  HitterProjection = require('../models/hitterProjection'),
  PitcherProjection = require('../models/pitcherProjection'),
  League = require('../models/league'),
  controller = require('../controllers/main.controller');

// Middleware to fetch legaue for leagueId param
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

// API to update our player database

router.route('/update/players')
.patch(async (req, res) => {
  try {
    // TODO - These functoins should return promises so error handling is better
    await getRankings()
    await getHitterProjections()
    await getPitcherProjections()

    return res.status(200).json({msg: "Rankings Updated"})
  } catch(err) {
    return res.status(400).json({error: err})
  }
});

async function getRankings() {
    // Rankings
    // Get rankings html and load it into cheerio
    var rankingsUrl = 'https://www.fantasypros.com/mlb/rankings/overall.php'
    let rankingsHtml = await rp(rankingsUrl)
    var $ = cheerio.load(rankingsHtml)

    // For each ranking found in the html create a query for mongoose
    var playerQueries = []
    $('#data tbody tr').each(function (index, element) { // For each row in the player table
      // Kind of sketchy way to get the fantasypros playerId from the dom for each row.
      // These have a second class fp-id-<id> so we are grabbing the id part from that.
      var playerId = $($(this).find('.fp-player-link').get(0)).attr('class').split('-').pop();
      let playerQuery = Player.findOneAndUpdate(
        {_id : playerId}, // Find existing player by id
        {
          _id : playerId,
          name : $(this).find('.player-name').text(),
          rank : $(this).find('.rank-cell').text(),
          team : $(this).attr('data-team'),
          pos : $(this).attr('data-pos')
        },
        { upsert : true, new : true }, // If not found, create a new one
      )
      playerQueries.push(playerQuery)
    });

    // Once all queries are gathered, execute them
    playerQueries.forEach(async (query) => {
        await query.exec()
    })
}

async function getHitterProjections() {
  var url = 'https://www.fantasypros.com/mlb/projections/hitters.php'
  var html = await rp(url)
  var $ = cheerio.load(html)

  var players = [];
  $('#data tbody tr').each(function (index, element) {
    // Kind of sketchy way to get the fantasypros playerId from the dom for each row.
    // These have a second class fp-id-<id> so we are grabbing the id part from that.
    var playerId = $($(this).find('.fp-player-link').get(0)).attr('class').split('-').pop();
    var playerName = $(this).find('.player-name').text();
    var team = $(this).find('small a').text();
    var positions = $(this).find('small').text().split(' - ').pop().replace(')', '');
    var projections = $(this).find('td');
    players.push({
      id : playerId,
      name : playerName,
      team : team,
      positions : positions,
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
      walks : $(projections.get(11)).text(),
      strikeouts : $(projections.get(12)).text(),
      slugging : $(projections.get(13)).text(),
      ops : $(projections.get(14)).text(),
    })
  })

  players.forEach(async (player) => {
      let projection = await HitterProjection.findOneAndUpdate(
        {_player : player.id },
        { // Find existing player by id
          _player : player.id,
          atBats : player.atBats,
          runs : player.runs,
          homeRuns : player.homeRuns,
          rbi : player.rbi,
          steals : player.steals,
          average : player.average,
          obp : player.obp,
          hits : player.hits,
          doubles : player.doubles,
          tripples : player.tripples,
          walks : player.walks,
          strikeouts : player.strikeouts,
          slugging : player.slugging,
          ops : player.ops,
        },
        { upsert : true, new : true },
      ).exec()

      let playerUpdate = await Player.findOneAndUpdate(
        { _id : projection._player },
        { _id : projection._player,
          name : player.name,
          team : player.team,
          pos : player.positions,
          hittingProjections: projection._id },
        { upsert : true, new : true },
      ).exec();
  })
}

async function getPitcherProjections() {
  var url = 'https://www.fantasypros.com/mlb/projections/pitchers.php';
  var html = await rp(url)
  var $ = cheerio.load(html)

  var players = [];
  $('#data tbody tr').each(function (index, element) {
    var playerId = $($(this).find('.fp-player-link').get(0)).attr('class').split('-').pop();
    var playerName = $(this).find('.player-name').text();
    var team = $(this).find('small a').text();
    var positions = $(this).find('small').text().split(' - ').pop().replace(')', '');
    var projections = $(this).find('td');

    players.push({ // Find existing player by id
      id : playerId,
      name : playerName,
      team : team,
      positions : positions,
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
    });
  })

  players.forEach(async (player) => {
    let projection = await PitcherProjection.findOneAndUpdate(
      {_player : player.id}, { // Find existing player by id
        _player : player.id,
        innings : player.innings,
        strikeouts : player.strikeouts,
        wins : player.wins,
        saves : player.saves,
        era : player.era,
        whip : player.whip,
        earnedRuns : player.earnedRuns,
        hits : player.hits,
        walks : player.walks,
        homeRuns : player.homeRuns,
        games : player.games,
        starts : player.starts,
        losses : player.losses,
        completeGames : player.completeGames,
      }, { upsert : true, new : true}, // If not found, create a new one
    ).exec()

    let updatedPlayer = Player.findOneAndUpdate(
      { _id : projection._player },
      { _id : projection._player,
        name : player.name,
        team : player.team,
        pos : player.positions,
        pitchingProjections: projection._id },
      { upsert : true, new : true },
    ).exec()
  })
};

// APIs to scrape on demand

router.route('/rankings')
.get((req, res) => {
  scrapeRankings(res);
});

router.route('/hitter')
.get((req, res) => {
  scrapeAllHitterProjections(res);
});

router.route('/hitter/:hitterId')
.get((req, res) => {
  scrapeHitterProjections(req.params.hitterId, res);
});

router.route('/pitcher')
.get((req, res) => {
  scrapeAllPitcherProjections(res);
});

router.route('/pitcher/:pitcherId')
.get((req, res) => {
  scrapePitcherProjections(req.params.pitcherId, res);
});

function scrapeAllHitterProjections(res) {
  var time = Date.now()
  var url = 'https://www.fantasypros.com/mlb/projections/hitters.php';
  request(url, function(err, response, html) {
      if (err) console.log(`Error: ${err}`);
      var resObj = {};
      var players = [];
      var $ = cheerio.load(html);
      $('#data tbody tr').each(function (index, element) {
        // Kind of sketchy way to get the fantasypros playerId from the dom for each row.
        // These have a second class fp-id-<id> so we are grabbing the id part from that.
        var playerId = $($(this).find('.fp-player-link').get(0)).attr('class').split('-').pop();
        var playerName = $(this).find('.player-name').text();
        var team = $(this).find('small a').text();
        var positions = $(this).find('small').text().split(' - ').pop().replace(')', '');
        var projections = $(this).find('td');
        players.push ({
          id : playerId,
          name : playerName,
          team : team,
          positions : positions,
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
        })
      });
      resObj.latency = Date.now() - time;
      resObj.players = players;
      res.json(resObj);
  });
};

function scrapeHitterProjections(hitterId, res) {
  var url = 'https://www.fantasypros.com/mlb/projections/hitters.php';
  request(url, function(err, response, html) {
      if (err) console.log(`Error: ${err}`);
      var resObj = {}
      var $ = cheerio.load(html);
      $('#data tbody tr').each(function (index, element) {
        // Kind of sketchy way to get the fantasypros playerId from the dom for each row.
        // These have a second class fp-id-<id> so we are grabbing the id part from that.
        var playerId = $($(this).find('.fp-player-link').get(0)).attr('class').split('-').pop();
        if (playerId === hitterId) {
          var playerName = $(this).find('.player-name').text();
          var team = $(this).find('small a').text();
          var positions = $(this).find('small').text().split(' - ').pop().replace(')', '');
          var projections = $(this).find('td');
          resObj = {
            id : playerId,
            name : playerName,
            team : team,
            positions : positions,
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
          }
        }
      });
      res.json(resObj);
  });
};

function scrapeAllPitcherProjections(res) {
  var time = Date.now()
  var url = 'https://www.fantasypros.com/mlb/projections/pitchers.php';
  request(url, function(err, response, html) {
      if (err) console.log(`Error: ${err}`)
      var resObj = {};
      var players = [];
      var $ = cheerio.load(html)
      $('#data tbody tr').each(function (index, element) {
        var playerId = $($(this).find('.fp-player-link').get(0)).attr('class').split('-').pop();
        var playerName = $(this).find('.player-name').text();
        var team = $(this).find('small a').text();
        var positions = $(this).find('small').text().split(' - ').pop().replace(')', '');
        var projections = $(this).find('td');

        players.push({ // Find existing player by id
          id : playerId,
          name : playerName,
          team : team,
          positions : positions,
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
        });
      });
      resObj.players = players
      res.json(resObj)
  });
};

function scrapePitcherProjections(pitcherId, res) {
  var url = 'https://www.fantasypros.com/mlb/projections/pitchers.php';
  request(url, function(err, response, html) {
      if (err) console.log(`Error: ${err}`)
      var resObj = {}
      var $ = cheerio.load(html)
      $('#data tbody tr').each(function (index, element) {
        var playerId = $($(this).find('.fp-player-link').get(0)).attr('class').split('-').pop();
        if (playerId === pitcherId) {
          var playerName = $(this).find('.player-name').text();
          var team = $(this).find('small a').text();
          var positions = $(this).find('small').text().split(' - ').pop().replace(')', '');
          var projections = $(this).find('td');

          resObj = {
            id : playerId,
            name : playerName,
            team : team,
            positions : positions,
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
          }
        }
      });
      res.json(resObj)
  });
};

function scrapeRankings(res) {
  var url = 'https://www.fantasypros.com/mlb/rankings/overall.php';
  var players = [];
  request(url, function(err, response, html) {
      if (err) console.log(`Error: ${err}`)
      var $ = cheerio.load(html)
      $('#data tbody tr').each(function (index, element) { // For each row in the player table
        // Kind of sketchy way to get the fantasypros playerId from the dom for each row.
        // These have a second class fp-id-<id> so we are grabbing the id part from that.
        var playerId = $($(this).find('.fp-player-link').get(0)).attr('class').split('-').pop();
        players.push({
          id : playerId,
          name : $(this).find('.player-name').text(),
          rank : $(this).find('.rank-cell').text(),
          team : $(this).attr('data-team'),
          pos : $(this).attr('data-pos')
        })
      });
      res.json(players)
  });
};

module.exports = router;
