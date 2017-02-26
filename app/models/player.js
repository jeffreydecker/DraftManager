var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// TODO - may want to reconsider this model to reference projections
var PlayerSchema = new Schema({
  _id   : String,   // FantasyPros player id
  name  : String,
  rank  : Number,   // Overall ranking according to FantasyPros concensus
  team  : String,
  pos   : String
});

module.exports = mongoose.model('Player', PlayerSchema);
