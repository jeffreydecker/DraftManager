var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// League info
var LeagueSchema = new Schema({
  name    : String,
  budget  : Number,
  rosterSize : Number,
  minorsSpots : Number,
  includeMinorsInCap: Boolean,
  teams   : [{type : Schema.Types.ObjectId, ref : "Team"}],
  players : [{type : Schema.Types.ObjectId, ref : "LeaguePlayer"}],
  minors  : [{type : Schema.Types.ObjectId, ref : "LeaguePlayer"}]
});

// Add a list of players to a league
LeagueSchema.methods.addPlayers = function(players, callback) {
  var that = this;
  players.forEach(function(player, index, array) {
    that.players.push(player._id);
  });
  this.save(callback);
};

// Add a list of teams to a league
LeagueSchema.methods.addTeams = function(teams, callback) {
  var that = this;
  teams.forEach(function(team, index, array) {
    that.teams.push(team._id);
  });
  this.save(callback);
};

// Add a team to a league
LeagueSchema.methods.addTeam = function(team, callback) {
  this.teams.push(team._id);
  this.save(callback);
};

module.exports = mongoose.model('League', LeagueSchema);
