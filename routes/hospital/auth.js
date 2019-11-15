const express = require('express')
const router = express.Router()
const { signup, signin, emailverify, authenticater } = require('../../controllers/hospital/auth')
const { signupValidator } = require("../../validator/index");
router.post("/hospital/signup",signupValidator,signup);
router.get('/hospital/emailVerify', emailverify)
// router.post('/hospital/signin', validateDoctorSignin, signin)
module.exports = router
