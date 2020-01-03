const express = require("express")
const app = express()
const cors = require('cors')
const compression = require("compression")
const helmet = require('helmet')
const rateLimit = require("express-rate-limit");
const hostValidation = require('host-validation')
app.use(cors())
app.use(hostValidation({ hosts: ['127.0.0.1:5000',
                                 'localhost:5000',
                                 'mydomain.com', 
                                 /.*\.mydomain\.com$/] }))
app.use(helmet())
app.use(compression())
require('dotenv').config()
//connect to database
require("./models/connection")
//body parser
const bparser = require('body-parser')
app.use(bparser.urlencoded({extended : true}))
app.use(bparser.json())
//use routes
const AppRoutes = require('./routes/index')

//rate limiter
const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50 ,   // limit each IP to 50 requests per windowMs
    handler : (req,res)=>{
		res.json({
			type : "error",
			limited : true,
			msg : "Too many requests . Please hold a while and try again after 5 minutes."
		})
	}
});
app.use('/api',authLimiter,AppRoutes)

const port = process.env.PORT || 5000
app.listen(port,(err)=>{
    if(err){
        console.log("Could not start server",err)
    }
    else{
        console.log("App up and running at port ",port)
    }
})