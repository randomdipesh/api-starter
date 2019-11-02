const mongoose = require("mongoose")
mongoose.connect(process.env.mongoURL,{useNewUrlParser : true,useUnifiedTopology : true},(err,succ)=>{
    if(err){console.log("Could not connect to database",err)}
    if(succ){console.log("Database connected!!")}
})