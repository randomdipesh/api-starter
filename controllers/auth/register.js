const helper = require('../../helper')
const User = require('../../models/User')
const bcrypt = require('bcrypt')
exports.Post = async(req,res)=>{
	let password = helper.safe(req.body.password)
	let email = helper.safe(req.body.email)
	let accountType = helper.safe(req.body.accountType)
	let username = helper.safe(req.body.username)
	let emailExists = await User.findOne({email},'_id')
	let usernameExists = await User.findOne({email},'_id')
	if (emailExists!==null){
		res.json({
			type : "error",
			msg : "E-mail address is already in use , please use another email!"
		})
	}
	else if (usernameExists!==null){
		res.json({
			type : "error",
			msg : "Requested username is already in use. Choose another username!"
		})
	}
	else if (!helper.isUserName(username)){
		res.json({
			type : 'error',
			msg : "Invalid username , choose another one!"
		})
	}
	else{
		let verifyCode = Math.random().toString(36).substring(5)
		await new User({
			email : email.toLowerCase(),
			password : await bcrypt.hash(password,10),
			verifyCode,
			username,
            isCreator : accountType === "creator"?true:false,
			date : new Date()
		})
		.save()
		//mail a link using mail api
		helper.send_email(email,'Verify your Identity',`
			Hey ,
			<br/>
			You've successfully registered !!
			<br/>
			Click the link below to verify your account : 
			http://${req.headers.host}/api/auth/verify?code=${verifyCode}&email=${email}
			<br/>
			<br/>
			Thanks!!
			&copy; ${new Date().getFullYear()}
			`)
		res.json({
			type : "success",
			msg : "Registration completed! We've sent a link to your email address, please check your email address and click on the link to verify your email address. You can only login after you verify your email address!"
		})
	}
}


exports.VerifyCode = async(req,res)=>{
	let code = helper.safe(req.query.code)
	let email = helper.safe(req.query.email)
	let checkDetails = await User.findOne({$and : [{verifyCode : code},{email}]},'isEmailVerified')
	if(checkDetails === null){
        res.send("Invalid details submitted!")
		// res.json({
		// 	type : 'error',
		// 	msg : "Invalid Details submitted !"
		// })
	}
	else if (checkDetails.isEmailVerified){
        res.send("You're already verified.")
		// res.json({
		// 	type : "error",
		// 	msg : "You're already verified!"
		// })
	}
	else{
        await User.updateOne({$and : [{verifyCode : code},{email}]},{$set : {isEmailVerified : true}})
        res.send("Your account has been verified. You can close this window now!")
		// res.json({
		// 	type : 'success',
		// 	msg : "You'r account has been verified successfully!"
		// })
	}
}