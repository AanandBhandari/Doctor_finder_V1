const express = require('express')
const router = express.Router()
const { signup, signin, emailverify } = require('../../controllers/doctor/auth')
const { signupValidator } = require("../../validator/index");

// auth
router.post("/doctor/signup", signupValidator, signup);
router.get('/doctor/emailVerify', emailverify)
router.post('/doctor/signin', signin)

module.exports = router
