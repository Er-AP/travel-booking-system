const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({

  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  destination:String,

  travelDate:String,

  travelers:Number,

  packageType:String,

  price:Number,

  bookingStatus:{
    type:String,
    default:"Pending"
  },

  address:String

});

module.exports = mongoose.model("Booking", bookingSchema);