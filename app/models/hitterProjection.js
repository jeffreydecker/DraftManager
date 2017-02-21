var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

  // Hitter projection stats
  var HitterProjectionSchema = new Schema({
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

  module.exports = mongoose.model('HitterProjection', HitterProjectionSchema);
