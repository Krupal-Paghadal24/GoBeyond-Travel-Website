const Guide = require("../../models/Guide");


/* ADD GUIDE */

exports.addGuide = async (req,res)=>{

 try{

  const {guide_name,expertise,languages,experience_years,contact} = req.body;

  const newGuide = new Guide({
   guide_name,
   expertise,
   languages,
   experience_years,
   contact
  });

  await newGuide.save();

  res.json({
   message:"Guide added successfully",
   guide:newGuide
  });

 }catch(error){

  console.log(error);

  res.status(500).json({
   message:"Error adding guide"
  });

 }

};



/* GET ALL GUIDES */

exports.getGuides = async(req,res)=>{

 try{

  const guides = await Guide.find();

  res.json(guides);

 }catch(error){

  res.status(500).json({
   message:"Error fetching guides"
  });

 }

};



/* DELETE GUIDE */

exports.deleteGuide = async(req,res)=>{

 try{

  await Guide.findByIdAndDelete(req.params.id);

  res.json({
   message:"Guide deleted"
  });

 }catch(error){

  res.status(500).json({
   message:"Error deleting guide"
  });

 }

};