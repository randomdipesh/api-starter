const User = require("../../models/User")
const helper = require('../../helper')
const bcrypt = require("bcrypt")
exports.Post = async (req,res)=>{
    let email = helper.safe(req.body.email)
	let password = helper.safe(req.body.password)
	let ifUserExists = await User.findOne({email : email},'isBanned isDeleted token password isEmailVerified')
    if(ifUserExists === null){
		res.json({
			type : "error",
			msg : "The user doesn't exists!"
		})
	}
	else if (ifUserExists.isBanned){
		res.json({
			type : "error",
			msg : "You've been banned from using site! Please consult admins for further info!!"
		})
	}
	else if (!ifUserExists.isEmailVerified){
		res.json({
			type : 'error',
			msg : "We are still waiting for you to verify your email address. Please verify it and try to login again."
		})
	}
	else if (ifUserExists.isDeleted){
		res.json({
			type : "error",
			msg : "Account Deleted!!"
		})
	}
	else if (!bcrypt.compareSync(password,ifUserExists.password)){
		res.json({
			type : 'error',
			msg : "Incorrect password! Please try again."
		})
	}
	else{
		let token
		if(ifUserExists.token === "myappfirsttoken" || !token || token === ""){
			token = await helper.Sign({email})
			await User.updateOne({email},{$set : {token}})
		}
		else{
			token = ifUserExists.token
		}
		res.json({
			type : "success",
			token,
			details : {email},
			msg : "Logged in successfully!"
		})

	}
}