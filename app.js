const express = require("express")
const app = express()
require('dotenv').config()
//connect to database
require("./models/connection")
//body parser
const bparser = require('body-parser')
app.use(bparser.urlencoded({extended : true}))
app.use(bparser.json())
//use routes
const AppRoutes = require('./routes/index')
app.use('/api',AppRoutes)


const port = process.env.PORT || 5000
app.listen(port,(err)=>{
    if(err){
        console.log("Could not start server",err)
    }
    else{
        console.log("App up and running at port ",port)
    }
})