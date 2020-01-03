const Reset = require('../../models/Reset')
const User = require('../../models/User')
const helper = require('../../helper')
const bcrypt = require('bcrypt')
exports.Forgot = async (req,res)=>{
	let email = helper.safe(req.body.email)
	let check = await User.findOne({email})
	if(check === null){
		res.json({
			type : "error",
			msg : "The email address is not yet registered!"
		})
	}
	else{
		let code = Math.random().toString(36).substring(7)+Math.random().toString(36).substring(7)
		await new Reset({
			email,
            code,
            date : new Date()
		})
		.save()
		//email
		helper.send_email(email,'Reset your Password',`
			Hello!
			<br/>
			Somebody requested to reset your  account password!
			<br/>
            If the request was done by you , please click on the link below to change your password.
			<br/>
			http://${req.headers.host}/reset?email=${email}&code=${code}
			<br/>
			<br/>
			If the request was not done by you , please kindly ignore this.
            <br/>
            Note : Link expires in 60 minutes.
            <br>
			<br/>
			&copy;  (${new Date().getFullYear()})

			`)
		res.json({
			type : 'success',
			msg : 'We have sent you a confirmation link to your mail, please click on the link sent to reset your password!'
		})
	}
}

exports.ResetCheck = async(req,res)=>{
	let email = helper.safe(req.body.email)
	let code = helper.safe(req.body.code)
    let check = await Reset.findOne({$and : [{email},{code}]})
    if(email === "" || code === ""){
        res.json({
            type : 'error',
            msg : "Do not leave any fields empty!"
        })
    }
	else if(check === null){
		res.json({
			type : 'error',
			msg : "Invalid details submitted"
		})
    }
    //don't accept links whose date is older than 60minutes
    else if( (check.date.getTime()+60000*60 )<new Date().getTime() ){
        res.json({
            type : 'error',
            msg : "Link expired!"
        })
    }
	else{
		res.json({
			type : 'success'
		})
	}
}

exports.ResetChange = async(req,res)=>{
	let {email,code,pw,rpw} = req.body
	email = helper.safe(email)
	code = helper.safe(code)
	pw = helper.safe(pw)
	rpw = helper.safe(rpw)
    let check = await Reset.findOne({$and : [{email},{code}]})
    if(email === "" || code === "" || pw === "" || rpw === ""){
        res.json({
            type : 'error',
            msg : "Do not leave any fields empty!"
        })
    }
    else if (pw!==rpw){
        res.json({
            type : 'error',
            msg : "Repeat password didn't matched!"
        })
    }
    else if (pw.length<6){
        res.json({
            type : "error",
            msg : "Password must be of at least 6 characters!"
        })
    }
	else if(check === null){
		res.json({
			type : 'error',
			msg : "Invalid details submitted"
		})
    }
     //don't accept links whose date is older than 60minutes
     else if((check.date.getTime()+60000*60 )<new Date().getTime() ){
        res.json({
            type : 'error',
            msg : "Link expired!"
        })
    }
	else{
        await Reset.remove({email})
        await User.updateOne({email},{$set : {
            password : await bcrypt.hash(pw,10),
            token : 'myappfirsttoken'
        }})
        res.json({
            type : 'success',
            msg : "Your password has been changed successfully!"
        })
	}

}