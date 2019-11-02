const router = require("express").Router()
const authRoute = require('./auth/index')
router.use('/auth',authRoute)
module.exports = router