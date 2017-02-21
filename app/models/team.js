var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

// Team info
var TeamSchema = new Schema({
  _league : {type : Schema.Types.ObjectId, ref : "League"},
  name : String,
  players : [{type : Schema.Types.ObjectId, ref : "Player"}]
});

TeamSchema.methods.rename = function(name, callback) {
  this.name = name;
  this.save(callback);
};

TeamSchema.methods.draft = function(player, callback) {
  this.players.push(player._id);
  this.save(callback);
}

module.exports = mongoose.model('Team', TeamSchema);
