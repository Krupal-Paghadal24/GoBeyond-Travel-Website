const mongoose = require("mongoose");

const localHelpSchema = new mongoose.Schema({

 trip_id:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"Trip"
 },

 language:String,

 local_contact:String,

 availability:{
  type:Boolean,
  default:true
 }

});

module.exports = mongoose.model("LocalHelp",localHelpSchema);