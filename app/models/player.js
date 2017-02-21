var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlayerSchema = new Schema({
  _id   : String,   // FantasyPros player id
  name  : String,
  rank  : Number,   // Overall ranking according to FantasyPros concensus
  team  : String,
  pos   : String
});

module.exports = mongoose.model('Player', PlayerSchema);
