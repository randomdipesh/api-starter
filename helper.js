const xss = require("xss");
const striptags = require("striptags");
const sanitize = require("mongo-sanitize");
const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")
const User = require('./models/User')
exports.safe = unsafe => {
    let safe = xss(sanitize(unsafe)).trim();
    safe = striptags(safe);
    safe = safe.trim();
    return safe;
};


exports.isUserName = (username)=>{
	let re = /^[a-zA-Z0-9_]{3,}[a-zA-Z]+[0-9]*$/
	return re.test(String(username.toLowerCase()))
}



exports.send_email =  (email,subject,text)=>{
	var transporter = nodemailer.createTransport({
	  host: process.env.Emailsmtp,
	  port : process.env.EmailPort,
	  secure : false,
	  auth: {
	    user: process.env.emailusername,
	    pass: process.env.emailpassword
	  }
	});

	var mailOptions = {
	  from: `App Admin ${process.env.emailusername}`,
	  to: email,
	  subject: subject,
	  html: text
	}

	transporter.sendMail(mailOptions, function(error, info){
		console.log(error,info)
	});
}


//sign a jwt
exports.Sign = data => {
	return jwt.sign(data, process.env.JWTSecret);
};

//parse data from jwt and verify if user has logged in actually or not
exports.isLogged = async (req, res, next) => {
    //header token sent by front end
	const header = req.headers["appauthtoken"];
	if (typeof header !== "undefined") {
        const bear = header.split(" ");
        //only third value is our token
        const token = bear[2];
        //some additional layer (normally used as Bearer) [wanna save bytes ? don't use it this way] , earlier I read about reducing header informations too can save you bytes in bandwidth.
		if (bear[0] != "MySuperGreatApp" || bear[1] != "AuthTokenSecret") {
			res.json({
				type: "logout",
				msg: "Invalid Token Quote"
			});
		} else {
			try {
				req.token = token;
				req.data = jwt.verify(token, process.env.JWTSecret);
                let user_detail = await User.findOne({email: req.data.email},"token");
                //checking if user is needed to be logged out. If the token in db isn't the same user supplied , log him out. JWT alone doesn't does much work.
				if (user_detail.token !== token) {
					await User.updateOne(
						{ email: req.data.email },
						{ $set: { token: "myappfirsttoken" } }
					);
					res.json({
						type: "logout",
						msg: "Logging session expired! Please log in again to continue!"
					});
                }
                //all good? process further
				else {
					next();
				}
			} catch (e) {
				console.log(e)
                //cannot parse token ? sth must be wrong
				res.json({
					type: "logout",
					msg:"Your logging session has been expired , please log in again !!"
				});
			}
		}
	} else {
        //no appauthtoken header sent
		res.json({
			type: "logout",
			msg: "Authorization header not present"
		});
	}
}







