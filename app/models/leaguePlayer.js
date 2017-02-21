var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

// Player mapping for leagues
var LeaguePlayerSchema = new Schema({
  _league : {type : Schema.Types.ObjectId, ref : "League"},
  _player : {type: String, ref: "Player"},
  _team : {type : Schema.Types.ObjectId, ref : "Team"}
});

module.exports = mongoose.model('LeaguePlayer', LeaguePlayerSchema);
