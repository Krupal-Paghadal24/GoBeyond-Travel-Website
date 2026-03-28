const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({

  title:{
    type:String,
    required:true
  },

  category:{
    type:String
  },

  location:{
    type:String
  },

  duration:{
    type:String
  },

  price:{
    type:Number
  },

  description:{
    type:String
  },

  images:[String],

  guide_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Guide"
  },

  language_support:[String],

  local_help:{
    type:Boolean,
    default:false
  },

  created_by:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  status:{
    type:String,
    default:"Available"
  }

},{timestamps:true});

module.exports = mongoose.model("Trip",tripSchema);