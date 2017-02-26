var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlayerSchema = new Schema({
  _id   : String,   // FantasyPros player id
  name  : String,
  rank  : Number,   // Overall ranking according to FantasyPros concensus
  team  : String,
  pos   : String
  // TODO - may want to reconsider this model to reference projections
  // projections : {
  //   hitting   : {type : Schema.Types.ObjectId, ref : "HitterProjection"},
  //   pitching  : {type : Schema.Types.ObjectId, ref : "PitcherProjection"}
  // }
});

module.exports = mongoose.model('Player', PlayerSchema);
