var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

// Team info
var TeamSchema = new Schema({
  name : String,
  _league : {type : Schema.Types.ObjectId, ref : "League"},
  players : [{type : Schema.Types.ObjectId, ref : "LeaguePlayer"}]
});

TeamSchema.methods.rename = function(name, callback) {
  this.name = name;
  this.save(callback);
};

TeamSchema.methods.draft = function(player, callback) {
  this.players.push(player._id);
  player.draft(this, () => {
    this.save(callback);
  });
}

TeamSchema.methods.drop = function(player, callback) {
  // TODO - for each through players to remove dropped player
  player.drop(() => {
    this.save(callback);
  });
}

module.exports = mongoose.model('Team', TeamSchema);
