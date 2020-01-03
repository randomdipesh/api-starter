const {check,validationResult} = require("express-validator")
//error finder and error response thrower
const Checker = (req,res,next)=>{
    const errors = validationResult(req).array();
    if(errors.length>0){
        res.json({
            type : 'error',
            msg : errors[0].msg
        })
    }
    else{
        next()
    }
}
//individual validator for different routes
exports.Login = async (req,res,next)=>{
  await  check('email','Please enter a valid email').exists().isEmail().run(req),
  await check("password","Password must be at least 6 characters").exists().isLength({min : 6}).run(req)
  Checker(req,res,next)
}
//for register
exports.Register = async (req,res,next)=>{
    await  check('email','Please enter a valid email').exists().isEmail().run(req),
    await  check('username','Empty username supplied!').exists().run(req),
    await check("password","Password must be at least 6 characters").exists().isLength({min : 6}).run(req)
    await check("accountType","Account type must be either user or creator").exists().isIn(['user','creator']).run(req)
    Checker(req,res,next)
}