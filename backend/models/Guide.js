const mongoose = require("mongoose");

const guideSchema = new mongoose.Schema({

 guide_name:{
  type:String,
  required:true
 },

 expertise:{
  type:String,
  enum:["Industrial","Cultural","Adventure"],
  required:true
 },

 languages:[
  {
   type:String
  }
 ],

 experience_years:{
  type:Number
 },

 contact:{
  type:String,
  required:true
 }

},{timestamps:true});

module.exports = mongoose.model("Guide",guideSchema);