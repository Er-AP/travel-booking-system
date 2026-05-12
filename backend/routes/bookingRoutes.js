const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");

const auth = require("../middleware/auth");

router.post("/bookings", auth, async(req,res)=>{

  const booking = await Booking.create({

    userId:req.user.id,

    destination:req.body.destination,

    travelDate:req.body.travelDate,

    travelers:req.body.travelers,

    packageType:req.body.packageType,

    price:req.body.price,

    address:req.body.address

  });

  res.json(booking);
});

router.get("/bookings", auth, async(req,res)=>{

  const data = await Booking.find({
    userId:req.user.id
  });

  res.json(data);
});

router.get("/bookings/:id", auth, async(req,res)=>{

  const data = await Booking.findById(
    req.params.id
  );

  res.json(data);
});

router.put("/bookings/:id", auth, async(req,res)=>{

  const data = await Booking.findByIdAndUpdate(
    req.params.id,
    req.body,
    {new:true}
  );

  res.json(data);
});

router.delete("/bookings/:id", auth, async(req,res)=>{

  await Booking.findByIdAndDelete(
    req.params.id
  );

  res.json({
    msg:"Booking deleted"
  });
});

module.exports = router;