var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlayerSchema = new Schema({
  _id   : String,   // FantasyPros player id
  name  : String,
  rank  : {type: Number, default: Number.MAX_SAFE_INTEGER},   // Overall ranking according to FantasyPros concensus
  team  : String,
  pos   : String,
  // TODO - may want to reconsider this model to reference projections
  // projections : {
    hittingProjections   : {type : Schema.Types.ObjectId, ref : "HitterProjection"},
    pitchingProjections  : {type : Schema.Types.ObjectId, ref : "PitcherProjection"}
  // }
});

module.exports = mongoose.model('Player', PlayerSchema);
