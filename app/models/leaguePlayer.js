var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

// Player mapping for leagues
var LeaguePlayerSchema = new Schema({
  salary  : Number,
  value   : Number,
  isMinor : Boolean,
  isRostered: Boolean,
  _player : {type : String, ref: "Player"},
  _league : {type : Schema.Types.ObjectId, ref : "League"},
  _team   : {type : Schema.Types.ObjectId, ref : "Team"}
});

LeaguePlayerSchema.methods.draft = (team, callback) => {
  this.team = team._id;
  this.save(callback);
}

LeaguePlayerSchema.methods.drop = (callback) => {
  this.team = null;
  this.save(callback);
}

module.exports = mongoose.model('LeaguePlayer', LeaguePlayerSchema);
