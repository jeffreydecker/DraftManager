var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

  // Pitcher projection stats
  var PitcherProjectionSchema = new Schema({
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

module.exports = mongoose.model('PitcherProjection', PitcherProjectionSchema);
