const router = require('express').Router()
const AuthController = require('../../controllers/auth/index')
router.get('/login',AuthController.login.Post)
router.get('/register',AuthController.register.Post)
module.exports = router