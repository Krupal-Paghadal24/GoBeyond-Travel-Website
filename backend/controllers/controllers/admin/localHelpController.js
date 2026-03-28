const LocalHelp = require("../../models/LocalHelp");

exports.addLocalHelp = async(req,res)=>{

try{

const help = new LocalHelp(req.body);

await help.save();

res.json(help);

}catch(err){

res.status(500).json({message:"Error adding helper"});

}

};