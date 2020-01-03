const mongoose = require("mongoose")
const UserSchema = mongoose.Schema({
    username : String,
    email : String,
    password : String,
    name : String,
    token : String,
    verifyCode : String,
    isCreator : {type : Boolean,default : false},
    isPaymentVerified : {type : Boolean , default : false},
    isEmailVerified : {type : Boolean , default : false},
    isBanned : {type : Boolean, default : false},
    isDeleted : {type : Boolean, default : false}
})
module.exports = mongoose.model("User",UserSchema)