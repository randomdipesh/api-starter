const mongoose  = require('mongoose')
const ResetSchema = mongoose.Schema({
	email : String,
    code : String,
    date : Date
})
module.exports = mongoose.model("Reset",ResetSchema)