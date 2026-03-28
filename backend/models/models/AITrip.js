const mongoose = require("mongoose");

const aiTripSchema = new mongoose.Schema({

  user_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  prompt_data:{
    tripType:String,
    days:Number,
    budget:Number,
    interest:String,
    region:String
  },

  title:String,

  destination:String,

  estimated_budget:Number,

  itinerary:[
    {
      day:Number,
      activities:[String]
    }
  ],

  travel_tips:[String],

  created_at:{
    type:Date,
    default:Date.now
  },

  saved:{
    type:Boolean,
    default:false
  }

});

module.exports = mongoose.model("AITrip",aiTripSchema);