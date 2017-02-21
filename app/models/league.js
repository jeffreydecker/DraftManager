var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// League info
var LeagueSchema = new Schema({
  name    : String,
  teams   : [{type : Schema.Types.ObjectId, ref : "Team"}],
  players : [{type : Schema.Types.ObjectId, ref : "LeaguePlayer"}]
});

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
